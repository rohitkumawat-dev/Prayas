import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/shared/stats-card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '@/services/admin';
import { Award, BookOpen, Users, TrendingUp } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';

export default function AdminAnalytics() {
  useSEO({ title: 'Platform Analytics', description: 'Platform-wide analytics on users, courses, and engagement.', noindex: true });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getAnalytics();
        setData(res.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  const roleChartData = data?.role_distribution?.map((r: any) => ({
    name: r.role.charAt(0).toUpperCase() + r.role.slice(1) + 's',
    value: r.count
  })) || [];

  const categoryChartData = data?.category_distribution?.map((c: any) => ({
    name: c.category,
    courses: c.count
  })) || [];

  const topCoursesData = data?.top_courses?.map((c: any) => ({
    name: c.title.length > 20 ? c.title.slice(0, 18) + '...' : c.title,
    enrollments: c.enrollments
  })) || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Platform Analytics</h1>
        <p className="text-slate-400">Comprehensive overview of platform usage, engagement, and trends.</p>
      </header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Overall Completion Rate" 
          value={`${data?.overall_completion_rate ?? 0}%`} 
          icon={Award} 
        />
        <StatsCard 
          title="Total User Base" 
          value={roleChartData.reduce((acc: number, cur: any) => acc + cur.value, 0)} 
          icon={Users} 
        />
        <StatsCard 
          title="Active Categories" 
          value={categoryChartData.length} 
          icon={BookOpen} 
        />
        <StatsCard 
          title="Top Course Enrollments" 
          value={topCoursesData[0]?.enrollments ?? 0} 
          icon={TrendingUp} 
        />
      </div>

      {loading ? (
        <Skeleton className="h-80 w-full" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Roles Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">User Roles Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {roleChartData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {roleChartData.map((entry: any, index: number) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs text-slate-400">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Courses per Category Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Courses by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Bar dataKey="courses" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Courses by Enrollments */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-200 mb-6">Most Popular Courses</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCoursesData} layout="vertical">
                  <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} width={160} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Bar dataKey="enrollments" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
