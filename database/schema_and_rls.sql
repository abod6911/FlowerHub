-- ==============================================================================
-- FLOWERHUB MULTI-TENANT PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- PostgreSQL 15+ / Supabase
-- Enforces Strict Tenant Isolation, RBAC, IDOR Prevention & Append-Only Auditing
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'florist', 'admin', 'super_admin');
CREATE TYPE store_member_role AS ENUM ('owner', 'manager', 'florist', 'cashier');
CREATE TYPE store_account_status AS ENUM ('active', 'suspended', 'pending_setup');
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

-- 4. STORES / MULTI-TENANT BOUTIQUES TABLE
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(64) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$'),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
  shop_name_ar VARCHAR(120) NOT NULL,
  shop_name_en VARCHAR(120) NOT NULL,
  tagline_ar TEXT,
  tagline_en TEXT,
  whatsapp VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(160),
  city VARCHAR(80),
  district VARCHAR(80),
  working_hours VARCHAR(120),
  delivery_fee NUMERIC(10, 2) DEFAULT 25.00 NOT NULL CHECK (delivery_fee >= 0),
  min_order_free_delivery NUMERIC(10, 2) DEFAULT 300.00 NOT NULL CHECK (min_order_free_delivery >= 0),
  cr_number VARCHAR(30),
  vat_number VARCHAR(30),
  google_maps_url TEXT,
  instagram_url TEXT,
  logo_url TEXT,
  theme_preset VARCHAR(50) DEFAULT 'botanical' NOT NULL,
  hero_style VARCHAR(50) DEFAULT 'qlub' NOT NULL,
  default_language VARCHAR(5) DEFAULT 'ar' NOT NULL CHECK (default_language IN ('ar', 'en')),
  status shop_operational_status DEFAULT 'open'::shop_operational_status NOT NULL,
  account_status store_account_status DEFAULT 'active'::store_account_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. STORE TEAM / RBAC MEMBERSHIP TABLE
CREATE TABLE IF NOT EXISTS public.store_members (
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role store_member_role DEFAULT 'owner'::store_member_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (store_id, user_id)
);

