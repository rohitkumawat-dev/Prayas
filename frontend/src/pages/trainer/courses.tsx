import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Settings, Trash2, BookOpen, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/contexts/toast-context';
import { Course } from '@/types';
import { trainerApi } from '@/services/trainer';
import { useSEO } from '@/hooks/use-seo';

export default function TrainerCourses() {
  useSEO({ title: 'My Courses', description: 'Manage the courses you teach on Capacity Connect.', noindex: true });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await trainerApi.getCourses();
      setCourses(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await trainerApi.deleteCourse(deleteId);
      toast({ title: 'Course deleted successfully', type: 'success' });
      setDeleteId(null);
      fetchCourses();
    } catch (err: any) {
      toast({ title: 'Failed to delete course', description: err.message, type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState onRetry={fetchCourses} />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Courses</h1>
          <p className="text-slate-400">Create, manage, and inspect your instructional content.</p>
        </div>
        <Button onClick={() => navigate('/trainer/courses/new')}>
          <Plus className="w-4 h-4 mr-2" /> Create Course
        </Button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="No courses yet"
          description="Get started by creating your first course with structured modules and lessons."
          action={
            <Button onClick={() => navigate('/trainer/courses/new')}>
              Create Course
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant={course.is_published ? 'success' : 'default'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="text-xs text-slate-400 capitalize bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                    {course.difficulty}
                  </span>
                </div>
                
                <h2 className="font-semibold text-lg text-slate-100 line-clamp-1">{course.title}</h2>
                <p className="text-slate-400 text-sm line-clamp-2">{course.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {course.enrollment_count ?? 0} students
                  </span>
                  <span>{course.duration_hours}h total</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 mt-4 border-t border-slate-800/80">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/trainer/courses/${course.id}/performance`)}>
                  <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Performance
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => navigate(`/trainer/courses/${course.id}/manage`)}>
                  <Settings className="w-3.5 h-3.5 mr-1.5" /> Content
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/trainer/courses/${course.id}/edit`)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => setDeleteId(course.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={!!deleteId}
        onClose={() => !deleting && setDeleteId(null)}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone and will remove all modules, lessons, and student enrollments."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} isLoading={deleting}>Delete Course</Button>
          </>
        }
      >
        <p className="text-sm text-slate-400 py-2">
          All associated modules, quizzes, and learner progress will be removed from the platform.
        </p>
      </Dialog>
    </div>
  );
}
