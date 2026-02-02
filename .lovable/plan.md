

# Increase Logo Size

## Overview
Make the header logo 2 sizes larger for better visibility and brand presence.

## Change

Update the logo sizing classes in `src/components/layout/Header.tsx`:

| Breakpoint | Current Size | New Size |
|------------|-------------|----------|
| Mobile | `h-12` (48px) | `h-16` (64px) |
| Tablet (md) | `h-14` (56px) | `h-20` (80px) |
| Desktop (lg) | `h-16` (64px) | `h-24` (96px) |

## File Changed

| File | Change |
|------|--------|
| `src/components/layout/Header.tsx` | Update `className` from `h-12 md:h-14 lg:h-16` to `h-16 md:h-20 lg:h-24` |

