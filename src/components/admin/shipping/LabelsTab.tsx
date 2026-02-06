import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Tag, DollarSign, Package, Printer, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Carrier {
  carrierId: string;
  carrierCode: string;
  name: string;
  accountNumber: string;
  primary: boolean;
}

interface Rate {
  serviceName: string;
  serviceCode: string;
  shipmentCost: number;
  otherCost: number;
  carrierCode: string;
  carrierNickname: string;
}

export function LabelsTab() {
  const [selectedCarrier, setSelectedCarrier] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [showRates, setShowRates] = useState(false);
  
  // Package details
  const [weight, setWeight] = useState("1");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("8");
  const [height, setHeight] = useState("6");
  
  // Ship to address
  const [shipToName, setShipToName] = useState("");
  const [shipToStreet, setShipToStreet] = useState("");
  const [shipToCity, setShipToCity] = useState("");
  const [shipToState, setShipToState] = useState("");
  const [shipToZip, setShipToZip] = useState("");

  // Fetch carriers
  const { data: carriers, isLoading: carriersLoading } = useQuery({
    queryKey: ["shipstation-carriers"],
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

  // Fetch warehouses for ship from
  const { data: warehouses } = useQuery({
    queryKey: ["shipstation-warehouses"],
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
          body: JSON.stringify({ action: 'listWarehouses' }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch warehouses");
      return response.json();
    },
  });

  // Get rates mutation
  const getRates = useMutation({
    mutationFn: async () => {
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
          body: JSON.stringify({
            action: 'getRates',
            data: {
              carrierCode: selectedCarrier || undefined,
              fromPostalCode: warehouses?.[0]?.originAddress?.postalCode || "10001",
              toState: shipToState,
              toCountry: "US",
              toPostalCode: shipToZip,
              toCity: shipToCity,
              weight: {
                value: parseFloat(weight),
                units: "ounces"
              },
              dimensions: {
                length: parseFloat(length),
                width: parseFloat(width),
                height: parseFloat(height),
                units: "inches"
              },
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get rates");
      return response.json() as Promise<Rate[]>;
    },
    onSuccess: () => {
      setShowRates(true);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Create label mutation
  const createLabel = useMutation({
    mutationFn: async () => {
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
          body: JSON.stringify({
            action: 'createLabel',
            data: {
              carrierCode: selectedCarrier,
              serviceCode: selectedService,
              packageCode: "package",
              confirmation: "none",
              shipDate: new Date().toISOString().split('T')[0],
              weight: {
                value: parseFloat(weight),
                units: "ounces"
              },
              dimensions: {
                length: parseFloat(length),
                width: parseFloat(width),
                height: parseFloat(height),
                units: "inches"
              },
              shipFrom: warehouses?.[0]?.originAddress || {},
              shipTo: {
                name: shipToName,
                street1: shipToStreet,
                city: shipToCity,
                state: shipToState,
                postalCode: shipToZip,
                country: "US",
              },
            },
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create label");
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Label created successfully!");
      if (data.labelData) {
        // Open label PDF in new window
        const win = window.open();
        if (win) {
          win.document.write(`<iframe src="data:application/pdf;base64,${data.labelData}" width="100%" height="100%"></iframe>`);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Label Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Create Shipping Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ship To Address */}
          <div className="space-y-3">
            <h4 className="font-medium">Ship To</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input
                  value={shipToName}
                  onChange={(e) => setShipToName(e.target.value)}
                  placeholder="Recipient name"
                />
              </div>
              <div className="col-span-2">
                <Label>Street Address</Label>
                <Input
                  value={shipToStreet}
                  onChange={(e) => setShipToStreet(e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={shipToCity}
                  onChange={(e) => setShipToCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={shipToState}
                  onChange={(e) => setShipToState(e.target.value)}
                  placeholder="State"
                  maxLength={2}
                />
              </div>
              <div className="col-span-2">
                <Label>ZIP Code</Label>
                <Input
                  value={shipToZip}
                  onChange={(e) => setShipToZip(e.target.value)}
                  placeholder="ZIP code"
                />
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-3">
            <h4 className="font-medium">Package Details</h4>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label>Weight (oz)</Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div>
                <Label>Length</Label>
                <Input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
              </div>
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Carrier Selection */}
          <div className="space-y-3">
            <h4 className="font-medium">Carrier</h4>
            <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Select carrier" />
              </SelectTrigger>
              <SelectContent>
                {carriersLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  carriers?.map((carrier) => (
                    <SelectItem key={carrier.carrierId} value={carrier.carrierCode}>
                      {carrier.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => getRates.mutate()}
              disabled={!shipToZip || getRates.isPending}
              variant="outline"
              className="flex-1"
            >
              {getRates.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              Get Rates
            </Button>
            <Button
              onClick={() => createLabel.mutate()}
              disabled={!selectedCarrier || !selectedService || createLabel.isPending}
              className="flex-1"
            >
              {createLabel.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              Create Label
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rate Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Rate Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getRates.isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : getRates.data && getRates.data.length > 0 ? (
            <div className="space-y-3">
              {getRates.data.map((rate, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedCarrier(rate.carrierCode);
                    setSelectedService(rate.serviceCode);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedService === rate.serviceCode
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rate.serviceName}</p>
                      <p className="text-sm text-muted-foreground">
                        {rate.carrierNickname}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        ${(rate.shipmentCost + rate.otherCost).toFixed(2)}
                      </p>
                      {selectedService === rate.serviceCode && (
                        <Badge className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Enter shipping details and click "Get Rates" to compare carrier prices
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
