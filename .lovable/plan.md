## Goal
On bagel products (One Bagel, 1/2 Dozen, Dozen), keep the current combined spread choices ("Butter and Jelly", "Peanut Butter and Jelly", etc.) AND add standalone buttons for each individual spread so a customer can pick just Butter, just Jelly, etc. Selection stays single-choice (one button lights up at a time).

## Changes

### 1. Data update (products table)
Update the `Spread` option's `choices` array on the three bagel products to include individual spread entries in addition to the existing combos. Priced to match current per-add pricing.

Added choices (in this order, appended after "Plain (No Spread)" and before the existing combos so individuals are easy to find):
- Butter — $1.08
- Jelly — $1.08
- Cream Cheese — $1.55 (already exists, keep as is)
- Peanut Butter — $2.25 (already exists, keep as is)
- Breakfast Spread — $1.75 (already exists)
- Flavored Cream Cheese — $2.49 (already exists)
- Lox Spread — $5.50 (already exists)

Net new entries: **Butter** ($1.08) and **Jelly** ($1.08). Existing combined entries ("Butter or Jelly", "Butter and Jelly", "Cream Cheese and Jelly", "Cream Cheese and Butter", "Peanut Butter and Jelly", "Sliced Lox and Cream Cheese") stay untouched.

Applied to all three products: One Bagel, 1/2 Dozen Bagels, Dozen Bagels.

### 2. UI (ProductModal.tsx)
No structural changes needed — the existing `flex flex-wrap gap-2` already renders one button per choice. Each spread (individual or combo) will get its own tappable pill automatically once the data is updated.

Optional polish: keep buttons visually grouped — no sub-headers, just the flat list, since the user asked for "each spread has its own button" and combos remain valid choices.

## Out of scope
- No change to option type (stays `single`) — one selection at a time.
- No cart, pricing-trigger, or checkout changes.
- Other products (sandwiches, platters) untouched.

## Verification
- Open One Bagel modal → see new "Butter" and "Jelly" buttons alongside "Butter and Jelly".
- Selecting "Butter" adds $1.08; selecting "Butter and Jelly" adds $1.45; only one is active at a time.
- Repeat on 1/2 Dozen and Dozen.
