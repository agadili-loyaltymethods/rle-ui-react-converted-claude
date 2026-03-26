import { apiClient } from '../axios.instance';

const crudResource = (path: string) => ({
  getAll: (params?: Record<string, unknown>) => apiClient.get(path, { params }),
  getById: (id: string) => apiClient.get(`${path}/${id}`),
  create: (data: unknown) => apiClient.post(path, data),
  update: (id: string, data: unknown) => apiClient.put(`${path}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${path}/${id}`),
});

export const orgsApi = crudResource('/orgs');
export const segmentsApi = crudResource('/segments');
export const locationsApi = crudResource('/locations');
export const productsApi = crudResource('/products');
export const dmasApi = crudResource('/dmas');
export const enumsApi = crudResource('/enums');
export const loyaltyCardsApi = crudResource('/loyaltycards');
export const divisionsApi = crudResource('/divisions');
export const namedListsApi = {
  ...crudResource('/namedlists'),
  getStaticData: (id: string) => apiClient.get(`/namedlist/staticdata/${id}`),
  refresh: (id: string) => apiClient.post(`/namedlist/refresh/${id}`),
  refreshAll: () => apiClient.post('/namedlist/refreshall'),
  exportCsv: (id: string) => apiClient.get('/exportdatacsv', { params: { id }, timeout: 120000 }),
};
