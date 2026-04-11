

# Remove "Meet the Team" Section from About Page

## Overview
Remove the entire "Meet the Team" section (lines 166–215) from the About page, along with the `team` data array that feeds it.

## Changes

### `src/pages/About.tsx`
- Delete the `team` array constant (likely defined earlier in the file with team member names, roles, and images)
- Delete the entire Team Section block (lines 166 through the end of that section, approximately line 213)
- Keep the Values/Quality & Freshness section and closing tags intact

