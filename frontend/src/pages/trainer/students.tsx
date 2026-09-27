import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/format';
import { useDebounce } from '@/hooks/use-debounce';
import { trainerApi } from '@/services/trainer';
import { useSEO } from '@/hooks/use-seo';

export default function TrainerStudents() {
  useSEO({ title: 'Students', description: 'View and manage students enrolled in your courses.', noindex: true });
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [courseFilter, setCourseFilter] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await trainerApi.getStudents();
      setStudents(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Extract unique courses for filter
  const courseOptions = [
    { value: '', label: 'All Courses' },
    ...Array.from(new Set(students.map(s => s.course_title))).map(title => ({
      value: title,
      label: title
    }))
  ];

  const filtered = students.filter(s => {
    const matchesSearch = s.user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                          s.user?.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCourse = !courseFilter || s.course_title === courseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Students</h1>
        <p className="text-slate-400">Monitor student progress, assessments, and status across your courses.</p>
      </header>

      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search students by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="sm:w-64">
          <Select 
            options={courseOptions}
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
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
                <TableHead>Student</TableHead>
                <TableHead>Enrolled Course</TableHead>
                <TableHead className="w-48">Progress</TableHead>
                <TableHead>Quiz Avg</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No students found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-slate-200">
                      <div>
                        <div>{s.user?.name}</div>
                        <div className="text-xs text-slate-500 font-normal">{s.user?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{s.course_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar value={s.progress} max={100} size="sm" className="flex-1" />
                        <span className="text-xs text-slate-400 w-10 text-right">{Math.round(s.progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={s.quiz_average >= 70 ? "text-emerald-400 font-medium" : s.quiz_average > 0 ? "text-amber-400 font-medium" : "text-slate-500"}>
                        {s.quiz_average > 0 ? `${s.quiz_average}%` : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.status === 'completed' ? 'success' : s.progress < 30 ? 'warning' : 'info'}>
                        {s.status === 'completed' ? 'Completed' : s.progress < 30 ? 'Needs Attention' : 'In Progress'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {formatDate(s.enrolled_at)}
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
