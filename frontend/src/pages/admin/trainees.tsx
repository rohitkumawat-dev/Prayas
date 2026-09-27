import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/format';
import { adminApi } from '@/services/admin';
import { useDebounce } from '@/hooks/use-debounce';
import { useSEO } from '@/hooks/use-seo';

export default function AdminTrainees() {
  useSEO({ title: 'Trainees', description: 'View and manage all trainee accounts on the platform.', noindex: true });
  const [trainees, setTrainees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTrainees();
      setTrainees(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  const filtered = trainees.filter(t => 
    t.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Trainees</h1>
        <p className="text-slate-400">View and analyze trainee engagement.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search trainees by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Certificates</TableHead>
                <TableHead className="w-48">Avg Progress</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No trainees found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-slate-200">{t.name}</TableCell>
                    <TableCell className="text-slate-400">{t.email}</TableCell>
                    <TableCell className="text-slate-300">{t.enrollments_count ?? 0}</TableCell>
                    <TableCell className="text-slate-300">{t.completed_courses ?? 0}</TableCell>
                    <TableCell className="text-slate-300">{t.certificates_count ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={t.avg_progress ?? 0} max={100} size="sm" className="flex-1" />
                        <span className="text-xs text-slate-400 w-10 text-right">{Math.round(t.avg_progress ?? 0)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(t.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
