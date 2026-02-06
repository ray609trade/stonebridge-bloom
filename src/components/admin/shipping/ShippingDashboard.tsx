import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Truck, 
  BarChart3, 
  Users,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShippingOverview } from "./ShippingOverview";
import { ShipmentsTab } from "./ShipmentsTab";
import { LabelsTab } from "./LabelsTab";
import { CarriersTab } from "./CarriersTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { LeadsTab } from "./LeadsTab";

export function ShippingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const handleQuickAction = (action: string) => {
    if (action === "labels") {
      setActiveTab("labels");
    } else if (action === "rates") {
      setActiveTab("labels");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Wholesale Shipping</h2>
          <p className="text-muted-foreground">
            Manage shipments, labels, carriers, and analytics
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4 hidden sm:block" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="shipments" className="gap-2">
            <Package className="h-4 w-4 hidden sm:block" />
            Shipments
          </TabsTrigger>
          <TabsTrigger value="labels" className="gap-2">
            <Tag className="h-4 w-4 hidden sm:block" />
            Labels
          </TabsTrigger>
          <TabsTrigger value="carriers" className="gap-2">
            <Truck className="h-4 w-4 hidden sm:block" />
            Carriers
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4 hidden sm:block" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <Users className="h-4 w-4 hidden sm:block" />
            Leads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ShippingOverview onQuickAction={handleQuickAction} />
        </TabsContent>

        <TabsContent value="shipments">
          <ShipmentsTab />
        </TabsContent>

        <TabsContent value="labels">
          <LabelsTab />
        </TabsContent>

        <TabsContent value="carriers">
          <CarriersTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="leads">
          <LeadsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
