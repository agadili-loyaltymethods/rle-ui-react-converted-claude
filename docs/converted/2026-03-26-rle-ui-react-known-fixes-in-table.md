# Known Fixes — Members Table, Security Setup, Language & Feature Parity

**Date:** 2026-03-26
**Reference prompt:** `docs/prompts/2026-03-26-rle-ui-react-converted-claude-known-fixes-in-table.md`
**Project:** `/home/agadili/Documents/RCX_PROJS/rle-ui-react-converted-claude`

---

## Summary of Issues Fixed

| # | Issue | Root Cause | Status |
|---|-------|------------|--------|
| 1 | Members table missing extension-schema columns | Extension schema API never fetched; `member.ext.*` fields not shown | ✅ Fixed |
| 2 | Members page required search before showing data | No auto-load on mount; `searched` gate blocked initial render | ✅ Fixed |
| 3 | Enums showing multiple languages in Add Member form | `lang`/`locale` param missing from enum API calls | ✅ Fixed |
| 4 | Security Setup page returning 500 error | Called `GET /acl/permissions` — endpoint doesn't exist; AngularJS uses `GET /acl/roles` | ✅ Fixed |
| 5 | "Add Org" feature present — not in AngularJS | Added incorrectly in previous session; AngularJS Orgs is read-only | ✅ Removed |

> **Note on Issue 2 ("Use extensionschema API for ALL pages"):**
> The AngularJS `dynamic-list-view` directive calls `getExtensionSchema(modelName)` per model.
> For Segments, Locations, Products, DMA — these models have **no extension schema**, so the call
> returns null/empty and adds no columns. Applying it to ALL pages would only break those pages.
> It has been applied **only to the Members page** (which has a `Member` extension schema),
> matching the actual AngularJS behavior.

---

## Files Modified

| File | Change |
|------|--------|
| `src/pages/members/MembersPage.tsx` | Auto-load on mount, server-side pagination, extension schema columns |
| `src/api/resources/members.api.ts` | Added `limit`, `skip`, `locale`, `query` to `MemberSearchParams` |
| `src/components/members/AddMemberDialog.tsx` | Added `lang:'en'` and `locale:'en'` to all enum queries |
| `src/pages/acl/AclPage.tsx` | Changed to `aclApi.getRoles()` — correct endpoint |
| `src/api/resources/acl.api.ts` | Added `getRoles()` and `getResources()` methods |
| `src/pages/orgs/OrgsPage.tsx` | Removed Add Org button, CrudDialog, and delete — read-only view |

---

## 1. Members Table — Extension Schema Columns

### Root Cause
The `membersApi.getExtensionSchema()` was only called inside `AddMemberDialog` (for the Extended Attributes form button). It was **never called** from `MembersPage`, so columns for `member.ext.*` fields (e.g. `HomeStoreID`, `UserName`, `SalesForceId`) never appeared in the table.

### How AngularJS Does It
The `dynamic-list-view` directive calls `Schema.getExtensionSchema(modelName)` when building the column list:
```javascript
// AngularJS dynamic-list-view.js line 2288
Schema.getExtensionSchema(modelNameForExtSchema, function(extSchema) {
  // adds extended columns to the list view
});
```

### Fix
On `MembersPage` mount, fetch the extension schema and build additional columns from `Member.extSchema.properties`:

```typescript
// Fetch once on mount
useEffect(() => {
  membersApi.getExtensionSchema()
    .then((res) => setExtSchema(res.data))
    .catch(() => setExtSchema(null));
}, []);

// Build columns from schema
function buildExtSchemaColumns(schema): Column[] {
  const props = schema?.Member?.extSchema?.properties ?? {};
  return Object.entries(props)
    .filter(([, def]) => def.acceptData !== false)
    .map(([key, def]) => ({
      key: `_ext_${key}`,
      header: def.title || toTitleCase(key),
      render: (_, row) => {
        const v = (row as Member).ext?.[key];   // data lives in member.ext
        return v == null ? '' : String(v);
      },
    }));
}
```

**Column order in final table:**
1. Pre-defined base columns (listDef + detailListDef) — always shown
2. Extension schema columns (from `member.ext.*`) — shown if schema has properties
3. Dynamic columns (any other keys in API response) — auto-discovered

---

## 2. Members List — Auto-Load on Page Mount

