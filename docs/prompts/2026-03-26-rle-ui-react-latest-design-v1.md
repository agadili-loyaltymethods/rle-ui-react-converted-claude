You are a senior frontend architect, UX designer, and React expert.

I have an existing AngularJS-based application (rle-ui) which has already been migrated to a React app (Vite + Tailwind CSS + shadcn/ui).

Your task is to redesign the UI to make it modern, clean, and user-friendly, while keeping ALL existing functionality EXACTLY the same.

---

## 🎯 Objective

- Improve UI/UX significantly
- Modernize the design
- Keep ALL functionality unchanged
- Maintain full parity with AngularJS (rle-ui)

---

## ⚠️ Constraints

- DO NOT change any business logic
- DO NOT remove or alter any features
- DO NOT change API behavior
- DO NOT break existing flows
- ONLY improve UI/UX and structure

---

## 🧠 What You Should Focus On

### 1. Layout Redesign
- Replace outdated layouts with modern structure:
  - Sidebar navigation (collapsible)
  - Top header (user info, actions)
  - Content area with proper spacing
- Improve alignment and spacing using Tailwind

---

### 2. Navigation Experience
- Make menus more intuitive:
  - Group related items (Reference Data, Settings, etc.)
  - Add icons (lucide-react)
  - Highlight active routes
  - Add breadcrumbs

---

### 3. Tables (Very Important)
- Redesign tables:
  - Sticky headers
  - Better spacing and readability
  - Hover effects
  - Zebra rows (optional)
  - Proper scroll handling
- Keep ALL columns and data intact

---

### 4. Forms (Add/Edit Pages)
- Improve form UX:
  - Group fields into sections
  - Use grid layout (2–3 columns)
  - Add labels, placeholders, validation states
  - Improve spacing and alignment
- Keep ALL fields and behavior unchanged

---

### 5. Buttons & Actions
- Use consistent button styles:
  - Primary / Secondary / Destructive
- Add icons where needed
- Improve placement of actions (Add, Edit, Delete)

---

### 6. Modals & Dialogs
- Replace old modals with:
  - shadcn Dialog
- Improve:
  - spacing
  - readability
  - actions placement

---

### 7. Typography & Colors
- Use modern typography scale
- Maintain consistent font sizes
- Improve contrast and readability
- Use Tailwind design tokens

---

### 8. Responsiveness
- Ensure UI works on:
  - Desktop
  - Tablet
- Maintain usability across screen sizes

---

### 9. Dashboard (If exists)
- Add clean summary cards
- Show key metrics
- Provide quick actions

---

## 🎨 Design Style Guidelines

- Clean and minimal
- Enterprise SaaS style (like Stripe / Salesforce / Notion)
- Use shadcn/ui components wherever possible
- Avoid clutter
- Focus on usability

---

## 🔍 Reference

Take functional reference from:
👉 /home/agadili/Documents/RCX_PROJS/rle-ui (AngularJS)

Apply UI changes ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude)

---

## 🧪 Validation Checklist

Ensure:
- All features still work exactly the same
- No API changes
- No missing fields or columns
- Navigation works correctly
- UI is significantly improved and modern

---

## 📦 Output Requirements

Provide:
1. Updated layout structure
2. Redesigned components (tables, forms, sidebar, header)
3. List of files modified
4. Before vs After explanation (UI only)
5. Reusable UI component patterns

---

## 🚨 Rules

- DO NOT change functionality
- DO NOT remove features
- DO NOT simplify data
- ONLY redesign UI/UX

---

Start by redesigning the main layout (sidebar + header), then update tables, then forms, and finally improve overall consistency.