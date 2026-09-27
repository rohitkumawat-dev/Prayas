import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Search, 
  ArrowLeft, 
  Calendar, 
  BarChart3, 
  Info, 
  FileText, 
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { StatsCard } from '@/components/shared/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/tabs';
import { useToast } from '@/contexts/toast-context';
import { trainerApi } from '@/services/trainer';
import { useSEO } from '@/hooks/use-seo';

export default function TrainerCoursePerformance() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  useSEO({ title: overview?.course_title ? `Performance: ${overview.course_title}` : 'Course Performance', description: 'Detailed performance analytics for this course.', noindex: true });
  const [learners, setLearners] = useState<any[]>([]);
  const [quizzesData, setQuizzesData] = useState<any>(null);
  
  // Filter state for learners
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'NEEDS_REVIEW' | 'NOT_STARTED'>('ALL');

  // Trainee Detail Modal
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(null);
  const [traineeDetail, setTraineeDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const courseId = Number(id);

  const fetchData = async (isRefresh = false) => {
    if (!courseId) return;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [perfRes, learnersRes, quizzesRes] = await Promise.all([
        trainerApi.getCoursePerformance(courseId),
        trainerApi.getCourseLearners(courseId),
        trainerApi.getCourseQuizzesPerformance(courseId)
      ]);

      setOverview(perfRes.data);
      setLearners(learnersRes.data || []);
      setQuizzesData(quizzesRes.data || null);
    } catch (err: any) {
      toast({
        title: 'Error loading analytics',
        description: err.response?.data?.message || err.message || 'Failed to fetch course analytics',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleOpenTraineeDetail = async (traineeId: number) => {
    setSelectedTraineeId(traineeId);
    setLoadingDetail(true);
    try {
      const res = await trainerApi.getLearnerDetail(courseId, traineeId);
      setTraineeDetail(res.data);
    } catch (err: any) {
      toast({
        title: 'Error loading trainee details',
        description: err.response?.data?.message || err.message || 'Could not load attempt history',
        type: 'error'
      });
      setSelectedTraineeId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredLearners = learners.filter(l => {
    const matchesSearch = 
      l.trainee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.trainee_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return l.status_label === statusFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-100 mb-2">Analytics Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          Unable to find performance records for this course, or you do not have permission to access it.
        </p>
        <Button variant="secondary" onClick={() => navigate('/trainer/courses')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/trainer/courses')} 
              className="px-2 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Courses
            </Button>
            <span className="text-slate-600">/</span>
            <span className="text-xs uppercase tracking-wider font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
              Trainer Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            {overview.course_title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time trainee performance metrics, assessment attempts, and data-backed instructional insights.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => navigate(`/trainer/courses/${courseId}/manage`)}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Manage Content
          </Button>
        </div>
      </header>

      {/* Schema Limitation Transparent Notice */}
      {quizzesData?.topic_analytics_status && !quizzesData.topic_analytics_status.available && (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Schema Transparency Notice: </span>
            {quizzesData.topic_analytics_status.notice}
          </div>
        </div>
      )}

      {/* Top 4 Performance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Enrolled Learners" 
          value={overview.enrolled_trainees_count} 
          icon={Users}
          description={`${overview.attempted_trainees_count} learners attempted quizzes`}
        />
        <StatsCard 
          title="Quiz Attempts" 
          value={overview.total_attempts_count} 
          icon={BarChart3}
          description={`Across ${overview.quizzes_count} active assessment(s)`}
        />
        <StatsCard 
          title="Class Average" 
          value={`${overview.average_score}%`} 
          icon={Award}
          description="Average score of all recorded attempts"
        />
        <StatsCard 
          title="Pass Rate" 
          value={`${overview.pass_rate}%`} 
          icon={TrendingUp}
          description={`${overview.passed_count} passed • ${overview.failed_count} failed attempts`}
        />
      </div>

      {/* Tabs: Learners & Assessment Breakdown */}
      <Tabs defaultValue="learners">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabList>
            <TabTrigger value="learners">
              Learners Performance ({learners.length})
            </TabTrigger>
            <TabTrigger value="quizzes">
              Assessment Breakdown ({quizzesData?.quizzes?.length ?? 0})
            </TabTrigger>
          </TabList>
        </div>

        {/* Tab 1: Learner Performance */}
        <TabContent value="learners" className="space-y-4">
          {/* Controls: Search and Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search learners by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-950/60 border-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {(['ALL', 'PASSED', 'NEEDS_REVIEW', 'NOT_STARTED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                    statusFilter === filter
                      ? 'bg-violet-600/20 text-violet-300 border-violet-500/50'
                      : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {filter === 'ALL' && 'All Learners'}
                  {filter === 'PASSED' && 'Passed'}
                  {filter === 'NEEDS_REVIEW' && 'Needs Review'}
                  {filter === 'NOT_STARTED' && 'Not Attempted'}
                </button>
              ))}
            </div>
          </div>

          {/* Learners Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {filteredLearners.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No learners match your filter</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery ? `No results found for "${searchQuery}".` : 'No learners currently enrolled in this category.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Trainee</th>
                      <th className="py-3.5 px-4 text-center">Attempts</th>
                      <th className="py-3.5 px-4 text-center">Latest Score</th>
                      <th className="py-3.5 px-4 text-center">Best Score</th>
                      <th className="py-3.5 px-4 text-center">Avg Score</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Action Recommendation</th>
                      <th className="py-3.5 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredLearners.map((learner) => (
                      <tr key={learner.trainee_id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Trainee Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-violet-400 text-sm overflow-hidden flex-shrink-0">
                              {learner.trainee_avatar ? (
                                <img src={learner.trainee_avatar} alt={learner.trainee_name} className="w-full h-full object-cover" />
                              ) : (
                                learner.trainee_name.slice(0, 2).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-100 truncate">{learner.trainee_name}</p>
                              <p className="text-xs text-slate-400 truncate">{learner.trainee_email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Attempts Count */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            learner.attempts_count > 0 
                              ? 'bg-slate-800 text-slate-200 border border-slate-700' 
                              : 'bg-slate-900 text-slate-500'
                          }`}>
                            {learner.attempts_count}
                          </span>
                        </td>

                        {/* Latest Score */}
                        <td className="py-4 px-4 text-center">
                          {learner.latest_score !== null ? (
                            <span className={`font-semibold ${
                              learner.latest_result === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {learner.latest_score}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Best Score */}
                        <td className="py-4 px-4 text-center">
                          {learner.best_score !== null ? (
                            <span className="font-semibold text-cyan-400">
                              {learner.best_score}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Average Score */}
                        <td className="py-4 px-4 text-center">
                          {learner.average_score !== null ? (
                            <span className="text-slate-300">
                              {learner.average_score}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>

                        {/* Status Label */}
                        <td className="py-4 px-4">
                          {learner.status_label === 'PASSED' && (
                            <Badge variant="success">Passed</Badge>
                          )}
                          {learner.status_label === 'NEEDS_REVIEW' && (
                            <Badge variant="warning">Needs Review</Badge>
                          )}
                          {learner.status_label === 'NOT_STARTED' && (
                            <Badge variant="default">Not Started</Badge>
                          )}
                        </td>

                        {/* Suggestions / Guidance */}
                        <td className="py-4 px-4 max-w-xs">
                          {learner.suggestions && learner.suggestions.length > 0 ? (
                            <p className="text-xs text-slate-400 leading-relaxed truncate" title={learner.suggestions[0]}>
                              {learner.suggestions[0]}
                            </p>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenTraineeDetail(learner.trainee_id)}
                          >
                            Inspect Attempts
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabContent>

        {/* Tab 2: Assessment Breakdown */}
        <TabContent value="quizzes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzesData?.quizzes?.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-slate-900 border border-slate-800 rounded-xl">
                <p className="text-slate-400 text-sm">No quizzes configured for this course.</p>
              </div>
            ) : (
              quizzesData?.quizzes?.map((quiz: any) => (
                <div key={quiz.quiz_id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-100 text-base">{quiz.quiz_title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {quiz.questions_count} Questions • Passing Threshold: {quiz.passing_score}%
                      </p>
                    </div>
                    <Badge variant={quiz.pass_rate >= 70 ? 'success' : 'warning'}>
                      {quiz.pass_rate}% Pass Rate
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Pass / Fail Distribution</span>
                      <span>{quiz.passed_count} passed / {quiz.failed_count} failed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: `${quiz.pass_rate}%` }} 
                      />
                      <div 
                        className="bg-rose-500 h-full transition-all" 
                        style={{ width: `${100 - quiz.pass_rate}%` }} 
                      />
                    </div>
                  </div>

                  {/* Micro stats */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                      <span className="text-slate-400 block text-[11px]">Total Attempts</span>
                      <span className="font-bold text-slate-200 mt-0.5 block">{quiz.total_attempts}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                      <span className="text-slate-400 block text-[11px]">Average Score</span>
                      <span className="font-bold text-violet-400 mt-0.5 block">{quiz.average_score}%</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                      <span className="text-slate-400 block text-[11px]">High / Low</span>
                      <span className="font-bold text-cyan-400 mt-0.5 block">
                        {quiz.highest_score}% / {quiz.lowest_score}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabContent>
      </Tabs>

      {/* Trainee Attempt Detail Dialog */}
      <Dialog
        isOpen={!!selectedTraineeId}
        onClose={() => {
          setSelectedTraineeId(null);
          setTraineeDetail(null);
        }}
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        title="Trainee Assessment History"
        description="Chronological record of attempts and progression insights for this course."
      >
        {loadingDetail || !traineeDetail ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Trainee Card */}
            <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-base flex-shrink-0">
                {traineeDetail.trainee?.avatar ? (
                  <img src={traineeDetail.trainee.avatar} alt={traineeDetail.trainee.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  traineeDetail.trainee?.name?.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-100 text-base">{traineeDetail.trainee?.name}</h4>
                <p className="text-xs text-slate-400">{traineeDetail.trainee?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={traineeDetail.summary?.passed_any ? 'success' : 'warning'}>
                    {traineeDetail.summary?.passed_any ? 'Course Passed' : 'Needs Passing Score'}
                  </Badge>
                  <span className="text-[11px] text-slate-500">
                    Enrolled {traineeDetail.enrollment?.enrolled_at ? new Date(traineeDetail.enrollment.enrolled_at).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Score Summary Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-center">
                <span className="text-xs text-slate-400 block">Total Attempts</span>
                <span className="text-lg font-bold text-slate-100 mt-0.5 block">
                  {traineeDetail.summary?.total_attempts}
                </span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-center">
                <span className="text-xs text-slate-400 block">Best Score</span>
                <span className="text-lg font-bold text-cyan-400 mt-0.5 block">
                  {traineeDetail.summary?.best_score !== null ? `${traineeDetail.summary.best_score}%` : '—'}
                </span>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg text-center">
                <span className="text-xs text-slate-400 block">Average Score</span>
                <span className="text-lg font-bold text-violet-400 mt-0.5 block">
                  {traineeDetail.summary?.average_score !== null ? `${traineeDetail.summary.average_score}%` : '—'}
                </span>
              </div>
            </div>

            {/* Automated Performance Insights */}
            {traineeDetail.insights && traineeDetail.insights.length > 0 && (
              <div className="bg-violet-950/20 border border-violet-800/40 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-violet-300 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Instructional Insights</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {traineeDetail.insights.map((insight: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quizzes & Chronological Attempts */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Attempt History by Quiz
              </h4>

              {traineeDetail.quizzes?.map((quiz: any) => (
                <div key={quiz.quiz_id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <div>
                      <span className="font-semibold text-slate-200 text-sm">{quiz.quiz_title}</span>
                      <span className="text-xs text-slate-500 ml-2">(Pass: {quiz.passing_score}%)</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {quiz.attempts_count} attempt(s)
                    </span>
                  </div>

                  {quiz.attempts?.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-1">No attempts for this quiz yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {quiz.attempts.map((att: any) => (
                        <div 
                          key={att.id} 
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                              #{att.attempt_number}
                            </span>
                            <span className="text-slate-400">
                              {att.completed_at ? new Date(att.completed_at).toLocaleString() : 'In progress'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-slate-300 font-mono">
                              {att.score} / {att.total_points} pts ({att.percentage}%)
                            </span>
                            {att.passed ? (
                              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" /> Passed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                <XCircle className="w-3 h-3" /> Failed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button 
                variant="secondary" 
                data-testid="modal-close-footer-btn"
                onClick={() => setSelectedTraineeId(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
