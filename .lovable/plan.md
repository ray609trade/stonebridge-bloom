

## Rebrand Wholesale Page to "Bulk Orders"

### What Changes

1. **Navigation label**: Change "Wholesale" → "Bulk Orders" in the Header nav links and MobileBottomNav
2. **Page hero heading**: Change "Wholesale Partnership" → **"Fresh by the Dozen"**
3. **Hero subheading**: Replace current description with: *"Ordering for your business, event, or team? We ship nationwide and offer local pickup starting at just 1 dozen. Set up a one-time or recurring order and we'll handle the rest."*
4. **Page title/meta**: Update any references to "wholesale" in user-facing text throughout the page (benefits section titles, form heading, button labels, etc.) to use "bulk order" language where appropriate

### Files to Edit

- `src/components/layout/Header.tsx` — nav link label "Wholesale" → "Bulk Orders"
- `src/components/layout/MobileBottomNav.tsx` — if wholesale link exists there
- `src/pages/Wholesale.tsx` — hero heading, subheading, and relevant user-facing copy

### What Stays the Same

- URL routes remain `/wholesale` (no breaking changes)
- All backend logic, form fields, and database tables unchanged
- Internal code variable names stay as-is (wholesale terminology in code only)

