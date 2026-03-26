You are a senior frontend architect and AngularJS → React migration expert.

I have migrated an AngularJS (rle-ui) application to a React app (Vite + Tailwind + shadcn/ui).

All fixes MUST be applied ONLY in:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude project)

The goal is to ensure FULL functional and data parity with the AngularJS project:
👉 /home/agadili/Documents/RCX_PROJS (rle-ui)

---

## 🐞 Issues

### 1. Missing Table Columns (Critical)

In the React app (Members page), only a few columns are displayed:
['Member ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Loayalty ID', 'Status']

However, in AngularJS (rle-ui), the Members table contains MANY more columns such as:
- Actions, Address, Phone, Tier, Purse, Type, Enroll Date, Program, HomeStoreID, UserName, SalesForceId, IpCode, IsLegacy, MemberSource, NamePrefix, NameSuffix, PreferredLanguage, SecondaryEmail, PrefSourceDescr, ActivationSource, ActivationSourceDescr, CustomerKey, Address2, Ethnicity, Address4, MobileNumber, ActivationDate, FirstTxnDate, LastTxnDate, FacebookId, Address3, MiddleName, FirstTxnStoreNumber, LastTxnStoreNumber, LastQuarantineDate, BpLastActivityDate, BpLastTxnDate, ZapparLastTxnDate, NetspendLastTxnDate, VocLastTxnDate, LastWelcomeBackAwardDate, EarnTxnCount, Enrollment, StartedEarnOn, PromoTracker, ValueType, RuleType, CardClass, LevelCode, Lid, IsEligibleforBonus, MaxRefEligibleforBonus, RefBonusDisbursed, Locale/Country, Locale/Currency, LastUpdDate, MobileAppUser, PrimaryStore, PrimaryCategoryDriver, LexisNexisVerifiedBirthday, LegacyAchEnrollmentDate, LastMobileActivity, DaysShoppedInLast30, SecondaryCategoryDriver, TertiaryCategoryDriver, Partnership, SmsVerified, RegistrationChannel, AchEnrollmentDate, AchPromotionEndDate, ExtTestStringObj, ExtTestNumberObj, ExtTestDateObj, ExtTestBooleanObj, ExtTestListObj, ExtTestArrayObj, GalacticId, IsPrimaryUmn, IsMyWuMember, RegistrationType, Platform, Role, Sales, Sales2, Street, GoalValues/Name, GoalValues/Target, GoalValues/BonusValue, LegacyTier, LegacyTierDate

👉 These are missing in React UI.

---

### 2. Column Labels Not Matching
- Column names/labels in React are not matching AngularJS (rle-ui)
- Must match EXACTLY (case, naming, formatting)

---

### 3. Add Member Form Missing Fields

AngularJS Add Member form contains:
['First Name', 'Last Name', 'Email Address', 'Phone Number', 'Gender', 'Date of Birth', 'Member Type', 'Address', 'City', 'State', 'Country', 'Zip Code', 'Enroll Date', 'Enroll Location', 'Enroll Source', 'Status', 'Participate in a Program', 'Referral Code', 'Can Preview']

👉 React version is missing many of these fields

---

### 4. Extended Attributes Missing

- AngularJS has an **"Extended Attributes"** button
- On click:
  - Shows additional dynamic fields
- This functionality is completely missing in React

---

## 🎯 Objective

Ensure the React app:
- Displays ALL columns exactly like AngularJS
- Uses SAME column labels
- Has FULL Add Member form fields
- Supports Extended Attributes dynamically
- Matches AngularJS functionality completely (UI can differ, but behavior must match)

---

## 🔍 What You MUST Do

### Step 1: Analyze AngularJS (rle-ui)
- Inspect:
  - Members table configuration
  - Column definitions (static + dynamic)
  - API response structure
  - Add Member form structure
  - Extended Attributes logic (dynamic fields)

---

### Step 2: Fix Members Table
- Add ALL missing columns
- Ensure:
  - Correct data mapping from API
  - Correct column labels
  - Support for nested fields (e.g., GoalValues)
- Handle:
  - Large number of columns (scrolling, virtualization if needed)

---

### Step 3: Fix Column Labels
- Match EXACT labels from AngularJS
- Do NOT rename or simplify

---

### Step 4: Fix Add Member Form
- Add ALL missing fields
- Match:
  - Field names
  - Labels
  - Input types
- Ensure:
  - Form submission payload matches AngularJS

---

### Step 5: Implement Extended Attributes
- Add button: "Extended Attributes"
- On click:
  - Show dynamic fields (based on API/config)
- Ensure:
  - Fields are editable
  - Values are included in payload

---

### Step 6: Data Mapping
- Ensure API response → UI mapping is correct
- Handle:
  - Nested objects
  - Arrays
  - Optional fields

---

### Step 7: Reusability
- Create reusable:
  - Table component (dynamic columns)
  - Form generator (for large forms)

---

## 🧪 Validation Checklist

Ensure:
- All columns from AngularJS are visible
- Column labels match exactly
- Data is correctly populated
- Add Member form has all fields
- Extended Attributes works
- Form submission works correctly
- No data loss compared to AngularJS

---

## 📦 Output Requirements

Provide:
1. Root cause of missing columns
2. Root cause of missing form fields
3. Fixed Members table implementation
4. Fixed Add Member form implementation
5. Extended Attributes implementation
6. Reusable pattern for other modules

---

## 🚨 Rules

- Work ONLY in: /home/agadili/Documents/RCX_PROJS (rle-ui-react-converted-claude)
- Do NOT modify AngularJS project
- Do NOT skip any field or column
- Ensure full functional parity with rle-ui
- Do NOT simplify or reduce data

---

Start by fixing Members table completely, then fix Add Member form, then implement Extended Attributes.