import React from 'react';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { aclApi } from '../../api/resources/acl.api';

function getUserInitials(user: { username?: string; email?: string } | null): string {
  if (!user) return 'U';
  const name = user.username || user.email || '';
  const parts = name.split(/[\s._@-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase() || 'U';
}

export function TopBar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await aclApi.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const initials = getUserInitials(user);

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 flex-shrink-0 shadow-[0_1px_0_0_hsl(var(--border))]">
      {/* Left: division name badge */}
      <div className="flex items-center gap-3">
        {user?.divisionName && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
            {user.divisionName}
          </span>
        )}
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell size={17} className="text-slate-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer select-none">
          <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-semibold leading-none">{initials}</span>
          </div>
          <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">
            {user?.username || user?.email}
          </span>
          <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1.5" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
