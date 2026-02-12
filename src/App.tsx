import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import About from "./pages/About";
import Order from "./pages/Order";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Wholesale from "./pages/Wholesale";
import WholesaleLogin from "./pages/WholesaleLogin";
import WholesalePortal from "./pages/WholesalePortal";
import WholesaleCheckout from "./pages/WholesaleCheckout";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order/checkout" element={<Checkout />} />
            <Route path="/order/confirmation/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/wholesale/login" element={<WholesaleLogin />} />
            <Route path="/wholesale/portal" element={<WholesalePortal />} />
            <Route path="/wholesale/checkout" element={<WholesaleCheckout />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
