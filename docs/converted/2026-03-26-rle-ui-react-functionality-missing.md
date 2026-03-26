# Members Module — AngularJS → React Migration Fixes

**Date:** 2026-03-26
**Reference:** `docs/2026-03-26-rle-ui-react-converted-claude-functionality-missing.md`
**Source (AngularJS):** `/home/agadili/Documents/RCX_PROJS/rle-ui`
**Target (React):** `/home/agadili/Documents/RCX_PROJS/rle-ui-react-converted-claude`

---

## Issues Fixed

| # | Issue | Severity |
|---|-------|----------|
| 1 | Members table showed only 7 columns vs 25+ in AngularJS | Critical |
| 2 | Column labels did not match AngularJS (e.g., `Phone` vs `Cell Phone`, `Loyalty ID` vs proper mapping) | High |
| 3 | Add Member form missing 14 out of 19 fields from AngularJS `uiDef` | Critical |
| 4 | Extended Attributes button and dynamic fields completely absent | High |
| 5 | Search API sent `phone` param instead of `cellPhone` (AngularJS field name) | High |
| 6 | Members search did not populate `program`, `purses.policyId`, `divisions` (AngularJS query missing) | Medium |
| 7 | `Member` TypeScript interface was missing most fields | Medium |

---

## Files Modified / Created

| File | Status | Description |
|------|--------|-------------|
| `src/api/resources/members.api.ts` | **Modified** | Expanded `Member` interface; fixed search params; added `getExtensionSchema()` |
| `src/pages/members/MembersPage.tsx` | **Modified** | Full rewrite — comprehensive columns, dynamic columns, new search params, `AddMemberDialog` |
| `src/components/members/AddMemberDialog.tsx` | **Created** | Full Add Member form matching AngularJS `uiDef` with all 19 fields |
| `src/components/members/ExtendedAttributesDialog.tsx` | **Created** | Extended Attributes modal — fetches schema, renders dynamic fields |

---

## Before vs After

### 1. Members Table Columns

**Before (7 columns):**
```
Member ID | First Name | Last Name | Email | Phone | Loyalty ID | Status
```

**After (25 pre-defined + dynamic columns from API response):**
```
Name | Address | Phone | Tier | Purse | Type | Enroll Date | Program | Status |
First Name | Last Name | Email | Last Activity Date | Enroll Channel |
Acquisition Channel | Acquisition Date | Date of Birth | Created At | Updated At |
Zip Code | Can Preview | Created By | Updated By | Divisions | Loyalty ID |
[+ any extra fields returned by API, e.g. HomeStoreID, UserName, SalesForceId ...]
```

Column mapping from AngularJS `listDef`:

| AngularJS `listDef` | Header | React key |
|---------------------|--------|-----------|
| `firstName` (template: member-name) | Name | `_name` (computed: `firstName + " " + lastName`) |
| `address` | Address | `address` |
| `cellPhone` | Phone | `cellPhone` |
| `tier` (template: member-primaryDetails) | Tier | `_tier` (primary tier level name) |
| `purse` (template: member-primaryDetails) | Purse | `_purse` (primary purse available balance) |
| `type` | Type | `type` |
| `enrollDate` | Enroll Date | `enrollDate` |
| `program` (object: name) | Program | `program` → `program.name` |

Additional columns from AngularJS `detailListDef`:

| AngularJS field | Header |
|-----------------|--------|
| `status` | Status |
| `firstName` | First Name |
| `lastName` | Last Name |
| `email` | Email |
| `lastActivityDate` | Last Activity Date |
| `enrollChannel` | Enroll Channel |
| `acquisitionChannel` | Acquisition Channel |
| `acquisitionDate` | Acquisition Date |
| `dob` | Date of Birth |
| `createdAt` | Created At |
| `updatedAt` | Updated At |
| `zipCode` | Zip Code |
| `canPreview` | Can Preview |
| `createdBy` (object: login) | Created By |
| `updatedBy` (object: login) | Updated By |
| `divisions` (array of names) | Divisions |

---

### 2. Dynamic Column Generation

The AngularJS `dynamic-list-view` directive renders all API response fields not in a `hiddenFields` list. The React app now replicates this:

**Before:** Static fixed columns only.

**After:** When search results arrive, any fields in the API response not already covered by pre-defined columns (and not in the hidden set) are automatically added as columns.

```typescript
// Hidden fields excluded from dynamic column generation (mirrors AngularJS hiddenFields)
const HIDDEN_FIELDS = new Set([
  'accruals', 'redemptions', '$$hashkey', '__b', '__v', 'hasdefaults',
  'enrolllocation', 'originalmemberid', 'org', 'details', 'timestamp',
  'activities', 'events', 'badges', 'rewards', 'tiers', 'purses', ...
]);

// Any extra key in API response → auto-generated column
const dynamicColumns = useMemo(() => {
  const extraKeys = new Set<string>();
  members.forEach((m) => {
    Object.keys(m).forEach((k) => {
      if (!PREDEFINED_KEYS.has(k) && !HIDDEN_FIELDS.has(k.toLowerCase())) {
        extraKeys.add(k);
      }
    });
  });
  return Array.from(extraKeys).sort().map((k) => ({
    key: k,
    header: toTitleCase(k),  // e.g. "homeStoreId" → "Home Store Id"
    render: (val) => typeof val === 'object' ? JSON.stringify(val) : String(val ?? ''),
  }));
}, [members]);
```

This automatically handles columns like `HomeStoreID`, `UserName`, `SalesForceId`, `IpCode`, `LegacyTier`, `GoalValues`, etc., if the API returns them.

---

### 3. Members Search API Params

**Before:**
```typescript
// Wrong field name; no populate/select
const res = await membersApi.search({ phone: '...' });
// GET /members?phone=...
```

