
# Full Admin Wholesale Shipping Dashboard

## Overview
Build a comprehensive shipping command center for wholesale fulfillment that integrates all ShipStation API capabilities into a unified dashboard experience. The dashboard will feature a primary overview with key metrics and quick actions, plus tabbed sections for detailed management of shipments, carriers, labels, analytics, and wholesale leads.

## Dashboard Architecture

```text
+------------------------------------------------------------------+
|  WHOLESALE SHIPPING                                    [Settings] |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|  | Pending     |  | In Transit  |  | Delivered   |  | Spend     | |
|  | 12 Orders   |  | 8 Orders    |  | 156 This Mo |  | $2,450    | |
|  +-------------+  +-------------+  +-------------+  +-----------+ |
|                                                                   |
|  +---------------------------------------------------------------+|
|  | QUICK ACTIONS                                                 ||
|  | [Create Label] [Rate Shop] [Batch Print] [Schedule Pickup]   ||
|  +---------------------------------------------------------------+|
|                                                                   |
|  [Overview] [Shipments] [Labels] [Carriers] [Analytics] [Leads]  |
|  +---------------------------------------------------------------+|
|  |                                                               ||
|  |  (Tab Content Area)                                           ||
|  |                                                               ||
|  +---------------------------------------------------------------+|
+------------------------------------------------------------------+
```

---

## Main Components Structure

### 1. New Tab in Admin Sidebar
Add "Shipping" tab between "Wholesale" and "Settings" in the admin navigation.

### 2. Primary Dashboard View (Overview Tab)
**Key Metrics Cards:**
- Pending Shipments (orders synced but not shipped)
- In Transit (have tracking, not delivered)
- Delivered This Month
- Shipping Spend (monthly total)

**Quick Actions Bar:**
- Create Label (direct label purchase)
- Rate Shop (compare carrier rates)
- Batch Print Labels
- Schedule Carrier Pickup

**Recent Activity Feed:**
- Latest shipment status updates
- New wholesale lead notifications
- Rate changes or carrier alerts

---

## Tab Breakdown

### Tab 1: Shipments
Full shipment management with filters and bulk actions.

**Features:**
- Sortable/filterable table of all shipments
- Status filters: All, Awaiting Shipment, Shipped, Delivered, On Hold
- Date range picker
- Search by order number, tracking, or customer
- Bulk actions: Print labels, void, mark shipped
- Click to expand shipment details

**Table Columns:**
| Order # | Customer | Destination | Carrier | Status | Ship Date | Tracking | Actions |

### Tab 2: Labels
Label creation and management center.

**Features:**
- Create new shipping label form
  - Carrier selection
  - Service selection (Ground, Express, etc.)
  - Package dimensions and weight
  - Ship from/to addresses
  - Insurance options
- View/download existing labels (PDF viewer)
- Void label functionality
- Return label generation
- Batch label creation for multiple orders

**Rate Shopping Panel:**
- Side-by-side carrier rate comparison
- Delivery time estimates
- Service level options

### Tab 3: Carriers
Carrier configuration and performance tracking.

**Carrier List View:**
- All connected carriers with status
- Enable/disable carriers
- Default carrier settings

**Per-Carrier Details:**
- Logo and name
- Available services
- Rate card / pricing tiers
- Performance stats (on-time %, avg transit days)
- Account status

**Shipping Rates Section:**
- Current rate table by weight/zone
- Rate update history
- Cost comparison charts

### Tab 4: Analytics
Comprehensive shipping analytics and insights.

**Charts and Visualizations:**
- Shipments Over Time (bar chart - daily/weekly/monthly)
- Shipping Cost Trends (line chart)
- Carrier Distribution (pie chart)
- Delivery Performance (on-time vs late)

**Geographic Insights:**
- Shipments by State (US map or table)
- Top Destination Cities
- Zone distribution

**Cost Analysis:**
- Average cost per shipment
- Cost by carrier comparison
- Savings opportunities

### Tab 5: Wholesale Leads
Submitted wholesale account applications with shipping-relevant info.

**Lead Management Table:**
| Business Name | Contact | Email | Volume | Preference | Status | Applied | Actions |

**Features:**
- Filter by status (Pending, Approved, Rejected)
- Quick approve/reject actions
- View full application details
- Link to create first order
- Shipping address capture

---

## Technical Implementation

### Database Changes
Add new table for shipping analytics caching:

