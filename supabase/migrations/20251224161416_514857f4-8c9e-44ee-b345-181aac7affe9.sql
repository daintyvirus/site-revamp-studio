-- Fix: Payment methods should only be visible to authenticated users
DROP POLICY IF EXISTS "Active payment methods are viewable by everyone" ON public.payment_methods;

CREATE POLICY "Authenticated users can view active payment methods"
ON public.payment_methods
FOR SELECT
TO authenticated
USING (is_active = true);