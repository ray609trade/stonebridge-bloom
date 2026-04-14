

## Add Spread Choice Options for Bagels

### Problem
The product options system (JSONB `options` column, `ProductModal` rendering) already exists and works, but the admin `ProductForm` has no UI to manage options. Bagel products need a "Spread Choice" option so customers can pick their spread when ordering.

### Solution
Two changes:

### 1. Add Options Editor to `src/components/admin/ProductForm.tsx`

Add a dynamic options builder section to the product form so the admin can create/edit option groups (e.g. "Spread Choice") with choices and optional upcharges:

- Store options state as an array of `{ name, type, required, choices: [{ label, price }] }`
- UI: collapsible section with "Add Option Group" button
- Each group has: name input, required toggle, type selector (single/multiple), and a list of choices with label + price fields
- "Add Choice" and "Remove" buttons for each
- On submit, include the options array in the product data sent to the database
- Load existing options from `product.options` when editing

### 2. Seed Spread Options for Bagel Products (optional guidance)

After the form is updated, the admin can edit any bagel product and add an option group like:
- **Name**: "Spread Choice"
- **Type**: single
- **Required**: false
- **Choices**: Plain Cream Cheese ($1.50), Scallion Cream Cheese ($1.75), Veggie Cream Cheese ($1.75), Lox Spread ($2.50), Butter ($0.75), None ($0.00)

No database migrations needed — the `options` JSONB column already exists. No changes to `ProductModal` or `ProductCard` — they already render and handle options correctly.

### Files Changed
- `src/components/admin/ProductForm.tsx` — add options editor UI and include options in form submission

