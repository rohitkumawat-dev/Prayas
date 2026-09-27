export interface User {
  id: number;
  name: string;
  email: string;
  role: 'trainee' | 'trainer' | 'admin';
  avatar?: string;
  bio?: string;
  is_active: boolean;
  status: 'active' | 'pending' | 'rejected';
  is_super_admin?: boolean;
  approved_by?: number | null;
  approved_at?: string | null;
  rejected_by?: number | null;
  rejected_at?: string | null;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  thumbnail?: string;
  is_published: boolean;
  trainer_id: number;
  trainer_name: string;
  created_at: string;
  modules?: Module[];
  enrollment_count?: number;
  is_enrolled?: boolean;
  quizzes?: Quiz[];
  quiz_count?: number;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  course_id: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  type: 'text' | 'video' | 'document';
  duration_minutes: number;
  order: number;
  module_id: number;
  is_completed?: boolean;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'active' | 'completed' | 'dropped';
  enrolled_at: string;
  completed_at?: string;
  course?: Course;
  progress?: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  passing_score: number;
  course_id: number;
  module_id?: number;
  time_limit_minutes?: number;
  questions?: Question[];
}

export interface Question {
  id: number;
  quiz_id: number;
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  order: number;
  points: number;
}

export interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  started_at: string;
  completed_at: string;
}

export interface Certificate {
  id: number;
  certificate_uid: string;
  user_id: number;
  course_id: number;
  issued_at: string;
  trainer_name: string;
  course_title: string;
  user_name?: string;
}

export interface Activity {
  id: number;
  user_id: number;
  type: string;
  description: string;
  created_at: string;
}
