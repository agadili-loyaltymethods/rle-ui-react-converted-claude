import { apiClient } from '../axios.instance';

const crudResource = (path: string) => ({
  getAll: (params?: Record<string, unknown>) => apiClient.get(path, { params }),
  getById: (id: string) => apiClient.get(`${path}/${id}`),
  create: (data: unknown) => apiClient.post(path, data),
  update: (id: string, data: unknown) => apiClient.put(`${path}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${path}/${id}`),
});

export const rewardPoliciesApi = crudResource('/rewardpolicies');
export const pursePoliciesApi = crudResource('/pursepolicies');
export const tierPoliciesApi = crudResource('/tierpolicies');
export const streakPoliciesApi = crudResource('/streakpolicies');
export const aggregatePoliciesApi = crudResource('/aggregatepolicies');
export const partnersApi = crudResource('/partners');
// Promo Policies: AngularJS uses /rules filtered by isPromoFolder — handled in PoliciesPage, not here
export const promoCodeDefsApi = crudResource('/promocodedefs');
