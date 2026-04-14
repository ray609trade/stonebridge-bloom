

## Fix Admin Portal Mobile UI

### Problem
The admin page uses a fixed 256px sidebar that never collapses, making it unusable on mobile — the sidebar takes up the full screen width and the main content is pushed off-screen/truncated.

### Solution
Convert the admin layout to a mobile-responsive design with a collapsible sidebar drawer on small screens, and convert tables to card-based layouts on mobile.

### Changes to `src/pages/Admin.tsx`

1. **Collapsible sidebar on mobile**
   - Add a `sidebarOpen` state (default `false` on mobile)
   - On `md+`: keep the current fixed sidebar as-is
   - On mobile (`<md`): hide the sidebar by default, show it as a slide-over drawer with a backdrop overlay
   - Add a hamburger menu button in a top bar on mobile
   - Auto-close sidebar when a nav item is tapped on mobile

2. **Mobile top bar**
   - Show a sticky top bar on mobile with the hamburger toggle, "Stonebridge Admin" title, and logout button
   - Hidden on `md+` where the sidebar is always visible

3. **Responsive main content area**
   - Change `ml-64` to `md:ml-64 ml-0` so content uses full width on mobile
   - Change `p-8` to `p-4 md:p-8` for tighter mobile padding

4. **Responsive tables → card layouts**
   - Orders table: on mobile, show each order as a stacked card (order number, customer, status, total) instead of a wide table
   - Categories table: same card treatment
   - Wholesale accounts table: same card treatment
   - Status filter badges in the orders header: wrap into a scrollable row on mobile

5. **Responsive orders header**
   - Stack the "Orders" title and status badges vertically on mobile instead of side-by-side

### Technical Approach
- Use Tailwind responsive classes (`md:` prefix) throughout — no new dependencies
- Use the existing `useIsMobile` hook from `src/hooks/use-mobile.tsx` for conditional rendering where responsive classes aren't sufficient
- Keep all existing functionality (status updates, modals, ShipStation sync) intact

