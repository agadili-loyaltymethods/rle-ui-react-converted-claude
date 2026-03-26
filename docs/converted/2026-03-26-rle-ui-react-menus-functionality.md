# Menu Structure & Table Improvements — AngularJS → React Migration Fixes

**Date:** 2026-03-26
**Reference:** `docs/2026-03-26-rle-ui-react-converted-claude-menus-functionality.md`
**Source (AngularJS):** `/home/agadili/Documents/RCX_PROJS/rle-ui`
**Target (React):** `/home/agadili/Documents/RCX_PROJS/rle-ui-react-converted-claude`

---

## Summary of Issues Fixed

| # | Issue | Root Cause | Status |
|---|-------|------------|--------|
| 1 | Reference Data items were flat top-level menu items | `Sidebar.tsx` used a single flat `navItems` array with no grouping | ✅ Fixed |
| 2 | Settings items were flat top-level menu items | Same as above — no group structure existed | ✅ Fixed |
| 3 | `/orgs` route and page missing | No `OrgsPage` existed despite `orgsApi` being present in reference-data.api.ts | ✅ Fixed |
| 4 | Columns squeezed into small widths with many columns | `DataTable` had no `min-width` on columns | ✅ Fixed |
| 5 | Long text content overflowing cells | No `truncate` / `text-overflow: ellipsis` on table cells | ✅ Fixed |
| 6 | No tooltip for truncated content | No `title` attribute on cells | ✅ Fixed |
| 7 | Horizontal scroll not working on wide tables | Table container lacked `overflow-x-auto` and `min-w-max` | ✅ Fixed |

---

## Files Modified / Created

| File | Status | Description |
|------|--------|-------------|
| `src/components/layout/Sidebar.tsx` | **Modified** | Full restructure — grouped nav items, collapsible groups, active-state awareness |
| `src/components/common/DataTable.tsx` | **Modified** | Horizontal scroll, min-width columns, ellipsis + native tooltip |
| `src/pages/orgs/OrgsPage.tsx` | **Created** | New Orgs CRUD page using `orgsApi` |
| `src/router/index.tsx` | **Modified** | Added `/orgs` route |

---

## 1. Menu Structure Restructure

### Root Cause
The `Sidebar.tsx` used a single flat `navItems: NavItem[]` array. Every module (Orgs, Segments, Divisions, Users, etc.) appeared as a separate top-level item. There was no grouping, no expandable sections, and no visual hierarchy.

### AngularJS Menu Structure (reference)
```
Members
Programs
Reference Data  ← group
  ├ Orgs
  ├ Segments
  ├ Locations
  ├ Products
  ├ DMA
  ├ Enums
  └ Named Lists
Settings        ← group
  ├ My Account
  ├ Users
  ├ Security Setup
  ├ Extensions
  ├ Limits
  ├ Divisions
  └ MCP UI Config
Analytics
```

### Before
```tsx
// Sidebar.tsx — BEFORE: single flat array, no groups
const navItems = [
  { path: '/',           icon: Users,          label: 'Members'      },
  { path: '/programs',   icon: LayoutDashboard, label: 'Programs'     },
  { path: '/analytics',  icon: BarChart2,       label: 'Analytics'    },
  { path: '/segments',   icon: Layers,          label: 'Segments'     },
  { path: '/locations',  icon: MapPin,          label: 'Locations'    },
  { path: '/products',   icon: Package,         label: 'Products'     },
  { path: '/dma',        icon: Globe,           label: 'DMA'          },
  { path: '/enums',      icon: List,            label: 'Enumerations' },
  { path: '/loyaltycards',icon: CreditCard,     label: 'Loyalty Cards'},
  { path: '/namedlists', icon: FileText,        label: 'Named Lists'  },
  { path: '/divisions',  icon: Database,        label: 'Divisions'    },
  { path: '/acl',        icon: Shield,          label: 'Access Control'},
  { path: '/users',      icon: UserCheck,       label: 'Users'        },
  { path: '/limits',     icon: Sliders,         label: 'Limits'       },
  { path: '/extensions', icon: Zap,             label: 'Extensions'   },
  { path: '/mcp-ui-config',icon: GitBranch,     label: 'MCP UI Config'},
  { path: '/settings',   icon: Settings,        label: 'Settings'     },
];
```

### After
```tsx
// Sidebar.tsx — AFTER: typed groups, collapsible, active-state aware

interface NavGroup {
  key: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const topNavItems: NavItem[] = [
  { path: '/',          icon: Users,           label: 'Members'  },
  { path: '/programs',  icon: LayoutDashboard, label: 'Programs' },
  { path: '/analytics', icon: BarChart2,       label: 'Analytics'},
];

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
```

### Key Features of New Sidebar
- **Collapsible groups** — chevron toggle (ChevronDown / ChevronUp) for each group
- **Auto-open on active child** — group expands automatically if a child route is currently active
- **Group-level active highlight** — group label turns blue when any child is active
- **Collapsed-sidebar support** — when sidebar is collapsed (`w-16`), only the group icon shows with a `title` tooltip
- **Sub-item indentation** — child items indented with left border for clear hierarchy

---

## 2. Orgs Page & Route Added

### Root Cause
`orgsApi` existed in `reference-data.api.ts` but there was no corresponding page or route. The `/orgs` path had no component registered.

