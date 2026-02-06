import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Building2, 
  Settings, 
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  Eye,
  Truck,
  ExternalLink,
  Ship
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { OrderDetailModal } from "@/components/admin/OrderDetailModal";
import { ShippingDashboard } from "@/components/admin/shipping/ShippingDashboard";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  order_type: "retail" | "wholesale";
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items: any;
  total: number;
  status: string | null;
  scheduled_time: string | null;
  created_at: string | null;
  shipstation_order_id: string | null;
  tracking_number: string | null;
  carrier_code: string | null;
  shipped_at: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Admin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("orders");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Check admin role
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!data) {
        navigate("/admin/login");
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Order[];
    },
    enabled: isAuthenticated,
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const { data: wholesaleAccounts } = useQuery({
    queryKey: ["admin-wholesale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wholesale_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: status as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
    onError: () => {
      toast.error("Failed to update order status");
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
        throw new Error(error.error || 'Failed to sync to ShipStation');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Order synced to ShipStation: ${data.orderNumber}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground p-4">
        <div className="mb-8">
          <h1 className="font-serif text-xl font-semibold text-sidebar-primary">
            Stonebridge Admin
          </h1>
        </div>

        <nav className="space-y-1">
          {[
            { id: "orders", label: "Orders", icon: ShoppingCart },
            { id: "products", label: "Products", icon: Package },
            { id: "categories", label: "Categories", icon: LayoutDashboard },
            { id: "wholesale", label: "Wholesale", icon: Building2 },
            { id: "shipping", label: "Shipping", icon: Ship },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold">Orders</h2>
              <div className="flex gap-2">
                {["pending", "confirmed", "preparing", "ready"].map((status) => (
                  <Badge
                    key={status}
                    variant="outline"
                    className={cn("capitalize", statusColors[status])}
                  >
                    {orders?.filter((o) => o.status === status).length || 0} {status}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Order #</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Shipping</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Time</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {order.order_type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </td>
                      <td className="px-4 py-3">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn("capitalize", statusColors[order.status || "pending"])}>
                          {order.status || "pending"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {order.tracking_number ? (
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              <Truck className="h-3 w-3 mr-1" />
                              {order.carrier_code?.toUpperCase() || 'SHIPPED'}
                            </Badge>
                            <a
                              href={`https://www.google.com/search?q=${order.carrier_code}+tracking+${order.tracking_number}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-0.5"
                            >
                              {order.tracking_number.slice(0, 12)}...
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : order.shipstation_order_id ? (
                          <Badge variant="secondary" className="text-xs">
                            Awaiting shipment
                          </Badge>
                        ) : order.order_type === 'wholesale' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={syncToShipStation.isPending}
                            onClick={() => syncToShipStation.mutate(order.id)}
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status !== "completed" && order.status !== "cancelled" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const nextStatus: Record<string, string> = {
                                  pending: "confirmed",
                                  confirmed: "preparing",
                                  preparing: "ready",
                                  ready: "completed",
                                };
                                updateOrderStatus.mutate({
                                  id: order.id,
                                  status: nextStatus[order.status || "pending"],
                                });
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No orders yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold">Products</h2>
              <Button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name || "Uncategorized"}
                      </p>
                    </div>
                    <Badge variant={product.active ? "default" : "secondary"}>
                      {product.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold mb-4">
                    ${product.retail_price.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                    >
                      <Edit2 className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-semibold">Categories</h2>
              <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Visibility</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories?.map((category) => (
                    <tr key={category.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{category.slug}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {category.visibility}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={category.active ? "default" : "secondary"}>
                          {category.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryForm(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Wholesale Tab */}
        {activeTab === "wholesale" && (
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-6">
              Wholesale Accounts
            </h2>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Business</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tier</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Applied</th>
                  </tr>
                </thead>
                <tbody>
                  {wholesaleAccounts?.map((account) => (
                    <tr key={account.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium">{account.business_name}</p>
                        <p className="text-sm text-muted-foreground">{account.address}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{account.contact_name}</p>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={account.status === "approved" ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {account.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 capitalize">{account.tier}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {account.created_at
                          ? new Date(account.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {wholesaleAccounts?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No wholesale account applications yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <ShippingDashboard />
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <h2 className="font-serif text-2xl font-semibold mb-6">Settings</h2>
            <div className="max-w-2xl">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-lg mb-4">Site Settings</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Configure your store details, contact information, and operating hours.
                </p>
                <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Logo:</strong> Place your logo at <code>/assets/logo.png</code>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Contact Info:</strong> Update placeholders in the Footer and Location components
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories || []}
          onClose={() => setShowProductForm(false)}
          onSuccess={() => {
            setShowProductForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          }}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setShowCategoryForm(false)}
          onSuccess={() => {
            setShowCategoryForm(false);
            queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
          }}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
