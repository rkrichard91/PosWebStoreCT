# **Manual Técnico Integral: Sistema E-Commerce \+ POS \+ PC Builder**

**Versión:** 1.0 Final

**Fecha:** 28/01/2026

**Arquitectura:** Monolito Modular (Next.js \+ Supabase)

**Repositorio:** https://github.com/rkrichard91/PosWebStoreCT.git

## **1\. Stack Tecnológico y Lenguajes**

Definición estricta de las tecnologías a utilizar para garantizar consistencia y mantenibilidad.

### **1.1 Core**

* **Lenguaje Principal:** **TypeScript** (v5.x). *No se permite JavaScript plano.*  
* **Framework Frontend/Fullstack:** **Next.js 14+** (App Router).  
* **Motor de Base de Datos:** **PostgreSQL** (vía Supabase).  
* **Lenguaje de Base de Datos:** PL/pgSQL (para funciones y triggers).

### **1.2 Librerías y Herramientas**

* **Estilos:** **Tailwind CSS** (Utility-first).  
* **Componentes UI:** **Shadcn/UI** (Base Radix UI, accesibles y personalizables).  
* **Iconografía:** **Lucide React**.  
* **Estado Global:** **Zustand** (Ligero, ideal para el carrito y el Builder).  
* **Formularios:** **React Hook Form** \+ **Zod** (Validación de esquemas).  
* **Gráficos:** **Recharts**.  
* **Manejo de Fechas:** **date-fns**.  
* **Drag & Drop (Taller):** **@hello-pangea/dnd**.

## **2\. Sistema de Diseño (UI/UX)**

El diseño debe reflejar tecnología y confianza. Dado el nicho "Gamer/Hardware", se prioriza el modo oscuro pero con soporte claro para impresión en POS.

### **2.1 Paleta de Colores (Tailwind Config)**

* **Primary:** Indigo/Violeta (tech vibe) o Azul Corporativo.  
* **Background Web:** slate-950 (Oscuro profundo).  
* **Background POS:** slate-50 (Claro, alto contraste para evitar errores de lectura en mostrador).  
* **Alertas:**  
  * Rojo: Error de compatibilidad crítico (Socket diferente).  
  * Amarillo: Advertencia (Cuello de botella o fuente justa).  
  * Verde: Compatible / En Stock.

### **2.2 Tipografía**

* **Principal:** Inter o Geist Sans (Legibilidad en UI).  
* **Monospace:** JetBrains Mono (Para números de serie, SKUs y código).

## **3\. Estrategia de Repositorio y Git**

Estructura para trabajar en equipo sin conflictos.

### **3.1 Estándar de Ramas (Gitflow Simplificado)**

* main: Producción. Código intocable y estable.  
* develop: Integración. Aquí se unen las PRs.  
* feat/nombre-modulo: (ej. feat/pc-builder-engine) Para nuevas funciones.  
* fix/nombre-bug: (ej. fix/cart-calculation) Para errores.

### **3.2 Convención de Commits**

Se debe usar **Conventional Commits**:

* feat: Nueva característica.  
* fix: Corrección de error.  
* docs: Cambios en documentación.  
* style: Formato, puntos y comas (no lógica).  
* refactor: Cambios de código que no arreglan ni añaden (limpieza).

## **4\. Base de Datos (Supabase): Esquema SQL Completo**

Copia y ejecuta este script en el **SQL Editor** de Supabase para generar toda la infraestructura.

