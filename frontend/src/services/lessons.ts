import { api } from './api';

export const lessonsService = {
  getLesson: (id: number) => api.get(`/lessons/${id}`),
  completeLesson: (id: number) => api.post(`/lessons/${id}/complete`),
};
