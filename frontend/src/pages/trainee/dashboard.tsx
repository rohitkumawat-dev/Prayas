import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { progressService } from '@/services/progress';
import { StatsCard } from '@/components/shared/stats-card';
import { ActivityItem } from '@/components/shared/activity-item';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, CheckCircle, Award, TrendingUp, Play, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/use-seo';

export default function TraineeDashboard() {
  useSEO({ title: 'My Dashboard', description: 'Track your courses, active lessons, and verified certifications.', noindex: true });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await progressService.getDashboard();
        setData(res.data);
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user?.name}</h1>
          <p className="text-slate-400">Track your courses, active lessons, and verified certifications.</p>
        </div>
        <Button onClick={() => navigate('/trainee/courses')}>
          <BookOpen className="w-4 h-4 mr-2" /> Explore Courses
        </Button>
      </header>

      {/* Top Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Enrolled Courses" value={data?.enrolled_courses ?? 0} icon={BookOpen} />
          <StatsCard title="Completed" value={data?.completed_courses ?? 0} icon={CheckCircle} />
          <StatsCard title="Average Progress" value={`${data?.avg_progress ?? 0}%`} icon={TrendingUp} />
          <StatsCard title="Certificates Earned" value={data?.certificates ?? 0} icon={Award} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Active Courses</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
            </div>
          ) : data?.active_courses?.length > 0 ? (
            <div className="space-y-4">
              {data.active_courses.map((course: any) => (
                <div 
                  key={course.course_id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                        {course.category}
                      </span>
                      <h3 className="font-semibold text-slate-100 text-lg mt-0.5">{course.title}</h3>
                      <p className="text-xs text-slate-400">Instructor: {course.trainer_name}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/trainee/courses/${course.course_id}`)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" /> Resume
                    </Button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{course.completed_lessons} of {course.total_lessons} lessons completed</span>
                      <span className="font-medium text-slate-200">{Math.round(course.progress)}%</span>
                    </div>
                    <ProgressBar value={course.progress} max={100} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center h-48">
              <p className="text-slate-400 text-sm">You do not have any active course enrollments.</p>
              <Link to="/trainee/courses" className="mt-3 text-violet-400 hover:text-violet-300 text-sm font-medium flex items-center gap-1">
                Browse Course Catalog <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity Column */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Recent Milestones</h2>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : data?.recent_activities?.length > 0 ? (
              <div className="divide-y divide-slate-800/80">
                {data.recent_activities.map((act: any) => (
                  <ActivityItem key={act.id} activity={act} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No recent milestone activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
