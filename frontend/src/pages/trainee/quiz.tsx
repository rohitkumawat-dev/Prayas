import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesService } from '@/services/quizzes';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/utils/cn';
import { Clock, AlertTriangle } from 'lucide-react';
import { useSEO } from '@/hooks/use-seo';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  useSEO({ title: quiz?.title ?? 'Quiz', description: 'Take this quiz to test your knowledge.', noindex: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const fetchQuiz = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await quizzesService.getQuiz(parseInt(id));
      setQuiz(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const handleAnswer = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId.toString()]: option }));
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await quizzesService.submitQuiz(parseInt(id), answers);
      navigate(`/trainee/quizzes/${id}/result`, { state: { attempt: res.data } });
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-10 w-full" />)}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <ErrorState title="Failed to load quiz" description={error} onRetry={fetchQuiz} />
      </div>
    );
  }

  if (!quiz || !quiz.questions) return null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz.questions.length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-2">{quiz.title}</h1>
        {quiz.description && <p className="text-slate-400 text-sm mb-4">{quiz.description}</p>}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>{totalQuestions} questions</span>
          {quiz.time_limit_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={14} /> {quiz.time_limit_minutes} min
            </span>
          )}
          <span>Passing: {quiz.passing_score}%</span>
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-slate-800">
        {quiz.questions.map((q: any, i: number) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(i)}
            className={cn(
              "w-9 h-9 rounded-lg text-xs font-medium transition-colors",
              i === currentQuestion && "ring-2 ring-violet-500",
              answers[q.id.toString()]
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      {quiz.questions.map((q: any, i: number) => (
        <div key={q.id} className={cn(i === currentQuestion ? 'block' : 'hidden')}>
          <div className="mb-6">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Question {i + 1} of {totalQuestions}
            </span>
            <h2 className="text-lg font-medium text-slate-100 mt-2">{q.text}</h2>
            {q.points > 1 && <span className="text-xs text-slate-500">{q.points} points</span>}
          </div>

          <div className="space-y-3 mb-8">
            {[
              { key: 'a', label: 'A', text: q.option_a },
              { key: 'b', label: 'B', text: q.option_b },
              { key: 'c', label: 'C', text: q.option_c },
              { key: 'd', label: 'D', text: q.option_d },
            ].filter(opt => opt.text).map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleAnswer(q.id, opt.key)}
                className={cn(
                  "w-full text-left flex items-center gap-3 p-4 rounded-lg border transition-colors",
                  answers[q.id.toString()] === opt.key
                    ? "bg-violet-500/10 border-violet-500/40 text-violet-300"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
                )}
              >
                <span className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 border",
                  answers[q.id.toString()] === opt.key
                    ? "bg-violet-500 border-violet-500 text-white"
                    : "border-slate-600 text-slate-400"
                )}>
                  {opt.label}
                </span>
                <span className="text-sm">{opt.text}</span>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion < totalQuestions - 1 ? (
              <Button
                variant="secondary"
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={() => setShowConfirm(true)}
                disabled={answeredCount === 0}
              >
                Submit Quiz ({answeredCount}/{totalQuestions} answered)
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Submit progress bar */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>{answeredCount} of {totalQuestions} answered</span>
          <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-violet-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => setShowConfirm(true)} disabled={answeredCount === 0}>
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} title="Submit Quiz?">
          <div className="space-y-4">
            {answeredCount < totalQuestions && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-300">
                  You have {totalQuestions - answeredCount} unanswered question(s).
                  Unanswered questions will be marked as incorrect.
                </p>
              </div>
            )}
            <p className="text-slate-300 text-sm">
              Are you sure you want to submit your quiz? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={submitting}>
                Submit Quiz
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
