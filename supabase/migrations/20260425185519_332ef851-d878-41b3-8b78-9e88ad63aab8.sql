
CREATE OR REPLACE FUNCTION public.lookup_guest_order(
  p_order_number text,
  p_email text
)
RETURNS TABLE (
  id uuid,
  order_number text,
  status order_status,
  customer_name text,
  customer_email text,
  customer_phone text,
  pickup_type text,
  scheduled_time timestamptz,
  notes text,
  items jsonb,
  subtotal numeric,
  tax numeric,
  total numeric,
  payment_method text,
  payment_status text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_order_number IS NULL OR p_email IS NULL
     OR length(trim(p_order_number)) = 0
     OR length(trim(p_email)) = 0 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.order_number,
    o.status,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.pickup_type,
    o.scheduled_time,
    o.notes,
    o.items,
    o.subtotal,
    o.tax,
    o.total,
    o.payment_method,
    o.payment_status,
    o.created_at
  FROM public.orders o
  WHERE upper(trim(o.order_number)) = upper(trim(p_order_number))
    AND lower(trim(o.customer_email)) = lower(trim(p_email))
    AND o.order_type = 'retail'::order_type
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_guest_order(text, text) TO anon, authenticated;
