-- Add ShipStation integration fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipstation_order_id text,
ADD COLUMN IF NOT EXISTS tracking_number text,
ADD COLUMN IF NOT EXISTS carrier_code text,
ADD COLUMN IF NOT EXISTS shipped_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ship_to_address jsonb;

-- Create index for ShipStation order lookups
CREATE INDEX IF NOT EXISTS idx_orders_shipstation_order_id ON public.orders(shipstation_order_id) WHERE shipstation_order_id IS NOT NULL;

-- Add shipping address to wholesale accounts for default shipping
ALTER TABLE public.wholesale_accounts
ADD COLUMN IF NOT EXISTS shipping_address jsonb;