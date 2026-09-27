import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/format';
import { adminApi } from '@/services/admin';
import { useDebounce } from '@/hooks/use-debounce';
import { useSEO } from '@/hooks/use-seo';

export default function AdminTrainers() {
  useSEO({ title: 'Trainers', description: 'View and manage all trainer accounts on the platform.', noindex: true });
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getTrainers();
      setTrainers(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const filtered = trainers.filter(t => 
    t.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    t.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Trainers</h1>
        <p className="text-slate-400">View and manage platform educators.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search trainers by name or email..." 
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
                <TableHead>Trainer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses Created</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Total Students</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No trainers found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-slate-200">{t.name}</TableCell>
                    <TableCell className="text-slate-400">{t.email}</TableCell>
                    <TableCell className="text-slate-300 font-medium">{t.courses_count ?? 0}</TableCell>
                    <TableCell className="text-emerald-400">{t.published_courses ?? 0}</TableCell>
                    <TableCell className="text-cyan-400">{t.total_students ?? 0}</TableCell>
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
