You are a senior frontend architect and AngularJS → React migration expert.

I have migrated an AngularJS (rle-ui) application to a React app (Vite + Tailwind CSS + shadcn/ui).

All fixes MUST be applied ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react project)

Reference AngularJS project (DO NOT MODIFY):
👉 /home/agadili/Documents/RCX_PROJS/rle-ui

Your goal is to ensure FULL functional parity with AngularJS (rle-ui) while maintaining clean React architecture.

---

## 🐞 Issues

### 1. Pagination Missing "Rows Per Page"

- Currently:
  - Pagination shows only page numbers

❌ Missing:
  - Rows per page selector (e.g., 10, 25, 50, 100)

✅ Requirement:
- Add "Rows per page" dropdown in ALL tables
- Default: 10
- Update API calls accordingly:
  - limit should change dynamically
- Reset to page 1 when rows per page changes

---

### 2. ID Column Should Be Hidden

- Currently:
  - ID column is visible in tables

❌ This is not required

✅ Requirement:
- Hide ID column in ALL tables across ALL pages
- Ensure:
  - Data still exists internally
  - Only UI column is hidden

---

### 3. Broken Click Actions (Critical)

- Program Name click is NOT working
- Rules button is disabled
- Flows button is disabled

❌ These should be interactive

✅ Requirement:
- Enable:
  - Program Name → navigate to Program details page
  - Rules → open Rules page/module
  - Flows → open Flows page/module

- Match AngularJS behavior exactly:
  - Same navigation
  - Same routing logic
  - Same API usage

---

### 4. Member Details Page (Major Missing Feature)

#### Current React UI:
- Poor design
- No tabs implemented
- Missing functionality

#### AngularJS (rle-ui) Reference:
Check screenshots:
- docs/images/Default Member details page in existing UI.png
- docs/images/Default Member details page in existing UI-2.png

#### Expected Tabs:
- Member Details
- Achievements
- Accruals
- Redemption

❌ None of these are implemented in React

---

---

Documentation Required

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

## 🎯 Requirements for Member Details Page

### A. Layout
- Clean modern layout using shadcn/ui
- Show member summary at top
- Tabs below

---

### B. Tabs Implementation

Implement following tabs:

1. Member Details
   - Show all member info fields

2. Achievements
   - Fetch and display achievements data

3. Accruals
   - Show accrual transactions

4. Redemption
   - Show redemption transactions

---

### C. Behavior
- Tabs should:
  - Load data dynamically (lazy load if needed)
  - Maintain state when switching
- Use API calls same as AngularJS

---

### D. Navigation
- Clicking a member from table:
  → Open Member Details page
- Maintain proper routing

---

## 🔍 What You MUST Do

### Step 1: Analyze AngularJS (rle-ui)
- Inspect:
  - Pagination behavior
  - Member details page structure
  - Tabs implementation
  - Program navigation logic

---

### Step 2: Fix Pagination
- Add rows-per-page dropdown
- Update API params (limit, offset)
- Reusable pagination component

---

### Step 3: Hide ID Column
- Update column configuration globally
- Ensure consistency across all tables

---

### Step 4: Fix Click Actions
- Enable:
  - Program Name navigation
  - Rules button
  - Flows button
- Fix routing issues if any

---

### Step 5: Implement Member Details Page

- Create:
  - Tabs using shadcn Tabs component
- Build:
  - Member Details tab
  - Achievements tab
  - Accruals tab
  - Redemption tab

---

### Step 6: Data Integration
- Ensure all tabs fetch correct API data
- Match AngularJS endpoints and payloads

---

## 🧪 Validation Checklist

Ensure:
- Rows per page dropdown works in all tables
- API updates correctly based on limit
- ID column is hidden everywhere
- Program name click navigates correctly
- Rules & Flows buttons work
- Member details page opens correctly
- All 4 tabs are implemented and working
- Data loads correctly in each tab
- UI is clean and usable

---

## 📦 Output Requirements

Provide:
1. Root cause of pagination issue
2. Root cause of disabled actions
3. Updated pagination component
4. Fix for ID column handling
5. Fixed navigation logic for Program/Rules/Flows
6. Member Details page implementation
7. Tabs implementation code
8. Reusable patterns

---

## 🚨 Rules

- Work ONLY in: /home/agadili/Documents/RCX_PROJS (rle-ui-react)
- Do NOT modify AngularJS project
- Do NOT skip any tab or feature
- Ensure full functional parity with rle-ui
- Do NOT provide partial fixes

---

Start by fixing pagination and actions, then implement Member Details page with all tabs, and ensure full functionality.