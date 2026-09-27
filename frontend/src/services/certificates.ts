import { api } from './api';

export const certificatesService = {
  getCertificates: () => api.get('/certificates'),
  getCertificate: (id: number) => api.get(`/certificates/${id}`),
  claimCertificate: (courseId: number) => api.post(`/certificates/claim/${courseId}`),
};
