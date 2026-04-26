-- Enable RLS on supplier_transactions
ALTER TABLE public.supplier_transactions ENABLE ROW LEVEL SECURITY;

-- Create public access policies for supplier_transactions
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.supplier_transactions;
DROP POLICY IF EXISTS "Public Access" ON public.supplier_transactions;
CREATE POLICY "Public Access" ON public.supplier_transactions
FOR ALL USING (true) WITH CHECK (true);

-- Enable RLS on purchase_items
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Create public access policies for purchase_items
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.purchase_items;
DROP POLICY IF EXISTS "Public Access" ON public.purchase_items;
CREATE POLICY "Public Access" ON public.purchase_items
FOR ALL USING (true) WITH CHECK (true);

-- Create customer_payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customer_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on customer_payments
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Create public access policies for customer_payments
DROP POLICY IF EXISTS "Public Access" ON public.customer_payments;
CREATE POLICY "Public Access" ON public.customer_payments
FOR ALL USING (true) WITH CHECK (true);