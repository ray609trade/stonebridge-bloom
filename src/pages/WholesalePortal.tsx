import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LogOut, Package, Clock, ShoppingBag, Search, Building2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WholesaleCartProvider, useWholesaleCart } from "@/hooks/useWholesaleCart";
import { WholesaleMenu } from "@/components/wholesale/WholesaleMenu";
import { WholesaleCartDrawer } from "@/components/wholesale/WholesaleCartDrawer";
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

function WholesalePortalContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"order" | "history">("order");
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, subtotal, toggleCart } = useWholesaleCart();

  // Check auth and get wholesale account
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

  // Get order history
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
        .limit(20);
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

  if (isLoading || accountLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="pt-24 md:pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-2xl font-semibold mb-4">Account Not Found</h1>
            <p className="text-muted-foreground mb-6">
              No approved wholesale account found for your email.
            </p>
            <Button onClick={handleLogout}>Sign Out</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <WholesaleCartDrawer />

      <main className="pt-16 md:pt-20">
        {/* Account Header */}
        <section className="bg-secondary/50 py-6 md:py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h1 className="font-serif text-xl md:text-2xl font-semibold text-foreground">
                    {account.business_name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {account.contact_name} · {account.tier} tier
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout} className="w-fit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("order")}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "order"
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <ShoppingBag className="h-4 w-4 inline mr-2" />
                Place Order
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "history"
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="h-4 w-4 inline mr-2" />
                Order History
              </button>
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
                {/* Search */}
                <div className="max-w-md mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-12 h-12 rounded-xl"
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
                className="space-y-4"
              >
                <h2 className="font-serif text-xl font-semibold mb-4">Recent Orders</h2>
                
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl border border-border bg-card hover:border-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.created_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                            <Badge variant="outline" className={cn("mt-1", getStatusColor(order.status))}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet. Start ordering!</p>
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
