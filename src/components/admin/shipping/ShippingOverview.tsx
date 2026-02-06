import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle, DollarSign, Tag, RefreshCw, Printer, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "./MetricCard";
import { format } from "date-fns";

interface ShippingOverviewProps {
  onQuickAction: (action: string) => void;
}

export function ShippingOverview({ onQuickAction }: ShippingOverviewProps) {
  // Fetch orders with shipping data
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["shipping-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_type", "wholesale")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics
  const pendingOrders = orders?.filter(
    (o) => o.shipstation_order_id && !o.tracking_number
  ).length || 0;
  
  const inTransitOrders = orders?.filter(
    (o) => o.tracking_number && o.status !== "completed"
  ).length || 0;
  
  const deliveredThisMonth = orders?.filter((o) => {
    if (!o.shipped_at) return false;
    const shippedDate = new Date(o.shipped_at);
    const now = new Date();
    return shippedDate.getMonth() === now.getMonth() && 
           shippedDate.getFullYear() === now.getFullYear();
  }).length || 0;

  const awaitingSync = orders?.filter(
    (o) => !o.shipstation_order_id && o.status === "confirmed"
  ).length || 0;

  // Recent activity
  const recentShipments = orders?.filter((o) => o.tracking_number).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Shipments"
          value={pendingOrders}
          subtitle="Synced, awaiting label"
          icon={Package}
          isLoading={ordersLoading}
        />
        <MetricCard
          title="In Transit"
          value={inTransitOrders}
          subtitle="With tracking"
          icon={Truck}
          isLoading={ordersLoading}
        />
        <MetricCard
          title="Delivered This Month"
          value={deliveredThisMonth}
          subtitle={format(new Date(), "MMMM yyyy")}
          icon={CheckCircle}
          isLoading={ordersLoading}
        />
        <MetricCard
          title="Awaiting Sync"
          value={awaitingSync}
          subtitle="Confirmed orders"
          icon={RefreshCw}
          isLoading={ordersLoading}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => onQuickAction("labels")}>
              <Tag className="mr-2 h-4 w-4" />
              Create Label
            </Button>
            <Button variant="outline" onClick={() => onQuickAction("rates")}>
              <DollarSign className="mr-2 h-4 w-4" />
              Rate Shop
            </Button>
            <Button variant="outline" onClick={() => onQuickAction("batch")}>
              <Printer className="mr-2 h-4 w-4" />
              Batch Print
            </Button>
            <Button variant="outline" onClick={() => onQuickAction("pickup")}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Pickup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          {recentShipments.length > 0 ? (
            <div className="space-y-3">
              {recentShipments.map((shipment) => (
                <div
                  key={shipment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Truck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{shipment.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {shipment.customer_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {shipment.carrier_code?.toUpperCase() || "SHIPPED"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shipment.shipped_at
                        ? format(new Date(shipment.shipped_at), "MMM d, yyyy")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No recent shipments
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
