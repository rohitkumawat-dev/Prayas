import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabList, TabTrigger, TabContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/contexts/toast-context';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, FileText, HelpCircle, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { coursesApi } from '@/services/courses';
import { trainerApi } from '@/services/trainer';
import { useSEO } from '@/hooks/use-seo';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

export default function CourseManage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  useSEO({ title: course?.title ? `Manage: ${course.title}` : 'Course Content Manager', description: 'Manage modules, lessons, and quizzes for this course.', noindex: true });
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});

  // Dialog States
  const [moduleModal, setModuleModal] = useState<{ open: boolean; editId?: number; title: string; description: string }>({
    open: false, title: '', description: ''
  });

  const [lessonModal, setLessonModal] = useState<{ open: boolean; moduleId?: number; editId?: number; title: string; content: string; duration_minutes: number }>({
    open: false, title: '', content: '', duration_minutes: 15
  });

  const [quizModal, setQuizModal] = useState<{ open: boolean; editId?: number; title: string; description: string; passing_score: number }>({
    open: false, title: '', description: '', passing_score: 70
  });

  const [questionModal, setQuestionModal] = useState<{
    open: boolean;
    quizId?: number;
    editId?: number;
    text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
  }>({
    open: false,
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a'
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCourse = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await coursesApi.getCourse(Number(id));
      setCourse(res.data);
      if (res.data?.modules?.length > 0) {
        setExpandedModules(prev => ({ ...prev, [res.data.modules[0].id]: true }));
      }
    } catch (err: any) {
      toast({ title: 'Failed to load course details', description: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const toggleModule = (modId: number) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Module actions
  const handleSaveModule = async () => {
    if (!id || !moduleModal.title) return;
    setSubmitting(true);
    try {
      if (moduleModal.editId) {
        await trainerApi.updateModule(moduleModal.editId, {
          title: moduleModal.title,
          description: moduleModal.description
        });
        toast({ title: 'Module updated', type: 'success' });
      } else {
        await trainerApi.createModule(Number(id), {
          title: moduleModal.title,
          description: moduleModal.description
        });
        toast({ title: 'Module created', type: 'success' });
      }
      setModuleModal({ open: false, title: '', description: '' });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Operation failed', description: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await trainerApi.deleteModule(moduleId);
      toast({ title: 'Module deleted', type: 'success' });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, type: 'error' });
    }
  };

  // Lesson actions
  const handleSaveLesson = async () => {
    if (!lessonModal.moduleId || !lessonModal.title) return;
    setSubmitting(true);
    try {
      if (lessonModal.editId) {
        await trainerApi.updateLesson(lessonModal.editId, {
          title: lessonModal.title,
          content: lessonModal.content,
          duration_minutes: lessonModal.duration_minutes
        });
        toast({ title: 'Lesson updated', type: 'success' });
      } else {
        await trainerApi.createLesson(lessonModal.moduleId, {
          title: lessonModal.title,
          content: lessonModal.content,
          type: 'text',
          duration_minutes: lessonModal.duration_minutes
        });
        toast({ title: 'Lesson added', type: 'success' });
      }
      setLessonModal({ open: false, title: '', content: '', duration_minutes: 15 });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Operation failed', description: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await trainerApi.deleteLesson(lessonId);
      toast({ title: 'Lesson deleted', type: 'success' });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, type: 'error' });
    }
  };

  // Quiz actions
  const handleSaveQuiz = async () => {
    if (!id || !quizModal.title) return;
    setSubmitting(true);
    try {
      if (quizModal.editId) {
        await trainerApi.updateQuiz(quizModal.editId, {
          title: quizModal.title,
          description: quizModal.description,
          passing_score: quizModal.passing_score
        });
        toast({ title: 'Quiz updated', type: 'success' });
      } else {
        await trainerApi.createQuiz(Number(id), {
          title: quizModal.title,
          description: quizModal.description,
          passing_score: quizModal.passing_score
        });
        toast({ title: 'Quiz created', type: 'success' });
      }
      setQuizModal({ open: false, title: '', description: '', passing_score: 70 });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Operation failed', description: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await trainerApi.deleteQuiz(quizId);
      toast({ title: 'Quiz deleted', type: 'success' });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, type: 'error' });
    }
  };

  // Question actions
  const handleSaveQuestion = async () => {
    if (!questionModal.quizId || !questionModal.text) return;
    setSubmitting(true);
    try {
      if (questionModal.editId) {
        await trainerApi.updateQuestion(questionModal.editId, {
          text: questionModal.text,
          option_a: questionModal.option_a,
          option_b: questionModal.option_b,
          option_c: questionModal.option_c,
          option_d: questionModal.option_d,
          correct_option: questionModal.correct_option
        });
        toast({ title: 'Question updated', type: 'success' });
      } else {
        await trainerApi.createQuestion(questionModal.quizId, {
          text: questionModal.text,
          option_a: questionModal.option_a,
          option_b: questionModal.option_b,
          option_c: questionModal.option_c,
          option_d: questionModal.option_d,
          correct_option: questionModal.correct_option,
          points: 1
        });
        toast({ title: 'Question added', type: 'success' });
      }
      setQuestionModal({ open: false, text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Operation failed', description: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await trainerApi.deleteQuestion(questionId);
      toast({ title: 'Question deleted', type: 'success' });
      fetchCourse();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, type: 'error' });
    }
  };

  if (loading) return <Skeleton className="h-[600px] w-full rounded-xl" />;
  if (!course) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <Breadcrumbs items={[{ label: 'My Courses', href: '/trainer/courses' }, { label: course.title }]} />
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Course Content Manager</h1>
          <p className="text-slate-400 font-medium text-sm mt-0.5">{course.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate(`/trainer/courses/${course.id}/performance`)}>
            <BarChart3 className="w-4 h-4 mr-1.5" /> Performance Analytics
          </Button>
          <Button variant="secondary" onClick={() => navigate('/trainer/courses')}>Back to Courses</Button>
        </div>
      </header>

      <Tabs defaultValue="curriculum">
        <TabList className="mb-6">
          <TabTrigger value="curriculum">Curriculum (Modules & Lessons)</TabTrigger>
          <TabTrigger value="quizzes">Quizzes & Assessments</TabTrigger>
        </TabList>

        <TabContent value="curriculum" className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h2 className="font-semibold text-slate-200">Course Modules ({course.modules?.length ?? 0})</h2>
              <p className="text-xs text-slate-400">Add learning sections and step-by-step instructional lessons.</p>
            </div>
            <Button size="sm" onClick={() => setModuleModal({ open: true, title: '', description: '' })}>
              <Plus className="w-4 h-4 mr-1.5"/> Add Module
            </Button>
          </div>

          <div className="space-y-4">
            {course.modules?.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <p className="text-slate-400 text-sm mb-3">This course has no modules yet.</p>
                <Button size="sm" onClick={() => setModuleModal({ open: true, title: '', description: '' })}>
                  <Plus className="w-4 h-4 mr-1.5"/> Create First Module
                </Button>
              </div>
            ) : (
              course.modules?.map((module: any) => (
                <div key={module.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center p-4 bg-slate-800/40 hover:bg-slate-800/70 transition-colors">
                    <button onClick={() => toggleModule(module.id)} className="mr-3 text-slate-400 hover:text-slate-200">
                      {expandedModules[module.id] ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100">{module.title}</h3>
                      {module.description && <p className="text-xs text-slate-400 mt-0.5">{module.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => setModuleModal({ open: true, editId: module.id, title: module.title, description: module.description || '' })}
                      >
                        <Edit className="w-4 h-4"/>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-rose-400 hover:text-rose-300"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>

                  {expandedModules[module.id] && (
                    <div className="p-4 border-t border-slate-800 space-y-3 pl-8 sm:pl-12 bg-slate-950/30">
                      {module.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-lg group">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                            <span className="text-sm text-slate-200">{lesson.title}</span>
                            <span className="text-xs text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">{lesson.duration_minutes}m</span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2"
                              onClick={() => setLessonModal({
                                open: true,
                                moduleId: module.id,
                                editId: lesson.id,
                                title: lesson.title,
                                content: lesson.content || '',
                                duration_minutes: lesson.duration_minutes || 15
                              })}
                            >
                              <Edit className="w-3.5 h-3.5"/>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-rose-400 hover:text-rose-300"
                              onClick={() => handleDeleteLesson(lesson.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full border border-dashed border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500 mt-2"
                        onClick={() => setLessonModal({ open: true, moduleId: module.id, title: '', content: '', duration_minutes: 15 })}
                      >
                        <Plus className="w-4 h-4 mr-2"/> Add Lesson to {module.title}
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabContent>

        <TabContent value="quizzes" className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div>
              <h2 className="font-semibold text-slate-200">Quizzes ({course.quizzes?.length ?? 0})</h2>
              <p className="text-xs text-slate-400">Create rigorous knowledge assessments to certify learners.</p>
            </div>
            <Button size="sm" onClick={() => setQuizModal({ open: true, title: '', description: '', passing_score: 70 })}>
              <Plus className="w-4 h-4 mr-1.5"/> Add Quiz
            </Button>
          </div>

          <div className="space-y-4">
            {course.quizzes?.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800/80 rounded-xl">
                <p className="text-slate-400 text-sm mb-3">No quizzes created for this course yet.</p>
                <Button size="sm" onClick={() => setQuizModal({ open: true, title: '', description: '', passing_score: 70 })}>
                  <Plus className="w-4 h-4 mr-1.5"/> Create Assessment Quiz
                </Button>
              </div>
            ) : (
              course.quizzes?.map((quiz: any) => (
                <div key={quiz.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-slate-100 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Passing score: {quiz.passing_score}% • {quiz.questions_count ?? quiz.questions?.length ?? 0} questions</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2"
                        onClick={() => setQuizModal({ open: true, editId: quiz.id, title: quiz.title, description: quiz.description || '', passing_score: quiz.passing_score || 70 })}
                      >
                        <Edit className="w-4 h-4"/>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-2 text-rose-400 hover:text-rose-300"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-violet-400 hover:text-violet-300 text-xs h-7"
                        onClick={() => setQuestionModal({
                          open: true,
                          quizId: quiz.id,
                          text: '',
                          option_a: '',
                          option_b: '',
                          option_c: '',
                          option_d: '',
                          correct_option: 'a'
                        })}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1"/> Add Question
                      </Button>
                    </div>

                    {quiz.questions?.map((q: any, i: number) => (
                      <div key={q.id} className="flex justify-between items-center py-2.5 border-b border-slate-800/80 last:border-0 text-sm">
                        <div className="text-slate-300 pr-4">
                          <span className="text-violet-400 font-semibold mr-2">{i + 1}.</span>
                          {q.text}
                          <span className="ml-2 text-xs text-emerald-400 font-medium">(Ans: {q.correct_option?.toUpperCase()})</span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-1 text-slate-400 hover:text-slate-200"
                            onClick={() => setQuestionModal({
                              open: true,
                              quizId: quiz.id,
                              editId: q.id,
                              text: q.text,
                              option_a: q.option_a,
                              option_b: q.option_b,
                              option_c: q.option_c || '',
                              option_d: q.option_d || '',
                              correct_option: q.correct_option || 'a'
                            })}
                          >
                            <Edit className="w-3.5 h-3.5"/>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-1 text-rose-400 hover:text-rose-300"
                            onClick={() => handleDeleteQuestion(q.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5"/>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabContent>
      </Tabs>

      {/* Module Modal */}
      <Dialog
        isOpen={moduleModal.open}
        onClose={() => setModuleModal(prev => ({ ...prev, open: false }))}
        title={moduleModal.editId ? "Edit Module" : "Add New Module"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModuleModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button onClick={handleSaveModule} isLoading={submitting}>Save Module</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input 
            label="Module Title" 
            value={moduleModal.title}
            onChange={(e) => setModuleModal(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Fundamental Syntax & Structures"
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
            <textarea 
              value={moduleModal.description}
              onChange={(e) => setModuleModal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief overview of module topics"
              className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
            />
          </div>
        </div>
      </Dialog>

      {/* Lesson Modal */}
      <Dialog
        isOpen={lessonModal.open}
        onClose={() => setLessonModal(prev => ({ ...prev, open: false }))}
        title={lessonModal.editId ? "Edit Lesson" : "Add New Lesson"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLessonModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button onClick={handleSaveLesson} isLoading={submitting}>Save Lesson</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input 
            label="Lesson Title" 
            value={lessonModal.title}
            onChange={(e) => setLessonModal(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Variable Declarations and Scope"
            required
          />
          <Input 
            label="Estimated Duration (Minutes)"
            type="number"
            value={lessonModal.duration_minutes}
            onChange={(e) => setLessonModal(prev => ({ ...prev, duration_minutes: Number(e.target.value) || 10 }))}
            min={1}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Lesson Content (Markdown Supported)</label>
            <textarea 
              value={lessonModal.content}
              onChange={(e) => setLessonModal(prev => ({ ...prev, content: e.target.value }))}
              placeholder="# Lesson Heading&#10;&#10;Explain core concepts and provide code examples."
              className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[160px]"
              required
            />
          </div>
        </div>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog
        isOpen={quizModal.open}
        onClose={() => setQuizModal(prev => ({ ...prev, open: false }))}
        title={quizModal.editId ? "Edit Quiz" : "Create Quiz"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuizModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button onClick={handleSaveQuiz} isLoading={submitting}>Save Quiz</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input 
            label="Quiz Title" 
            value={quizModal.title}
            onChange={(e) => setQuizModal(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Milestone Assessment"
            required
          />
          <Input 
            label="Passing Score (%)"
            type="number"
            value={quizModal.passing_score}
            onChange={(e) => setQuizModal(prev => ({ ...prev, passing_score: Number(e.target.value) || 60 }))}
            min={10}
            max={100}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Instructions / Description</label>
            <textarea 
              value={quizModal.description}
              onChange={(e) => setQuizModal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Instructions for trainees taking this quiz"
              className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
            />
          </div>
        </div>
      </Dialog>

      {/* Question Modal */}
      <Dialog
        isOpen={questionModal.open}
        onClose={() => setQuestionModal(prev => ({ ...prev, open: false }))}
        title={questionModal.editId ? "Edit Question" : "Add Question"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuestionModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
            <Button onClick={handleSaveQuestion} isLoading={submitting}>Save Question</Button>
          </>
        }
      >
        <div className="space-y-3 py-2">
          <Input 
            label="Question Text" 
            value={questionModal.text}
            onChange={(e) => setQuestionModal(prev => ({ ...prev, text: e.target.value }))}
            placeholder="e.g. Which keyword declares a block-scoped variable?"
            required
          />
          <Input 
            label="Option A" 
            value={questionModal.option_a}
            onChange={(e) => setQuestionModal(prev => ({ ...prev, option_a: e.target.value }))}
            required
          />
          <Input 
            label="Option B" 
            value={questionModal.option_b}
            onChange={(e) => setQuestionModal(prev => ({ ...prev, option_b: e.target.value }))}
            required
          />
          <Input 
            label="Option C (Optional)" 
            value={questionModal.option_c}
            onChange={(e) => setQuestionModal(prev => ({ ...prev, option_c: e.target.value }))}
          />
          <Input 
            label="Option D (Optional)" 
            value={questionModal.option_d}
            onChange={(e) => setQuestionModal(prev => ({ ...prev, option_d: e.target.value }))}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Correct Option</label>
            <select
              value={questionModal.correct_option}
              onChange={(e) => setQuestionModal(prev => ({ ...prev, correct_option: e.target.value }))}
              className="flex w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="a">Option A</option>
              <option value="b">Option B</option>
              <option value="c">Option C</option>
              <option value="d">Option D</option>
            </select>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
