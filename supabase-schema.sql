-- 1. Crear Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  ean TEXT,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Crear Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Crear Tabla de Ventas
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  total DECIMAL(12,2) NOT NULL,
  items JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id)
);

-- 4. Crear Tabla de Gastos
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Crear Tabla de Contenido
CREATE TABLE IF NOT EXISTS landing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, key)
);

-- 6. Crear Tabla de Reseñas
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  time TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  img TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Insertar contenido inicial
INSERT INTO landing_content (section, key, value) 
VALUES
  ('hero', 'title', 'Cuidado con alma y estilo.'),
  ('hero', 'subtitle', 'Tu mascota feliz, tu casa radiante. En Piamontino encontrás el equilibrio perfecto.'),
  ('hero', 'cta_text', 'Ver Servicios'),
  ('services', 'title', 'Más que una tienda, un estilo de vida.'),
  ('services', 'subtitle', 'Diseñamos experiencias únicas para tu mascota.'),
  ('products', 'title', 'Nuestra Tienda'),
  ('products', 'subtitle', 'Los favoritos de la comunidad.'),
  ('about', 'title', 'Pasión por lo que hacemos.'),
  ('about', 'description', 'En Piamontino, dedicamos cada día a brindar un servicio de excelencia.')
ON CONFLICT (section, key) DO NOTHING;