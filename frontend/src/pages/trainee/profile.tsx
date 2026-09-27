import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/format';
import { useToast } from '@/contexts/toast-context';
import { User, ShieldCheck } from 'lucide-react';
import { api } from '@/services/api';
import { useSEO } from '@/hooks/use-seo';

export default function TraineeProfile() {
  useSEO({ title: 'My Profile', description: 'Manage your Capacity Connect profile.', noindex: true });
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', { name, bio });
      updateUser(res.data);
      toast({ title: 'Profile updated successfully', type: 'success' });
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">My Profile</h1>
        <p className="text-slate-400">Manage your learner account information and biography.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="w-28 h-28 rounded-full bg-slate-800 border-2 border-violet-500/40 shadow-xl flex items-center justify-center text-violet-300 font-bold text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck size={14} /> Active Trainee
            </div>
          </div>

          <div className="flex-1 w-full">
            <form onSubmit={handleSave} className="space-y-5">
              <Input 
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Bio</label>
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share a short bio about your learning goals"
                  className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Email Address</span>
                  <span className="text-slate-300 font-medium">{user.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs">Member Since</span>
                  <span className="text-slate-300 font-medium">{formatDate(user.created_at)}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={saving}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
