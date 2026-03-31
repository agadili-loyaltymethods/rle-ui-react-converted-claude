# RLE-UI React — Issues Fixed (2026-03-31)

## 1. Summary of Issues Fixed

| # | Issue | Status |
|---|-------|--------|
| 1 | Program name showing as "undefined" in header | Fixed |
| 2 | Tabs mismatch — missing Promo Policies & Promo Code tabs | Fixed |
| 3 | Wrong tab order vs. original AngularJS UI | Fixed |
| 4 | "Add Policy" button had no functionality | Fixed |
| 5 | "Add Rule" button had no functionality | Fixed |
| 6 | "Create Flow" button had no functionality | Fixed |
| 7 | Rules/Folders columns missing (Priority, Rule Type, Bonus Type, etc.) | Fixed |
| 8 | PoliciesPage navigation guard when program ID is undefined | Fixed |

---

## 2. Root Cause Analysis

### Issue 1 — Program name "undefined"

**Root cause (navigation):** In `ProgramsPage.tsx`, the row navigation used:
```tsx
// BEFORE — breaks if API field is not 'id'
navigate(`/programs/${row['id']}/policies`)
```
If the API returns the primary key under `programId` (or any key other than `id`), `row['id']` evaluates to `undefined` and the URL becomes `/programs/undefined/policies`. `useParams()` in the sub-pages then receives the string `"undefined"`.

**Root cause (display):** Even with a valid ID, the sub-pages displayed the raw ID rather than the human-readable program name:
```tsx
// BEFORE — shows UUID, not "GAP Good Rewards"
title={`Program: ${program}`}
```

---

### Issue 2 — Tabs mismatch

`PoliciesPage.tsx` had 7 tabs:
- Missing **"Promo Policies"** (was labeled "Promotions" — incorrect name)
- Missing **"Promo Code"** tab entirely (API `promoCodeDefsApi` existed but was unused)
- Order did not match original AngularJS UI

---

### Issues 4–6 — Non-functional action buttons

"Add Policy", "Add Rule", and "Create Flow" buttons rendered `<Button>` elements with no `onClick` handler and no dialog. Clicking them did nothing.

---

## 3. Fixes Applied

### Fix 1a — Safe navigation in `ProgramsPage.tsx`

```tsx
// BEFORE
onRowClick={(row) => navigate(`/programs/${row['id']}/policies`)}

// AFTER — checks both 'id' and 'programId' as API may use either
onRowClick={(row) => {
  const id = (row['id'] ?? row['programId']) as string | undefined;
  if (id) navigate(`/programs/${id}/policies`);
}}
```
Buttons are also `disabled` when no ID is resolvable, preventing silent broken navigation.

---

### Fix 1b — Fetch program name in sub-pages

Added `useEffect` in `PoliciesPage`, `RulesPage`, and `FlowPage`:

```tsx
// AFTER — fetches real program name for header display
useEffect(() => {
  if (!program || program === 'undefined') return;
  programsApi.getById(program)
    .then((res) => {
      const p = res.data as { name?: string };
      setProgramName(p.name || program);
    })
    .catch(() => setProgramName(program));
}, [program]);
```

Also added an invalid-program guard that renders an error message with a link back to `/programs` instead of loading with a broken state.

---

### Fix 2 — Tabs restored and reordered (`PoliciesPage.tsx`)

```tsx
// BEFORE (7 tabs, wrong order, wrong names)
type PolicyTab = 'reward' | 'purse' | 'tier' | 'streak' | 'aggregate' | 'partners' | 'promos';

const policyTabs = [
  { key: 'reward',     label: 'Reward Policies'    },
  { key: 'purse',      label: 'Purse Policies'     },
  { key: 'tier',       label: 'Tier Policies'      },
  { key: 'streak',     label: 'Streak Policies'    },
  { key: 'aggregate',  label: 'Aggregate Policies' },
  { key: 'partners',   label: 'Partners'           },
  { key: 'promos',     label: 'Promotions'         }, // wrong name
];

// AFTER (8 tabs, correct order, correct names matching AngularJS original)
type PolicyTab =
  | 'reward' | 'promos' | 'streak' | 'purse'
  | 'tier' | 'partners' | 'promoCodes' | 'aggregate';

const policyTabs = [
  { key: 'reward',     label: 'Reward Policies'    },
  { key: 'promos',     label: 'Promo Policies'     }, // renamed from "Promotions"
  { key: 'streak',     label: 'Streak Policies'    },
  { key: 'purse',      label: 'Purse Policies'     },
  { key: 'tier',       label: 'Tier Policies'      },
  { key: 'partners',   label: 'Partners'           },
  { key: 'promoCodes', label: 'Promo Code'         }, // new tab
  { key: 'aggregate',  label: 'Aggregate Policies' },
];
```