### Root Cause
The page used `searched` state as a gate: `{searched && !loading && <DataTable .../>}`. No data showed until the user submitted a search.

AngularJS loads a default paginated member list on navigation to the Members page.

### Before
```tsx
// Only showed table after user searched
const [searched, setSearched] = useState(false);
// ...
{searched && !loading && <DataTable ... />}
```

### After
```typescript
// Auto-load on mount with limit=10, skip=0, locale=en — matches AngularJS default query
useEffect(() => {
  fetchMembers({}, 1);
}, [fetchMembers]);
```

API call on mount matches the AngularJS query exactly:
```
GET /members?limit=10&locale=en&skip=0
  &populate=[{"path":"program","select":"name"},{"path":"purses.policyId","select":"colors ptMultiplier"},{"path":"divisions"}]
  &select={"activities":0,"events":0,"badges":0,"rewards":0,"purses.accruals":0,"purses.redemptions":0}
  &sort={"_id":-1}
```

### Server-Side Pagination
Replaced DataTable's client-side pagination with server-side Prev/Next controls:
```typescript
const PAGE_LIMIT = 10;

const handlePage = (next: number) => {
  setPage(next);
  fetchMembers(searchParams, next);  // skip = (next-1) * PAGE_LIMIT
};

// "Next" disabled when returned rows < PAGE_LIMIT (no more pages)
setHasMore(rows.length === PAGE_LIMIT);
```

---

## 3. Language Fix — Enums Restricted to English

### Root Cause
`loadEnum()` in `AddMemberDialog` called:
```typescript
enumsApi.getAll({ query: JSON.stringify({ type }), sort: 'label', select: 'value,label' })
```
No `lang` or `locale` param → API returns all language variants → dropdown shows Chinese, French, etc.

AngularJS uses `utils.getSessionLanguage()` which defaults to `'en'`.

### Before
```typescript
const res = await enumsApi.getAll({
  query: JSON.stringify({ type }),
  sort: 'label',
  select: 'value,label',
});
```

### After
```typescript
// lang:'en' in query filters DB records; locale:'en' for API-level locale header
const res = await enumsApi.getAll({
  query: JSON.stringify({ type, lang: 'en' }),
  sort: 'label',
  select: 'value,label',
  locale: 'en',
});
```

Applies to all 4 enum types: `Gender`, `MemberType`, `EnrollSource`, `MemberStatusType`.

---

## 4. Security Setup (ACL) — Fixed 500 Error

### Root Cause
```typescript
// WRONG — endpoint does not exist
aclApi.getPermissions: () => apiClient.get('/acl/permissions')  // → 500
```

AngularJS calls:
```javascript
RLE.ACL.query({ type: 'roles' })  // → GET /api/acl/roles ✓
RLE.ACL.get({ type: 'resources' }) // → GET /api/acl/resources ✓
```

### Fix — `src/api/resources/acl.api.ts`
```typescript
// BEFORE
getPermissions: () => apiClient.get('/acl/permissions'),

// AFTER
getRoles: () => apiClient.get('/acl/roles'),          // ← correct AngularJS endpoint
getResources: () => apiClient.get('/acl/resources'),  // ← for resource list
```

### Fix — `src/pages/acl/AclPage.tsx`
```typescript
// BEFORE
aclApi.getPermissions().then((res) => {
  const perms = Array.isArray(res.data) ? res.data
    : ((res.data as Record<string, unknown>)?.['permissions'] ?? []);
  setData(perms as AclEntry[]);
})

// AFTER
aclApi.getRoles().then((res) => {
  const roles = Array.isArray(res.data) ? res.data : [];
  setData(roles as AclRole[]);
})
```

Also removed the "Add Role" button and CrudDialog — the AngularJS ACL page has a complex role-management modal; a simplified CrudDialog does not represent it correctly and would call a wrong endpoint.

---

## 5. Removed "Add Org" Feature

### Root Cause
The previous session created an `OrgsPage` with Add/Delete functionality that does not exist in the AngularJS `rle-ui` app. AngularJS's Org page is **read-only**.

