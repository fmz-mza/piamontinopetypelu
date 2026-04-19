-- Tabla de Productos
CREATE TABLE products (
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

-- Tabla de Clientes (Cuentas Corrientes)
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Ventas
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  total DECIMAL(12,2) NOT NULL,
  items JSONB NOT NULL,
  payment_method TEXT NOT NULL, -- 'efectivo', 'tarjeta', 'cuenta_corriente'
  customer_id UUID REFERENCES customers(id)
);

-- Tabla de Gastos
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'fija', 'variable'
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Contenido de la Landing Page
CREATE TABLE landing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section, key)
);

-- Tabla de Reseñas
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  time TEXT,
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  img TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar contenido inicial para la landing
INSERT INTO landing_content (section, key, value) VALUES
('hero', 'title', 'Cuidado con alma y estilo.'),
('hero', 'subtitle', 'Tu mascota feliz, tu casa radiante. En Piamontino encontrás el equilibrio perfecto: nutrición, accesorios y peluquería de primer nivel.'),
('hero', 'cta_text', 'Ver Servicios'),
('services', 'title', 'Más que una tienda, un estilo de vida.'),
('services', 'subtitle', 'Diseñamos experiencias únicas para que la convivencia con tu mascota sea perfecta.'),
('products', 'title', 'Nuestra Tienda'),
('products', 'subtitle', 'Los favoritos de la comunidad para este mes.'),
('about', 'title', 'Pasión por lo que hacemos.'),
('about', 'description', 'En Piamontino, entendemos que tu mascota es parte de tu familia. Por eso, dedicamos cada día a brindar un servicio de excelencia.');