import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { quizzesService } from '@/services/quizzes';
import { useSEO } from '@/hooks/use-seo';

export default function TraineeQuizResult() {
  useSEO({ title: 'Quiz Result', description: 'Your quiz results and score breakdown.', noindex: true });
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const stateResult = (location.state as any)?.attempt || ((location.state as any)?.score !== undefined ? location.state : null);
  const [result, setResult] = useState<any>(stateResult);
  const [loading, setLoading] = useState<boolean>(!stateResult);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchLatestAttempt = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError('');
        const res = await quizzesService.getAttempts(parseInt(id, 10));
        const attempts = res.data || [];
        if (attempts.length > 0) {
          // Latest attempt returned first by backend
          setResult(attempts[0]);
        } else if (!stateResult) {
          setError('No completed quiz attempts found.');
        }
      } catch (err: any) {
        if (!stateResult) {
          setError(err.message || 'Failed to load quiz results');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAttempt();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 px-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <ErrorState 
          title="Result data not available" 
          description={error} 
          onRetry={() => {
            if (id) {
              setLoading(true);
              quizzesService.getAttempts(parseInt(id, 10))
                .then(res => setResult(res.data?.[0] || null))
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
            }
          }}
        />
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => navigate('/trainee/courses')}>
            Return to Courses
          </Button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (result.percentage / 100) * circumference;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-12 text-center">
        {result.passed ? (
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        ) : (
          <XCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
        )}
        
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          {result.passed ? "Congratulations! You passed." : "You didn't pass this time."}
        </h1>
        <p className="text-slate-400 mb-8">
          {result.passed 
            ? "You've successfully completed this assessment." 
            : "Don't worry, you can review the material and try again."}
        </p>

        <div className="relative w-48 h-48 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="96"
              cy="96"
              r="60"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={result.passed ? "text-emerald-500" : "text-rose-500"}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-slate-100">{result.percentage}%</span>
            <span className="text-sm text-slate-400 mt-1">Score</span>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl p-4 inline-flex gap-8 mb-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</p>
            <p className={`font-medium ${result.passed ? "text-emerald-400" : "text-rose-400"}`}>
              {result.passed ? "PASSED" : "FAILED"}
            </p>
          </div>
          <div className="w-px bg-slate-800"></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Points</p>
            <p className="font-medium text-slate-200">
              {result.score} / {result.total_points}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate(`/trainee/quizzes/${id}`)}>
            <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
          </Button>
          <Button onClick={() => navigate('/trainee/courses')}>
            Continue Courses
          </Button>
        </div>
      </div>
    </div>
  );
}
