import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, CheckCircle, XCircle, Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

interface WholesaleAccount {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  shipping_address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
  status: string | null;
  tier: string | null;
  notes: string | null;
  created_at: string | null;
}

export function LeadsTab() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState<WholesaleAccount | null>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["wholesale-accounts-shipping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wholesale_accounts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WholesaleAccount[];
    },
  });

  // Real-time subscription for wholesale accounts
  useEffect(() => {
    const channel = supabase
      .channel('wholesale-accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wholesale_accounts'
        },
        (payload) => {
          console.log('Wholesale account change:', payload);
          queryClient.invalidateQueries({ queryKey: ["wholesale-accounts-shipping"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, email, contactName, businessName }: { id: string; status: string; email: string; contactName: string; businessName: string }) => {
      const { error } = await supabase
        .from("wholesale_accounts")
        .update({ status: status as any })
        .eq("id", id);
      if (error) throw error;
      return { status, email, contactName, businessName };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["wholesale-accounts-shipping"] });
      toast.success("Account status updated");
      setSelectedAccount(null);

      if (data.status === "approved" || data.status === "rejected") {
        try {
          const { data: result, error } = await supabase.functions.invoke('send-wholesale-status-email', {
            body: {
              email: data.email,
              contactName: data.contactName,
              businessName: data.businessName,
              status: data.status,
            },
          });
          if (error) throw error;
          if (result?.success) {
            toast.success("Notification email sent");
          }
        } catch (emailError) {
          console.error("Failed to send status email:", emailError);
          toast.error("Status updated but failed to send notification email");
        }
      }
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Filter accounts
  const filteredAccounts = accounts?.filter((account) => {
    const matchesSearch =
      account.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || account.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses, contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Business</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Tier</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Applied</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading...
                </td>
              </tr>
            ) : filteredAccounts?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No accounts found
                </td>
              </tr>
            ) : (
              filteredAccounts?.map((account) => (
                <tr key={account.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3 font-medium">{account.business_name}</td>
                  <td className="px-4 py-3">{account.contact_name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {account.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("capitalize", statusColors[account.status || "pending"])}>
                      {account.status || "pending"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 capitalize">{account.tier || "standard"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {account.created_at
                      ? format(new Date(account.created_at), "MMM d, yyyy")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedAccount(account)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {account.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => updateStatus.mutate({ id: account.id, status: "approved" })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => updateStatus.mutate({ id: account.id, status: "rejected" })}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedAccount} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Wholesale Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedAccount.business_name}</h3>
                  <Badge className={cn("capitalize mt-1", statusColors[selectedAccount.status || "pending"])}>
                    {selectedAccount.status || "pending"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{selectedAccount.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tier</p>
                  <p className="font-medium capitalize">{selectedAccount.tier || "Standard"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAccount.email}</span>
                </div>
                {selectedAccount.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAccount.phone}</span>
                  </div>
                )}
                {selectedAccount.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAccount.address}</span>
                  </div>
                )}
              </div>

              {selectedAccount.shipping_address && (
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm font-medium mb-2">Shipping Address</p>
                  <p className="text-sm">
                    {selectedAccount.shipping_address.street}<br />
                    {selectedAccount.shipping_address.city}, {selectedAccount.shipping_address.state} {selectedAccount.shipping_address.zip}
                  </p>
                </div>
              )}

              {selectedAccount.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{selectedAccount.notes}</p>
                </div>
              )}

              {selectedAccount.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => updateStatus.mutate({ id: selectedAccount.id, status: "approved" })}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => updateStatus.mutate({ id: selectedAccount.id, status: "rejected" })}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
