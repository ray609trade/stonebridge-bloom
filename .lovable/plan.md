

# Add Stonebridge Bagels Menu Items

## Overview
I'll add all the menu items from your January 2025 menu PDF to the database so customers can order them on the site. This involves creating new categories for menu sections and adding 40+ products with accurate pricing.

## Menu Items Extracted

### Bagels (existing category)
| Item | Price |
|------|-------|
| One Bagel | $1.50 |
| 1/2 Dozen | $8.00 |
| Dozen | $17.00 |

### Bagel Spreads (existing "Spreads" category)
| Item | Price |
|------|-------|
| Butter or Jelly | $2.58 |
| Butter and Jelly | $2.95 |
| Cream Cheese | $3.05 |
| Cream Cheese and Jelly | $3.55 |
| Cream Cheese and Butter | $3.75 |
| Peanut Butter | $3.75 |
| Peanut Butter and Jelly | $4.25 |
| Breakfast Spread | $3.25 |
| Flavored Cream Cheese | $3.99 |
| Lox Spread | $7.00 |
| Sliced Lox and Cream Cheese | $10.50 |

### Breakfast Sandwiches (new category)
| Item | Price |
|------|-------|
| Two Eggs | $4.50 |
| Two Eggs with Bacon/Pork Roll/Ham/Sausage | $6.07 |
| Two Eggs with Turkey Bacon | $7.10 |
| Pork Roll | $4.20 |
| Two Meats | $7.75 |
| Three Meats | $8.75 |

### Breakfast Platters (new category)
| Item | Price |
|------|-------|
| Two Eggs Platter | $7.75 |
| Three Eggs Platter | $8.75 |
| Cheese Omelet | $9.50 |
| Classic Omelet | $10.50 |
| Spanish Omelet | $9.50 |
| Western Omelet | $10.50 |
| Veggie Omelet | $10.00 |

### Stonebridge Specialties
| Item | Price |
|------|-------|
| The "A" Town | $8.00 |
| The Turkey Pesto | $10.00 |

### Wraps (new category)
| Item | Price |
|------|-------|
| The Stonebridge Classic | $11.00 |
| The Veggie Delight | $8.50 |
| The Caesar | $9.00 |
| The Buffalo | $9.00 |
| The Rustic | $10.00 |

### Soups (new category)
| Item | Price |
|------|-------|
| Soup of the Day | $6.00 |

### Salads (new category)
| Item | Price |
|------|-------|
| Greek Salad | $10.00 |
| Chicken Caesar Salad | $12.00 |
| Spinach Avocado Salad | $12.00 |
| Buffalo Chicken Salad | $11.00 |
| Signature Salad | $12.00 |
| Create Your Own Salad | $10.00 |

### Grillers (new category)
| Item | Price |
|------|-------|
| BLT | $7.00 |
| Cheesesteak w/Onions & Peppers | $9.50 |
| Panini Grilled Cheese | $6.00 |
| Chicken Tenders w/Fries | $9.00 |

### Sides (new category)
| Item | Price |
|------|-------|
| French Fries | $4.00 |
| Cheese Fries | $6.00 |
| Mozzarella Sticks | $6.00 |
| Onion Rings | $4.00 |

## Implementation Steps

### Step 1: Create New Categories
Add 6 new categories to organize the full menu:
- Breakfast Sandwiches (sort_order: 2)
- Breakfast Platters (sort_order: 3)
- Wraps (sort_order: 4)
- Salads (sort_order: 6)
- Grillers (sort_order: 7)
- Sides (sort_order: 8)

Update existing categories sort order for proper menu flow.

### Step 2: Remove Sample Products
Delete all current "(Sample)" products to replace with real menu items.

### Step 3: Add Real Products
Insert all menu items with:
- Accurate pricing from the PDF
- Proper category assignments
- Descriptive text where appropriate
- Appropriate `options` for items with choices (bread type, meat selection, etc.)

### Step 4: Configure Product Options
Add option configurations for items that have choices:
- Breakfast items: bagel, roll, wrap, white, rye, or whole wheat bread
- Breakfast sandwiches: meat selection (bacon, pork roll, ham, sausage)
- Create Your Own Salad: greens, toppings, dressings

---

## Technical Details

### Database Operations
1. **Categories table**: INSERT 6 new rows, UPDATE sort_order on existing
2. **Products table**: DELETE sample products, INSERT ~45 new products

### Files Modified
No code changes needed - this is purely database population using SQL INSERT statements.

### Product Options Schema
For items with choices, the `options` JSONB field will contain:
```json
[
  {
    "name": "Bread",
    "required": true,
    "choices": [
      {"name": "Bagel", "price": 0},
      {"name": "Roll", "price": 0},
      {"name": "Wrap", "price": 0}
    ]
  }
]
```

