You are a senior frontend architect and AngularJS → React migration expert.

I have migrated an AngularJS (rle-ui) application to a React app (Vite + Tailwind + shadcn/ui).

All fixes MUST be applied ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude project)

Reference AngularJS project (DO NOT MODIFY):
👉 /home/agadili/Documents/RCX_PROJS (rle-ui)

Your goal is to ensure FULL structural and functional parity with the AngularJS app.

---

## 🐞 Issues

### 1. Menu Structure Incorrect (Reference Data)
Currently, menus like:
- Orgs
- Segments
- Locations
- Products
- DMA
- Enums
- Named List

are implemented as separate menus.

❌ This is incorrect.

✅ Expected:
All above should be grouped under:
👉 "Reference Data" (as sub-menus)

---

### 2. Menu Structure Incorrect (Settings)

Currently, these are separate menus:
- My Account
- Users
- Security Setup
- Extensions
- Limits
- Divisions
- MCP UI Config

❌ This is incorrect.

✅ Expected:
All above should be grouped under:
👉 "Settings" (as sub-menus)

---

### 3. Incorrect Table Data Source

Currently:
- Tables are rendered using:
  '/api/schema/extensionschema?locale=en&offset=330&query=%7B%22display%22:true%7D'

❌ This is wrong.

✅ Expected:
- Use correct APIs per module (same as AngularJS rle-ui)
- Do NOT use a generic schema API to render all tables

---

### 4. Column Alignment Issue

- When many columns are shown:
  - Data is not aligned properly
  - Columns are squeezed into small widths

❌ This is incorrect UX

✅ Expected:
- Proper column widths
- Horizontal scrolling if needed
- Maintain readability
- Do NOT force all columns into small width

---

### 5. Missing Ellipsis for Long Content

- Long text in columns is overflowing or breaking layout

✅ Required:
- Apply ellipsis (...) for long content
- Show full content on:
  - Tooltip OR hover

---

### 6. Documentation Missing

- No documentation of changes made by Claude

✅ Required:
Create a markdown file:

👉 docs/converted/2026-03-26-rle-ui-react-converted-claude-menus-functionality.md

Include:
- What issues were fixed
- What files were modified
- Before vs After behavior
- Code snippets for major changes

---

## 🎯 Objective

Fix:
- Menu structure (grouping)
- Table data source (correct APIs)
- Column alignment & responsiveness
- Ellipsis handling for long content
- Documentation of all changes

---

## 🔍 What You MUST Do

### Step 1: Analyze AngularJS (rle-ui)
- Inspect:
  - Menu configuration
  - Routing structure
  - Table data sources per module

---

### Step 2: Fix Menu Structure

Implement nested menu:

Reference Data
  - Orgs
  - Segments
  - Locations
  - Products
  - DMA
  - Enums
  - Named List

Settings
  - My Account
  - Users
  - Security Setup
  - Extensions
  - Limits
  - Divisions
  - MCP UI Config

Ensure:
- Navigation works correctly
- Active states are handled
- Routes match AngularJS behavior

---

### Step 3: Fix Table Data Source

- Remove dependency on:
  '/api/schema/extensionschema...'

- Use:
  - Correct APIs per module (same as AngularJS)
- Ensure:
  - Data mapping is correct
  - Columns match API response

---

### Step 4: Fix Table Layout

- Implement:
  - Horizontal scroll (overflow-x-auto)
  - Min width for columns
  - Responsive layout

- Do NOT:
  - Shrink columns unnaturally

---

### Step 5: Implement Ellipsis

- Apply to all table cells:
  - overflow: hidden
  - text-overflow: ellipsis
  - white-space: nowrap

- Add:
  - Tooltip (on hover) to show full value

---

### Step 6: Reusable Table Component

- Create reusable table component with:
  - Dynamic columns
  - Proper alignment
  - Ellipsis support
  - Scroll handling

---

### Step 7: Create Documentation

Create file:
👉 docs/converted/changes.md

Include:
1. Summary of issues fixed
2. Menu restructuring details
3. API corrections
4. Table improvements
5. List of modified files
6. Code snippets (before/after)

---

## 🧪 Validation Checklist

Ensure:
- Menus are grouped correctly
- Navigation works for sub-menus
- Tables use correct APIs
- Columns are properly aligned
- Horizontal scrolling works
- Ellipsis is applied everywhere needed
- Tooltip shows full content
- Documentation file exists with proper details

---

## 📦 Output Requirements

Provide:
1. Root cause of menu issue
2. Root cause of schema misuse
3. Updated menu implementation
4. Fixed table implementation
5. Reusable table component
6. Markdown documentation content

---

## 🚨 Rules

- Work ONLY in: /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude)
- Do NOT modify AngularJS project
- Do NOT use schema API for all tables
- Do NOT compress columns unnaturally
- Ensure full parity with rle-ui structure

---

Start by fixing menu structure, then fix table API usage, then improve table layout, and finally generate documentation.