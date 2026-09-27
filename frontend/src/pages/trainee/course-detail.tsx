import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, BookOpen, ChevronDown, CheckCircle2, HelpCircle } from 'lucide-react';
import { Course } from '@/types';
import { coursesApi } from '@/services/courses';
import { enrollmentsApi } from '@/services/enrollments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useToast } from '@/contexts/toast-context';
import { useSEO } from '@/hooks/use-seo';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export default function TraineeCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  // Must be called unconditionally (before the loading/error early-returns below)
  // to satisfy the Rules of Hooks. Falls back to a generic title while loading.
  useSEO({
    title: course?.title ?? 'Course Details',
    description: course?.description ?? 'View course curriculum, lessons, and assessments.',
    noindex: true,
  });

  const fetchCourse = async () => {
    try {
      setLoading(true);
      if (id) {
        const res = await coursesApi.getCourse(parseInt(id, 10));
        const data = res.data;
        setCourse(data);
        
        // Expand first module by default
        if (data.modules && data.modules.length > 0) {
          setExpandedModules({ [data.modules[0].id]: true });
        }
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!course) return;
    
    try {
      setEnrolling(true);
      await enrollmentsApi.enroll(course.id);
      toast({ title: 'Successfully enrolled!', type: 'success' });
      // Refresh course data to show enrolled state
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Failed to enroll', description: err.message, type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getContinueLessonId = (): number | null => {
    if (!course?.modules || course.modules.length === 0) return null;
    const allLessons = course.modules.flatMap(m => m.lessons || []);
    if (allLessons.length === 0) return null;
    const nextUncompleted = allLessons.find((l: any) => !l.is_completed);
    return nextUncompleted ? nextUncompleted.id : allLessons[0].id;
  };

  if (loading) return <div className="p-8">Loading...</div>; // Could use better skeleton
  if (error || !course) return <ErrorState onRetry={fetchCourse} />;

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Capacity Connect',
      sameAs: 'https://www.capacityconnect.example.com/',
    },
    ...(course.trainer_name ? { instructor: { '@type': 'Person', name: course.trainer_name } } : {}),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <Breadcrumbs items={[{ label: 'Courses', href: '/trainee/courses' }, { label: course.title }]} />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="h-48 md:h-64 relative bg-slate-800">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-50" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-violet-900/50 to-slate-900">
              <BookOpen className="w-20 h-20 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex gap-2 mb-3">
              <Badge variant="info">{course.category}</Badge>
              <Badge variant={course.difficulty === 'beginner' ? 'success' : course.difficulty === 'advanced' ? 'error' : 'warning'}>
                {course.difficulty}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-slate-300 max-w-3xl line-clamp-2">{course.description}</p>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-900">
          <div className="flex gap-6 text-sm text-slate-400 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium">
                {course.trainer_name.charAt(0)}
              </div>
              <span className="text-slate-200">{course.trainer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{course.duration_hours} Hours</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{course.enrollment_count || 0} Enrolled</span>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0">
            {course.is_enrolled ? (
              <Button 
                size="lg" 
                fullWidth 
                onClick={() => {
                  const targetLessonId = getContinueLessonId();
                  if (targetLessonId) {
                    navigate(`/trainee/learning/${targetLessonId}`);
                  } else {
                    toast({ title: 'No lessons available for this course yet.', type: 'info' });
                  }
                }}
              >
                Continue Learning
              </Button>
            ) : (
              <Button size="lg" fullWidth onClick={handleEnroll} isLoading={enrolling}>
                Enroll Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-100">Course Curriculum</h2>
        
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div>
                    <h3 className="font-medium text-slate-100 text-lg">{module.title}</h3>
                    {module.description && <p className="text-sm text-slate-400 mt-1">{module.description}</p>}
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedModules[module.id] ? 'rotate-180' : ''}`} />
                </button>
                
                {expandedModules[module.id] && (
                  <div className="border-t border-slate-800 bg-slate-900/50">
                    {module.lessons && module.lessons.length > 0 ? (
                      <ul className="divide-y divide-slate-800/50">
                        {module.lessons.map((lesson, idx) => (
                          <li 
                            key={lesson.id} 
                            onClick={() => {
                              if (course.is_enrolled) {
                                navigate(`/trainee/learning/${lesson.id}`);
                              }
                            }}
                            className={`p-4 pl-6 flex items-center gap-4 transition-colors ${
                              course.is_enrolled 
                                ? 'cursor-pointer hover:bg-slate-800/60' 
                                : 'hover:bg-slate-800/30'
                            }`}
                          >
                            {course.is_enrolled && lesson.is_completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0 flex items-center justify-center">
                                <span className="text-[10px] text-slate-400">{idx + 1}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className={`text-sm ${course.is_enrolled && lesson.is_completed ? 'text-slate-300' : 'text-slate-200'}`}>
                                {lesson.title}
                              </p>
                            </div>
                            <div className="text-xs text-slate-500 shrink-0">
                              {lesson.duration_minutes} min
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">No lessons in this module yet.</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
            <p className="text-slate-400">Curriculum is being prepared.</p>
          </div>
        )}
      </div>

      {/* Quizzes & Assessments */}
      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-violet-400" />
          Course Assessments
        </h2>
        {course.quizzes && course.quizzes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {course.quizzes.map((quiz: any) => (
              <div 
                key={quiz.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-semibold text-slate-100 text-lg">{quiz.title}</h3>
                    <Badge variant="info" className="text-xs">Passing: {quiz.passing_score}%</Badge>
                  </div>
                  {quiz.description && (
                    <p className="text-sm text-slate-400">{quiz.description}</p>
                  )}
                  {quiz.time_limit_minutes && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={13} /> {quiz.time_limit_minutes} minutes time limit
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {course.is_enrolled ? (
                    <Button 
                      onClick={() => navigate(`/trainee/quizzes/${quiz.id}`)}
                      className="bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      Take Quiz
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary"
                      onClick={handleEnroll}
                      isLoading={enrolling}
                    >
                      Enroll to Take Quiz
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-400 text-sm">No assessments currently assigned to this course.</p>
          </div>
        )}
      </div>
    </div>
  );
}
