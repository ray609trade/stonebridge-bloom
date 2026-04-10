import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOut, Package, Clock, ShoppingBag, Search, Building2, DollarSign, CalendarDays, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WholesaleCartProvider, useWholesaleCart } from "@/hooks/useWholesaleCart";
import { WholesaleMenu } from "@/components/wholesale/WholesaleMenu";
import { WholesaleCartDrawer } from "@/components/wholesale/WholesaleCartDrawer";
import { OrderHistoryCard } from "@/components/wholesale/OrderHistoryCard";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface WholesaleAccount {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  tier: string;
  shipping_address: any;
}

const ORDER_FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

function WholesalePortalContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"order" | "history">("order");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const { itemCount, subtotal, toggleCart } = useWholesaleCart();

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["wholesale-account", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("wholesale_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .single();
      if (error) throw error;
      return data as WholesaleAccount;
    },
    enabled: !!user,
  });

  const { data: orders } = useQuery({
    queryKey: ["wholesale-orders", account?.id],
    queryFn: async () => {
      if (!account) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("wholesale_account_id", account.id)
        .eq("order_type", "wholesale")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!account,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/wholesale/login");
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/wholesale/login");
      } else if (session) {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/wholesale/login");
  };

  // Stats
  const stats = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);
    const lastOrder = orders[0];
    const activeCount = orders.filter(o => !["completed", "cancelled"].includes(o.status || "")).length;
    return { totalOrders: orders.length, totalSpent, lastOrderDate: lastOrder.created_at, activeCount };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (orderFilter === "all") return orders;
    if (orderFilter === "active") return orders.filter(o => !["completed", "cancelled"].includes(o.status || ""));
    if (orderFilter === "completed") return orders.filter(o => o.status === "completed");
    if (orderFilter === "cancelled") return orders.filter(o => o.status === "cancelled");
    return orders;
  }, [orders, orderFilter]);

  if (isLoading || accountLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="pt-16 md:pt-20">
          <div className="bg-secondary/50 py-6 md:py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="pt-24 md:pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 rounded-3xl bg-secondary mx-auto mb-6 flex items-center justify-center">
                <Building2 className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h1 className="font-serif text-2xl font-semibold mb-3">Account Not Found</h1>
              <p className="text-muted-foreground mb-6">
                No approved wholesale account found for your email.
              </p>
              <Button onClick={handleLogout} variant="outline">Sign Out</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <WholesaleCartDrawer />

      <main className="pt-16 md:pt-20">
        {/* Premium Account Header */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/50 to-background" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="container mx-auto px-4 py-8 md:py-10 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-accent" />
                </div>
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
                    {account.business_name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {account.contact_name} · <span className="capitalize font-medium text-foreground/70">{account.tier}</span> tier
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="w-fit rounded-xl h-11 border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex gap-1">
              {[
                { key: "order", label: "Place Order", icon: ShoppingBag },
                { key: "history", label: "Order History", icon: Clock },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={cn(
                    "px-5 py-3.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
                    activeTab === tab.key
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            {activeTab === "order" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-md mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-12 h-12 rounded-xl border-border/80"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <WholesaleMenu searchQuery={searchQuery} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Stats Bar */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                      { icon: Package, label: "Total Orders", value: stats.totalOrders },
                      { icon: DollarSign, label: "Total Spent", value: `$${stats.totalSpent.toFixed(2)}` },
                      { icon: TrendingUp, label: "Active Orders", value: stats.activeCount },
                      { icon: CalendarDays, label: "Last Order", value: format(new Date(stats.lastOrderDate), "MMM d, yyyy") },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-card border border-border shadow-[var(--card-shadow)]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className="h-4 w-4 text-accent" />
                          <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                        </div>
                        <p className="text-lg md:text-xl font-semibold text-foreground">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                  {ORDER_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setOrderFilter(f.key)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0",
                        orderFilter === f.key
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Order Cards */}
                {filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order: any, i: number) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <OrderHistoryCard order={order} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="h-20 w-20 rounded-3xl bg-secondary mx-auto mb-5 flex items-center justify-center">
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground font-medium">No orders found</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      {orderFilter !== "all" ? "Try a different filter" : "Start ordering to see your history here"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto z-30"
        >
          <Button
            onClick={toggleCart}
            className="w-full md:w-auto h-14 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold text-base rounded-xl shadow-lg"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            View Cart ({itemCount}) · ${subtotal.toFixed(2)}
          </Button>
        </motion.div>
      )}

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function WholesalePortal() {
  return (
    <WholesaleCartProvider>
      <WholesalePortalContent />
    </WholesaleCartProvider>
  );
}
