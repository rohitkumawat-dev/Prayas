import { api } from './api';

export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (search?: string, role?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    const qs = params.toString();
    return api.get(`/admin/users${qs ? `?${qs}` : ''}`);
  },
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/admin/users', data),
  getApprovalRequests: () => api.get('/admin/approval-requests'),
  approveAdmin: (id: number) => api.post(`/admin/users/${id}/approve`),
  rejectAdmin: (id: number) => api.post(`/admin/users/${id}/reject`),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: { role?: string; is_active?: boolean; name?: string }) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getTrainees: () => api.get('/admin/trainees'),
  getTrainers: () => api.get('/admin/trainers'),
  getCourses: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/admin/courses${qs}`);
  },
  moderateCourse: (id: number, data: { is_published?: boolean }) =>
    api.put(`/admin/courses/${id}`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
};
