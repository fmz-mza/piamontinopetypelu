-- Supabase Database Schema for Piamontino Pet & Peluquería

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  ean TEXT UNIQUE,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  customer_id UUID REFERENCES customers(id),
  payment_method TEXT DEFAULT 'efectivo',
  status TEXT DEFAULT 'completada'
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('fija', 'variable')),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landing content table
CREATE TABLE IF NOT EXISTS landing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(section, key)
);

-- Customers table (Cuentas Corrientes)
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust as needed)
CREATE POLICY "Allow public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON landing_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON customers FOR SELECT USING (true);

-- Insert default landing content
INSERT INTO landing_content (section, key, value) VALUES
  ('hero', 'title', 'Cuidado con alma y estilo.'),
  ('hero', 'subtitle', 'Tu mascota feliz, tu casa radiante. En Piamontino encontrás el equilibrio perfecto: nutrición, accesorios y peluquería de primer nivel, junto a una selección exclusiva de artículos de limpieza.'),
  ('hero', 'cta_text', 'Ver Servicios'),
  ('services', 'title', 'Más que una tienda, un estilo de vida.'),
  ('services', 'subtitle', 'Diseñamos experiencias únicas para que la convivencia con tu mascota sea perfecta.'),
  ('products', 'title', 'Nuestra Tienda'),
  ('products', 'subtitle', 'Los favoritos de la comunidad para este mes.')
ON CONFLICT (section, key) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, price, cost, stock, category, image_url) VALUES
  ('Alimento Premium Adulto', 45.00, 30.00, 50, 'Comida', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400'),
  ('Arnés de Cuero Ajustable', 28.50, 15.00, 20, 'Accesorios', 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=400'),
  ('Limpiador Enzimático', 15.90, 8.00, 35, 'Limpieza', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400'),
  ('Juguete Interactivo', 12.00, 5.00, 40, 'Accesorios', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400')
ON CONFLICT DO NOTHING;