import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users, LayoutDashboard, BarChart2, List,
  Shield, MapPin, Package, FileText, Layers,
  Database, CreditCard, Sliders, UserCheck,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Zap, GitBranch, Globe, Settings, Building2, User,
} from 'lucide-react';
import { useAppStore } from '../../store/app.store';
import { cn } from '../../utils/cn';

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
}

interface NavGroup {
  key: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

// ─── Top-level items (not grouped) ───────────────────────────────────────────
const topNavItems: NavItem[] = [
  { path: '/',          icon: Users,           label: 'Members'   },
  { path: '/programs',  icon: LayoutDashboard, label: 'Programs'  },
  { path: '/analytics', icon: BarChart2,        label: 'Analytics' },
];

// ─── Grouped items ────────────────────────────────────────────────────────────
const navGroups: NavGroup[] = [
  {
    key: 'reference-data',
    label: 'Reference Data',
    icon: Database,
    items: [
      { path: '/orgs',         icon: Building2,  label: 'Orgs'          },
      { path: '/segments',     icon: Layers,     label: 'Segments'      },
      { path: '/locations',    icon: MapPin,     label: 'Locations'     },
      { path: '/products',     icon: Package,    label: 'Products'      },
      { path: '/dma',          icon: Globe,      label: 'DMA'           },
      { path: '/enums',        icon: List,       label: 'Enums'         },
      { path: '/namedlists',   icon: FileText,   label: 'Named Lists'   },
      { path: '/loyaltycards', icon: CreditCard, label: 'Loyalty Cards' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { path: '/ussettings',    icon: User,      label: 'My Account'    },
      { path: '/users',         icon: UserCheck, label: 'Users'         },
      { path: '/acl',           icon: Shield,    label: 'Security Setup'},
      { path: '/extensions',    icon: Zap,       label: 'Extensions'    },
      { path: '/limits',        icon: Sliders,   label: 'Limits'        },
      { path: '/divisions',     icon: Database,  label: 'Divisions'     },
      { path: '/mcp-ui-config', icon: GitBranch, label: 'MCP UI Config' },
    ],
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();

  const getInitialOpen = () => {
    const open: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      open[g.key] = g.items.some((i) => location.pathname.startsWith(i.path));
    });
    return open;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpen);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((i) => location.pathname.startsWith(i.path));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-slate-950 text-white transition-all duration-300 flex flex-col',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-slate-800 px-3 flex-shrink-0',
          sidebarOpen ? 'justify-between' : 'justify-center'
        )}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white text-sm font-bold leading-none">R</span>
              </div>
              <span className="text-sm font-semibold text-white truncate tracking-tight">ReactorCX</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-white flex-shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            title="Expand sidebar"
            className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            <span className="text-white text-sm font-bold leading-none">R</span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 sidebar-scroll">
        {/* Top-level items */}
        {topNavItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 text-sm font-medium',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* Section divider */}
        <div className="my-2 border-t border-slate-800/70" />

        {/* Grouped items */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isActive = isGroupActive(group);
          const isOpen = sidebarOpen && openGroups[group.key];

          return (
            <div key={group.key} className="space-y-0.5">
              {/* Group header button */}
              <button
                onClick={() => sidebarOpen && toggleGroup(group.key)}
                title={!sidebarOpen ? group.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 text-sm font-medium',
                  isActive
                    ? 'text-blue-400 hover:bg-slate-800'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                )}
              >
                <GroupIcon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="truncate flex-1 text-left">{group.label}</span>
                    {openGroups[group.key]
                      ? <ChevronUp size={14} className="flex-shrink-0 text-slate-500" />
                      : <ChevronDown size={14} className="flex-shrink-0 text-slate-500" />
                    }
                  </>
                )}
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="ml-3 pl-3 border-l border-slate-800 space-y-0.5">
                  {group.items.map(({ path, icon: Icon, label }) => (
                    <NavLink
                      key={path}
                      to={path}
                      title={label}
                      className={({ isActive: active }) =>
                        cn(
                          'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 text-sm',
                          active
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                        )
                      }
                    >
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle at bottom when collapsed */}
      {!sidebarOpen && (
        <div className="flex-shrink-0 px-2 pb-3">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
