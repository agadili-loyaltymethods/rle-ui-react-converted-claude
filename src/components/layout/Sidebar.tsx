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
  { path: '/',          icon: Users,          label: 'Members'  },
  { path: '/programs',  icon: LayoutDashboard, label: 'Programs' },
  { path: '/analytics', icon: BarChart2,       label: 'Analytics'},
];

// ─── Grouped items ────────────────────────────────────────────────────────────
const navGroups: NavGroup[] = [
  {
    key: 'reference-data',
    label: 'Reference Data',
    icon: Database,
    items: [
      { path: '/orgs',         icon: Building2, label: 'Orgs'         },
      { path: '/segments',     icon: Layers,    label: 'Segments'     },
      { path: '/locations',    icon: MapPin,    label: 'Locations'    },
      { path: '/products',     icon: Package,   label: 'Products'     },
      { path: '/dma',          icon: Globe,     label: 'DMA'          },
      { path: '/enums',        icon: List,      label: 'Enums'        },
      { path: '/namedlists',   icon: FileText,  label: 'Named Lists'  },
      { path: '/loyaltycards', icon: CreditCard,label: 'Loyalty Cards'},
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    items: [
      { path: '/ussettings',   icon: User,      label: 'My Account'    },
      { path: '/users',        icon: UserCheck, label: 'Users'         },
      { path: '/acl',          icon: Shield,    label: 'Security Setup'},
      { path: '/extensions',   icon: Zap,       label: 'Extensions'    },
      { path: '/limits',       icon: Sliders,   label: 'Limits'        },
      { path: '/divisions',    icon: Database,  label: 'Divisions'     },
      { path: '/mcp-ui-config',icon: GitBranch, label: 'MCP UI Config' },
    ],
  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const location = useLocation();

  // Track which groups are expanded; default open if a child is active
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
        'fixed left-0 top-0 z-40 h-screen bg-gray-900 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-700">
        {sidebarOpen && (
          <span className="text-lg font-bold text-white truncate">ReactorCX</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-700 transition-colors ml-auto"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {/* Top-level items */}
        {topNavItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            title={!sidebarOpen ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        {/* Grouped items */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isActive = isGroupActive(group);
          const isOpen = sidebarOpen && openGroups[group.key];

          return (
            <div key={group.key}>
              {/* Group header button */}
              <button
                onClick={() => sidebarOpen && toggleGroup(group.key)}
                title={!sidebarOpen ? group.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'text-blue-400 hover:bg-gray-700'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <GroupIcon size={18} className="flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="truncate flex-1 text-left">{group.label}</span>
                    {openGroups[group.key]
                      ? <ChevronUp size={14} className="flex-shrink-0" />
                      : <ChevronDown size={14} className="flex-shrink-0" />
                    }
                  </>
                )}
              </button>

              {/* Sub-items (only when sidebar is open and group is expanded) */}
              {isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                  {group.items.map(({ path, icon: Icon, label }) => (
                    <NavLink
                      key={path}
                      to={path}
                      title={label}
                      className={({ isActive: active }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors text-sm',
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        )
                      }
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