```sql
CREATE TABLE shipping_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_shipments INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  by_carrier JSONB DEFAULT '{}',
  by_state JSONB DEFAULT '{}',
  by_city JSONB DEFAULT '{}',
  on_time_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### New Edge Function: shipstation-api
Proxy function to call various ShipStation API endpoints:

**Endpoints:**
- `GET /carriers` - List all connected carriers
- `GET /carriers/:id/services` - Get carrier services
- `POST /rates` - Get shipping rates for a shipment
- `POST /labels` - Create a shipping label
- `GET /labels/:id` - Get label PDF
- `POST /labels/:id/void` - Void a label
- `GET /shipments` - List shipments with filters
- `GET /shipments/rates/:id` - Get rates for existing shipment
- `POST /pickups` - Schedule carrier pickup
- `GET /webhooks` - List active webhooks

### New React Components

**Main Dashboard:**
- `src/components/admin/shipping/ShippingDashboard.tsx` - Main container
- `src/components/admin/shipping/ShippingOverview.tsx` - Overview tab content
- `src/components/admin/shipping/MetricCard.tsx` - KPI display card

**Shipments Tab:**
- `src/components/admin/shipping/ShipmentsTable.tsx` - Full shipment list
- `src/components/admin/shipping/ShipmentFilters.tsx` - Filter controls
- `src/components/admin/shipping/ShipmentRow.tsx` - Expandable row

**Labels Tab:**
- `src/components/admin/shipping/LabelCreator.tsx` - Create label form
- `src/components/admin/shipping/LabelViewer.tsx` - PDF preview
- `src/components/admin/shipping/RateShopPanel.tsx` - Rate comparison

**Carriers Tab:**
- `src/components/admin/shipping/CarriersList.tsx` - Carrier cards
- `src/components/admin/shipping/CarrierDetails.tsx` - Carrier config
- `src/components/admin/shipping/RateTable.tsx` - Pricing display

**Analytics Tab:**
- `src/components/admin/shipping/ShippingAnalytics.tsx` - Charts container
- `src/components/admin/shipping/ShipmentChart.tsx` - Volume chart
- `src/components/admin/shipping/CostChart.tsx` - Cost trends
- `src/components/admin/shipping/GeoInsights.tsx` - Geographic data

**Leads Tab:**
- `src/components/admin/shipping/WholesaleLeads.tsx` - Leads table
- `src/components/admin/shipping/LeadDetailModal.tsx` - Full application view

---

## ShipStation API Integration Details

### API Endpoints to Implement

| Feature | ShipStation Endpoint | Method |
|---------|---------------------|--------|
| List Carriers | `/v2/carriers` | GET |
| Carrier Services | `/v2/carriers/{id}/services` | GET |
| Get Rates | `/v2/rates` | POST |
| Create Label | `/v2/labels` | POST |
| List Labels | `/v2/labels` | GET |
| Get Label PDF | `/v2/labels/{id}` | GET |
| Void Label | `/v2/labels/{id}/void` | POST |
| List Shipments | `/v2/shipments` | GET |
| Create Shipment | `/v2/shipments` | POST |
| Schedule Pickup | `/v2/pickups` | POST |
| Manifests | `/v2/manifests` | GET/POST |

### Label Printing
- Labels returned as base64 PDF from ShipStation
- Display in browser using PDF.js or iframe
- Direct print functionality
- Batch download as ZIP for multiple labels

---

## Files to Create

1. `supabase/functions/shipstation-api/index.ts` - Comprehensive API proxy
2. `src/components/admin/shipping/ShippingDashboard.tsx` - Main dashboard container
3. `src/components/admin/shipping/ShippingOverview.tsx` - Overview with metrics
4. `src/components/admin/shipping/ShipmentsTab.tsx` - Shipments management
5. `src/components/admin/shipping/LabelsTab.tsx` - Label creation/management
6. `src/components/admin/shipping/CarriersTab.tsx` - Carrier configuration
7. `src/components/admin/shipping/AnalyticsTab.tsx` - Charts and insights
8. `src/components/admin/shipping/LeadsTab.tsx` - Wholesale leads management
9. `src/components/admin/shipping/MetricCard.tsx` - Reusable metric display
10. `src/components/admin/shipping/RateComparison.tsx` - Rate shopping UI

## Files to Modify

1. `src/pages/Admin.tsx` - Add Shipping tab to sidebar and render ShippingDashboard
2. `supabase/config.toml` - Add new edge function configuration

---

## Implementation Order

1. **Phase 1: Core Infrastructure**
   - Create `shipstation-api` edge function with carrier and rate endpoints
   - Build `ShippingDashboard` container with tab navigation
   - Implement `ShippingOverview` with metric cards

2. **Phase 2: Shipments Management**
   - Build shipments table with filters
   - Add bulk action capabilities
   - Implement shipment detail expansion

3. **Phase 3: Label System**
   - Create label creation form with rate shopping
   - Implement PDF viewer for labels
   - Add void and reprint functionality
   - Build batch label printing

4. **Phase 4: Carriers & Rates**
   - Display connected carriers
   - Show service options per carrier
   - Implement rate table display

5. **Phase 5: Analytics**
   - Create charts using recharts
   - Build geographic insights
   - Add cost analysis views

6. **Phase 6: Leads Integration**
   - Enhance wholesale leads display
   - Add approve/reject workflow
   - Connect to shipping address management

---

## UI/UX Considerations

- **Responsive Design**: Dashboard adapts from desktop to tablet views
- **Real-time Updates**: Use React Query for data freshness
- **Loading States**: Skeleton loaders for all async data
- **Error Handling**: Toast notifications for API failures
- **Print Optimization**: Label viewer optimized for thermal printers
- **Accessibility**: Full keyboard navigation and screen reader support
