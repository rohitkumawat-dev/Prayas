import { api } from './api';

export const progressService = {
  getDashboard: () => api.get('/progress/dashboard'),
  getAllProgress: () => api.get('/progress'),
  getCourseProgress: (courseId: number) => api.get(`/progress/courses/${courseId}`),
};
