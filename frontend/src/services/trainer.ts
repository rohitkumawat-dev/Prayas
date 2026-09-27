import { api } from './api';

export const trainerApi = {
  getCourses: () => api.get('/trainer/courses'),
  createCourse: (data: any) => api.post('/trainer/courses', data),
  updateCourse: (id: number, data: any) => api.put(`/trainer/courses/${id}`, data),
  deleteCourse: (id: number) => api.delete(`/trainer/courses/${id}`),

  createModule: (courseId: number, data: any) => api.post(`/trainer/courses/${courseId}/modules`, data),
  updateModule: (id: number, data: any) => api.put(`/trainer/modules/${id}`, data),
  deleteModule: (id: number) => api.delete(`/trainer/modules/${id}`),

  createLesson: (moduleId: number, data: any) => api.post(`/trainer/modules/${moduleId}/lessons`, data),
  updateLesson: (id: number, data: any) => api.put(`/trainer/lessons/${id}`, data),
  deleteLesson: (id: number) => api.delete(`/trainer/lessons/${id}`),

  createQuiz: (courseId: number, data: any) => api.post(`/trainer/courses/${courseId}/quizzes`, data),
  updateQuiz: (id: number, data: any) => api.put(`/trainer/quizzes/${id}`, data),
  deleteQuiz: (id: number) => api.delete(`/trainer/quizzes/${id}`),

  createQuestion: (quizId: number, data: any) => api.post(`/trainer/quizzes/${quizId}/questions`, data),
  updateQuestion: (id: number, data: any) => api.put(`/trainer/questions/${id}`, data),
  deleteQuestion: (id: number) => api.delete(`/trainer/questions/${id}`),

  getStudents: () => api.get('/trainer/students'),
  getAnalytics: () => api.get('/trainer/analytics'),
  getNeedsAttention: () => api.get('/trainer/needs-attention'),

  // Performance Analytics
  getCoursePerformance: (courseId: number) => api.get(`/trainer/courses/${courseId}/performance`),
  getCourseLearners: (courseId: number) => api.get(`/trainer/courses/${courseId}/learners`),
  getLearnerDetail: (courseId: number, traineeId: number) => api.get(`/trainer/courses/${courseId}/learners/${traineeId}`),
  getCourseQuizzesPerformance: (courseId: number) => api.get(`/trainer/courses/${courseId}/quizzes/performance`),
};
