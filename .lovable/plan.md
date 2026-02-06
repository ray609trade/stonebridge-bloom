
# Add Product Options for Bagels

## Overview
Currently when ordering a bagel, customers can't select add-ons like butter or cream cheese before adding to cart. This plan adds spread options to bagel products and ensures customers must select options before checkout.

---

## What You'll Get

- **Spread Selection**: When ordering bagels, customers can choose from butter, cream cheese, jelly, and other spreads
- **Smart Quick Add**: The "+" button will open the options modal if a product has options, instead of adding directly
- **Clear Option Display**: Selected options shown in cart and checkout summary

---

## Changes Required

### 1. Update Bagel Products with Spread Options
Add spread options to the bagel products in the database. Each bagel will have an optional "Spread" selection with choices including:
- Plain (no spread)
- Butter
- Cream Cheese
- Flavored Cream Cheese
- Butter and Jelly
- Peanut Butter
- And other spreads from your menu

These will be marked as optional (not required) so customers can still order plain bagels.

### 2. Fix Quick Add Button Behavior
Update the ProductCard component so that when a product has options:
- The "+" button opens the product modal instead of adding directly
- Products without options continue to quick-add as before

This ensures customers always see the options before adding to cart.

### 3. Show Options in Cart
The cart drawer already displays selected options - we'll verify this works correctly with the new spread selections.

---

## Technical Details

### Database Migration
Add spread options to bagel products using SQL update:

```text
Products to update:
- One Bagel
- 1/2 Dozen Bagels  
- Dozen Bagels

New options structure:
- Name: "Spread"
- Type: "single" 
- Required: false
- Choices: Plain, Butter, Cream Cheese, Flavored Cream Cheese, etc.
```

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/ProductCard.tsx` | Check for options before quick-add; open modal if options exist |

### ProductCard Logic Change

```text
Current behavior:
  Quick Add -> Add to cart immediately

New behavior:
  If product has options -> Open ProductModal
  If no options -> Add to cart immediately
```

---

## How It Will Work

1. Customer clicks on "One Bagel" or the "+" button
2. Product modal opens showing:
   - Bagel image and price
   - "Spread" section with options (Plain, Butter, Cream Cheese, etc.)
   - Quantity selector
   - "Add to Order" button
3. Customer selects their preferred spread
4. Item added to cart shows "One Bagel - Cream Cheese"
5. At checkout, order summary shows the selected spread

---

## Notes

- Spreads will be optional - customers can still order plain bagels
- Spread prices will be built into the bagel+spread combo price (matching your current menu pricing)
- This same pattern can be extended to other products that need customization options
