import { api } from './api';

export const quizzesService = {
  getQuiz: (id: number) => api.get(`/quizzes/${id}`),
  submitQuiz: (id: number, answers: Record<string, string>) => api.post(`/quizzes/${id}/submit`, { answers }),
  getAttempts: (id: number) => api.get(`/quizzes/${id}/attempts`),
};
