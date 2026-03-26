import { apiClient } from '../axios.instance';

export const rulesApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/rules', { params }),
  getById: (id: string) => apiClient.get(`/rules/${id}`),
  create: (data: unknown) => apiClient.post('/rules', data),
  update: (id: string, data: unknown) => apiClient.put(`/rules/${id}`, data),
  delete: (id: string) => apiClient.delete(`/rules/${id}`),
  publish: (data: unknown) => apiClient.post('/rules/publish', data),
};

export const ruleFoldersApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/rulefolders', { params }),
  getById: (id: string) => apiClient.get(`/rulefolders/${id}`),
  create: (data: unknown) => apiClient.post('/rulefolders', data),
  update: (id: string, data: unknown) => apiClient.put(`/rulefolders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/rulefolders/${id}`),
};

export const customExpressionsApi = {
  getAll: (params?: Record<string, unknown>) => apiClient.get('/customexpressions', { params }),
  getById: (id: string) => apiClient.get(`/customexpressions/${id}`),
  create: (data: unknown) => apiClient.post('/customexpressions', data),
  update: (id: string, data: unknown) => apiClient.put(`/customexpressions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/customexpressions/${id}`),
};

export const schemaApi = {
  getTree: (program: string) => apiClient.get(`/schema/tree/${program}`),
  reset: (program: string) => apiClient.post(`/schema/reset/${program}`),
  getExtensionSchema: () => apiClient.get('/schema/extensionschema'),
  getMetaSchema: () => apiClient.get('/schema/metaschema'),
  validate: (data: unknown) => apiClient.post('/schema/validation', data),
};
