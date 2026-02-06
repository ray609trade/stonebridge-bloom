-- Create shipping_analytics table for caching shipping metrics
CREATE TABLE public.shipping_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_shipments INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  by_carrier JSONB DEFAULT '{}',
  by_state JSONB DEFAULT '{}',
  by_city JSONB DEFAULT '{}',
  on_time_count INTEGER DEFAULT 0,
  late_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can manage shipping analytics
CREATE POLICY "Admins can manage shipping analytics"
ON public.shipping_analytics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for period queries
CREATE INDEX idx_shipping_analytics_period ON public.shipping_analytics(period_start, period_end);