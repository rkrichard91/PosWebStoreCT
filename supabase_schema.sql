-- 1. TIPOS ENUMERADOS
create type product_category as enum ('laptop', 'cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'peripheral', 'monitor', 'service');
create type repair_status as enum ('received', 'diagnosing', 'waiting_parts', 'approved', 'repaired', 'delivered');
create type order_origin as enum ('web', 'pos');

-- 2. TABLA DE PRODUCTOS (Inventario Unificado)
create table products (
  id uuid default gen_random_uuid() primary key,
  sku text unique not null,
  name text not null,
  slug text unique not null,
  description text,
  category product_category not null,
  price_public numeric(10,2) not null check (price_public >= 0),
  price_cash numeric(10,2) not null check (price_cash >= 0),
  cost_price numeric(10,2) not null default 0, -- RLS Protegido
  stock_physical int default 0,
  min_stock_alert int default 2,
  image_url text,
  is_active boolean default true,
  specs jsonb default '{}'::jsonb, -- Corazón del PC Builder
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para búsqueda rápida
create index idx_products_category on products(category);
create index idx_products_specs on products using gin (specs); -- Búsqueda rápida dentro del JSON

-- 3. TABLA DE ÓRDENES (Ventas)
create table orders (
  id uuid default gen_random_uuid() primary key,
  ticket_number serial, -- Número humano para el POS (Ticket #1042)
  customer_id uuid references auth.users, -- Null si es cliente anónimo
  customer_data jsonb, -- { "name": "Juan", "rut": "123", "email": "..." }
  total numeric(10,2) not null,
  payment_method text, -- 'cash', 'card', 'transfer', 'mixed'
  status text default 'completed',
  origin order_origin default 'web',
  created_by uuid references auth.users, -- Vendedor que cerró la venta
  created_at timestamptz default now()
);

-- 4. DETALLE DE ÓRDENES
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity int not null,
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) generated always as (quantity * unit_price) stored
);

-- 5. TABLA DE REPARACIONES (Taller)
create table repairs (
  id uuid default gen_random_uuid() primary key,
  ticket_number serial,
  customer_name text not null,
  customer_contact text,
  device_model text,
  serial_number text,
  issue_reported text,
  diagnosis text,
  status repair_status default 'received',
  technician_id uuid references auth.users,
  evidence_photos text[], -- Array de URLs
  cost_service numeric(10,2) default 0,
  cost_parts numeric(10,2) default 0,
  total numeric(10,2) generated always as (cost_service + cost_parts) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. SEGURIDAD (RLS)
alter table products enable row level security;
alter table orders enable row level security;

-- Política: Cualquiera ve productos activos
create policy "Public Active Products" on products
  for select using (is_active = true);

-- Política: Solo ADMIN ve costo real
create policy "Admin View Costs" on products
  for select using (
    auth.jwt() ->> 'role' = 'admin' 
    OR 
    auth.jwt() ->> 'role' = 'superadmin'
  );
    
-- Política: Solo ADMIN/VENDEDOR edita productos
-- Política: Solo ADMIN/VENDEDOR edita productos
create policy "Staff Edit Products" on products
  for all using (
    auth.jwt() ->> 'role' in ('admin', 'seller')
  );

-- POLÍTICAS FALTANTES (Agregadas para POS y Taller)
-- Orders: Permitir crear órdenes (cualquier autenticado o anónimo si se configura, aqui asumimos auth o public para POS)
create policy "Enable insert for authenticated users only" on orders for insert to authenticated with check (true);
create policy "Enable select for users based on user_id" on orders for select using (auth.uid() = customer_id);

-- Order Items
alter table order_items enable row level security;
create policy "Enable insert for authenticated users only" on order_items for insert to authenticated with check (true);
create policy "Enable read access for all users" on order_items for select using (true);

-- Repairs
alter table repairs enable row level security;
create policy "Enable read access for all users" on repairs for select using (true);
create policy "Enable insert for authenticated users only" on repairs for insert to authenticated with check (true);
create policy "Enable update for technicians" on repairs for update using (auth.jwt() ->> 'role' in ('admin', 'technician'));

-- 7. STORAGE (Ejecutar esto si se tiene permisos de superadmin o hacerlo desde UI)
-- Insertar bucket 'products' si no existe (requiere extensión storage)
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;

-- Políticas de Storage
create policy "Public Access" on storage.objects for select using ( bucket_id = 'products' );
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Auth Delete" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );
