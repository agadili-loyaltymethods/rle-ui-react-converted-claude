import { apiClient } from '../axios.instance';

export const miscApi = {
  refreshCache: (entityType: string) =>
    apiClient.get('/refreshcache', { params: { entity: entityType } }),

  getFlags: () => apiClient.get('/get-flags'),

  multiEdit: (data: unknown) => apiClient.post('/multiedit', data),
  multiDelete: (data: unknown) => apiClient.post('/multidelete', data),

  extendedGet: (entity: string, count: number, params?: Record<string, unknown>) =>
    apiClient.get(`/extendedget/${entity}/${count}`, { params }),

  getLimits: (role: string, id: string, limitType: string) =>
    apiClient.get(`/limits/${role}/${id}/${limitType}`),

  updateLimits: (role: string, id: string, limitType: string, data: unknown) =>
    apiClient.put(`/limits/${role}/${id}/${limitType}`, data),

  getMcpDeployedConfigs: () => apiClient.get('/mcpuideployedconfigs'),
  getMcpPublishedConfigs: () => apiClient.get('/mcpuipublishedconfigs'),

  cancelActivity: (memberId: string, activityId: string) =>
    apiClient.post(`/activity/${memberId}/cancel/${activityId}`),

  getActivityLog: (activityId: string) =>
    apiClient.get(`/activity/${activityId}/log`),

  getFlows: (params?: Record<string, unknown>) => apiClient.get('/flows', { params }),
  getFlow: (id: string) => apiClient.get(`/flows/${id}`),
  createFlow: (data: unknown) => apiClient.post('/flows', data),
  updateFlow: (id: string, data: unknown) => apiClient.put(`/flows/${id}`, data),
  deleteFlow: (id: string) => apiClient.delete(`/flows/${id}`),
};
