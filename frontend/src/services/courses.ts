import { api } from './api';

export const coursesApi = {
  getCourses: async (params?: Record<string, string>) => {
    const query = params ? new URLSearchParams(params).toString() : '';
    return api.get(`/courses${query ? `?${query}` : ''}`);
  },
  
  getCourse: async (id: number) => {
    return api.get(`/courses/${id}`);
  },

  getCategories: async () => {
    return api.get('/courses/categories');
  },

  enroll: async (courseId: number) => {
    return api.post(`/courses/${courseId}/enroll`);
  },
};