**After (matches AngularJS `queryData` function):**
```typescript
const res = await membersApi.search({
  ...searchParams,         // cellPhone (not phone)
  populate: JSON.stringify([
    { path: 'program', select: 'name' },
    { path: 'purses.policyId', select: 'colors ptMultiplier' },
    { path: 'divisions' },
  ]),
  select: JSON.stringify({
    activities: 0, events: 0, badges: 0, rewards: 0,
    'purses.accruals': 0, 'purses.redemptions': 0,
  }),
  sort: JSON.stringify({ _id: -1 }),
});
```

---

### 4. Add Member Form

**Before (5 fields):**
```
First Name | Last Name | Email | Phone | Loyalty ID
```

**After (19 fields — matches AngularJS `uiDef` exactly):**

| Row | Fields | Type |
|-----|--------|------|
| 1 | First Name `*`, Last Name | text |
| 2 | Email Address, Phone Number | text / email |
| 3 | Gender, Date of Birth, Member Type `*` | select, date, select |
| 4 | Address, City, State | text |
| 5 | Country, Zip Code, Enroll Date `*` | text, text, date |
| 6 | Enroll Location, Enroll Source, Status | text, select, select |
| 7 | Participate in a Program `*`, Referral Code, Can Preview | select, text, checkbox |
| hidden | `acquisitionChannel = 'Web'`, `enrollChannel = 'Web'` | — |

`*` = required field

**Form validation (matches AngularJS required fields):**
```typescript
const validate = (): string | null => {
  if (!form.firstName.trim())  return '"First Name" is required.';
  if (!form.type)              return '"Member Type" is required.';
  if (!form.enrollDate)        return '"Enroll Date" is required.';
  if (!form.program)           return '"Participate in a program" is required.';
  return null;
};
```

**Enum/options loading (matches AngularJS `RLE.Enums.query`):**
```typescript
// Same API call pattern as AngularJS controller
await enumsApi.getAll({
  query: JSON.stringify({ type: 'MemberType' }),
  sort: 'label',
  select: 'value,label',
});

// MemberStatusType excludes 'Anonymous' (matches AngularJS filter)
await loadEnum('MemberStatusType', ['Anonymous']);
```

---

### 5. Extended Attributes

**Before:** No Extended Attributes button or modal existed.

**After:**

1. On `AddMemberDialog` open, `GET /schema/extensionschema` is called.
2. If the schema contains fields with `acceptData !== false`, the **"Extended Attributes"** button is shown (matches AngularJS `isModalExtEnable` flag).
3. Clicking the button opens `ExtendedAttributesDialog`:
   - Dynamically renders input fields from `extSchema.properties`
   - Supports category-based grouping (sectioned layout)
   - Field types: text, number, date
4. On save, ext data is merged into the submission payload:

```typescript
// Extended attributes stored under member.ext (matches AngularJS data.ext)
if (Object.keys(filledExt).length > 0) {
  payload.ext = filledExt;
}
```

**AngularJS equivalent flow:**
```javascript
// AngularJS: Schema.getExtensionSchema → isModalExtEnable check
if (v.acceptData) {
  $scope.isModalExtEnable = true;
}
// On save: $scope.data.ext = user-entered ext values
```

---

### 6. Member TypeScript Interface Expansion

**Before:**
```typescript
export interface Member {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;          // wrong field name
  loyaltyId?: string;
  [key: string]: unknown;
}
```

**After:**
```typescript
export interface Member {
  id?: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  cellPhone?: string;      // corrected field name
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  type?: string;
  status?: string;
  enrollDate?: string;
  enrollChannel?: string;
  enrollSource?: string;
  acquisitionChannel?: string;
  acquisitionDate?: string;
  dob?: string;
  gender?: string;
  program?: { _id?: string; name?: string } | string;
  tiers?: Array<{ primary?: boolean; level?: { name?: string; color?: string } }>;
  purses?: Array<{ primary?: boolean; availBalance?: number; policyId?: {...}; ... }>;
  divisions?: Array<{ name?: string } | string>;
  canPreview?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastActivityDate?: string;
  createdBy?: { login?: string } | string;
  updatedBy?: { login?: string } | string;
  referralCode?: string;
  ext?: Record<string, unknown>;
  [key: string]: unknown;
}
```

Also added to `MemberSearchParams`:
```typescript
populate?: string;
select?: string | Record<string, number>;
sort?: unknown;
```

And new API method:
```typescript
getExtensionSchema: () =>
  apiClient.get('/schema/extensionschema', {
    params: { query: JSON.stringify({ display: true }) }
  }),
```

---

## Validation Checklist

| Requirement | Status |
|-------------|--------|
| All columns from AngularJS `listDef` visible | ✅ |
| All columns from AngularJS `detailListDef` visible | ✅ |
| Extra API response columns shown dynamically | ✅ |
| Column labels match AngularJS exactly | ✅ |
| Add Member form has all 19 fields from `uiDef` | ✅ |
| Field labels match AngularJS (e.g., "Phone Number", "Email Address", "Participate in a Program") | ✅ |
| Required field validation matches AngularJS | ✅ |
| Enroll Source defaults to 'Unknown' | ✅ |
| Hidden fields `acquisitionChannel`, `enrollChannel` set to 'Web' | ✅ |
| Extended Attributes button shown when `acceptData` fields exist | ✅ |
| Extended Attributes fields editable | ✅ |
| Ext data included in form submission as `payload.ext` | ✅ |
| Search uses `cellPhone` (not `phone`) | ✅ |
| Search populates `program`, `purses.policyId`, `divisions` | ✅ |
| TypeScript compiles with no errors | ✅ |
| Vite build succeeds | ✅ |
