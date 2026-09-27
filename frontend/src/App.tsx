import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import NotFoundPage from './pages/not-found';
import { DashboardLayout } from './components/layout/dashboard-layout';

// Trainee, Trainer, and Admin pages are code-split with React.lazy so a
// visitor only ever downloads the JS for the role they're actually using,
// instead of one giant bundle containing every dashboard up front.

// Trainee Pages
const TraineeDashboard = lazy(() => import('./pages/trainee/dashboard'));
const TraineeCourses = lazy(() => import('./pages/trainee/courses'));
const TraineeCourseDetail = lazy(() => import('./pages/trainee/course-detail'));
const TraineeLearning = lazy(() => import('./pages/trainee/learning'));
const TraineeQuiz = lazy(() => import('./pages/trainee/quiz'));
const TraineeQuizResult = lazy(() => import('./pages/trainee/quiz-result'));
const TraineeProgress = lazy(() => import('./pages/trainee/progress'));
const TraineeCertificates = lazy(() => import('./pages/trainee/certificates'));
const TraineeProfile = lazy(() => import('./pages/trainee/profile'));

// Trainer Pages
const TrainerDashboard = lazy(() => import('./pages/trainer/dashboard'));
const TrainerCourses = lazy(() => import('./pages/trainer/courses'));
const TrainerCourseForm = lazy(() => import('./pages/trainer/course-form'));
const TrainerCourseManage = lazy(() => import('./pages/trainer/course-manage'));
const TrainerStudents = lazy(() => import('./pages/trainer/students'));
const TrainerAnalytics = lazy(() => import('./pages/trainer/analytics'));
const TrainerCoursePerformance = lazy(() => import('./pages/trainer/course-performance'));
const TrainerProfile = lazy(() => import('./pages/trainer/profile'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/dashboard'));
const AdminUsers = lazy(() => import('./pages/admin/users'));
const AdminTrainees = lazy(() => import('./pages/admin/trainees'));
const AdminTrainers = lazy(() => import('./pages/admin/trainers'));
const AdminCourses = lazy(() => import('./pages/admin/courses'));
const AdminAnalytics = lazy(() => import('./pages/admin/analytics'));
const AdminSettings = lazy(() => import('./pages/admin/settings'));

import { AuthProvider } from './contexts/auth-context';
import { ToastProvider } from './contexts/toast-context';

function RouteLoadingFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Trainee Routes */}
        <Route element={<DashboardLayout allowedRoles={['trainee']} />}>
          <Route path="/trainee/dashboard" element={<TraineeDashboard />} />
          <Route path="/trainee/courses" element={<TraineeCourses />} />
          <Route path="/trainee/courses/:id" element={<TraineeCourseDetail />} />
          <Route path="/trainee/learning/:id" element={<TraineeLearning />} />
          <Route path="/trainee/quizzes/:id" element={<TraineeQuiz />} />
          <Route path="/trainee/quizzes/:id/result" element={<TraineeQuizResult />} />
          <Route path="/trainee/progress" element={<TraineeProgress />} />
          <Route path="/trainee/certificates" element={<TraineeCertificates />} />
          <Route path="/trainee/profile" element={<TraineeProfile />} />
        </Route>

        {/* Trainer Routes */}
        <Route element={<DashboardLayout allowedRoles={['trainer']} />}>
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/courses" element={<TrainerCourses />} />
          <Route path="/trainer/courses/new" element={<TrainerCourseForm />} />
          <Route path="/trainer/courses/:id" element={<TrainerCourseManage />} />
          <Route path="/trainer/courses/:id/edit" element={<TrainerCourseForm />} />
          <Route path="/trainer/courses/:id/manage" element={<TrainerCourseManage />} />
          <Route path="/trainer/courses/:id/performance" element={<TrainerCoursePerformance />} />
          <Route path="/trainer/students" element={<TrainerStudents />} />
          <Route path="/trainer/analytics" element={<TrainerAnalytics />} />
          <Route path="/trainer/profile" element={<TrainerProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/trainees" element={<AdminTrainees />} />
          <Route path="/admin/trainers" element={<AdminTrainers />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
