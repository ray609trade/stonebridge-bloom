
# PWA Setup Plan for Stonebridge Bagels

## Overview
This plan adds Progressive Web App (PWA) functionality so customers can install the app to their phone's home screen directly from the browser. The app will work offline and feel like a native app.

---

## What You'll Get

- **Home Screen Install**: Customers can add Stonebridge Bagels to their phone like a real app
- **App-Like Experience**: Full-screen mode without browser chrome
- **Offline Support**: Basic pages load even without internet
- **Fast Loading**: Cached assets for instant startup

---

## Implementation Steps

### Step 1: Install PWA Plugin
Add `vite-plugin-pwa` to handle manifest generation and service worker automatically.

### Step 2: Configure Vite for PWA
Update `vite.config.ts` with PWA settings including:
- App name: "Stonebridge Bagels"
- Theme color matching brand (warm bagel color)
- Display mode: standalone (hides browser UI)
- Service worker with caching strategy

### Step 3: Create PWA Icons
Generate multiple icon sizes for different devices:
- 192x192 (Android)
- 512x512 (Android splash)
- 180x180 (iOS)
- 152x152 (iPad)

We'll use the existing Stonebridge logo as the base.

### Step 4: Update index.html
Add essential PWA meta tags:
- Apple touch icon for iOS
- Theme color for browser chrome
- Apple mobile web app capable tag
- Proper title and description

### Step 5: Create Install Page (Optional)
A dedicated `/install` route with instructions for different devices and an install prompt trigger.

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `public/pwa-192x192.png` | Android app icon |
| `public/pwa-512x512.png` | Android splash / maskable |
| `public/apple-touch-icon.png` | iOS home screen icon |

### Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add vite-plugin-pwa dependency |
| `vite.config.ts` | Configure PWA plugin with manifest |
| `index.html` | Add PWA meta tags, Apple touch icon, theme color |

### PWA Manifest Configuration

```text
Name: Stonebridge Bagels
Short Name: Stonebridge
Description: Order fresh bagels for pickup
Theme Color: #D97706 (warm amber matching brand)
Background: #FFFBEB (cream/bagel color)
Display: standalone
Start URL: /
Scope: /
```

### Service Worker Strategy
- **Runtime Caching**: Cache images and API responses
- **Precaching**: Critical app shell files
- **Network First**: For API calls to ensure fresh data
- **Cache First**: For static assets (images, fonts)

---

## Expected Behavior

1. **Android**: Users see "Add to Home Screen" prompt automatically after visiting twice
2. **iOS**: Users tap Share button then "Add to Home Screen"
3. **Desktop**: Install button appears in browser address bar

---

## Notes

- The existing `stonebridge-logo.png` will be converted to proper PWA icon sizes
- Service worker only activates in production builds
- Development mode continues working normally without caching
