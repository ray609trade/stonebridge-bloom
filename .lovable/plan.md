
# Remove Image from Product Modal

## Overview
Remove the image section from the ProductModal popup that appears when a product is clicked on the order page, and adjust spacing so the modal still looks clean.

## Changes

### `src/components/menu/ProductModal.tsx`
- Remove lines 131–138 (the image `<div>` with `aspect-[16/10]` and `<img>`)
- Remove line 85 (the `image` variable declaration, since it's no longer used)
- Add top padding to the content area so the header text doesn't collide with the close button and drag indicator
- Reduce the modal height on mobile from `h-[95vh]` to `h-auto max-h-[85vh]` since there's no image taking up space
