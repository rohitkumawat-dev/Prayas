import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/services/admin';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/contexts/toast-context';
import { useSEO } from '@/hooks/use-seo';

export default function AdminCourses() {
  useSEO({ title: 'Course Directory', description: 'Browse and moderate all courses on the platform.', noindex: true });
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCourses(debouncedSearch || undefined);
      setCourses(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [debouncedSearch]);

  const togglePublished = async (courseId: number, current: boolean) => {
    try {
      await adminApi.moderateCourse(courseId, { is_published: !current });
      toast({ title: `Course ${!current ? 'published' : 'unpublished'} successfully`, type: 'success' });
      fetchCourses();
    } catch (err: any) {
      toast({ title: 'Moderation failed', description: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Course Directory</h1>
        <p className="text-slate-400">View and moderate all platform courses.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
                <TableHead className="text-right">Completions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No courses found.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-200">{c.title}</TableCell>
                    <TableCell className="text-slate-400">{c.trainer_name || 'Assigned Trainer'}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">
                        {c.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-300">{c.enrollment_count ?? 0}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-400">{c.completion_count ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_published ? 'success' : 'default'}>
                        {c.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={c.is_published ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => togglePublished(c.id, c.is_published)}
                      >
                        {c.is_published ? 'Unpublish' : 'Publish'}
                      </Button>
                    </TableCell>
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
