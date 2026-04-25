import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, ChevronDown, MapPin, Truck, FileText, 
  ExternalLink, Clock, CheckCircle2, Circle, AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  options?: Record<string, string>;
}

interface OrderHistoryCardProps {
  order: {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total: number;
    subtotal: number;
    tax: number;
    items: any;
    tracking_number?: string | null;
    carrier_code?: string | null;
    shipped_at?: string | null;
    ship_to_address?: any;
    notes?: string | null;
  };
}

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready", "completed"] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-amber-500/15 text-amber-700 border-amber-500/25", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500/15 text-blue-700 border-blue-500/25", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "bg-indigo-500/15 text-indigo-700 border-indigo-500/25", icon: Package },
  ready: { label: "Ready to Ship", color: "bg-purple-500/15 text-purple-700 border-purple-500/25", icon: Truck },
  completed: { label: "Completed", color: "bg-emerald-500/15 text-emerald-700 border-emerald-500/25", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-700 border-red-500/25", icon: AlertCircle },
};

function getTrackingUrl(carrier: string | null, trackingNumber: string): string {
  const c = carrier?.toLowerCase() || "";
  if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  if (c.includes("fedex")) return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  if (c.includes("usps") || c.includes("stamps")) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  if (c.includes("dhl")) return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
  return `https://www.google.com/search?q=${trackingNumber}+tracking`;
}

export function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const parsedItems: OrderItem[] = (() => {
    try {
      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  })();

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const currentStepIndex = STATUS_STEPS.indexOf(order.status as any);
  const address = order.ship_to_address && typeof order.ship_to_address === "object" ? order.ship_to_address : null;

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border bg-card overflow-hidden transition-shadow duration-300",
        isExpanded ? "shadow-[var(--card-shadow-hover)] border-accent/30" : "shadow-[var(--card-shadow)] border-border hover:border-accent/20"
      )}
    >
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-5 flex items-center gap-3 sm:gap-4 text-left"
      >
        <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground truncate">{order.order_number}</span>
            <Badge variant="outline" className={cn("text-xs font-medium", statusConfig.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
            <span>{format(new Date(order.created_at), "MMM d, yyyy")}</span>
            <span className="text-border">·</span>
            <span>{parsedItems.length} item{parsedItems.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-semibold text-foreground text-base sm:text-lg">${Number(order.total).toFixed(2)}</p>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto mt-1" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-5 space-y-5 border-t border-border pt-4">
              {/* Status Timeline */}
              {order.status !== "cancelled" && (
                <div className="flex items-center justify-between gap-1">
                  {STATUS_STEPS.map((step, i) => {
                    const isActive = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className={cn(
                          "h-2.5 w-full rounded-full transition-colors",
                          isActive ? "bg-accent" : "bg-secondary"
                        )} />
                        <span className={cn(
                          "text-[10px] md:text-xs capitalize",
                          isCurrent ? "text-accent font-semibold" : isActive ? "text-foreground" : "text-muted-foreground/50"
                        )}>
                          {step === "ready" ? "Ship" : step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Items Table */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  Items
                </h4>
                <div className="bg-secondary/50 rounded-xl overflow-hidden">
                  <div className="divide-y divide-border">
                    {parsedItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          {item.options && Object.keys(item.options).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-muted-foreground">{item.quantity} × ${Number(item.unitPrice).toFixed(2)}</p>
                          <p className="font-medium text-foreground">${(item.quantity * Number(item.unitPrice)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border px-4 py-3 flex justify-between font-semibold text-sm">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking & Shipping Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tracking */}
                {order.tracking_number && (
                  <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Truck className="h-4 w-4 text-accent" />
                      Tracking
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {order.carrier_code && <span className="uppercase font-medium text-foreground">{order.carrier_code} · </span>}
                      {order.tracking_number}
                    </p>
                    {order.shipped_at && (
                      <p className="text-xs text-muted-foreground">
                        Shipped {format(new Date(order.shipped_at), "MMM d, yyyy")}
                      </p>
                    )}
                    <a
                      href={getTrackingUrl(order.carrier_code || null, order.tracking_number)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline mt-1"
                    >
                      Track Package <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}

                {/* Ship To */}
                {address && (
                  <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      Ship To
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {address.street && <>{address.street}<br /></>}
                      {address.city && `${address.city}, `}{address.state} {address.zip}
                      {address.country && address.country !== "USA" && <><br />{address.country}</>}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="p-4 rounded-xl bg-secondary/50">
                  <h4 className="text-sm font-semibold text-foreground mb-1">Notes</h4>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
