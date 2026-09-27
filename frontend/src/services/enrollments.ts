import { api } from './api';

export const enrollmentsApi = {
  getEnrollments: async () => {
    return api.get('/enrollments');
  },
  
  enroll: async (courseId: number) => {
    return api.post(`/courses/${courseId}/enroll`);
  },
};
