# Member Selection, Rules/Flows Actions & Pagination Fixes (2026-03-31)

## 1. Summary of Issues Fixed

| # | Issue | Status |
|---|-------|--------|
| 1 | Pagination missing "Rows per page" selector | Fixed |
| 2 | ID column visible in all tables | Fixed |
| 3 | Program name click / Rules / Flows buttons broken/disabled | Fixed |
| 4 | Member Details page — poor design, no real tabs | Redesigned |
| 5 | Member Details tabs not implemented (Member Details, Achievements, Accruals, Redemption) | Implemented |

---

## 2. Root Cause Analysis

### Issue 1 — Pagination "Rows per page"

`DataTable` component had a `pageSize` prop (static default: `20`) but no UI selector.
`MembersPage` used a hardcoded `PAGE_LIMIT = 10` with no way to change it.

### Issue 2 — ID column visible

All column arrays in `PoliciesPage`, `RulesPage`, and `ProgramsPage` included `{ key: 'id', header: 'ID' }` explicitly. No mechanism existed to hide columns while keeping data accessible.

### Issue 3 — Broken click actions

`ProgramsPage` navigation used:
```tsx
navigate(`/programs/${row['id']}/policies`)
```
If the API returns MongoDB `_id` (not `id`), `row['id']` is `undefined`. The URL becomes `/programs/undefined/policies` and the buttons were `disabled` when no ID resolved.

### Issue 4 & 5 — Member Details page

`MemberDetailsPage` used route-based tabs (`/details/:id/:tab`) where each tab rendered a `MemberTabPlaceholder` (a grey dashed box with no functionality). No real data was shown in any tab.

---

## 3. Fixes Applied

### Fix 1 — Rows per page (DataTable + MembersPage)

**`DataTable.tsx` changes:**
- Added `PAGE_SIZE_OPTIONS = [10, 25, 50, 100]`
- Added `showRowsPerPage?: boolean` prop (default `true`)
- Added `hidden?: boolean` to `Column` interface (data kept for row key/callbacks, just not rendered)
- Added `rowsPerPage` local state initialized from `pageSize` prop
- Renders a `<select>` next to search input; resets to page 1 when changed
- Changed `pageSize` variable to `rowsPerPage` throughout

```tsx
// BEFORE — no rows-per-page selector
<DataTable data={data} columns={columns} pageSize={20} />

// AFTER — rows-per-page dropdown appears automatically (10/25/50/100)
<DataTable data={data} columns={columns} pageSize={10} />
// Disable for server-side pagination:
<DataTable data={data} columns={columns} pageSize={pageLimit} showRowsPerPage={false} />
```

**`MembersPage.tsx` changes:**
- Replaced `PAGE_LIMIT = 10` with `DEFAULT_PAGE_LIMIT = 10` and `PAGE_SIZE_OPTIONS`
- Added `pageLimit` state and `handlePageLimitChange()` handler
- `fetchMembers()` now takes `limit` as a third parameter
- Server-side pagination footer now has a "Rows per page" `<select>`
- DataTable rendered with `showRowsPerPage={false}` (server controls pagination)

---

### Fix 2 — Hidden ID column

Added `hidden?: boolean` to `Column` interface in `DataTable.tsx`:
```tsx
export interface Column<T> {
  hidden?: boolean; // new — hides from UI but data is still present in row object
  ...
}
```

`DataTable` now filters: `const visibleColumns = columns.filter((c) => !c.hidden)`.
All `colSpan`, header, and body renders use `visibleColumns`.

Updated column definitions across pages:
```tsx
// BEFORE
{ key: 'id', header: 'ID', sortable: true }

// AFTER — hidden from display, data still in row for row key / callbacks
{ key: 'id', header: 'ID', hidden: true }
```

Files updated: `PoliciesPage.tsx` (rewardColumns + genericColumns), `RulesPage.tsx` (all 3 column sets), `ProgramsPage.tsx`.

---

### Fix 3 — Program navigation actions

Extended the ID fallback chain to cover MongoDB `_id`:
```tsx
// BEFORE
const id = (row['id'] ?? row['programId']) as string | undefined;

// AFTER — also checks MongoDB _id
const id = (row['id'] ?? row['_id'] ?? row['programId']) as string | undefined;
```