-- 6. PRODUCTS CATALOG TABLE (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR(50) PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
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

-- 7. ORDERS TABLE (TENANT-SCOPED & STRICT IDOR PROTECTION)
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(30) PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
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

-- 8. BESPOKE CUSTOM ORDERS TABLE (TENANT-SCOPED)
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_phone VARCHAR(20) NOT NULL,
  budget NUMERIC(10, 2) NOT NULL CHECK (budget >= 50),
  occasion VARCHAR(100) NOT NULL,
  notes TEXT,
  reference_photo_url TEXT,
  status VARCHAR(30) DEFAULT 'inquiry_received' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. SHOP CONFIG EXTENSIONS TABLE (PER-STORE SETTINGS)
CREATE TABLE IF NOT EXISTS public.shop_config (
  store_id UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  specials_style VARCHAR(50) DEFAULT 'marquee' NOT NULL,
  theme_config JSONB DEFAULT '{}'::jsonb NOT NULL,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. SECURITY AUDIT LOG TABLE (APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_store_members_user_id ON public.store_members(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON public.orders(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_store_id ON public.custom_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_store_created ON public.audit_logs(store_id, created_at DESC);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security-hardened RBAC helper functions with fixed search_path
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_store_staff(target_store_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_platform_admin() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.store_id = target_store_id
      AND sm.user_id = (SELECT auth.uid())
      AND sm.role IN ('owner', 'manager', 'florist', 'cashier')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.is_store_owner_or_manager(target_store_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_platform_admin() THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.store_members sm
    WHERE sm.store_id = target_store_id
      AND sm.user_id = (SELECT auth.uid())
      AND sm.role IN ('owner', 'manager')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ==============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ==============================================================================

-- 1. PROFILES POLICIES
CREATE POLICY "Users read own profile or platform admin"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id OR public.is_platform_admin());

CREATE POLICY "Users update own non-privileged profile fields"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );

-- 2. STORES POLICIES
CREATE POLICY "Public view active stores or staff view own store"
  ON public.stores FOR SELECT
  USING (
    account_status = 'active'
    OR public.is_store_staff(id)
    OR public.is_platform_admin()
  );

CREATE POLICY "Platform admins provision stores"
  ON public.stores FOR INSERT
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "Store owners or platform admins update store"
  ON public.stores FOR UPDATE
  USING (public.is_store_owner_or_manager(id))
  WITH CHECK (public.is_store_owner_or_manager(id));

CREATE POLICY "Only platform admins delete stores"
  ON public.stores FOR DELETE
  USING (public.is_platform_admin());

-- 3. STORE MEMBERS POLICIES
CREATE POLICY "Store staff or admins view memberships"
  ON public.store_members FOR SELECT
  USING ((SELECT auth.uid()) = user_id OR public.is_store_owner_or_manager(store_id));

CREATE POLICY "Store owners or platform admins manage memberships"
  ON public.store_members FOR ALL
  USING (public.is_store_owner_or_manager(store_id))
  WITH CHECK (public.is_store_owner_or_manager(store_id));

-- 4. PRODUCTS POLICIES (TENANT ISOLATED)
CREATE POLICY "Public view available products of active stores"
  ON public.products FOR SELECT
  USING (
    (
      is_sold_out = false
      AND EXISTS (
        SELECT 1 FROM public.stores s
        WHERE s.id = products.store_id AND s.account_status = 'active'
      )
    )
    OR public.is_store_staff(store_id)
  );

CREATE POLICY "Store staff manage own store products"
  ON public.products FOR ALL
  USING (public.is_store_staff(store_id))
  WITH CHECK (public.is_store_staff(store_id));

-- 5. ORDERS POLICIES (STRICT TENANT ISOLATION + IDOR PREVENTION)
CREATE POLICY "Customers view own orders; staff view store orders"
  ON public.orders FOR SELECT
  USING (
    ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = customer_id)
    OR public.is_store_staff(store_id)
  );

CREATE POLICY "Customers create orders for active stores"
  ON public.orders FOR INSERT
  WITH CHECK (
    (customer_id IS NULL OR customer_id = (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = orders.store_id AND s.account_status = 'active'
    )
  );

CREATE POLICY "Store staff update own store orders"
  ON public.orders FOR UPDATE
  USING (public.is_store_staff(store_id))
  WITH CHECK (public.is_store_staff(store_id));

-- 6. CUSTOM ORDERS POLICIES
CREATE POLICY "Customers view own custom orders; staff view store custom orders"
  ON public.custom_orders FOR SELECT
  USING (
    ((SELECT auth.uid()) IS NOT NULL AND (SELECT auth.uid()) = customer_id)
    OR public.is_store_staff(store_id)
  );

CREATE POLICY "Customers submit custom orders for active stores"
  ON public.custom_orders FOR INSERT
  WITH CHECK (
    (customer_id IS NULL OR customer_id = (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = custom_orders.store_id AND s.account_status = 'active'
    )
  );

-- 7. SHOP CONFIG POLICIES
CREATE POLICY "Public read active shop config"
  ON public.shop_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s
      WHERE s.id = shop_config.store_id AND s.account_status = 'active'
    )
    OR public.is_store_staff(store_id)
  );

CREATE POLICY "Store staff update own shop config"
  ON public.shop_config FOR ALL
  USING (public.is_store_staff(store_id))
  WITH CHECK (public.is_store_staff(store_id));

-- 8. AUDIT LOGS POLICIES (RESTRICTED READ / AUTHENTICATED APPEND ONLY)
CREATE POLICY "Admins and store owners read scoped audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    public.is_platform_admin()
    OR (store_id IS NOT NULL AND public.is_store_owner_or_manager(store_id))
  );

CREATE POLICY "Authenticated users append own audit trail"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) IS NOT NULL
    AND (actor_id IS NULL OR actor_id = (SELECT auth.uid()))
  );
