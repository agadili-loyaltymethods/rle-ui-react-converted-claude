import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '../../store/app.store';
import { cn } from '../../utils/cn';

export function AppLayout() {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className={cn('flex flex-1 flex-col overflow-hidden transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16')}>
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