Also added hidden `_id` column to `ProgramsPage` columns so the DataTable makes the value available in row callbacks:
```tsx
{ key: '_id', header: '_id', hidden: true }, // MongoDB _id fallback; not shown
```

---

### Fix 4 & 5 — Member Details page redesign

Completely rewrote `MemberDetailsPage.tsx`. Removed route-based child tabs; now uses `@radix-ui/react-tabs` (already installed) via a new `src/components/ui/tabs.tsx` component.

**New layout:**
```
┌─────────────────────────────────────────┐
│  [Avatar]  John Smith                   │
│           john@example.com  ●Active     │
│           Enrolled: Jan 1 2025          │
└─────────────────────────────────────────┘

[Member Details] [Achievements] [Accruals] [Redemption]

───────────────────────────────────────────
Tab content area
───────────────────────────────────────────
```

**Tab 1 — Member Details:**
Grid of key/value pairs for all member fields (name, email, phone, status, program, loyalty ID, enroll date/channel, acquisition info, DOB, address, created/updated timestamps, etc.)

**Tab 2 — Achievements:**
Sub-tab navigation (Purses / Badges / Tiers / Streaks) showing data embedded in member object. Fetches with full populate parameters matching the original AngularJS `getMemberData()` query:
```
GET /members/:id?populate=[...tiers, purses, badges, streaks with nested createdBy/updatedBy/policyId...]
```

**Tab 3 — Accruals:**
```
GET /accrualitems?query={"memberId": ":id"}
  &populate=[{"path":"rule","select":"name"},{"path":"purse","select":"name"}]
```
Columns: Accrued Points, Burned Points, Current, Excess On, Expires On, Purse, Rule, Date

**Tab 4 — Redemption:**
```
GET /redemptionitems?query={"memberId": ":id"}
  &populate=[{"path":"rule"},{"path":"accrual"}]
```
Columns: Rule, Purse, Points, Date Burned, Details, Status, Created At

**Router change:** Removed nested child routes from `details/:id`. The old `MemberTabPlaceholder` import was removed.

---

## 4. Files Modified

| File | Changes |
|------|---------|
| `src/components/common/DataTable.tsx` | `hidden` column prop; rows-per-page selector; `showRowsPerPage` prop; use `visibleColumns` throughout |
| `src/components/ui/tabs.tsx` | **New file** — Radix UI Tabs wrapper (TabsList, TabsTrigger, TabsContent) |
| `src/pages/member-details/MemberDetailsPage.tsx` | Full rewrite — 4 tabs, member summary card, API-integrated content |
| `src/pages/members/MembersPage.tsx` | Dynamic page limit; server-side pagination footer with rows-per-page dropdown |
| `src/pages/programs/ProgramsPage.tsx` | `_id` fallback for navigation; hidden id/_id columns |
| `src/pages/policies/PoliciesPage.tsx` | Hidden ID column |
| `src/pages/rules/RulesPage.tsx` | Hidden ID columns (all 3 tab column sets) |
| `src/router/index.tsx` | Removed nested child routes for member details; removed `MemberTabPlaceholder` import |

---

## 5. Testing Checklist

- [ ] DataTable shows "Rows per page" dropdown (10/25/50/100) on all tables
- [ ] Changing rows per page resets to page 1 and re-renders correct number of rows
- [ ] Members page server-side "Rows per page" dropdown triggers new API call with correct `limit`
- [ ] ID column not visible in any table (Policies, Rules, Programs)
- [ ] Clicking a program row navigates to `/programs/:id/policies` (not `/programs/undefined/...`)
- [ ] Rules and Flows buttons in Programs table are enabled and navigate correctly
- [ ] Clicking a member row navigates to `/details/:id`
- [ ] Member Details page shows 4 tabs: Member Details, Achievements, Accruals, Redemption
- [ ] Member Details tab shows all field key/value grid
- [ ] Achievements tab shows Purses/Badges/Tiers/Streaks sub-tabs with data
- [ ] Accruals tab loads from `/accrualitems` endpoint
- [ ] Redemption tab loads from `/redemptionitems` endpoint
- [ ] All tabs handle empty state gracefully
