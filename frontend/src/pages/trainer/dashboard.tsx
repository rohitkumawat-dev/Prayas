import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { StatsCard } from '@/components/shared/stats-card';
import { BookOpen, Users, TrendingUp, AlertTriangle, CheckCircle, Award } from 'lucide-react';
import { trainerApi } from '@/services/trainer';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/use-seo';

export default function TrainerDashboard() {
  useSEO({ title: 'Trainer Dashboard', description: 'Overview of your courses, students, and analytics.', noindex: true });
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsRes, attentionRes] = await Promise.all([
        trainerApi.getAnalytics(),
        trainerApi.getNeedsAttention()
      ]);
      setAnalytics(analyticsRes.data);
      setNeedsAttention(attentionRes.data || []);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (error) return <ErrorState onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trainer Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.name}. Here's how your courses are performing.</p>
        </div>
        <Link 
          to="/trainer/courses/new" 
          className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create New Course
        </Link>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Courses" value={analytics.total_courses} icon={BookOpen} />
          <StatsCard title="Total Enrollments" value={analytics.total_enrollments} icon={Users} />
          <StatsCard title="Active Learners" value={analytics.active_learners} icon={TrendingUp} />
          <StatsCard title="Completion Rate" value={`${analytics.completion_rate}%`} icon={Award} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <BookOpen className="text-violet-400" size={18} />
            My Courses Performance
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : analytics?.course_stats && analytics.course_stats.length > 0 ? (
            <div className="space-y-4">
              {analytics.course_stats.map((c: any) => (
                <div key={c.course_id} className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-200">{c.title}</span>
                    <span className="text-xs text-slate-400">
                      {c.completions} of {c.enrollments} completed ({c.completion_rate}%)
                    </span>
                  </div>
                  <ProgressBar value={c.completion_rate} max={100} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4">No published courses with enrollment data yet.</p>
          )}
        </div>

        {/* Needs Attention Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={18} />
            Needs Attention
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : needsAttention.length > 0 ? (
            <div className="space-y-3">
              {needsAttention.map((item: any, i: number) => (
                <div key={i} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm text-slate-200">{item.user?.name}</p>
                    <Badge variant="warning" className="text-xs">At-risk</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{item.course_title}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.reasons?.map((r: string, idx: number) => (
                      <span key={idx} className="text-[11px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
              <p className="text-slate-400 text-sm">All students are progressing smoothly!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
