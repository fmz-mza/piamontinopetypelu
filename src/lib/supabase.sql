"CREATE POLICY \"Allow authenticated users to insert supplier_transactions\" ON supplier_transactions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY \"Allow authenticated users to select supplier_transactions\" ON supplier_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY \"Allow authenticated users to update supplier_transactions\" ON supplier_transactions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY \"Allow authenticated users to delete supplier_transactions\" ON supplier_transactions
  FOR DELETE TO authenticated USING (true);

CREATE POLICY \"Allow authenticated users to insert purchase_items\" ON purchase_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY \"Allow authenticated users to select purchase_items\" ON purchase_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY \"Allow authenticated users to update purchase_items\" ON purchase_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY \"Allow authenticated users to delete purchase_items\" ON purchase_items
  FOR DELETE TO authenticated USING (true);"