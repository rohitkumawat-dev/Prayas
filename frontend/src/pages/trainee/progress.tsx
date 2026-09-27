import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressService } from '@/services/progress';
import { StatsCard } from '@/components/shared/stats-card';
import { BookOpen, CheckCircle, TrendingUp, Award, PlayCircle } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSEO } from '@/hooks/use-seo';

export default function TraineeProgress() {
  useSEO({ title: 'Learning Progress', description: 'Track your progress across all enrolled courses.', noindex: true });
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await progressService.getAllProgress();
      setCourses(res.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (error) return <ErrorState onRetry={fetchProgress} />;

  const totalEnrolled = courses.length;
  const completed = courses.filter(c => c.status === 'completed').length;
  const avgProgress = totalEnrolled > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.progress || 0), 0) / totalEnrolled)
    : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Learning Progress</h1>
        <p className="text-slate-400">Track and review detailed progression across all your enrolled courses.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Enrolled" value={totalEnrolled} icon={BookOpen} />
          <StatsCard title="Completed Courses" value={completed} icon={CheckCircle} />
          <StatsCard title="Average Progress" value={`${avgProgress}%`} icon={TrendingUp} />
          <StatsCard title="Verified Completions" value={completed} icon={Award} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {[1, 2].map(i => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState 
          icon={BookOpen}
          title="No courses in progress"
          description="Explore our course catalog to find a skill path and begin learning."
          action={
            <Button onClick={() => navigate('/trainee/courses')}>
              Browse Courses
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {courses.map(course => (
            <div 
              key={course.course_id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                      {course.category}
                    </span>
                    <h2 className="font-semibold text-lg text-slate-100 mt-1">{course.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Instructor: {course.trainer_name}</p>
                  </div>
                  <Badge variant={course.status === 'completed' ? 'success' : 'info'}>
                    {course.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Lessons Completed</span>
                    <span>{course.completed_lessons} of {course.total_lessons} ({Math.round(course.progress)}%)</span>
                  </div>
                  <ProgressBar value={course.progress} max={100} size="md" />
                </div>

                {course.quiz_results && course.quiz_results.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-xs text-slate-400 mb-1.5 font-medium">Assessment Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {course.quiz_results.map((q: any, idx: number) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2 py-0.5 rounded border ${
                            q.passed 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {q.quiz_title}: {q.best_score}% {q.passed ? '(Passed)' : '(Failed)'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex justify-end">
                <Button 
                  size="sm"
                  variant={course.status === 'completed' ? 'secondary' : 'primary'}
                  onClick={() => navigate(`/trainee/courses/${course.course_id}`)}
                >
                  <PlayCircle className="w-4 h-4 mr-1.5" />
                  {course.status === 'completed' ? 'Review Content' : 'Continue Course'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
