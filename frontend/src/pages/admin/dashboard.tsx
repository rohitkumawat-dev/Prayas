import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '@/components/shared/stats-card';
import { ActivityItem } from '@/components/shared/activity-item';
import { Users, BookOpen, GraduationCap, UserCheck, Award, CheckCircle, Shield } from 'lucide-react';
import { adminApi } from '@/services/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useAuth } from '@/contexts/auth-context';
import { useSEO } from '@/hooks/use-seo';

export default function AdminDashboard() {
  useSEO({ title: 'Platform Overview', description: 'Platform-wide stats for users, courses, and activity.', noindex: true });
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getDashboardStats();
      setStats(res.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) return <ErrorState onRetry={fetchStats} />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Platform Overview</h1>
        <p className="text-slate-400">High-level metrics for Capacity Connect.</p>
      </header>

      {/* Super Admin Approval Requests Indicator */}
      {user?.is_super_admin && stats && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.pending_admin_requests > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'
            }`}>
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                Admin Approval Requests
                {stats.pending_admin_requests > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {stats.pending_admin_requests} Pending
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {stats.pending_admin_requests > 0
                  ? `${stats.pending_admin_requests} administrator account${stats.pending_admin_requests > 1 ? 's' : ''} awaiting Super Admin approval.`
                  : "No pending admin requests"}
              </p>
            </div>
          </div>
          {stats.pending_admin_requests > 0 && (
            <Link
              to="/admin/users?status=pending"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
            >
              Review Requests
            </Link>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard title="Total Users" value={stats.total_users} icon={Users} />
          <StatsCard title="Trainees" value={stats.total_trainees} icon={GraduationCap} />
          <StatsCard title="Trainers" value={stats.total_trainers} icon={UserCheck} />
          <StatsCard title="Active Courses" value={stats.published_courses} icon={BookOpen} />
          <StatsCard title="Total Enrollments" value={stats.total_enrollments} icon={Users} />
          <StatsCard title="Certificates Issued" value={stats.total_certificates} icon={Award} />
        </div>
      )}

      {/* Recent Platform Activities */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <CheckCircle className="text-emerald-400" size={18} />
          Recent Platform Activity
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : stats?.recent_activities && stats.recent_activities.length > 0 ? (
          <div className="divide-y divide-slate-800">
            {stats.recent_activities.map((act: any) => (
              <ActivityItem key={act.id} activity={act} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm py-4">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
}
