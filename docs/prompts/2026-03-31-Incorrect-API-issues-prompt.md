You are a senior frontend architect and AngularJS → React migration expert.

I have migrated an AngularJS (rle-ui) application to a React app (Vite + Tailwind CSS + shadcn/ui).

All fixes MUST be applied ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react project)

Reference AngularJS project (DO NOT MODIFY):
👉 /home/agadili/Documents/RCX_PROJS/rle-ui

Your goal is to ensure FULL functional parity with AngularJS (rle-ui), especially for Program and Member Details pages.

---

## 🐞 Issues

### 1. Promo Policies Tab – Resource Not Found + Stale Data (Critical)

- When clicking "Promo Policies" tab:
  - API returns "Resource Not Found"
- Additionally:
  - If user first opens "Reward Policies" tab (data loads correctly)
  - Then switches to "Promo Policies":
    ❌ Old data from previous tab (Reward Policies) is still visible
    ❌ New API fails but UI is not clearing previous data

Reference:
👉 Check provided screenshot for behavior docs/images/Still seeing promo policies error.png

---

### 2. Incorrect API for Promo Policies

- Currently using:
  ❌ api/promopolicies (likely incorrect)

- Observation:
  - AngularJS (rle-ui) may NOT use this API
  - Or uses a different endpoint / structure

---

### 3. Default Sub-Tab Selection Missing (Achievements Tab)

- When selecting a member → navigating to "Achievements" tab:

❌ Currently:
- No default sub-tab selected OR wrong tab selected

✅ Expected:
- Default sub-tab should be:
  👉 "Activity"

---

### 4. Documentation Required

Create a markdown file inside:

👉 docs/converted/

File name:
- Use prompt name OR generate unique meaningful name

---
## 📝 Documentation Content

Include:

1. Summary of issues fixed
2. Members table fix (schema-based columns)
3. Dynamic column implementation for all pages
4. Language fix in forms
5. Default members API integration
6. Security Setup fix
7. Removed features (Add Org)
8. List of files modified
9. Code snippets (before vs after)
10. Comments explaining decisions
11. Generate file after all comments in claude-code is given like summary etc.

---

---

## 🎯 Objective

Fix:
- Promo Policies tab API + behavior
- Clear stale data when switching tabs
- Correct API usage based on AngularJS
- Set default sub-tab as "Activity" in Achievements

---

## 🔍 What You MUST Do

### Step 1: Analyze AngularJS (rle-ui)

- Inspect:
  - Program page → Promo Policies tab
  - Check:
    - Whether Promo Policies exists
    - What API is actually used
    - Or if it is derived from another API

- Inspect:
  - Member Details → Achievements tab
  - Default sub-tab logic

---

### Step 2: Fix Promo Policies API

- Identify correct API from AngularJS:
  - Replace incorrect:
    ❌ api/promopolicies

- Ensure:
  - Correct endpoint
  - Correct query params
  - Correct mapping

- If API does NOT exist:
  - Remove or disable Promo Policies tab OR
  - Implement correct logic as per AngularJS

---

### Step 3: Fix Tab Data Handling (VERY IMPORTANT)

- When switching tabs:
  - CLEAR previous tab data immediately

Implement:
- On tab change:
  - Reset state (data = empty)
  - Show loading state
  - Then populate with new API response

Ensure:
- No stale data is displayed
- No mixing of data between tabs

---

### Step 4: Error Handling

- If API fails:
  - Show proper error message (not blank or stale UI)
  - Do NOT display old data

---

### Step 5: Fix Default Sub-Tab (Achievements)

- When user navigates to:
  → Member Details → Achievements tab

Ensure:
- Automatically select:
  👉 "Activity" sub-tab

Implementation:
- Set default tab state
- Ensure routing (if any) reflects this

---

### Step 6: Maintain Consistency

- Apply same tab behavior across:
  - Program tabs
  - Member tabs
- Ensure:
  - Clean state management
  - No stale UI issues anywhere

---

## 🧪 Validation Checklist

Ensure:
- Promo Policies tab works OR is correctly handled
- No "Resource Not Found" errors
- Correct API is used (as per AngularJS)
- Switching tabs clears previous data
- No stale data visible
- Error states handled properly
- Achievements tab defaults to "Activity"
- UI behavior matches AngularJS

---

## 📦 Output Requirements

Provide:
1. Root cause of Promo Policies API failure
2. Whether Promo Policies API exists or not in AngularJS
3. Fixed API implementation OR tab handling
4. Fix for stale data issue (state reset logic)
5. Default tab implementation for Achievements
6. Reusable tab handling pattern

---

## 🚨 Rules

- Work ONLY in: /home/agadili/Documents/RCX_PROJS (rle-ui-react)
- Do NOT modify AngularJS project
- Do NOT assume APIs — verify from AngularJS
- Do NOT leave stale data in UI
- Ensure full parity with rle-ui

---

Start by verifying Promo Policies API from AngularJS, then fix tab switching behavior, then implement default sub-tab selection.