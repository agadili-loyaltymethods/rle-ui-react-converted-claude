import { apiClient } from '../axios.instance';

export const aclApi = {
  // List all roles — matches AngularJS: RLE.ACL.query({ type: 'roles' }) → GET /api/acl/roles
  getRoles: () => apiClient.get('/acl/roles'),
  // List all resources — matches AngularJS: RLE.ACL.get({ type: 'resources' }) → GET /api/acl/resources
  getResources: () => apiClient.get('/acl/resources'),
  getUserRoles: (userId: string) => apiClient.get(`/acl/users/${userId}/roles`),
  assign: (type: string, id: string, action: string, data: unknown) =>
    apiClient.post(`/acl/${type}/${id}/${action}`, data),
  revoke: (type: string, id: string, action: string, data: unknown) =>
    apiClient.delete(`/acl/${type}/${id}/${action}`, { data }),
  getMyAccount: () => apiClient.get('/myaccount'),
  changePassword: (data: unknown) => apiClient.post('/myaccount/change-password', data),
  logout: () => apiClient.post('/myaccount/logout'),
};