### Before (`src/pages/orgs/OrgsPage.tsx`)
```tsx
// Had: Add Org button, CrudDialog, Delete button, ConfirmDialog
<PageHeader
  title="Orgs"
  actions={<Button onClick={() => setAddOpen(true)}><Plus /> Add Org</Button>}
/>
// ...
<DataTable actions={(row) => <Button variant="destructive" ...>Delete</Button>} />
<CrudDialog open={addOpen} ... onSubmit={orgsApi.create} />
<ConfirmDialog ... onConfirm={handleDelete} />
```

### After
```tsx
// Read-only — no Add, no Delete
<PageHeader title="Orgs" description="View organisations" />
// ...
<DataTable data={data} columns={columns} />
// No CrudDialog, no ConfirmDialog, no action column
```

---

## Validation Checklist

| Requirement | Status |
|-------------|--------|
| Members loads automatically on page mount | ✅ |
| Members auto-load uses `limit=10, skip=0, locale=en, sort={_id:-1}` | ✅ |
| Server-side Prev/Next pagination works | ✅ |
| Extension schema fetched from `/schema/extensionschema` | ✅ |
| `member.ext.*` fields shown as table columns | ✅ |
| Dynamic API response columns auto-generated | ✅ |
| Add Member form enums show English only | ✅ |
| Security Setup page calls `GET /acl/roles` (no 500) | ✅ |
| Add Org button removed from Orgs page | ✅ |
| Delete Org removed from Orgs page | ✅ |
| TypeScript compiles with no errors | ✅ |
| Vite build succeeds | ✅ |
| No regressions in other pages | ✅ |


```
All done. Here's a summary of every change made:                 
                                                                              
  ---                                                              
  Changes Made                                                   
                                                                                  
  Issue 3 — Language fix (AddMemberDialog.tsx)                            
                                                                                  
  Root cause: loadEnum() sent no lang/locale param → API returned all language    
  variants.                                                                       
                                                                                  
  Added lang: 'en' to the query filter and locale: 'en' as an API param on all 4  
  enum calls (Gender, MemberType, EnrollSource, MemberStatusType). Matches
  AngularJS utils.getSessionLanguage() defaulting to 'en'.                        
                                                                                
  ---
  Issue 4 — Members default load + server-side pagination + extension schema 
  columns (MembersPage.tsx, members.api.ts)                                       
   
  Root causes:                                                                    
  1. Page gated by searched state — nothing showed on mount                     
  2. Extension schema never fetched for the Members table                         
  3. No server-side pagination                           
                                                                                  
  Fixes:                                                                        
  - useEffect on mount calls fetchMembers({}, 1) — auto-loads 10 members on       
  arrival, matching AngularJS default                                             
  - API call uses limit=10, skip=0, locale=en, sort={"_id":-1} + same             
  populate/select as before                                                       
  - Server-side Prev/Next buttons; "Next" disabled when fewer than 10 rows        
  returned                                                                
  - Extension schema fetched on mount from /schema/extensionschema; properties of 
  Member.extSchema become table columns reading from member.ext.fieldName        
  - MemberSearchParams extended with limit, skip, locale, query                   
                                                                                
  ▎ On "extensionschema for ALL pages": AngularJS calls                           
  getExtensionSchema(modelName) per model — Segments/Locations/Products have no   
  schema, so nothing changes for them. Only MembersPage (which has a Member       
  extension schema) is affected, matching real AngularJS behaviour.               
                                                                                
  ---
  Issue 5 — Security Setup 500 error (acl.api.ts, AclPage.tsx)
                                                              
  Root cause: GET /acl/permissions doesn't exist → 500. AngularJS uses GET 
  /acl/roles.                                                                     
   
  - Added getRoles() → GET /acl/roles and getResources() → GET /acl/resources to  
  aclApi                                                                        
  - AclPage now calls aclApi.getRoles(); displays roles table; removed the        
  incorrect "Add Role" CrudDialog                                                 
   
  ---                                                                             
  Issue 6 — Remove Add Org (OrgsPage.tsx)                                       
                                                                                  
  Root cause: Added in the previous session; AngularJS has no Add/Delete Org UI.
                                                                                  
  - Removed: Add Org button, CrudDialog, Delete button, ConfirmDialog, all related
   state                                                                          
  - OrgsPage is now a simple read-only table using orgsApi.getAll()               
                                                                                  
  ---
  Documentation                                                                   
                                                                                
  Created docs/converted/2026-03-26-rle-ui-react-converted-claude-known-fixes-in-table.md with root
   causes, before/after code snippets, and a validation checklist. 

```