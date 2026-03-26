export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  analyticsUrl: import.meta.env.VITE_ANALYTICS_URL || '',
  oktaEnabled: import.meta.env.VITE_OKTA_ENABLED === 'true',
  tokenExpirationBuffer: parseInt(import.meta.env.VITE_TOKEN_EXPIRATION_BUFFER || '120'),
  tokenTypeForCrud: import.meta.env.VITE_TOKEN_TYPE_FOR_CRUD || 'access_token',
  decimalPrecision: parseInt(import.meta.env.VITE_DECIMAL_PRECISION || '2'),
};

export const uiFlags = {
  disableMemberUnMerge: import.meta.env.VITE_DISABLE_MEMBER_UNMERGE === 'true',
  disableSearchFLName: import.meta.env.VITE_DISABLE_SEARCH_FL_NAME === 'true',
  disableSearchPhone: import.meta.env.VITE_DISABLE_SEARCH_PHONE === 'true',
  disableSearchEmail: import.meta.env.VITE_DISABLE_SEARCH_EMAIL === 'true',
  decimalPrecision: parseInt(import.meta.env.VITE_DECIMAL_PRECISION || '2'),
  disablePointsDivider: import.meta.env.VITE_DISABLE_POINTS_DIVIDER === 'true',
  enableAutoExpiration: import.meta.env.VITE_ENABLE_AUTO_EXPIRATION === 'true',
};
