
DROP POLICY "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO public
USING (
  (user_id = auth.uid())
  OR (auth.uid() IS NOT NULL AND customer_email = auth.email())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'staff'::app_role)
);
