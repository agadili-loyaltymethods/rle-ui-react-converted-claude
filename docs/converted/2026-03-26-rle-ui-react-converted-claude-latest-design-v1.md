# UI/UX Redesign — ReactorCX React App (v1)

**Date:** 2026-03-26
**Prompt:** `docs/prompts/2026-03-26-rle-ui-react-converted-claude-latest-design-v1.md`
**Scope:** UI/UX only — no business logic, API, or feature changes

---

## Objective

Modernize the React app (migrated from AngularJS) to a clean enterprise SaaS style inspired by Stripe / Salesforce / Notion. All existing functionality, data, columns, and API behavior remain unchanged.

---

## Design Principles Applied

| Principle | Implementation |
|-----------|---------------|
| Clean & minimal | Removed visual noise; consistent spacing via Tailwind |
| Enterprise SaaS | `slate-950` sidebar, white cards on `slate-50` background |
| shadcn/ui first | All dialogs, tables, inputs, buttons use shadcn primitives |
| Responsive | Sidebar collapses to icon-only; `lg:p-8` padding on main |
| Accessibility | Native `title` tooltips on collapsed nav; `sr-only` labels kept |

---

## Files Modified

### Global Styles

| File | Change |
|------|--------|
| `src/index.css` | Updated CSS variables (light-gray `210 20% 98%` page bg), 6px custom scrollbar, `sidebar-scroll` dark variant class |

---

### Layout

| File | Key Changes |
|------|-------------|
| `src/components/layout/AppLayout.tsx` | `bg-slate-50` main background; `lg:p-8` padding |
| `src/components/layout/Sidebar.tsx` | `slate-950` dark bg · Blue "R" logo mark (collapses to clickable icon) · `bg-blue-600` active items · Section divider between main and group nav · Expand chevron at bottom when collapsed · `sidebar-scroll` dark scrollbar |
| `src/components/layout/TopBar.tsx` | User initials avatar (blue circle, computed from username/email) · Division name rendered as a pill chip · Separator dividers · Cleaner logout button with hover-red style |

---

### UI Primitives (`src/components/ui/`)

| File | Key Changes |
|------|-------------|
| `table.tsx` | **Removed inner `overflow-auto` wrapper** — enables sticky `<thead>` relative to the page's main scroll area · `TableHead`: `text-xs uppercase tracking-wide font-semibold text-slate-500` · `TableCell`: `px-3 py-2.5` (was `p-2`) |
| `input.tsx` | `rounded-lg` (was `rounded-md`) · `bg-white` explicit background |
| `dialog.tsx` | Overlay: `bg-black/50 + backdrop-blur-sm` (was `bg-black/80`) · Content: `rounded-xl border-slate-200 bg-white shadow-xl` |

---

### Common Components (`src/components/common/`)

| File | Key Changes |
|------|-------------|
| `DataTable.tsx` | Sticky header (`sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm`) · Zebra rows (even rows `bg-slate-50/40`) · Row hover `bg-blue-50/60` · Search: max-w-sm, × clear button · Empty state with conditional "Clear search" link · Compact pagination (`h-8 w-8` icon buttons, `X / Y` counter) · Table wrapped in `rounded-xl border shadow-sm` card |
| `PageHeader.tsx` | `text-xl font-semibold tracking-tight` title · Horizontal `border-b` divider below header area |
| `CrudDialog.tsx` | `text-slate-700` labels · `space-y-1.5` field groups · `rounded-lg` base field class · Consistent `size="sm"` buttons in footer |
| `ConfirmDialog.tsx` | Icon badge in title row (`AlertTriangle` for destructive, `Info` for default) · Description indented to align with title text · `size="sm"` footer buttons |
| `LoadingSpinner.tsx` | Double-ring spinner (track ring + animated ring) · "Loading…" label below |
| `ErrorMessage.tsx` | `items-start` layout for multi-line messages · `mt-0.5` icon offset |
| `RouteError.tsx` | `bg-slate-50` · `rounded-2xl` icon container · `text-5xl` status code · Smaller `size="sm"` action buttons |

---

### Pages

