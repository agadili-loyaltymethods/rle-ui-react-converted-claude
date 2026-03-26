import { apiClient } from '../axios.instance';

export const jobsApi = {
  getLatest: () => apiClient.get('/jobs/latest'),
  generatePromoCodes: (data: unknown) => apiClient.post('/promocodes/generatecodes', data),
  managePromoCode: (campaignCode: string, action: string) =>
    apiClient.post(`/promocodes/${campaignCode}/${action}`),
};
