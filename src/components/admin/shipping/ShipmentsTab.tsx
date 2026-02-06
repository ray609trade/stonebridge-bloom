import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, ExternalLink, Truck, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export function ShipmentsTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["shipping-orders-all"],
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

  const syncToShipStation = useMutation({
    mutationFn: async (orderId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shipstation-sync`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-orders-all"] });
      toast.success("Order synced to ShipStation");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Filter orders
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "awaiting" && order.shipstation_order_id && !order.tracking_number) ||
      (statusFilter === "shipped" && order.tracking_number) ||
      (statusFilter === "not_synced" && !order.shipstation_order_id);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shipments</SelectItem>
            <SelectItem value="not_synced">Not Synced</SelectItem>
            <SelectItem value="awaiting">Awaiting Shipment</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Destination</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Carrier</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Ship Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tracking</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Loading shipments...
                </td>
              </tr>
            ) : filteredOrders?.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No shipments found
                </td>
              </tr>
            ) : (
              filteredOrders?.map((order) => {
                const shipTo = order.ship_to_address as { city?: string; state?: string } | null;
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {shipTo ? (
                        <span>{shipTo.city}, {shipTo.state}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.carrier_code ? (
                        <Badge variant="outline" className="text-xs">
                          {order.carrier_code.toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {order.tracking_number ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Truck className="mr-1 h-3 w-3" />
                          Shipped
                        </Badge>
                      ) : order.shipstation_order_id ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Package className="mr-1 h-3 w-3" />
                          Awaiting
                        </Badge>
                      ) : (
                        <Badge className={cn("capitalize", statusColors[order.status || "pending"])}>
                          {order.status || "pending"}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {order.shipped_at
                        ? format(new Date(order.shipped_at), "MMM d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {order.tracking_number ? (
                        <a
                          href={`https://www.google.com/search?q=${order.carrier_code}+tracking+${order.tracking_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {order.tracking_number.slice(0, 16)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!order.shipstation_order_id && order.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={syncToShipStation.isPending}
                          onClick={() => syncToShipStation.mutate(order.id)}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Sync
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
