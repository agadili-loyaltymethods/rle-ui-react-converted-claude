const SESSION_KEYS = {
  TOKEN: 'token',
  USERNAME: 'RCX_username',
  USER_ID: 'RCX_userID',
  USER_EMAIL: 'RCX_userEmail',
  DIVISION: 'RCX_division',
  DIVISION_NAME: 'RCX_divisionName',
  DIVISION_CHECK_ENABLED: 'RCX_divisionCheckEnabled',
  DIVISION_PERMISSIONS: 'RCX_divisionPermissions',
  OKTA_ENABLED: 'oktaEnabled',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_EXPIRATION_BUFFER: 'tokenExpirationBuffer',
  TOKEN_TYPE_FOR_CRUD: 'tokenTypeForCrud',
  LAST_API_ACCESS: 'lastAPIAcess',
  UNIQUE_SESSION_ID: 'uniqueSessionId',
} as const;

export const storage = {
  session: {
    get: (key: string) => sessionStorage.getItem(key),
    set: (key: string, value: string) => sessionStorage.setItem(key, value),
    remove: (key: string) => sessionStorage.removeItem(key),
    clear: () => sessionStorage.clear(),
  },
  local: {
    get: (key: string) => localStorage.getItem(key),
    set: (key: string, value: string) => localStorage.setItem(key, value),
    remove: (key: string) => localStorage.removeItem(key),
    clear: () => localStorage.clear(),
  },
  getToken: () => sessionStorage.getItem(SESSION_KEYS.TOKEN),
  setToken: (token: string) => sessionStorage.setItem(SESSION_KEYS.TOKEN, token),
  getRefreshToken: () => sessionStorage.getItem(SESSION_KEYS.REFRESH_TOKEN),
  setRefreshToken: (token: string) => sessionStorage.setItem(SESSION_KEYS.REFRESH_TOKEN, token),
  getUserId: () => sessionStorage.getItem(SESSION_KEYS.USER_ID),
  setUserId: (id: string) => sessionStorage.setItem(SESSION_KEYS.USER_ID, id),
  getUsername: () => sessionStorage.getItem(SESSION_KEYS.USERNAME),
  setUsername: (name: string) => sessionStorage.setItem(SESSION_KEYS.USERNAME, name),
  getUserEmail: () => sessionStorage.getItem(SESSION_KEYS.USER_EMAIL),
  setUserEmail: (email: string) => sessionStorage.setItem(SESSION_KEYS.USER_EMAIL, email),
  getDivision: () => sessionStorage.getItem(SESSION_KEYS.DIVISION),
  setDivision: (id: string) => sessionStorage.setItem(SESSION_KEYS.DIVISION, id),
  getDivisionName: () => sessionStorage.getItem(SESSION_KEYS.DIVISION_NAME),
  setDivisionName: (name: string) => sessionStorage.setItem(SESSION_KEYS.DIVISION_NAME, name),
  getDivisionPermissions: () => {
    const val = sessionStorage.getItem(SESSION_KEYS.DIVISION_PERMISSIONS);
    return val ? JSON.parse(val) : null;
  },
  setDivisionPermissions: (perms: unknown) =>
    sessionStorage.setItem(SESSION_KEYS.DIVISION_PERMISSIONS, JSON.stringify(perms)),
  isOktaEnabled: () => sessionStorage.getItem(SESSION_KEYS.OKTA_ENABLED) === 'true',
  setOktaEnabled: (val: boolean) =>
    sessionStorage.setItem(SESSION_KEYS.OKTA_ENABLED, String(val)),
  clearAuth: () => {
    sessionStorage.removeItem(SESSION_KEYS.TOKEN);
    sessionStorage.removeItem(SESSION_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(SESSION_KEYS.USERNAME);
    sessionStorage.removeItem(SESSION_KEYS.USER_ID);
    sessionStorage.removeItem(SESSION_KEYS.USER_EMAIL);
  },
};

export { SESSION_KEYS };
