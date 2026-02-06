import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
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

      // Check if user has an approved wholesale account
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
      // Check if wholesale account exists for this email
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

      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/wholesale/portal`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Link auth user to wholesale account
        const { error: updateError } = await supabase
          .from("wholesale_accounts")
          .update({ user_id: authData.user.id })
          .eq("id", existingAccount.id);

        if (updateError) throw updateError;

        // Add wholesale_customer role
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
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
              Wholesale Portal
            </h1>
            <p className="text-muted-foreground mb-8">
              Sign in to access your wholesale account
            </p>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-accent hover:bg-amber-dark text-accent-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> You must have an approved wholesale application before creating an account.{" "}
                    <Link to="/wholesale" className="text-accent hover:underline">
                      Apply here
                    </Link>
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email (from your application)</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      required
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      required
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-accent hover:bg-amber-dark text-accent-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
