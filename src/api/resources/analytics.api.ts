import { apiClient } from '../axios.instance';

export const analyticsApi = {
  getByFilter: (module: string, filter: string, params?: Record<string, unknown>) =>
    apiClient.get(`/analytics/${module}/by/${filter}`, { params }),

  getDma: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('members', 'dma', params),

  getTier: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('members', 'tier', params),

  getEnrollSource: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('members', 'enroll-source', params),

  getEnrollChannel: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('members', 'enroll-channel', params),

  getSegment: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('members', 'segment', params),

  getPromotionParticipation: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('promotions', 'participation', params),

  getPurses: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('purses', 'balance', params),

  getRewards: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('rewards', 'balance', params),

  getRewardRedemption: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('rewards', 'redemption', params),

  getOfferRedemption: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('offers', 'redemption', params),

  getProductRedemption: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('products', 'redemption', params),

  getTopProducts: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('products', 'top', params),

  getAverageTickets: (params?: Record<string, unknown>) =>
    analyticsApi.getByFilter('tickets', 'average', params),
};
