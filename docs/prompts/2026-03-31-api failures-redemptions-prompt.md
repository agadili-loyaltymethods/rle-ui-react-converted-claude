You are a senior frontend architect and AngularJS → React migration expert.

I have migrated an AngularJS (rle-ui) application to a React app (Vite + Tailwind CSS + shadcn/ui).

All fixes MUST be applied ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react project)

Reference AngularJS project (DO NOT MODIFY):
👉 /home/agadili/Documents/RCX_PROJS/rle-ui

Your goal is to ensure FULL functional parity with AngularJS (rle-ui), especially for Member Details and Program pages.

---

## 🐞 Issues

### 1. API Failures in Accruals & Redemption Tabs (Critical)

- In Selected Member Details page:
  - Accruals tab → API failure
  - Redemption tab → API failure

Reference:
👉 docs/images/Getting error when redirecting to tabs Accruals and Redeptions.png

❌ Current:
- APIs are failing (likely wrong endpoint / missing params / wrong payload)

✅ Requirement:
- Fix API calls for:
  - Accruals
  - Redemption
- Match EXACT AngularJS implementation:
  - Endpoint
  - Query params
  - populate
  - select
  - filters

---

### 2. Missing Tabs in Achievements Section

#### Current React UI:
- Only 4 tabs:
  - Purses
  - Badges
  - Tiers
  - Streaks

#### Expected (from AngularJS):
Total 17 tabs:
['Rewards', 'Purses', 'Purse Histories', 'Badges', 'Tiers', 'Streaks', 'Streak Histories', 'Loyalty IDs', 'Referrals', 'Transactions', 'Activity', 'Preferences', 'Offers', 'Segments', 'Merge Histories', 'Terms & Conditions', 'Aggregates']

❌ Missing 13 tabs

---

### ✅ Requirement:
- Analyze AngularJS:
  - member-details controller
- Implement ALL 17 tabs
- Ensure:
  - Each tab loads correct data
  - Each tab has correct API integration
  - Tabs match AngularJS behavior

---

### 3. Populate Parameter Missing in API Calls

- When selecting a Program:
  - Tabs appear correctly
  - BUT data is incorrect

❌ Root Issue:
- `populate` parameter is NOT being passed in API calls

---

### ✅ Requirement:
- Identify all API calls where populate is required from the existing UI.
- Add correct populate structure as per AngularJS:
  Example:
  - populate=[{ path: "program", select: "name" }, ...]

- Ensure:
  - Nested data loads correctly
  - No missing relationships

---

### 4. Promo Policies & Promo Code Tabs API Failure

- In Selected Program page:
  - Promo Policies tab → API failure (resource not found)
  - Promo Code tab → API failure

Reference:
👉 docs/images/Seeing Promo Policies and Promo Code tabs API failures..png

---

### ✅ Requirement:
- Check AngularJS implementation:
  - API endpoints used
  - Query structure
- Fix:
  - Endpoint URLs
  - Parameters
  - Routing if required

---

## 🎯 Objective

Fix:
- Accruals & Redemption API failures
- Missing Achievements tabs (all 17)
- Missing populate parameters
- Program tabs API failures (Promo Policies & Promo Code)
- Ensure full data accuracy and parity with AngularJS

---

---

### 5. Documentation Required

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

## 🔍 What You MUST Do

### Step 1: Analyze AngularJS (rle-ui)
- Inspect:
  - member-details controller
  - API service calls
  - populate usage
  - Program page APIs

---

### Step 2: Fix Accruals & Redemption APIs
- Match AngularJS endpoints exactly
- Ensure:
  - Correct params
  - Correct memberId usage
  - Correct filters

---

### Step 3: Implement All 17 Tabs

- Build dynamic tab system OR static mapping
- Tabs:
  - Rewards
  - Purses
  - Purse Histories
  - Badges
  - Tiers
  - Streaks
  - Streak Histories
  - Loyalty IDs
  - Referrals
  - Transactions
  - Activity
  - Preferences
  - Offers
  - Segments
  - Merge Histories
  - Terms & Conditions
  - Aggregates

- Ensure:
  - Lazy loading per tab
  - Proper API integration

---

### Step 4: Fix Populate Parameter

- Add populate to ALL relevant API calls
- Ensure:
  - Correct nested data
  - No undefined/null issues

---

### Step 5: Fix Program Page APIs

- Correct:
  - Promo Policies API
  - Promo Code API
- Match AngularJS:
  - Endpoints
  - Params
  - Response mapping

---

## 🧪 Validation Checklist

Ensure:
- Accruals tab works without error
- Redemption tab works without error
- All 17 tabs are visible in Achievements
- Each tab loads correct data
- populate parameter is present in API calls
- Program tabs (Promo Policies, Promo Code) work
- No "resource not found" errors
- Data matches AngularJS behavior

---

## 📦 Output Requirements

Provide:
1. Root cause of Accruals/Redemption failures
2. Root cause of missing tabs
3. Root cause of missing populate
4. Root cause of Program API failures
5. Fixed API implementations
6. Tabs implementation code
7. Reusable pattern for API calls with populate

---

## 🚨 Rules

- Work ONLY in: /home/agadili/Documents/RCX_PROJS (rle-ui-react)
- Do NOT modify AngularJS project
- Do NOT skip any tab
- Do NOT hardcode incorrect APIs
- Ensure full parity with rle-ui

---

Start by fixing Accruals/Redemption APIs, then implement all missing tabs, then fix populate usage, and finally resolve Program page API issues.