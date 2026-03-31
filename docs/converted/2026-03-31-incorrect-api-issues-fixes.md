# Incorrect API Issues — Promo Policies, Stale Data, Default Sub-tab (2026-03-31)

## 1. Summary of Issues Fixed

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | Promo Policies tab → "Resource not found" | `/promopolicies` endpoint does not exist | 2-step fetch: `/rulefolders` (isPromoFolder=true) → `/rules` (in those folders) |
| 2 | Stale data from previous tab still showing on error | `data` state never cleared on tab change | `setData([])` + `setError(null)` before every fetch; render guards prevent mixing |
| 3 | Achievements default sub-tab wrong (was "Rewards") | `useState<SubTab>('rewards')` | Changed to `useState<SubTab>('activity')` |

---

## 2. Root Cause Analysis

### Issue 1 — Promo Policies "Resource Not Found"

From the previous fix session, `/promopolicies` was tried as the endpoint. AngularJS source
analysis (`dal.js`, `controller.js`, `promoPolicies.html`) confirms:

> **The "Promo Policies" tab does NOT have a dedicated API endpoint.**
> It renders Rules (`model-name="'Rule'"`) filtered to rule folders marked `isPromoFolder: true`.

AngularJS `queryPromoRulesData()` (controller.js ~line 2979) does this in two steps:
1. Fetch rule folders: `GET /rulefolders?query={"program":programId,"isPromoFolder":true}`
2. Fetch rules in those folders: `GET /rules?query={"program":programId,"ruleFolder":{"$in":[...folderIds]}}`

If the program has no promo folders → empty result (not an error).

---

### Issue 2 — Stale Data on Tab Switch

**Before:**
```tsx
useEffect(() => {
  setLoading(true);
  setError(null);
  // ❌ data is NOT cleared — old rows remain visible while new fetch runs
  apiMap[activeTab].getAll(...)
    .then(res => setData(rows))
    .catch(err => setError(err));   // ❌ on error: old data + error message both show
}, [program, activeTab]);

// render:
{error && <ErrorMessage />}
{loading ? <LoadingSpinner /> : <DataTable data={data} />}
// ❌ when !loading && error: DataTable still renders with stale data
```

**After:**
```tsx
useEffect(() => {
  setData([]);      // ✅ clear stale data immediately
  setError(null);
  setLoading(true);
  ...
}, [program, activeTab]);

// render:
{loading && <LoadingSpinner />}
{!loading && error && <ErrorMessage />}
{!loading && !error && <DataTable data={data} />}  // ✅ mutually exclusive states
```

A cleanup flag (`cancelled = true`) also prevents race conditions when the user switches
tabs faster than a request completes.

---

### Issue 3 — Wrong Default Sub-tab

AngularJS member details controller opens the Achievements section on the **Activity** tab
(activityhistories). The React implementation had `useState<SubTab>('rewards')`.

**Fix:** `useState<SubTab>('activity')`

---

## 3. Promo Policies — 2-Step Fetch Implementation

```tsx
if (activeTab === 'promos') {
  // Step 1: find promo rule-folders for this program
  ruleFoldersApi
    .getAll({ query: JSON.stringify({ program, isPromoFolder: true }) })
    .then(fRes => {
      const folders = Array.isArray(fRes.data) ? fRes.data : [];
      const folderIds = folders.map(f => f['_id'] || f['id']).filter(Boolean);

      if (folderIds.length === 0) {
        finish([]);   // no promo folders → empty, not error
        return;
      }

      // Step 2: get rules inside those promo folders
      rulesApi
        .getAll({
          query: JSON.stringify({ program, ruleFolder: { $in: folderIds } }),
          populate: POLICY_POPULATE,
        })
        .then(rRes => finish(Array.isArray(rRes.data) ? rRes.data : []))
        .catch(err => finish([], err.message));
    })
    .catch(err => finish([], err.message));
}
```

Promo Policies data uses the same `genericColumns` (Name, Description, Status) as
other rule-like tabs — the column structure matches a Rule record.

---

## 4. Stale-Data Prevention Pattern (Reusable)

The same pattern should be applied to any page where tabs share a single `data` state:

```tsx
useEffect(() => {
  setData([]);        // 1. clear immediately
  setError(null);
  setLoading(true);

  let cancelled = false;  // 2. cancel if tab changes before fetch completes

  fetchData()
    .then(rows => { if (!cancelled) { setData(rows); setLoading(false); } })
    .catch(err  => { if (!cancelled) { setError(err.message); setLoading(false); } });

  return () => { cancelled = true; };
}, [activeTab]);

// Render — mutually exclusive, never mix states:
{loading && <LoadingSpinner />}
{!loading && error && <ErrorMessage message={error} />}
{!loading && !error && <DataTable data={data} />}
```

---

## 5. Files Modified

| File | Change |
|------|--------|
| `src/pages/policies/PoliciesPage.tsx` | Clear stale data on tab change; 2-step Promo Policies fetch using `ruleFoldersApi` + `rulesApi`; render guards for mutually exclusive loading/error/data states |
| `src/api/resources/policies.api.ts` | Removed `promosApi` export (replaced by inline logic); added comment explaining Promo Policies design |
| `src/pages/member-details/MemberDetailsPage.tsx` | Default Achievements sub-tab changed from `'rewards'` to `'activity'` |

---

## 6. Validation Checklist

- [ ] Reward Policies tab loads data correctly
- [ ] Switching to Promo Policies: previous (Reward) data is NOT visible during load
- [ ] Promo Policies shows rules from promo folders if the program has them, empty otherwise
- [ ] No "Resource not found" error for Promo Policies
- [ ] Switching any tab shows spinner immediately, never old data
- [ ] If a tab's API fails: only error message shown, no stale rows underneath
- [ ] All other policy tabs (Streak, Purse, Tier, Partners, Promo Code, Aggregate) unaffected
- [ ] Member Details → Achievements opens on "Activity" sub-tab by default
- [ ] Race condition safe: switching tabs quickly doesn't show mixed data
