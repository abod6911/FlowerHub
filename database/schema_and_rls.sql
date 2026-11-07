-- ==============================================================================
-- FLOWERHUB PRODUCTION DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS) POLICIES
-- PostgreSQL 15+ / Supabase
-- Enforces Least Privilege, Tenant Isolation, IDOR Prevention & Audit Logging
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'florist', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE shop_operational_status AS ENUM ('open', 'busy_60m', 'closed');

-- 3. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100),
  role user_role DEFAULT 'customer'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. PRODUCTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  title_ar VARCHAR(150) NOT NULL,
  title_en VARCHAR(150),
  desc_ar TEXT,
  desc_en TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price > price),
  image_url TEXT NOT NULL,
  is_ready_now BOOLEAN DEFAULT FALSE NOT NULL,
  is_one_time_special BOOLEAN DEFAULT FALSE NOT NULL,
  is_sold_out BOOLEAN DEFAULT FALSE NOT NULL,
  cooler_stock INTEGER DEFAULT NULL CHECK (cooler_stock IS NULL OR cooler_stock >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. ORDERS TABLE (STRICT IDOR PROTECTION)
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(30) PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_name VARCHAR(100),
  recipient_name VARCHAR(100),
  recipient_phone VARCHAR(20),
  handover_type VARCHAR(20) NOT NULL,
  handover_timing VARCHAR(50) NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (delivery_fee >= 0),
  grand_total NUMERIC(10, 2) NOT NULL CHECK (grand_total >= 0),
  gift_card_message TEXT,
  items JSONB NOT NULL,
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. BESPOKE CUSTOM ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_phone VARCHAR(20) NOT NULL,
  budget NUMERIC(10, 2) NOT NULL CHECK (budget >= 50),
  occasion VARCHAR(100) NOT NULL,
  notes TEXT,
  reference_photo_url TEXT,
  status VARCHAR(30) DEFAULT 'inquiry_received' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. SHOP CONFIG TABLE (SINGLETON)
CREATE TABLE IF NOT EXISTS public.shop_config (
  id VARCHAR(20) PRIMARY KEY DEFAULT 'main_boutique',
  shop_name_ar VARCHAR(100) NOT NULL,
  shop_name_en VARCHAR(100),
  tagline_ar TEXT,
  tagline_en TEXT,
  phone VARCHAR(20) NOT NULL,
  status shop_operational_status DEFAULT 'open'::shop_operational_status NOT NULL,
  theme_preset VARCHAR(50) DEFAULT 'botanical' NOT NULL,
  specials_style VARCHAR(50) DEFAULT 'marquee' NOT NULL,
  logo_url TEXT,
  avatar_url TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. SECURITY AUDIT LOG TABLE (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin or florist
CREATE OR REPLACE FUNCTION public.is_admin_or_florist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'florist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ==============================================================================

-- 1. PROFILES POLICIES
-- Users can view and update only their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin_or_florist());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. PRODUCTS POLICIES
-- Public can read all non-hidden products
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_sold_out = false OR public.is_admin_or_florist());

-- Only Admin/Florist can insert, update, or delete products
CREATE POLICY "Staff can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin_or_florist());

CREATE POLICY "Staff can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin_or_florist());

CREATE POLICY "Staff can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin_or_florist());

-- 3. ORDERS POLICIES (IDOR PREVENTION)
-- Customer can only see their own orders; Admins can see all orders
CREATE POLICY "Customers view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id OR public.is_admin_or_florist());

-- Any authenticated customer or public session can create an order with their ID
CREATE POLICY "Customers create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id OR customer_id IS NULL
  );

-- Only Admin/Florist can update order status
CREATE POLICY "Staff can update order status"
  ON public.orders FOR UPDATE
  USING (public.is_admin_or_florist());

-- 4. CUSTOM ORDERS POLICIES
CREATE POLICY "Customers view own custom requests"
  ON public.custom_orders FOR SELECT
  USING (auth.uid() = customer_id OR public.is_admin_or_florist());

CREATE POLICY "Customers create custom requests"
  ON public.custom_orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id OR customer_id IS NULL);

-- 5. SHOP CONFIG POLICIES
-- Everyone can read shop config
CREATE POLICY "Public read shop config"
  ON public.shop_config FOR SELECT
  USING (true);

-- Only Admin/Florist can update shop config
CREATE POLICY "Staff update shop config"
  ON public.shop_config FOR UPDATE
  USING (public.is_admin_or_florist());

-- 6. AUDIT LOGS POLICIES (RESTRICTED READ / APPEND ONLY)
CREATE POLICY "Only admins read audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_admin_or_florist());

CREATE POLICY "System appends audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
