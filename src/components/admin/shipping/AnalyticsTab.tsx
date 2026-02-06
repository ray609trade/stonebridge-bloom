import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { MapPin, TrendingUp, Truck, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function AnalyticsTab() {
  // Fetch orders for analytics
  const { data: orders, isLoading } = useQuery({
    queryKey: ["shipping-analytics-orders"],
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

  // Process data for charts
  const processedData = orders ? (() => {
    // Shipments over time (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = orders.filter((o) => {
        if (!o.shipped_at) return false;
        return format(new Date(o.shipped_at), "yyyy-MM-dd") === dateStr;
      }).length;
      return { date: format(date, "MMM d"), shipments: count };
    });

    // Carrier distribution
    const carrierCounts: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.carrier_code) {
        carrierCounts[o.carrier_code] = (carrierCounts[o.carrier_code] || 0) + 1;
      }
    });
    const carrierData = Object.entries(carrierCounts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
    }));

    // Geographic data (by state)
    const stateCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const shipTo = o.ship_to_address as { state?: string } | null;
      if (shipTo?.state) {
        stateCounts[shipTo.state] = (stateCounts[shipTo.state] || 0) + 1;
      }
    });
    const stateData = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, shipments: count }));

    // City data
    const cityCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const shipTo = o.ship_to_address as { city?: string } | null;
      if (shipTo?.city) {
        cityCounts[shipTo.city] = (cityCounts[shipTo.city] || 0) + 1;
      }
    });
    const cityData = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, shipments: count }));

    // Monthly trends
    const monthlyData: Record<string, { orders: number; shipped: number }> = {};
    orders.forEach((o) => {
      if (!o.created_at) return;
      const month = format(new Date(o.created_at), "MMM yyyy");
      if (!monthlyData[month]) {
        monthlyData[month] = { orders: 0, shipped: 0 };
      }
      monthlyData[month].orders++;
      if (o.tracking_number) {
        monthlyData[month].shipped++;
      }
    });
    const trendData = Object.entries(monthlyData)
      .slice(-6)
      .map(([month, data]) => ({
        month,
        orders: data.orders,
        shipped: data.shipped,
      }));

    return { last30Days, carrierData, stateData, cityData, trendData };
  })() : null;

  // Summary stats
  const stats = orders ? {
    totalShipments: orders.filter((o) => o.tracking_number).length,
    avgPerDay: (orders.filter((o) => o.tracking_number).length / 30).toFixed(1),
    topState: processedData?.stateData[0]?.state || "N/A",
    topCarrier: processedData?.carrierData[0]?.name || "N/A",
  } : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Shipped</p>
                <p className="text-2xl font-bold">{stats?.totalShipments || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg/Day (30d)</p>
                <p className="text-2xl font-bold">{stats?.avgPerDay || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top State</p>
                <p className="text-2xl font-bold">{stats?.topState}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Carrier</p>
                <p className="text-2xl font-bold">{stats?.topCarrier}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipments Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Shipments (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData?.last30Days || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="shipments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carrier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Carrier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {processedData?.carrierData && processedData.carrierData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedData.carrierData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processedData.carrierData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No carrier data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top States */}
        <Card>
          <CardHeader>
            <CardTitle>Top Destination States</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData?.stateData || []} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="state" type="category" width={40} />
                  <Tooltip />
                  <Bar dataKey="shipments" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Cities */}
        <Card>
          <CardHeader>
            <CardTitle>Top Destination Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData?.cityData || []} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="shipments" fill="#00C49F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData?.trendData || []}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Orders"
                />
                <Line
                  type="monotone"
                  dataKey="shipped"
                  stroke="#00C49F"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Shipped"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
