import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/stats-card';
import { BookOpen, Users, AlertTriangle, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { trainerApi } from '@/services/trainer';
import { useSEO } from '@/hooks/use-seo';

export default function TrainerAnalytics() {
  useSEO({ title: 'Analytics', description: 'View analytics across all your courses.', noindex: true });
  const [analytics, setAnalytics] = useState<any>(null);
  const [needsAttention, setNeedsAttention] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [aRes, nRes] = await Promise.all([
          trainerApi.getAnalytics(),
          trainerApi.getNeedsAttention()
        ]);
        setAnalytics(aRes.data);
        setNeedsAttention(nRes.data || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = analytics?.course_stats?.map((c: any) => ({
    name: c.title.length > 20 ? c.title.slice(0, 18) + '...' : c.title,
    students: c.enrollments,
    completions: c.completions
  })) || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-slate-400">Deep dive into your course enrollments, student retention, and performance.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard title="Courses" value={analytics.total_courses} icon={BookOpen} />
          <StatsCard title="Enrollments" value={analytics.total_enrollments} icon={Users} />
          <StatsCard title="Active Learners" value={analytics.active_learners} icon={TrendingUp} />
          <StatsCard title="Avg Quiz Score" value={`${analytics.avg_quiz_score}%`} icon={Award} />
          <StatsCard title="Completion Rate" value={`${analytics.completion_rate}%`} icon={CheckCircle} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-6">Course Enrollment & Completion</h2>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
              No enrollment statistics to display yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="students" name="Enrolled" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completions" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={18} />
            Needs Attention ({needsAttention.length})
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : needsAttention.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center">
              <CheckCircle className="text-emerald-400 mb-2" size={24} />
              <p className="text-slate-400 text-sm">No students currently flagged.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {needsAttention.map((student: any, index: number) => (
                <div key={index} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-200 text-sm">{student.user?.name}</h3>
                      <p className="text-xs text-slate-400">{student.course_title}</p>
                    </div>
                    <Badge variant="warning" className="text-[10px]">
                      {student.progress}% Progress
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {student.reasons?.map((reason: string, rIdx: number) => (
                      <span key={rIdx} className="text-[11px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
