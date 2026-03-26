import { apiClient } from '../axios.instance';

export interface Member {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  cellPhone?: string;
  /** @deprecated use cellPhone */
  phone?: string;
  loyaltyId?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type?: string;
  status?: string;
  enrollDate?: string;
  enrollChannel?: string;
  enrollSource?: string;
  enrollLocation?: string;
  acquisitionChannel?: string;
  acquisitionDate?: string;
  dob?: string;
  gender?: string;
  program?: { _id?: string; name?: string } | string;
  tiers?: Array<{ primary?: boolean; level?: { name?: string; color?: string } }>;
  purses?: Array<{ primary?: boolean; availBalance?: number; policyId?: { colors?: unknown[]; ptMultiplier?: number }; lockedPoints?: unknown[] }>;
  divisions?: Array<{ name?: string } | string>;
  canPreview?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastActivityDate?: string;
  createdBy?: { login?: string } | string;
  updatedBy?: { login?: string } | string;
  referralCode?: string;
  ext?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface MemberSearchParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  cellPhone?: string;
  loyaltyId?: string;
  /** @deprecated use skip/limit for server-side pagination */
  page?: number;
  /** @deprecated use skip/limit for server-side pagination */
  pageSize?: number;
  /** Server-side pagination — number of records to return */
  limit?: number;
  /** Server-side pagination — number of records to skip */
  skip?: number;
  /** Locale for translated labels, e.g. 'en' */
  locale?: string;
  populate?: string;
  select?: string | Record<string, number>;
  sort?: unknown;
  query?: string;
}

export const membersApi = {
  search: (params: MemberSearchParams) =>
    apiClient.get('/members', { params }),

  getExtensionSchema: () =>
    apiClient.get('/schema/extensionschema', { params: { query: JSON.stringify({ display: true }) } }),

  getById: (id: string) =>
    apiClient.get(`/members/${id}`),

  create: (data: Partial<Member>) =>
    apiClient.post('/members', data),

  update: (id: string, data: Partial<Member>) =>
    apiClient.put(`/members/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/members/${id}`),

  findByLoyaltyId: (loyaltyId: string) =>
    apiClient.get(`/members/findByLoyaltyId/${loyaltyId}`),

  getProgramParticipation: (memberId: string, programId: string) =>
    apiClient.get(`/members/${memberId}/program/${programId}`),

  getReferral: (memberId: string) =>
    apiClient.get(`/members/${memberId}/referral`),

  merge: (survivorId: string, victimId: string) =>
    apiClient.post(`/members/${survivorId}/merge/${victimId}`),

  unmerge: (survivorId: string) =>
    apiClient.post(`/members/unmerge/${survivorId}`),

  getMergeHistory: (memberId: string) =>
    apiClient.get(`/mergetrail/${memberId}`),

  // Member sub-resources
  getActivities: (memberId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/members/${memberId}/activities`, { params }),

  getRewards: (memberId: string) =>
    apiClient.get(`/members/${memberId}/rewards`),

  getPurses: (memberId: string) =>
    apiClient.get(`/members/${memberId}/purses`),

  getTiers: (memberId: string) =>
    apiClient.get(`/members/${memberId}/tiers`),

  getBadges: (memberId: string) =>
    apiClient.get(`/members/${memberId}/badges`),

  getTransactions: (memberId: string, params?: Record<string, unknown>) =>
    apiClient.get(`/members/${memberId}/transactions`, { params }),

  getSegments: (memberId: string) =>
    apiClient.get(`/members/${memberId}/segments`),

  getStreaks: (memberId: string) =>
    apiClient.get(`/members/${memberId}/streaks`),

  adjustPoints: (memberId: string, data: unknown) =>
    apiClient.post(`/members/${memberId}/adjust`, data),

  upgradeDowngradeTier: (memberId: string, tierId: string, action: string) =>
    apiClient.post(`/members/${memberId}/tiers/${tierId}/${action}`),
};