### Files Created
- `src/pages/orgs/OrgsPage.tsx` — CRUD page using `orgsApi.getAll()`, `orgsApi.create()`, `orgsApi.delete()`
- Added `/orgs` route in `src/router/index.tsx`

```tsx
// router/index.tsx — added
const OrgsPage = lazy(() =>
  import('../pages/orgs/OrgsPage').then((m) => ({ default: m.OrgsPage }))
);

// Inside route children:
{ path: 'orgs', element: <Wrap><OrgsPage /></Wrap> },
```

---

## 3. Table Data Source Verification

All module pages use their own correct API endpoints (matching AngularJS):

| Page | API Used | Endpoint |
|------|----------|----------|
| SegmentsPage | `segmentsApi.getAll()` | `GET /segments` |
| LocationsPage | `locationsApi.getAll()` | `GET /locations` |
| ProductsPage | `productsApi.getAll()` | `GET /products` |
| DmaPage | `dmasApi.getAll()` | `GET /dmas` |
| EnumsPage | `enumsApi.getAll()` | `GET /enums` |
| NamedListsPage | `namedListsApi.getAll()` | `GET /namedlists` |
| DivisionsPage | `divisionsApi.getAll()` | `GET /divisions` |
| OrgsPage | `orgsApi.getAll()` | `GET /orgs` |
| ExtensionsPage | `schemaApi.getExtensionSchema()` | `GET /schema/extensionschema` ✓ (correct for this page) |

The `/schema/extensionschema` endpoint is **only** used by `ExtensionsPage` (which is the correct module for it). No other table uses it as a generic data source.

---

## 4. DataTable Layout Improvements

### Root Cause
`DataTable.tsx` had:
- No `overflow-x-auto` → columns squished on wide tables
- No `min-width` → columns collapsed to near-zero width
- No `truncate` CSS → long text caused layout breakage
- No `title` attribute → truncated content inaccessible

### Before
```tsx
// DataTable.tsx — BEFORE
<div className="rounded-md border">          {/* no overflow-x-auto */}
  <Table>
    <TableHeader>
      <TableRow>
        {columns.map((col) => (
          <TableHead                          {/* no minWidth */}
            key={String(col.key)}
            className={cn(col.sortable && 'cursor-pointer select-none', col.className)}
          >
            ...
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {paged.map((row, idx) => (
        <TableRow ...>
          {columns.map((col) => (
            <TableCell key={String(col.key)} className={col.className}>
              {col.render                     {/* no ellipsis, no tooltip */}
                ? col.render(row[String(col.key)], row)
                : String(row[String(col.key)] ?? '')}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### After
```tsx
// DataTable.tsx — AFTER

// 1. Horizontal scroll container
<div className="rounded-md border overflow-x-auto">
  <Table className="min-w-max">             {/* table never shrinks below content */}

    <TableHeader>
      <TableRow>
        {columns.map((col) => (
          <TableHead
            key={String(col.key)}
            style={{ minWidth: col.minWidth ?? '8rem' }}   {/* min 8rem per column */}
            className={cn('whitespace-nowrap', ...)}
          >
            ...
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>

    <TableBody>
      {paged.map((row, idx) => (
        <TableRow ...>
          {columns.map((col) => {
            const rawValue = row[String(col.key)];
            const rendered = col.render ? col.render(rawValue, row) : String(rawValue ?? '');
            const titleText = toPlainText(rawValue);   // plain-text for native tooltip

            return (
              <TableCell
                key={String(col.key)}
                style={{ minWidth: col.minWidth ?? '8rem' }}
                className={cn('max-w-[16rem]', col.className)}
              >
                {/* Ellipsis + tooltip */}
                <div className="truncate" title={titleText || undefined}>
                  {rendered}
                </div>
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

### Summary of DataTable Changes

| Property | Before | After |
|----------|--------|-------|
| Table container | `rounded-md border` | `rounded-md border overflow-x-auto` |
| Table element | default | `min-w-max` (never shrinks) |
| Column min-width | none | `8rem` default (configurable via `Column.minWidth`) |
| Header whitespace | wraps | `whitespace-nowrap` |
| Cell text overflow | breaks layout | `truncate` (ellipsis) |
| Cell max-width | none | `max-w-[16rem]` |
| Tooltip on truncated content | none | Native `title` attribute with raw value |

The `Column` interface also gained an optional `minWidth` field:
```typescript
export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  minWidth?: string;   // ← NEW: e.g. '12rem', '200px'
}
```

---

## Validation Checklist

| Requirement | Status |
|-------------|--------|
| Reference Data group in sidebar | ✅ |
| Settings group in sidebar | ✅ |
| Groups expand/collapse with chevron | ✅ |
| Group auto-opens when child route is active | ✅ |
| Group highlights when child is active | ✅ |
| Collapsed sidebar shows group icon + tooltip | ✅ |
| /orgs route registered | ✅ |
| OrgsPage uses `orgsApi` (not schema API) | ✅ |
| All Reference Data pages use correct APIs | ✅ |
| Table has horizontal scrolling | ✅ |
| Columns have minimum width | ✅ |
| Long text shows ellipsis | ✅ |
| Hover shows full content via tooltip | ✅ |
| TypeScript compiles with no errors | ✅ |
| Vite build succeeds | ✅ |
