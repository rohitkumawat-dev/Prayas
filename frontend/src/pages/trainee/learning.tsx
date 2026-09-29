import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { lessonsService } from '@/services/lessons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CheckCircle, ChevronLeft, ChevronRight, BookOpen, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSEO } from '@/hooks/use-seo';
import { LessonContent } from '@/components/shared/lesson-content';

export default function LearningPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useSEO({ title: lesson?.title ?? 'Lesson', description: 'Continue your lesson on Capacity Connect.', noindex: true });

  const fetchLesson = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await lessonsService.getLesson(parseInt(id));
      setLesson(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
    setSidebarOpen(false);
  }, [id]);

  const handleComplete = async () => {
    if (!id) return;
    setCompleting(true);
    try {
      await lessonsService.completeLesson(parseInt(id));
      // Refresh lesson data to get updated completion status
      const res = await lessonsService.getLesson(parseInt(id));
      setLesson(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="hidden lg:block w-72 border-r border-slate-800 p-4 space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <ErrorState title="Failed to load lesson" description={error} onRetry={fetchLesson} />
        <Button variant="ghost" onClick={() => navigate('/trainee/courses')} className="text-violet-400 hover:text-violet-300">
          <ChevronLeft size={16} className="mr-1" /> Return to Course Catalog
        </Button>
      </div>
    );
  }

  if (!lesson) return null;

  const totalLessons = lesson.course_modules?.reduce((sum: number, m: any) => sum + m.lessons.length, 0) || 0;
  const completedLessons = lesson.course_modules?.reduce((sum: number, m: any) =>
    sum + m.lessons.filter((l: any) => l.is_completed).length, 0) || 0;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-30 bg-slate-800 border border-slate-700 p-2 rounded-lg"
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar - course navigation */}
      <aside className={cn(
        "w-72 border-r border-slate-800 bg-slate-900 overflow-y-auto flex-shrink-0 transition-transform duration-200",
        "fixed lg:relative inset-y-0 left-0 z-20 pt-16 lg:pt-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4">
          <Link to={`/trainee/courses/${lesson.course_id}`} className="text-sm text-slate-400 hover:text-violet-400 flex items-center gap-1 mb-4">
            <ChevronLeft size={14} /> Back to course
          </Link>
          <h3 className="text-sm font-semibold text-slate-100 mb-1">{lesson.course_title}</h3>
          <div className="mb-4">
            <ProgressBar value={progress} max={100} size="sm" />
            <p className="text-xs text-slate-500 mt-1">{completedLessons}/{totalLessons} lessons</p>
          </div>

          <div className="space-y-3">
            {lesson.course_modules?.map((m: any) => (
              <div key={m.id}>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{m.title}</h4>
                <ul className="space-y-0.5">
                  {m.lessons.map((l: any) => (
                    <li key={l.id}>
                      <button
                        onClick={() => {
                          navigate(`/trainee/learning/${l.id}`);
                          setSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                          l.is_current
                            ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        )}
                      >
                        {l.is_completed ? (
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                        ) : (
                          <BookOpen size={14} className="shrink-0 opacity-50" />
                        )}
                        <span className="truncate">{l.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
          <div className="mb-8">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{lesson.module_title}</p>
            <h1 className="text-2xl font-bold text-slate-100 mb-4">{lesson.title}</h1>
            {lesson.duration_minutes > 0 && (
              <span className="text-sm text-slate-400">{lesson.duration_minutes} min read</span>
            )}
          </div>

          {/* Lesson content */}
          <article className="max-w-none mb-12">
            <LessonContent content={lesson.content || ''} />
          </article>

          {/* Actions */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-3">
              {lesson.prev_lesson_id && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/trainee/learning/${lesson.prev_lesson_id}`)}
                >
                  <ChevronLeft size={16} /> Previous
                </Button>
              )}
              {lesson.next_lesson_id && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/trainee/learning/${lesson.next_lesson_id}`)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              )}
            </div>

            {!lesson.is_completed ? (
              <Button onClick={handleComplete} isLoading={completing}>
                <CheckCircle size={16} /> Mark as Complete
              </Button>
            ) : (
              <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <CheckCircle size={16} /> Completed
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
