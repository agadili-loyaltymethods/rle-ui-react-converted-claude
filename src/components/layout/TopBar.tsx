import React from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { aclApi } from '../../api/resources/acl.api';

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

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {user?.divisionName && (
          <span className="text-sm font-medium text-gray-700">{user.divisionName}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
          <User size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{user?.username || user?.email}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
