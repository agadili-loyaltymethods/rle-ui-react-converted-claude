You are a senior frontend architect and AngularJS → React migration expert.

I have migrated an AngularJS (rle-ui) application to a React app (Vite + Tailwind + shadcn/ui).

All fixes MUST be applied ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude project)

Reference AngularJS project (DO NOT MODIFY):
👉 /home/agadili/Documents/RCX_PROJS/rle-ui

Your goal is to ensure FULL functional and structural parity with the AngularJS application.

---

## 🐞 Issues

### 1. Members Table Columns Still Missing (Critical)

- Columns are still missing in Members page
- You MUST use:
  /api/schema/extensionschema?locale=en&offset=330&query=%7B%22display%22:true%7D

✅ Requirement:
- Fetch column configuration dynamically from this API
- Display ALL columns returned
- Map data correctly to each column
- Follow EXACT logic used in AngularJS (rle-ui)

---

### 2. Apply Same Logic to ALL Pages

- Currently only partial implementation exists

✅ Requirement:
- Use extensionschema API for ALL pages (Members, Programs, Segments, etc.)
- Follow AngularJS approach:
  - Dynamic columns
  - Proper mapping
  - Conditional display

---

### 3. Language Issue in Add Member Form

- Currently showing multiple languages (including Chinese)

❌ This is incorrect

✅ Requirement:
- Show ONLY one language (default: English - "en")
- Do NOT show multiple language options
- Match AngularJS behavior

---

### 4. Default Members List Not Loading Properly

✅ Requirement:
- On page load, fetch default members list using:

api/members?limit=10&locale=en&offset=330&populate=[{"path":"program","select":"name"},{"path":"purses.policyId","select":"colors ptMultiplier"},{"path":"divisions"}]&query={}&select={"activities":0,"events":0,"badges":0,"rewards":0,"purses.accruals":0,"purses.redemptions":0}&skip=0&sort={"_id":-1}

- Ensure:
  - Data loads automatically
  - Table populates correctly
  - Pagination/offset handled properly

---

### 5. Security Setup Page Error (500)

- Security Setup page is failing with 500 error

✅ Requirement:
- Analyze AngularJS implementation
- Fix API call / payload / routing
- Ensure page works exactly like rle-ui

---

### 6. Invalid Feature Added (Add Org)

- "Add Org" functionality exists in React app

❌ This is incorrect

- AngularJS (rle-ui) does NOT have this feature

✅ Requirement:
- REMOVE "Add Org" functionality
- Ensure feature parity (do not add extra features)

---

### 7. Documentation Required

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

---

## 🎯 Objective

Ensure:
- Dynamic schema-based columns work everywhere
- Members table fully matches AngularJS
- Only valid features exist
- Language handling is correct
- APIs work correctly
- Security Setup page works
- Documentation is complete

---

## 🔍 What You MUST Do

### Step 1: Analyze AngularJS (rle-ui)
- Understand:
  - extensionschema usage
  - dynamic column rendering
  - language handling
  - default API calls
  - Security Setup implementation

---

### Step 2: Fix Schema-Based Columns
- Fetch schema
- Generate columns dynamically
- Map nested fields properly

---

### Step 3: Apply to All Pages
- Reuse dynamic table logic everywhere

---

### Step 4: Fix Members API Integration
- Use correct endpoint
- Populate required fields
- Ensure data binding works

---

### Step 5: Fix Language Handling
- Restrict to single language (en)

---

### Step 6: Fix Security Setup Page
- Debug 500 error
- Align with AngularJS behavior

---

### Step 7: Remove Invalid Features
- Remove "Add Org"

---

### Step 8: Create Documentation

---

## 🧪 Validation Checklist

Ensure:
- All schema columns are visible
- Data aligns correctly with columns
- Members list loads by default
- Only English language is shown
- Security Setup page works
- No extra features like "Add Org"
- All pages follow same schema logic
- Documentation file exists and is complete

---

## 📦 Output Requirements

Provide:
1. Root cause of missing columns
2. Root cause of language issue
3. Root cause of Security Setup error
4. Fixed dynamic table implementation
5. Fixed Members API integration
6. Removed invalid features
7. Documentation file content

---

## 🚨 Rules

- Work ONLY in: /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude)
- Do NOT modify AngularJS project
- Do NOT skip any page
- Do NOT add new features
- Ensure full parity with rle-ui

---

Start by fixing Members table using schema API, then apply same logic globally, then fix remaining issues, and finally generate documentation.