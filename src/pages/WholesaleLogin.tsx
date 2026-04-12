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
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export default function WholesaleLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/wholesale/reset-password",
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });

      if (result.redirected) return;
      if (result.error) throw result.error;

      // Check wholesale account access
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: account } = await supabase
          .from("wholesale_accounts")
          .select("id, status")
          .eq("user_id", session.user.id)
          .single();

        if (!account) {
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
      }
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                        <button
                          type="button"
                          className="text-xs text-accent hover:underline"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setResetEmail(loginData.email);
                          }}
                        >
                          Forgot Password?
                        </button>
                      </div>
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

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        or
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                      disabled={isLoading}
                      onClick={() => handleOAuthSignIn("google")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                      disabled={isLoading}
                      onClick={() => handleOAuthSignIn("apple")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      Continue with Apple
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

                    <div className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        or
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                      disabled={isLoading}
                      onClick={() => handleOAuthSignIn("google")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continue with Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                      disabled={isLoading}
                      onClick={() => handleOAuthSignIn("apple")}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                      </svg>
                      Continue with Apple
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
            {showForgotPassword && (
              <div className="mt-4 p-6 rounded-2xl border border-border bg-card shadow-[var(--card-shadow)] space-y-4">
                <h2 className="font-serif text-lg font-semibold">Reset Password</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="h-12 rounded-xl"
                />
                <div className="flex gap-2">
                  <Button
                    className="flex-1 h-12 bg-accent hover:bg-amber-dark text-accent-foreground font-semibold rounded-xl"
                    disabled={isLoading}
                    onClick={handleForgotPassword}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