`promoCodeDefsApi` (already in `policies.api.ts` at `/promocodesdef`) is now wired to the new "Promo Code" tab.

---

### Fix 3 — Reward-specific columns added (`PoliciesPage.tsx`)

```tsx
// BEFORE — generic columns for all tabs
const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'description', header: 'Description' },
  { key: 'status', header: 'Status' },
];

// AFTER — reward-specific columns match original UI
const rewardColumns = [
  { key: 'id',             header: 'ID'             },
  { key: 'name',           header: 'Name'           },
  { key: 'description',    header: 'Description'    },
  { key: 'intendedUse',    header: 'Intended Use'   },
  { key: 'discountType',   header: 'Discount Type'  },
  { key: 'effectiveDate',  header: 'Effective Date' },
  { key: 'expirationDate', header: 'Expiration Date'},
  { key: 'pricingType',    header: 'Pricing Type'   },
  { key: 'status',         header: 'Status'         },
];
```

---

### Fix 4 — Rules columns (`RulesPage.tsx`)

Three separate column sets now match the original AngularJS column layout:

- **Rules tab**: Rule, Description, Priority, Rule Type, Bonus Type, Bonus Value, Effective From, Effective To, Status
- **Folders tab**: Rule Folder, Description, Priority, Folders, Rules, Promotional, Created By, Created At
- **Custom Expressions tab**: Name, Description, Expression, Last Updated, Status

---

### Fix 5 — Functional "Add" dialogs in all three pages

All three pages (`PoliciesPage`, `RulesPage`, `FlowPage`) now use the existing `CrudDialog` component:

- **Add Policy**: creates via `apiMap[activeTab].create()`
- **Add Rule / New Folder / Add Expression**: button label and fields change based on active tab; creates via the appropriate API
- **Create Flow**: creates via `miscApi.createFlow()`

New records are prepended to the local state on success without a full page reload.

---

## 4. Files Modified

| File | Changes |
|------|---------|
| `src/pages/policies/PoliciesPage.tsx` | Program name fetch; 8 tabs (added Promo Policies, Promo Code); correct tab order; reward-specific columns; functional Add Policy dialog |
| `src/pages/rules/RulesPage.tsx` | Program name fetch; expanded columns per original UI; functional Add Rule / Folder / Expression dialog |
| `src/pages/flow/FlowPage.tsx` | Program name fetch; functional Create Flow dialog; invalid-program guard |
| `src/pages/programs/ProgramsPage.tsx` | Safe ID resolution — checks `id` then `programId` fallback; disabled buttons when no ID |

---

## 5. Architecture Notes / Decisions

- **Program name lookup**: Each sub-page fetches program details independently via `programsApi.getById()`. A shared context (`ProgramContext`) would be more efficient for a future refactor if deeper program metadata is needed across pages.
- **Tab columns**: Kept per-tab column arrays statically defined inside the component for simplicity. If column schemas are later driven by API metadata, this is the right place to swap in dynamic column resolution.
- **No core business logic changed**: All API endpoints, route paths, and auth flows remain unchanged.
- **promoCodeDefsApi** was already defined in `policies.api.ts` but never imported in the Policies page. It is now wired to the "Promo Code" tab.

---

## 6. Visual Flow Composer — Future Work

The original AngularJS app uses a full visual node-based flow editor (drag-and-drop boxes and connectors). The current React conversion renders flows as a card grid.

Recommended approach for a proper visual flow builder:
- **Library**: [React Flow](https://reactflow.dev) (`@xyflow/react`) — MIT licensed, zero-dep, handles node/edge rendering
- **Node types to implement**: Init Program, Load Data, Partner Activity Check, Earn Rules, Discount Rules, Promo Rules, Burn Rules, Adjustment Rules, MCP Rules, Exit Rule
- **State**: Flow JSON (nodes + edges) can be stored in the existing `/flows/{id}` payload

This is tracked as a follow-up enhancement and not blocking the current fixes.

---

## 7. Testing Checklist

- [ ] Select a program from `/programs` — verify URL does NOT contain `undefined`
- [ ] Verify page header shows the human-readable program name (e.g. "GAP Good Rewards")
- [ ] Verify 8 policy tabs appear in correct order on `/programs/:id/policies`
- [ ] Verify "Promo Code" tab loads data from `/promocodesdef`
- [ ] Click "Add Policy" — dialog opens, submit creates a record via API
- [ ] Click "Add Rule" on Rules page — dialog opens, submit creates a rule
- [ ] Click "New Folder" on Folders tab — dialog opens, submit creates a folder
- [ ] Click "Create Flow" on Flow page — dialog opens, submit creates a flow
- [ ] Navigate directly to `/programs/undefined/policies` — error message shown, not a broken blank page
