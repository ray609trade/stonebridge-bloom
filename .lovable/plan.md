
# Add Admin Link to Header Navigation

## Overview
Add a clickable "Admin" tab to the site header that navigates to the admin login page at `/admin/login`.

## Changes Required

### File: `src/components/layout/Header.tsx`

**Update the `navLinks` array** (line 10-15) to include the Admin link:

```typescript
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/order", label: "Order" },
  { href: "/wholesale", label: "Wholesale" },
  { href: "/admin/login", label: "Admin" },
];
```

This single addition will:
- Display "Admin" in the desktop navigation bar alongside existing links
- Include "Admin" in the mobile hamburger menu
- Apply the same active state styling when on the admin pages
- Maintain consistent styling that adapts to scroll state and page context

## Visual Result
The header navigation will show: **Home | About | Order | Wholesale | Admin**

The Admin link will use the same styling as other nav items and will be highlighted when active.
