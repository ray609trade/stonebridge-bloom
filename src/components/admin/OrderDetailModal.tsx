import { useState } from "react";
import { X, Printer, Clock, User, Phone, Mail, MapPin, Truck, ExternalLink, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  options?: Record<string, string>;
}

interface Order {
  id: string;
  order_number: string;
  order_type: "retail" | "wholesale";
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  items: OrderItem[] | any;
  total: number;
  status: string | null;
  scheduled_time: string | null;
  created_at: string | null;
  shipstation_order_id?: string | null;
  tracking_number?: string | null;
  carrier_code?: string | null;
  shipped_at?: string | null;
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const items = Array.isArray(order.items) ? order.items : [];
  const [isSendingText, setIsSendingText] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSendText = async () => {
    if (!order.customer_phone) {
      toast.error("Customer has no phone number on file");
      return;
    }

    setIsSendingText(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Text message sent! 📱");
      } else if (result.reason === 'no_phone') {
        toast.error("Customer has no phone number on file");
      } else {
        toast.error(result.message || "Failed to send text");
      }
    } catch (error) {
      console.error('Failed to send text:', error);
      toast.error("Failed to send text notification");
    } finally {
      setIsSendingText(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-xl shadow-2xl print:shadow-none print:max-w-full"
      >
        <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
          <h2 className="font-serif text-xl font-semibold">
            Order {order.order_number}
          </h2>
          <div className="flex items-center gap-2">
            {order.customer_phone && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSendText}
                disabled={isSendingText}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                {isSendingText ? "Sending..." : "Send Text"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-1 h-4 w-4" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-semibold print:text-3xl">
                {order.order_number}
              </h3>
              <p className="text-sm text-muted-foreground">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <Badge className={cn("capitalize text-sm", statusColors[order.status || "pending"])}>
              {order.status || "pending"}
            </Badge>
          </div>

          {/* Customer Info */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{order.customer_email}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer_phone}</span>
              </div>
            )}
          </div>

          {/* Shipping Info - only for wholesale */}
          {order.order_type === 'wholesale' && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 font-medium text-primary">
                <Truck className="h-4 w-4" />
                Shipping Information
              </div>
              {order.tracking_number ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Carrier</span>
                    <span className="font-medium uppercase">{order.carrier_code || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tracking #</span>
                    <a
                      href={`https://www.google.com/search?q=${order.carrier_code}+tracking+${order.tracking_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {order.tracking_number}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  {order.shipped_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Shipped</span>
                      <span className="text-sm">{new Date(order.shipped_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              ) : order.shipstation_order_id ? (
                <p className="text-sm text-muted-foreground">
                  Order synced to fulfillment — awaiting shipment
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not yet synced to fulfillment system
                </p>
              )}
            </div>
          )}

          {/* Items */}
          <div>
            <h4 className="font-medium mb-3">Order Items</h4>
            <div className="space-y-3">
              {items.map((item: OrderItem, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-3 rounded-lg bg-secondary/30"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    {item.options && Object.entries(item.options).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center text-xl font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
