

## Rebrand Login and Portal Pages to "Bulk Orders"

### WholesaleLogin.tsx

1. **Line 215**: "Back to Wholesale" → "Back to Bulk Orders"
2. **Line 230**: "Wholesale Portal" → "Bulk Orders Portal"
3. **Line 233**: "Sign in to access exclusive wholesale pricing" → "Sign in to access your bulk order account"
4. **Line 71**: Toast "No wholesale account found for this email" → "No bulk order account found for this email"
5. **Line 77**: Toast "Your wholesale account is pending approval" → "Your bulk order account is pending approval"
6. **Line 111**: Toast "No wholesale account found for this email" → "No bulk order account found for this email"
7. **Line 117**: Toast "Your wholesale account is pending approval" → "Your bulk order account is pending approval"
8. **Line 154**: Toast "No wholesale application found..." → "No bulk order application found..."
9. **Line 163**: Toast "Your wholesale application is still pending approval" → "Your bulk order application is still pending approval"
10. **Line 337**: "approved wholesale application" → "approved bulk order application"

### WholesalePortal.tsx

1. **Line 164**: "No approved wholesale account found" → "No approved bulk order account found"

### What Stays the Same
- URL routes (`/wholesale/*`), database tables, internal variable/component names all unchanged

