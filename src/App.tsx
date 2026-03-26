import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { useAuthStore } from './store/auth.store';
import { aclApi } from './api/resources/acl.api';
import { miscApi } from './api/resources/misc.api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { loadFromStorage, setUser, setPermissions, setFlags } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
    // Load flags and permissions if token exists
    const token = sessionStorage.getItem('token');
    if (token) {
      Promise.all([
        miscApi.getFlags().catch(() => ({ data: {} })),
        aclApi.getMyAccount().catch(() => null),
        aclApi.getRoles().catch(() => null),
      ]).then(([flagsRes, accountRes, permsRes]) => {
        if (flagsRes?.data) setFlags(flagsRes.data as Record<string, unknown>);
        if (accountRes?.data) {
          const acc = accountRes.data as Record<string, unknown>;
          setUser({
            id: String(acc['id'] || ''),
            email: String(acc['email'] || ''),
            username: String(acc['username'] || acc['email'] || ''),
            division: acc['division'] ? String(acc['division']) : undefined,
            divisionName: acc['divisionName'] ? String(acc['divisionName']) : undefined,
          });
        }
        if (permsRes?.data) {
          const perms = Array.isArray(permsRes.data) ? permsRes.data : [];
          setPermissions(perms as string[]);
        }
      });
    }
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <AppRouter />
      </AppInitializer>
    </QueryClientProvider>
  );
}
