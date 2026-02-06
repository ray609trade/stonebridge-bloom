
# Add Real-Time Updates to Leads Tab

## Overview

Add Supabase Realtime subscription to the Leads tab so new wholesale applications appear automatically without requiring a page refresh.

## Implementation Steps

### Step 1: Enable Realtime on the Table

Create a database migration to add `wholesale_accounts` to the Supabase realtime publication:

```text
ALTER PUBLICATION supabase_realtime ADD TABLE public.wholesale_accounts;
```

### Step 2: Add Realtime Subscription in LeadsTab

Update `src/components/admin/shipping/LeadsTab.tsx` to:

1. Import `useEffect` from React
2. Add a `useEffect` hook that:
   - Creates a Supabase realtime channel subscribed to `wholesale_accounts` table changes
   - Listens for INSERT, UPDATE, and DELETE events
   - Calls `queryClient.invalidateQueries` when any change occurs
   - Cleans up the subscription on unmount

### Code Changes

**File: `src/components/admin/shipping/LeadsTab.tsx`**

Add import:
```text
import { useState, useEffect } from "react";
```

Add `useEffect` hook after the existing query hooks:
```text
// Real-time subscription for wholesale accounts
useEffect(() => {
  const channel = supabase
    .channel('wholesale-accounts-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'wholesale_accounts'
      },
      (payload) => {
        console.log('Wholesale account change:', payload);
        queryClient.invalidateQueries({ queryKey: ["wholesale-accounts-shipping"] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [queryClient]);
```

## How It Works

1. When the LeadsTab component mounts, it subscribes to the `wholesale_accounts` table changes
2. When a new wholesale application is submitted (INSERT), the subscription triggers
3. The React Query cache is invalidated, causing an automatic refetch
4. The new lead appears in the table without manual refresh
5. Same applies for status updates (UPDATE) and deletions (DELETE)

## Testing

After implementation:
1. Open the Admin → Shipping → Leads tab
2. In a separate browser/tab, submit a new wholesale application at `/wholesale`
3. The new application should appear automatically in the Leads table within seconds
