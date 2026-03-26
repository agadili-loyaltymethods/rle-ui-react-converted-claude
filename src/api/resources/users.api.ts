import { apiClient } from '../axios.instance';

export const usersApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/users', { params }),
  getById: (id: string) => apiClient.get(`/users/${id}`),
  create: (data: unknown) => apiClient.post('/users', data),
  update: (id: string, data: unknown) => apiClient.put(`/users/${id}`, data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  resetPassword: (id: string) => apiClient.post(`/users/${id}/reset-password`),
};
