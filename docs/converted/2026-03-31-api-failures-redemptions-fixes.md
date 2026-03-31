# API Failures — Accruals, Redemptions & Program Tabs (2026-03-31)

## 1. Summary of Issues Fixed

| # | Issue | Root Cause | Status |
|---|-------|-----------|--------|
| 1 | Accruals tab API failure | Wrong query field (`memberId` → must be `member`) | Fixed |
| 2 | Redemption tab API failure | Same wrong query field | Fixed |
| 3 | Only 4 Achievements sub-tabs (missing 13) | Incomplete initial implementation | Fixed — all 17 implemented |
| 4 | Promo Policies tab 404 | Wrong endpoint `/promos` → `/promopolicies` | Fixed |
| 5 | Promo Code tab 404 | Wrong endpoint `/promocodesdef` → `/promocodedefs` | Fixed |
| 6 | Policies missing `populate` + `query` structure | `programId` param used; AngularJS uses `query={program}` + `populate` | Fixed |

---

## 2. Root Cause Analysis

### Issue 1 & 2 — Accruals / Redemption API failures

**Error shown:** `At least one of the following query parameters is required: _id, member, purse, activity`

**Wrong implementation:**
```tsx
// BEFORE — API rejected because "memberId" is NOT a valid filter field
params: { query: JSON.stringify({ memberId }) }
```

**Root cause:** The `/accrualitems` and `/redemptionitems` endpoints accept only these
query filters: `_id`, `member`, `purse`, or `activity`. The field name in these collections
is `member` (an object reference), not `memberId`.

**Fix:**
```tsx
// AFTER — "member" is a valid filter
params: { query: JSON.stringify({ member: memberId }) }
```

---

### Issue 3 — Only 4 Achievements sub-tabs

**Root cause:** Initial implementation only mapped member-object properties (purses, badges,
tiers, streaks). The other 13 tabs require separate API calls — each with its own endpoint,
query filter, and populate structure matching the AngularJS controller.

---

### Issue 4 — Promo Policies 404

**Root cause:** Endpoint set to `/promos` (incorrect). AngularJS `dal.js` maps the
`PromoPolicies` resource to `/promopolicies`.

```typescript
// BEFORE
export const promosApi = crudResource('/promos');

// AFTER
export const promosApi = crudResource('/promopolicies');
```

---

### Issue 5 — Promo Code 404

**Root cause:** Endpoint set to `/promocodesdef` (singular `def`). AngularJS maps
`PromoCodeDefs` to `/promocodedefs` (plural `defs`).

```typescript
// BEFORE
export const promoCodeDefsApi = crudResource('/promocodesdef');

// AFTER
export const promoCodeDefsApi = crudResource('/promocodedefs');
```

---

### Issue 6 — Missing `populate` in Policies API calls

**Root cause:** The policy fetch used `{ programId: program }` as the raw query param.
AngularJS passes:
- `query: JSON.stringify({ program: programID })` (object reference, not `programId`)
- `populate: '[{"path":"program"},{"path":"createdBy"},{"path":"updatedBy"},{"path":"divisions","select":"name"}]'`

**Fix in `PoliciesPage.tsx`:**
```tsx
// BEFORE
apiMap[activeTab].getAll({ programId: program })

// AFTER — matches AngularJS policies controller lines 1105-1107
apiMap[activeTab].getAll({
  query: JSON.stringify({ program }),
  populate: JSON.stringify([
    { path: 'program' },
    { path: 'createdBy' },
    { path: 'updatedBy' },
    { path: 'divisions', select: 'name' },
  ]),
})
```

---

## 3. All 17 Achievements Sub-Tabs — API Mapping

| # | Tab | Source | Endpoint | Query Filter | Populate |
|---|-----|--------|----------|-------------|---------|
| 1 | Rewards | API | `/rewards` | `{member: id}` | policyId(name), divisions |
| 2 | Purses | Member obj | — | — | Loaded via member populate |
| 3 | Purse Histories | API | `/pursehistories` | `{memberId: id}` | createdBy(login), updatedBy(login), program(name org), policyId(escrow fields) |
| 4 | Badges | Member obj | — | — | Loaded via member populate |
| 5 | Tiers | Member obj | — | — | Loaded via member populate |
| 6 | Streaks | Member obj | — | — | Loaded via member populate |
| 7 | Streak Histories | API | `/streakhistories` | `{memberId: id}` | createdBy, updatedBy, policyId(name desc), goals.updatedBy/createdBy |
| 8 | Loyalty IDs | API | `/loyaltyids` | `{memberId: id}` | accrueTo, createdBy, updatedBy |
| 9 | Referrals | API | `/referrals` | `{referrer: id}` | createdBy, updatedBy |
| 10 | Transactions | API | `/activityhistories` | `{$or:[{memberID:id},{originalMemberID:id}]}` | createdBy(login), updatedBy(login) |
| 11 | Activity | API | `/activityhistories` | same as Transactions | same |
| 12 | Preferences | API | `/memberpreferences` | `{memberId:id, category:{$nin:['T&C']}}` | createdBy, updatedBy |
| 13 | Offers | API | `/offers` | `{member: id}` | policyId(name), divisions |
| 14 | Segments | API | `/membersegments` | `{member: id}` | segment, createdBy, updatedBy, divisions |
| 15 | Merge Histories | API | `/mergehistories` | `{survivorId: id}` | createdBy, updatedBy |
| 16 | Terms & Conditions | API | `/memberpreferences` | `{memberId:id, category:'T&C'}` | createdBy, updatedBy |
| 17 | Aggregates | API | `/memberaggregates` | `{memberId: id}` | createdBy, updatedBy |