| File | Key Changes |
|------|-------------|
| `src/pages/login/LoginPage.tsx` | Full visual redesign: `slate-900` gradient background with `blur-3xl` color orbs · Standalone card (no Card component wrapping) · Inline loading spinner inside Sign In button · `h-10` inputs |
| `src/pages/member-details/MemberDetailsPage.tsx` | Member initials avatar (blue circle) · Polished summary card (`border-slate-200`) · Tab hover uses `hover:border-slate-300` · "Back" button with subtle icon animation |

---

## Before vs After

### Sidebar
| Before | After |
|--------|-------|
| `bg-gray-900` | `bg-slate-950` (deeper, richer dark) |
| Plain text logo | Blue rounded "R" logo mark |
| Collapse arrow only | Logo mark doubles as expand button when collapsed; arrow at bottom |
| Active: `bg-blue-600` | Same — consistent with design system |
| Subitems: `ml-4 border-l border-gray-700` | `ml-3 pl-3 border-slate-800` (tighter, cleaner indent) |

### TopBar
| Before | After |
|--------|-------|
| `<User>` icon | Colored initials circle (`bg-blue-600`) |
| Division text only | Division name as `bg-slate-100` pill chip |
| Red standalone logout button | Subtle slate logout, turns red on hover |

### DataTable
| Before | After |
|--------|-------|
| Plain `<thead>` | Sticky header with blur backdrop |
| Uniform white rows | Zebra striping (white / slate-50) |
| Default row hover | `bg-blue-50/60` hover |
| Search with no clear | Search with × clear button |
| `Prev / Next` pagination | Icon-only `< >` buttons with `X / Y` counter |
| `rounded-md border` wrapper | `rounded-xl border shadow-sm` card |

### Login
| Before | After |
|--------|-------|
| `from-gray-900 to-gray-700` gradient | `from-slate-900 via-slate-800 to-slate-900` + blur orbs |
| Card component | Inline white card with `rounded-2xl` |
| Full-width `size="lg"` button | `h-10` button with inline spinner on loading |

### Dialogs
| Before | After |
|--------|-------|
| `bg-black/80` overlay | `bg-black/50 backdrop-blur-sm` |
| `sm:rounded-lg` content | `rounded-xl border-slate-200` |
| ConfirmDialog: title only | ConfirmDialog: icon badge + indented description |

---

## Reusable Patterns Established

### Page structure
```tsx
<div>
  <PageHeader title="..." description="..." actions={<Button>...</Button>} />
  {error && <ErrorMessage message={error} />}
  {loading ? <LoadingSpinner /> : <DataTable data={...} columns={...} />}
</div>
```

### Table container
All tables are rendered inside `DataTable` which wraps in `rounded-xl border shadow-sm bg-white`. The `Table` component no longer adds its own overflow wrapper — the `main` scroll area handles vertical scroll, enabling sticky headers.

### Action buttons in table rows
```tsx
actions={(row) => (
  <div className="flex gap-2 justify-end">
    <Button variant="outline" size="sm">Edit</Button>
    <Button variant="destructive" size="sm">Delete</Button>
  </div>
)}
```

### Destructive confirmation
```tsx
<ConfirmDialog
  variant="destructive"
  title="Delete X"
  description={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
  confirmLabel="Delete"
  onConfirm={handleDelete}
/>
```

---

## Validation Checklist

- [x] All navigation routes work correctly
- [x] Sidebar groups expand/collapse as before
- [x] Sidebar collapses to icon-only mode
- [x] DataTable search, sort, and pagination unchanged
- [x] CRUD dialogs open/close and submit correctly
- [x] Confirm dialogs trigger correct actions
- [x] Login (basic + OKTA) flow unchanged
- [x] Member details tabs navigate correctly
- [x] No API endpoint or parameter changes
- [x] No columns removed from any table
- [x] No form fields removed from any dialog
- [x] Build passes: `npm run build` ✅

---

## Build Output

```
✓ built in 2.77s
dist/assets/index-BesqE1tD.js   446.28 kB │ gzip: 141.53 kB
dist/assets/index-DDz3zk85.css   29.34 kB │ gzip:   6.20 kB
```
