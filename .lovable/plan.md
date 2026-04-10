

# Remove Product Images from Order Page

## Overview
Redesign the ProductCard to remove the image section entirely, creating a clean list-style card layout that doesn't depend on product photos.

## Changes

### `src/components/menu/ProductCard.tsx` — Full redesign
- Remove the entire image container (`aspect-[4/3]` div with `<img>`, category badge overlay)
- Restructure as a horizontal card: product name, description, dietary tags, and price on the left; quick-add button on the right
- Move the category badge inline as a small text label above the product name
- Keep the quick-add button prominently placed on the right side of the card
- Maintain hover/tap animations and all existing functionality (options detection, quick add, onSelect)

### `src/pages/Order.tsx` — Grid adjustment
- Change the grid from image-card layout (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) to a tighter layout better suited for text-only cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with reduced gap
- Update skeleton loaders to match the new shorter card height (no image = shorter cards)

### Design approach
- Cards become compact horizontal rows: name + price on one line, description below, dietary tags at bottom, add button on far right
- Feels like a clean restaurant menu — scannable, fast, premium typography-driven