**Critical field distinctions (matching AngularJS exactly):**
- `member` (not `memberId`) → Rewards, Offers, Segments
- `referrer` (not `memberId`) → Referrals
- `survivorId` (not `memberId`) → Merge Histories
- `$or: [{memberID}, {originalMemberID}]` → Transactions & Activity

---

## 4. Architecture: Generic Lazy Tab Component

All API-fetched achievement sub-tabs use a shared `LazyApiTab` component:

```tsx
function LazyApiTab({ endpoint, params, columns, emptyMsg }) {
  const [rows, setRows]   = useState([]);
  const [loading, ...]    = useState(true);
  const [error, ...]      = useState(null);

  useEffect(() => {
    apiClient.get(endpoint, { params })
      .then(res => setRows(Array.isArray(res.data) ? res.data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []); // runs once on mount — natural lazy load
  ...
}
```

**Lazy loading strategy:** Each sub-tab is mounted only when selected
(`key={active}` on `<SubTabContent>`), so React unmounts/remounts on switch. This means
data is fetched **on first visit** and not before. No preloading overhead.

---

## 5. Files Modified

| File | Changes |
|------|---------|
| `src/api/resources/policies.api.ts` | Fix: `/promos` → `/promopolicies`; `/promocodesdef` → `/promocodedefs` |
| `src/pages/policies/PoliciesPage.tsx` | Fix: query structure `{program}` + `populate`; create uses `{program}` |
| `src/pages/member-details/MemberDetailsPage.tsx` | Fix Accruals/Redemption (`member` not `memberId`); implement all 17 Achievements sub-tabs with correct endpoints, query filters, and populate |

---

## 6. Validation Checklist

- [ ] Accruals tab loads without "query parameters required" error
- [ ] Redemption tab loads without error
- [ ] Achievements section shows all 17 sub-tabs in scrollable nav
- [ ] Rewards tab fetches `/rewards?query={member:...}`
- [ ] Purses/Badges/Tiers/Streaks render from member object (no extra API call)
- [ ] Purse Histories fetches `/pursehistories?query={memberId:...}`
- [ ] Streak Histories fetches `/streakhistories?query={memberId:...}`
- [ ] Loyalty IDs fetches `/loyaltyids?query={memberId:...}`
- [ ] Referrals fetches `/referrals?query={referrer:...}`
- [ ] Transactions/Activity fetch `/activityhistories` with `$or` filter
- [ ] Preferences fetches `/memberpreferences` excluding T&C category
- [ ] Terms & Conditions fetches `/memberpreferences` with `category:'T&C'`
- [ ] Segments fetches `/membersegments?query={member:...}`
- [ ] Merge Histories fetches `/mergehistories?query={survivorId:...}`
- [ ] Promo Policies tab loads data (no 404)
- [ ] Promo Code tab loads data (no 404)
- [ ] Policy tabs send `query={program}` + `populate` in request

## 7. Final Summary
---
● All done. Here's the full summary:   
                                                                                          
  ---                                                                                                                                                                                                              
  Root Causes & Fixes                                                                                                                                                                                              
                                                                                                                                                                                                                   
  Issue 1 & 2 — Accruals / Redemption API failures                                                                                                                                                                 
                                                                                                                                                                                                                   
  Root cause: The API error said it all — "At least one of the following query parameters is required: _id, member, purse, activity". The previous implementation passed { memberId } which is not a valid filter  
  field on /accrualitems or /redemptionitems.                                                                                                                                                                      
                                                                                                                                                                                                                   
  Fix: Changed query to { member: memberId } — matching the AngularJS source which uses member (an object reference field) not memberId.                                                                           
   
  ---                                                                                                                                                                                                              
  Issue 3 — Only 4 of 17 Achievements sub-tabs              
                                                                                                                                                                                                                   
  Root cause: Initial implementation only handled the 4 sub-resources embedded in the member object (purses, badges, tiers, streaks). The other 13 each require separate API calls with their own endpoints,
  filters, and populate structures.                                                                                                                                                                                
                                                            
  Fix: Implemented all 17 sub-tabs with a reusable LazyApiTab component. Key field distinctions from the AngularJS controller:                                                                                     
  - member (not memberId) → Rewards, Offers, Segments       
  - referrer (not memberId) → Referrals                                                                                                                                                                            
  - survivorId (not memberId) → Merge Histories             
  - $or: [{memberID}, {originalMemberID}] → Transactions & Activity                                                                                                                                                
  - category: { $nin: ['T&C'] } → Preferences; category: 'T&C' → Terms & Conditions                                                                                                                                
                                                                                                                                                                                                                   
  Sub-tabs are lazily loaded — each only fetches when first selected (key={active} triggers remount).                                                                                                              
                                                                                                                                                                                                                   
  ---                                                                                                                                                                                                              
  Issue 4 — Promo Policies 404                                                                                                                                                                                     
                                                                                                                                                                                                                   
  Fix: /promos → /promopolicies in policies.api.ts
                                                                                                                                                                                                                   
  Issue 5 — Promo Code 404                                                                                                                                                                                         
                                                                                                                                                                                                                   
  Fix: /promocodesdef → /promocodedefs in policies.api.ts                                                                                                                                                          
                                                            
  Issue 6 — Missing populate in Policies calls                                                                                                                                                                     
                                                            
  Fix: Changed from getAll({ programId: program }) to getAll({ query: JSON.stringify({ program }), populate: JSON.stringify([...]) }) — matching the AngularJS policies controller exactly. 
  ---