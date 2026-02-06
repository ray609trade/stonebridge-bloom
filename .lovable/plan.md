
# Add Navigation Link to Landing Page

## Overview
Add a new navigation item in the admin sidebar that allows users to quickly navigate back to the public-facing landing page.

## Changes Required

### File: `src/pages/Admin.tsx`

**1. Add Home icon import** (line 4-20)
- Add `Home` to the lucide-react imports

**2. Add navigation item to sidebar** (lines 229-250)
- Insert a new navigation item at the top of the nav array:
```typescript
{ id: "home", label: "View Site", icon: Home, href: "/" }
```

**3. Update navigation button logic**
- Modify the navigation button to handle external navigation (using `navigate("/")`) for the "home" item while keeping the current tab-switching behavior for other items

## Visual Result
The sidebar will display a "View Site" option at the top with a Home icon. Clicking it will navigate the user back to the public landing page, making it easy to preview the customer-facing site without manually changing the URL.

## Alternative Considered
Instead of adding it in the main navigation, it could be placed in the header area or near the logout button - but adding it to the main nav keeps all navigation actions in one consistent location.
