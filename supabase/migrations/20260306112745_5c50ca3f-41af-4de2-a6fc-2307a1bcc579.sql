
CREATE OR REPLACE FUNCTION public.recalculate_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  item jsonb;
  product_record RECORD;
  calculated_subtotal numeric := 0;
  item_price numeric;
  item_qty integer;
BEGIN
  -- Loop through each item in the order's items JSONB array
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    item_qty := COALESCE((item->>'quantity')::integer, 1);

    -- Look up the current price from the products table
    SELECT retail_price, wholesale_price
    INTO product_record
    FROM public.products
    WHERE id = (item->>'productId')::uuid;

    IF product_record IS NOT NULL THEN
      -- Use wholesale price for wholesale orders, retail price for retail
      IF NEW.order_type = 'wholesale' THEN
        item_price := COALESCE(product_record.wholesale_price, product_record.retail_price);
      ELSE
        item_price := product_record.retail_price;
      END IF;
    ELSE
      -- Fallback to client-provided price if product not found
      item_price := COALESCE((item->>'unitPrice')::numeric, 0);
    END IF;

    calculated_subtotal := calculated_subtotal + (item_price * item_qty);
  END LOOP;

  -- Set server-calculated values
  NEW.subtotal := calculated_subtotal;

  -- Tax: 8% for retail, 0 for wholesale
  IF NEW.order_type = 'retail' THEN
    NEW.tax := ROUND(calculated_subtotal * 0.08, 2);
  ELSE
    NEW.tax := 0;
  END IF;

  NEW.total := NEW.subtotal + NEW.tax;

  RETURN NEW;
END;
$$;

-- Create trigger on INSERT
CREATE TRIGGER trg_recalculate_order_totals
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_order_totals();
