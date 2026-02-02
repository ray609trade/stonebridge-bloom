
# Dynamic Business Hours Implementation

## Overview
Create a smart system that knows the current day and time to display accurate opening hours throughout the website. The hero badge will show today's specific hours, and the Location section will display the full weekly schedule with the correct times.

## Your Business Hours
| Day | Hours |
|-----|-------|
| Monday - Friday | 5:30 AM - 3 PM |
| Saturday - Sunday | 6 AM - 2 PM |

## What Will Change

### 1. Hero Section Badge
**Current:** "Fresh bagels daily from 6am"

**After implementation, it will dynamically show:**
- On weekdays: "Fresh bagels today from 5:30am"
- On weekends: "Fresh bagels today from 6am"
- When currently open: "Open now until 3pm" (or 2pm on weekends)
- When closed: "Opens tomorrow at 5:30am" (or appropriate next opening)

### 2. Location Section Hours
**Current:** Shows incorrect placeholder hours

**After:** Will display your actual hours:
```
Mon-Fri: 5:30am - 3pm
Sat-Sun: 6am - 2pm
```

## Technical Approach

### New File: `src/lib/businessHours.ts`
A utility module containing:
- **Business hours data** - Your weekly schedule stored in a structured format
- **`getBusinessStatus()`** - Returns whether you're currently open/closed
- **`getTodayHours()`** - Returns today's opening and closing times
- **`getNextOpenTime()`** - Calculates when you next open (for "Opens at..." messaging)
- **`formatTime()`** - Formats times nicely (e.g., "5:30am" not "05:30")

### Updated Components
1. **Hero.tsx** - Will use the new utility to show dynamic, day-aware messaging
2. **LocationSection.tsx** - Will display the correct weekly hours from the centralized data

## Benefits
- **Single source of truth** - Change hours in one place, updates everywhere
- **Real-time awareness** - Shows "Open now" or "Closed" based on actual time
- **User-friendly** - Customers immediately see today's hours without searching
- **Future-proof** - Easy to add holiday hours or special schedules later
