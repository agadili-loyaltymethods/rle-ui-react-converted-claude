You are a senior frontend architect and UI/UX expert.

We have migrated an existing AngularJS application (rle-ui) to a modern frontend stack (React/Angular/Next.js based system). However, the converted UI is not matching the original application behavior, data, and usability.

Your task is to analyze, debug, and redesign the application UI and functionality based on the following inputs.

-----------------------------------
📌 EXISTING (REFERENCE) UI (/home/agadili/Documents/RCX_PROJS/rle-ui)
-----------------------------------
Refer to the below screenshots for original behavior and expected output:

1. docs/images/Existing AngularJS(rle-ui).png
2. docs/images/Existing Rle-UI flow composer UI.png
3. docs/images/Existing Rle-UI Rules UI.png

-----------------------------------
📌 CONVERTED (CURRENT) UI (/home/agadili/Documents/RCX_PROJS/rle-ui-react-converted-claude)
-----------------------------------
Refer to the below screenshots showing current issues:

1. docs/images/Showing Seletced Program as undefined.png
2. docs/images/This is converted UI Flow or flow composer new design(showing program name as undefined).png
3. docs/images/This is converted UI Rules new design(showing undefined).png

-----------------------------------
🚨 CURRENT ISSUES
-----------------------------------

1. Program name is showing as "undefined" when selecting a program.
   - Identify root cause (state issue / API response / mapping issue).
   - Fix data binding and ensure correct program name is displayed everywhere.

2. Tabs mismatch between old and new UI:
   - Existing UI has 8 tabs:
     • Reward Policies
     • Promo Policies
     • Streak Policies
     • Purse Policies
     • Tier Policies
     • Partners
     • Promo Code
     • Aggregate Policies

   - Converted UI has only 7 tabs and incorrect naming/order:
     • Reward Policies
     • Purse Policies
     • Tier Policies
     • Streak Policies
     • Aggregate Policies
     • Partners
     • Promotions

   - Restore missing tabs (Promo Policies, Promo Code).
   - Ensure correct naming, order, and mapping with backend APIs.

3. Data inconsistency:
   - Existing UI shows correct data across all tabs.
   - Converted UI is not showing accurate or complete data.
   - Fix API integration, response mapping, and state handling.
   - Validate with mock + real API data.

4. Broken functionality:
   - Rules and Flow Composer are not working correctly.
   - Actions like:
     • Add Rule
     • Create Flow
   are not functioning.

   - Debug event handling, API calls, and state updates.
   - Ensure full CRUD functionality works end-to-end.

5. UI/UX redesign requirement:
   - Improve Rules and Flow Composer UI.
   - Make it more user-friendly and intuitive.
   - Suggest modern UX patterns such as:
     • Drag-and-drop flow builder
     • Visual rule builder (if/else blocks)
     • Step-based wizard
     • Clean card/grid layouts

6. Documentation Required

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

-----------------------------------
🎯 EXPECTED OUTPUT
-----------------------------------

1. Root cause analysis for each issue.
2. Step-by-step fixes (code-level suggestions if possible).
3. Suggested component structure (modular design).
4. API integration corrections.
5. Improved UI/UX redesign proposal for:
   - Rules
   - Flow Composer
6. Optional:
   - Sample code snippets (React/Angular preferred)
   - State management suggestions (Redux/Zustand/RxJS)
   - Folder structure improvements

-----------------------------------
⚙️ CONSTRAINTS
-----------------------------------
- Do NOT change core business logic.
- Maintain backward compatibility with APIs.
- Focus on production-ready scalable solution.
- Ensure clean, maintainable, modular code.

-----------------------------------
💡 BONUS
-----------------------------------
If possible, suggest:
- Performance improvements
- Lazy loading / code splitting
- Reusable components
- Test strategy (unit + integration)

-----------------------------------

Act like you are fixing a real production issue and redesigning it for better UX.