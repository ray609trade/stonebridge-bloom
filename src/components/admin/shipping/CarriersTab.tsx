import { useQuery } from "@tanstack/react-query";
import { Truck, CheckCircle, XCircle, Loader2, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Carrier {
  carrierId: string;
  carrierCode: string;
  name: string;
  accountNumber: string;
  primary: boolean;
  requiresFundedAccount: boolean;
  balance: number;
  nickname: string;
  shippingProviderId: number;
}

interface CarrierService {
  carrierCode: string;
  code: string;
  name: string;
  domestic: boolean;
  international: boolean;
}

export function CarriersTab() {
  // Fetch carriers
  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ["shipstation-carriers-full"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shipstation-api`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ action: 'listCarriers' }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch carriers");
      return response.json() as Promise<Carrier[]>;
    },
  });

  // Fetch services for each carrier
  const { data: allServices } = useQuery({
    queryKey: ["shipstation-all-services", carriers],
    queryFn: async () => {
      if (!carriers || carriers.length === 0) return {};
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const servicesMap: Record<string, CarrierService[]> = {};
      
      for (const carrier of carriers) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shipstation-api`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                action: 'getCarrierServices',
                data: { carrierId: carrier.carrierCode },
              }),
            }
          );

          if (response.ok) {
            servicesMap[carrier.carrierCode] = await response.json();
          }
        } catch (e) {
          console.error(`Failed to fetch services for ${carrier.carrierCode}`, e);
        }
      }
      
      return servicesMap;
    },
    enabled: !!carriers && carriers.length > 0,
  });

  if (carriersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!carriers || carriers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Truck className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No carriers connected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Connect carriers in your ShipStation account
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carrier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {carriers.map((carrier) => (
          <Card key={carrier.carrierId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{carrier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {carrier.nickname || carrier.carrierCode}
                    </p>
                  </div>
                </div>
                {carrier.primary && (
                  <Badge>Primary</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Account #</p>
                  <p className="font-medium">{carrier.accountNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className="font-medium">
                    {carrier.requiresFundedAccount
                      ? `$${carrier.balance?.toFixed(2) || "0.00"}`
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Connected</span>
                </div>
              </div>

              {/* Services */}
              {allServices?.[carrier.carrierCode] && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Available Services ({allServices[carrier.carrierCode].length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {allServices[carrier.carrierCode].slice(0, 5).map((service) => (
                      <Badge key={service.code} variant="secondary" className="text-xs">
                        {service.name}
                      </Badge>
                    ))}
                    {allServices[carrier.carrierCode].length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{allServices[carrier.carrierCode].length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="h-5 w-5" />
            Service Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Carrier</th>
                  <th className="px-4 py-3 text-left font-medium">Service</th>
                  <th className="px-4 py-3 text-left font-medium">Domestic</th>
                  <th className="px-4 py-3 text-left font-medium">International</th>
                </tr>
              </thead>
              <tbody>
                {carriers.map((carrier) =>
                  allServices?.[carrier.carrierCode]?.map((service, idx) => (
                    <tr
                      key={`${carrier.carrierCode}-${service.code}`}
                      className="border-b border-border last:border-0"
                    >
                      {idx === 0 && (
                        <td
                          className="px-4 py-3 font-medium"
                          rowSpan={allServices[carrier.carrierCode].length}
                        >
                          {carrier.name}
                        </td>
                      )}
                      <td className="px-4 py-3">{service.name}</td>
                      <td className="px-4 py-3">
                        {service.domestic ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {service.international ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
