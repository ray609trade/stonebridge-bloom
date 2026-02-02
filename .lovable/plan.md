

# Animated Logo Header Implementation

## Overview
Add the Stonebridge Bagels & Deli logo to the header with a stunning staggered entrance animation. When the page loads, the logo will animate in with a sequence: bagel appears first, then the text fades in, creating a premium, custom-built feel.

## What You'll See

### Animation Sequence (on page load)
1. **0.0s** - Header fades in smoothly
2. **0.2s** - Bagel logo scales up with a bounce effect
3. **0.4s** - The entire logo settles into place with a subtle glow pulse

### Final Result
- Logo prominently displayed on the left side of the header
- Smooth, professional animation that plays once on page load
- Logo remains static after animation completes (no annoying loops)
- Works beautifully on both desktop and mobile

## Technical Implementation

### 1. Copy Logo to Project
Move your uploaded logo from `user-uploads://` to `src/assets/stonebridge-logo.png` so it can be imported properly in the React component.

### 2. Update Header Component (`src/components/layout/Header.tsx`)
- Import framer-motion's `motion` component
- Import the logo using ES6 import syntax for optimal bundling
- Replace the current logo placeholder with animated logo
- Add staggered animation using framer-motion:

```text
Animation Configuration:
┌─────────────────────────────────────────────────┐
│  Logo Container                                 │
│  ├── initial: { opacity: 0, scale: 0.8, x: -20 }│
│  ├── animate: { opacity: 1, scale: 1, x: 0 }   │
│  └── transition:                               │
│      ├── duration: 0.6s                        │
│      ├── ease: "easeOut"                       │
│      └── type: "spring" (for bounce)           │
└─────────────────────────────────────────────────┘
```

### 3. Animation Details
Using framer-motion (already installed) for smooth, GPU-accelerated animations:
- **Spring physics** for natural bounce feel
- **Scale transform** (0.8 → 1) for "pop" effect
- **Opacity fade** (0 → 1) for smooth reveal
- **Slight horizontal slide** (-20px → 0) for dynamic entry

### 4. Responsive Sizing
- Mobile: `h-12` (48px height)
- Desktop: `h-14 md:h-16` (56-64px height)
- Auto width to maintain aspect ratio

## Files Changed

| File | Change |
|------|--------|
| `src/assets/stonebridge-logo.png` | New file - your uploaded logo |
| `src/components/layout/Header.tsx` | Add framer-motion import, animated logo component |

## Benefits
- **Modern feel** - Smooth animations signal quality and attention to detail
- **Brand recognition** - Logo is prominently displayed and memorable
- **Performance** - Framer-motion uses GPU acceleration for 60fps animations
- **One-time animation** - Plays on load only, doesn't distract returning visitors

