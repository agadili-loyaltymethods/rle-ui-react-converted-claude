import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { storage } from '../../utils/storage';

/**
 * Auth guard for protected routes.
 * Checks sessionStorage directly (not Zustand store) so it works synchronously
 * on first render before AppInitializer has a chance to hydrate the store.
 * Redirects unauthenticated users to /login and preserves the intended path
 * so they can be sent back after a successful login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!storage.getToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
