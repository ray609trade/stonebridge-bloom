import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function WholesaleLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      const { data: account, error: accountError } = await supabase
        .from("wholesale_accounts")
        .select("id, status")
        .eq("user_id", data.user.id)
        .single();

      if (accountError || !account) {
        await supabase.auth.signOut();
        toast.error("No wholesale account found for this email");
        return;
      }

      if (account.status !== "approved") {
        await supabase.auth.signOut();
        toast.error("Your wholesale account is pending approval");
        return;
      }

      toast.success("Welcome back!");
      navigate("/wholesale/portal");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data: existingAccount } = await supabase
        .from("wholesale_accounts")
        .select("id, status, user_id")
        .eq("email", signupData.email)
        .single();

      if (!existingAccount) {
        toast.error("No wholesale application found. Please apply first.", {
          action: {
            label: "Apply Now",
            onClick: () => navigate("/wholesale"),
          },
        });
        return;
      }

      if (existingAccount.status !== "approved") {
        toast.error("Your wholesale application is still pending approval");
        return;
      }

      if (existingAccount.user_id) {
        toast.error("An account already exists. Please login instead.");
        setActiveTab("login");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/wholesale/portal`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: updateError } = await supabase
          .from("wholesale_accounts")
          .update({ user_id: authData.user.id })
          .eq("id", existingAccount.id);

        if (updateError) throw updateError;

        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "wholesale_customer",
        });
      }

      toast.success("Account created! Please check your email to verify.");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <Button variant="ghost" className="mb-6 -ml-2" asChild>
            <Link to="/wholesale">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wholesale
            </Link>
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Branded Header */}
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-accent/15 border border-accent/20 mx-auto mb-5 flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
              <h1 className="font-serif text-3xl font-semibold text-foreground">
                Wholesale Portal
              </h1>
              <p className="text-muted-foreground mt-2">
                Sign in to access exclusive wholesale pricing
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-[var(--card-shadow)] p-6">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl">
                  <TabsTrigger value="login" className="flex items-center gap-2 rounded-lg text-sm">
                    <LogIn className="h-4 w-4" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex items-center gap-2 rounded-lg text-sm">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        required
                        placeholder="you@business.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold rounded-xl shadow-[var(--amber-glow)] transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="bg-secondary/60 rounded-xl p-4 mb-6 border border-border/50">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> You must have an approved wholesale application before creating an account.{" "}
                      <Link to="/wholesale" className="text-accent font-medium hover:underline">
                        Apply here
                      </Link>
                    </p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email (from your application)</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        required
                        placeholder="you@business.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        placeholder="Min. 6 characters"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-sm font-medium">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold rounded-xl shadow-[var(--amber-glow)] transition-all"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
