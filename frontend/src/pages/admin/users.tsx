import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Edit, Trash2, UserX, UserCheck, Plus, 
  Shield, Check, X, Clock, AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';
import { useToast } from '@/contexts/toast-context';
import { useAuth } from '@/contexts/auth-context';
import { adminApi } from '@/services/admin';
import { useDebounce } from '@/hooks/use-debounce';
import { useSEO } from '@/hooks/use-seo';

export default function AdminUsers() {
  useSEO({ title: 'User Management', description: 'Manage trainee, trainer, and admin accounts.', noindex: true });
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  
  // Pending Admin Approval Requests (Super Admin)
  const [approvalRequests, setApprovalRequests] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalActionId, setApprovalActionId] = useState<number | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'trainee' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [editUser, setEditUser] = useState<any>(null);
  const [editRole, setEditRole] = useState('');
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers(
        debouncedSearch || undefined, 
        roleFilter || undefined,
        statusFilter || undefined
      );
      setUsers(res.data || []);
    } catch (err: any) {
      toast({ title: 'Failed to load users', description: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalRequests = async () => {
    if (!currentUser?.is_super_admin) return;
    try {
      setApprovalLoading(true);
      const res = await adminApi.getApprovalRequests();
      setApprovalRequests(res.data || []);
    } catch (err: any) {
      console.error('Failed to load approval requests', err);
    } finally {
      setApprovalLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter, statusFilter]);

  useEffect(() => {
    const s = searchParams.get('status') || '';
    if (s !== statusFilter) {
      setStatusFilter(s);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentUser?.is_super_admin) {
      fetchApprovalRequests();
    }
  }, [currentUser]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!createForm.name || !createForm.email || !createForm.password) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    if (createForm.password.length < 6) {
      setCreateError('Password must be at least 6 characters.');
      return;
    }

    try {
      setCreateLoading(true);
      await adminApi.createUser(createForm);
      if (createForm.role === 'admin') {
        toast({ 
          title: 'Admin Created (Pending Approval)', 
          description: 'The administrator account was created and is awaiting Super Admin approval.',
          type: 'info' 
        });
      } else {
        toast({ title: 'User account created', type: 'success' });
      }
      setCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: '', role: 'trainee' });
      await fetchUsers();
      if (currentUser?.is_super_admin) {
        await fetchApprovalRequests();
      }
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setApprovalActionId(id);
      await adminApi.approveAdmin(id);
      toast({ title: 'Admin account approved', description: 'Account is now active with administrator access.', type: 'success' });
      await fetchUsers();
      await fetchApprovalRequests();
    } catch (err: any) {
      toast({ title: 'Approval failed', description: err.message, type: 'error' });
    } finally {
      setApprovalActionId(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setApprovalActionId(id);
      await adminApi.rejectAdmin(id);
      toast({ title: 'Admin account rejected', description: 'Administrator request has been rejected.', type: 'error' });
      await fetchUsers();
      await fetchApprovalRequests();
    } catch (err: any) {
      toast({ title: 'Rejection failed', description: err.message, type: 'error' });
    } finally {
      setApprovalActionId(null);
    }
  };

  const handleSaveRole = async () => {
    if (!editUser) return;
    try {
      setActionLoading(true);
      await adminApi.updateUser(editUser.id, { role: editRole });
      toast({ title: 'User role updated', type: 'success' });
      setEditUser(null);
      fetchUsers();
      fetchApprovalRequests();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await adminApi.updateUser(id, { is_active: !currentStatus });
      toast({ title: `User ${currentStatus ? 'deactivated' : 'activated'}`, type: 'success' });
      fetchUsers();
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      setActionLoading(true);
      await adminApi.deleteUser(deleteUser.id);
      toast({ title: 'User deleted successfully', type: 'success' });
      setDeleteUser(null);
      fetchUsers();
      fetchApprovalRequests();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create User CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-slate-400">Manage platform users, roles, account status, and administrator approvals.</p>
        </div>
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-medium"
        >
          <Plus size={16} />
          Create User
        </Button>
      </div>

      {/* SUPER ADMIN APPROVAL SECTION */}
      {currentUser?.is_super_admin && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Shield size={16} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  Admin Approval Requests
                  {approvalRequests.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {approvalRequests.length} Pending
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">Review and authorize new administrator access requests.</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {approvalLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : approvalRequests.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">No pending admin requests</p>
                <p className="text-xs text-slate-500 mt-1">All administrator accounts are currently reviewed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {approvalRequests.map((req) => (
                  <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold text-slate-100">{req.name}</span>
                        <Badge variant="warning" className="text-xs font-normal">Pending Approval</Badge>
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Email: <strong className="text-slate-300 font-normal">{req.email}</strong></span>
                        <span>Role: <strong className="text-slate-300 font-normal">Administrator</strong></span>
                        <span>Requested: {formatDate(req.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(req.id)}
                        isLoading={approvalActionId === req.id}
                        disabled={approvalActionId !== null}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white inline-flex items-center gap-1.5 text-xs"
                      >
                        <Check size={14} />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(req.id)}
                        isLoading={approvalActionId === req.id}
                        disabled={approvalActionId !== null}
                        className="inline-flex items-center gap-1.5 text-xs"
                      >
                        <X size={14} />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="sm:w-44">
          <Select 
            options={[
              { value: '', label: 'All Roles' },
              { value: 'trainee', label: 'Trainee' },
              { value: 'trainer', label: 'Trainer' },
              { value: 'admin', label: 'Admin' }
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <Select 
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending Approval' },
              { value: 'rejected', label: 'Rejected' }
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSearchParams(e.target.value ? { status: e.target.value } : {});
            }}
          />
        </div>
      </div>

      {/* USERS TABLE */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    <p className="text-sm font-medium text-slate-300">No users found matching your criteria.</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting the role or status filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.is_super_admin && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                            Super Admin
                          </span>
                        )}
                        {u.id === currentUser?.id && (
                          <span className="text-[10px] text-slate-500">(You)</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs sm:text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'admin' ? 'error' : u.role === 'trainer' ? 'warning' : 'info'} className="capitalize text-xs">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {u.status === 'pending' ? (
                          <Badge variant="warning" className="text-xs font-normal">Pending Approval</Badge>
                        ) : u.status === 'rejected' ? (
                          <Badge variant="error" className="text-xs font-normal">Rejected</Badge>
                        ) : (
                          <Badge variant={u.is_active ? 'success' : 'default'} className="text-xs font-normal">
                            {u.is_active ? 'Active' : 'Deactivated'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{formatDate(u.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5 items-center">
                        {/* Inline Super Admin approval controls for pending admins */}
                        {currentUser?.is_super_admin && u.role === 'admin' && u.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(u.id)}
                              isLoading={approvalActionId === u.id}
                              disabled={approvalActionId !== null}
                              title="Approve Administrator"
                              className="bg-emerald-600/80 hover:bg-emerald-600 text-white p-1.5 h-8 w-8"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(u.id)}
                              isLoading={approvalActionId === u.id}
                              disabled={approvalActionId !== null}
                              title="Reject Administrator"
                              className="p-1.5 h-8 w-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setEditUser(u); setEditRole(u.role); }}
                          title="Edit Role"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={u.is_active ? "text-amber-500 hover:text-amber-400" : "text-emerald-500 hover:text-emerald-400"}
                          onClick={() => toggleStatus(u.id, u.is_active)}
                          title={u.is_active ? "Deactivate User" : "Activate User"}
                        >
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-rose-500 hover:text-rose-400"
                          onClick={() => setDeleteUser(u)}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE USER DIALOG */}
      <Dialog
        isOpen={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setCreateError(''); }}
        title="Create New User"
        description="Add a new trainee, trainer, or administrator account to the platform."
        footer={
          <>
            <Button variant="ghost" onClick={() => { setCreateModalOpen(false); setCreateError(''); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} isLoading={createLoading}>
              Create User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4 py-2">
          {createError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-start gap-2" role="alert">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{createError}</span>
            </div>
          )}

          <Input 
            label="Full Name"
            type="text"
            required
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="e.g. Arjun Nair"
          />

          <Input 
            label="Email Address"
            type="email"
            required
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            placeholder="user@example.com"
          />

          <Input 
            label="Password"
            type="password"
            required
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            placeholder="Minimum 6 characters"
          />

          <Select 
            label="Platform Role"
            value={createForm.role}
            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
            options={[
              { value: 'trainee', label: 'Trainee (Learner)' },
              { value: 'trainer', label: 'Trainer (Instructor)' },
              { value: 'admin', label: 'Administrator' }
            ]}
          />

          {createForm.role === 'admin' && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Shield size={13} />
                Requires Super Admin Approval
              </p>
              <p className="text-amber-300/80 leading-relaxed">
                Newly created Administrator accounts default to <strong>Pending Approval</strong> and will not receive login access until approved by the Super Admin.
              </p>
            </div>
          )}
        </form>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User Role"
        description={`Change platform role for ${editUser?.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveRole} isLoading={actionLoading}>Save Changes</Button>
          </>
        }
      >
        <div className="py-4">
          <Select 
            label="Role"
            options={[
              { value: 'trainee', label: 'Trainee' },
              { value: 'trainer', label: 'Trainer' },
              { value: 'admin', label: 'Admin' }
            ]}
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
          />
        </div>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Delete User"
        description={`Are you sure you want to permanently delete "${deleteUser?.name}" (${deleteUser?.email})?`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={actionLoading}>Delete User</Button>
          </>
        }
      >
        <p className="text-sm text-slate-400 py-2">
          This will permanently remove their account, course enrollments, and progress.
        </p>
      </Dialog>
    </div>
  );
}