\-- 1\. TIPOS ENUMERADOS  
create type product\_category as enum ('laptop', 'cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'peripheral', 'monitor', 'service');  
create type repair\_status as enum ('received', 'diagnosing', 'waiting\_parts', 'approved', 'repaired', 'delivered');  
create type order\_origin as enum ('web', 'pos');

\-- 2\. TABLA DE PRODUCTOS (Inventario Unificado)  
create table products (  
  id uuid default gen\_random\_uuid() primary key,  
  sku text unique not null,  
  name text not null,  
  slug text unique not null,  
  description text,  
  category product\_category not null,  
  price\_public numeric(10,2) not null check (price\_public \>= 0),  
  price\_cash numeric(10,2) not null check (price\_cash \>= 0),  
  cost\_price numeric(10,2) not null default 0, \-- RLS Protegido  
  stock\_physical int default 0,  
  min\_stock\_alert int default 2,  
  image\_url text,  
  is\_active boolean default true,  
  specs jsonb default '{}'::jsonb, \-- Corazón del PC Builder  
  created\_at timestamptz default now(),  
  updated\_at timestamptz default now()  
);

\-- Índices para búsqueda rápida  
create index idx\_products\_category on products(category);  
create index idx\_products\_specs on products using gin (specs); \-- Búsqueda rápida dentro del JSON

\-- 3\. TABLA DE ÓRDENES (Ventas)  
create table orders (  
  id uuid default gen\_random\_uuid() primary key,  
  ticket\_number serial, \-- Número humano para el POS (Ticket \#1042)  
  customer\_id uuid references auth.users, \-- Null si es cliente anónimo  
  customer\_data jsonb, \-- { "name": "Juan", "rut": "123", "email": "..." }  
  total numeric(10,2) not null,  
  payment\_method text, \-- 'cash', 'card', 'transfer', 'mixed'  
  status text default 'completed',  
  origin order\_origin default 'web',  
  created\_by uuid references auth.users, \-- Vendedor que cerró la venta  
  created\_at timestamptz default now()  
);

\-- 4\. DETALLE DE ÓRDENES  
create table order\_items (  
  id uuid default gen\_random\_uuid() primary key,  
  order\_id uuid references orders(id) on delete cascade,  
  product\_id uuid references products(id),  
  quantity int not null,  
  unit\_price numeric(10,2) not null,  
  subtotal numeric(10,2) generated always as (quantity \* unit\_price) stored  
);

\-- 5\. TABLA DE REPARACIONES (Taller)  
create table repairs (  
  id uuid default gen\_random\_uuid() primary key,  
  ticket\_number serial,  
  customer\_name text not null,  
  customer\_contact text,  
  device\_model text,  
  serial\_number text,  
  issue\_reported text,  
  diagnosis text,  
  status repair\_status default 'received',  
  technician\_id uuid references auth.users,  
  evidence\_photos text\[\], \-- Array de URLs  
  cost\_service numeric(10,2) default 0,  
  cost\_parts numeric(10,2) default 0,  
  total numeric(10,2) generated always as (cost\_service \+ cost\_parts) stored,  
  created\_at timestamptz default now(),  
  updated\_at timestamptz default now()  
);

\-- 6\. SEGURIDAD (RLS)  
alter table products enable row level security;  
alter table orders enable row level security;

\-- Política: Cualquiera ve productos activos  
create policy "Public Active Products" on products  
  for select using (is\_active \= true);

\-- Política: Solo ADMIN ve costo real  
create policy "Admin View Costs" on products  
  for select using (  
    auth.jwt() \-\>\> 'role' \= 'admin'   
    OR   
    auth.jwt() \-\>\> 'role' \= 'superadmin'  
  );  
    
\-- Política: Solo ADMIN/VENDEDOR edita productos  
create policy "Staff Edit Products" on products  
  for all using (  
    auth.jwt() \-\>\> 'role' in ('admin', 'seller')  
  );

## **5\. Arquitectura Frontend (Estructura de Carpetas)**

Estructura diseñada para escalar.

/src  
 ├── /app  
 │    ├── (shop)               \# RUTAS PÚBLICAS  
 │    │    ├── /builder        \# Página del PC Builder  
 │    │    ├── /product/\[slug\] \# Detalle de producto  
 │    │    ├── /cart           \# Carrito y Checkout  
 │    │    └── page.tsx        \# Landing Page  
 │    │  
 │    ├── (admin)              \# RUTAS PRIVADAS (Layout Dashboard)  
 │    │    ├── /pos            \# Punto de Venta  
 │    │    ├── /inventory      \# CRUD Productos  
 │    │    ├── /taller         \# Kanban Taller  
 │    │    └── /settings       \# Usuarios y Config  
 │    │  
 │    ├── layout.tsx           \# Providers (Toast, Query, Auth)  
 │    └── globals.css          \# Tailwind  
 │  
 ├── /components  
 │    ├── /ui                  \# Shadcn (Button, Input, Card)  
 │    ├── /shop                \# ProductCard, BuilderSteps, Hero  
 │    ├── /admin               \# DataTable, Sidebar, POSCart  
 │    └── /shared              \# SearchBar, StatusBadge  
 │  
 ├── /lib  
 │    ├── supabase.ts          \# Cliente Singleton  
 │    ├── utils.ts             \# cn(), formatCurrency()  
 │    └── compatibility.ts     \# MOTOR LÓGICO PC BUILDER  
 │  
 ├── /store                    \# Estado Global (Zustand)  
 │    ├── cart-store.ts  
 │    └── builder-store.ts  
 │  
 ├── /types  
 │    └── database.types.ts    \# Generado por Supabase CLI

## **6\. Motor de Compatibilidad (Lógica Core)**

Este código va en /src/lib/compatibility.ts. Es el cerebro del PC Builder.

import { Product } from '@/types/database.types';

export interface CompatibilityIssue {  
  type: 'error' | 'warning';  
  message: string;  
  component: string;  
}

export function checkCompatibility(  
  cpu: Product | null,  
  mobo: Product | null,  
  ram: Product | null,  
  gpu: Product | null,  
  psu: Product | null  
): CompatibilityIssue\[\] {  
  const issues: CompatibilityIssue\[\] \= \[\];

  // 1\. REGLA: SOCKET (Crítica)  
  if (cpu && mobo) {  
    if (cpu.specs.socket \!== mobo.specs.socket) {  
      issues.push({  
        type: 'error',  
        message: \`Incompatible: El CPU es socket ${cpu.specs.socket} y la placa es ${mobo.specs.socket}.\`,  
        component: 'mobo'  
      });  
    }  
  }

  // 2\. REGLA: MEMORIA RAM (Crítica)  
  if (mobo && ram) {  
    if (mobo.specs.memory\_type \!== ram.specs.type) {  
      issues.push({  
        type: 'error',  
        message: \`Incompatible: La placa requiere memoria ${mobo.specs.memory\_type} pero seleccionaste ${ram.specs.type}.\`,  
        component: 'ram'  
      });  
    }  
  }

  // 3\. REGLA: ENERGÍA (Advertencia)  
  if (cpu && gpu && psu) {  
    const totalTDP \= (cpu.specs.tdp || 65\) \+ (gpu.specs.tdp || 0\) \+ 50; // \+50W margen base  
    const psuWattage \= psu.specs.watts || 0;  
      
    if (psuWattage \< totalTDP) {  
      issues.push({  
        type: 'warning',  
        message: \`Riesgo: El consumo estimado es ${totalTDP}W, tu fuente de ${psuWattage}W es insuficiente.\`,  
        component: 'psu'  
      });  
    }  
  }

  return issues;  
}

## **7\. Implementación del POS (Punto de Venta)**

Detalles específicos para la interfaz /admin/pos.

### **7.1 Lógica del Escáner de Barras**

Los lectores de barras USB emulan un teclado. Escriben el código muy rápido y presionan "Enter".

// Hook personalizado: useBarcodeScanner.ts  
import { useEffect, useState } from 'react';

export function useBarcodeScanner(onScan: (code: string) \=\> void) {  
  const \[buffer, setBuffer\] \= useState('');

  useEffect(() \=\> {  
    const handleKeyDown \= (e: KeyboardEvent) \=\> {  
      // Si el foco está en un input de texto normal, no interceptar  
      if ((e.target as HTMLElement).tagName \=== 'INPUT') return;

      if (e.key \=== 'Enter') {  
        if (buffer.length \> 3\) { // Filtrar Enters accidentales  
            onScan(buffer);  
            setBuffer('');  
        }  
      } else if (e.key.length \=== 1\) {  
        setBuffer((prev) \=\> prev \+ e.key);  
      }  
    };

    window.addEventListener('keydown', handleKeyDown);  
    return () \=\> window.removeEventListener('keydown', handleKeyDown);  
  }, \[buffer, onScan\]);  
}

### **7.2 Impresión Térmica**

No uses librerías complejas. Usa CSS Print Media.

1. Crea un componente \<ReceiptTicket data={order} /\>.  
2. En globals.css:  
   @media print {  
     body \* { visibility: hidden; }  
     \#ticket-area, \#ticket-area \* { visibility: visible; }  
     \#ticket-area { position: absolute; left: 0; top: 0; width: 80mm; }  
   }

3. Al cobrar: window.print().

## **8\. Seguridad y Despliegue**

### **8.1 Middleware (Next.js)**

Crear src/middleware.ts para proteger rutas administrativas.

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';  
import { NextResponse } from 'next/server';  
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {  
  const res \= NextResponse.next();  
  const supabase \= createMiddlewareClient({ req, res });  
  const { data: { session } } \= await supabase.auth.getSession();

  // Si intenta entrar a /admin y no hay sesión o no es staff  
  if (req.nextUrl.pathname.startsWith('/admin')) {  
    if (\!session) {  
      return NextResponse.redirect(new URL('/login', req.url));  
    }  
      
    // Verificar rol (esto requiere un custom claim o consulta a tabla profiles)  
    // const role \= session.user.app\_metadata.role;  
    // if (role \!== 'admin' && role \!== 'seller') ...  
  }

  return res;  
}

### **8.2 Despliegue**

1. **Repo:** Push a GitHub.  
2. **Hosting:** Conectar repositorio a **Vercel**.  
3. **Variables de Entorno en Vercel:**  
   * NEXT\_PUBLIC\_SUPABASE\_URL  
   * NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY  
   * SUPABASE\_SERVICE\_ROLE\_KEY (Solo si usas Edge Functions, cuidado).

## **9\. Flujo de Trabajo Recomendado**

1. **Día 1:** Inicializar Repo, Instalar Next.js \+ Tailwind \+ Shadcn. Configurar Supabase (Tablas SQL).  
2. **Día 2:** Crear Layouts (Público y Admin) y Autenticación (Login Page).  
3. **Día 3:** Módulo de Inventario (CRUD de Productos con subida de imágenes).  
4. **Día 4:** PC Builder Engine (Front público) y lógica de compatibilidad.  
5. **Día 5:** POS (Interfaz de venta rápida) y Carrito de compras.  
6. **Día 6:** Taller (Kanban) y Reportes.