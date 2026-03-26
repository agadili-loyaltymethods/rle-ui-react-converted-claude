import { useAuthStore } from '../store/auth.store';

export function usePermissions() {
  const { permissions, user } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (perms: string[]): boolean => {
    return perms.every((p) => permissions.includes(p));
  };

  const canRead = (resource: string): boolean =>
    hasPermission(`${resource}.read`);

  const canWrite = (resource: string): boolean =>
    hasPermission(`${resource}.write`);

  const canDelete = (resource: string): boolean =>
    hasPermission(`${resource}.delete`);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canRead,
    canWrite,
    canDelete,
    user,
  };
}
