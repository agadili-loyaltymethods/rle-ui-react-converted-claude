import { apiClient } from '../axios.instance';

export const programsApi = {
  getAll: (params?: Record<string, unknown>) =>
    apiClient.get('/programs', { params }),

  getById: (id: string) =>
    apiClient.get(`/programs/${id}`),

  create: (data: unknown) =>
    apiClient.post('/programs', data),

  update: (id: string, data: unknown) =>
    apiClient.put(`/programs/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/programs/${id}`),

  publish: (id: string) =>
    apiClient.post(`/programs/${id}/publish`),

  unpublish: (id: string) =>
    apiClient.post(`/programs/${id}/unpublish`),

  exportProgram: (id: string) =>
    apiClient.get(`/programs/${id}/export`, { timeout: 120000 }),

  getDependencyChecksums: (orgId: string) =>
    apiClient.get(`/programs/${orgId}/dependency-checksums`),

  getPublishInfo: (id: string) =>
    apiClient.get(`/programs/${id}/publish-info`),

  checkAlias: (id: string, alias: string) =>
    apiClient.get(`/programs/${id}/has-alias`, { params: { alias } }),
};
