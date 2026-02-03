# 🖥️ Center Tecno - Sistema E-Commerce + POS + Taller

Sistema integral para tienda de tecnología con funcionalidades de e-commerce, punto de venta (POS), gestión de inventario, PC Builder y taller de reparaciones.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)

## 🚀 Características Principales

### 🛒 E-Commerce (Tienda Web)
- Catálogo de productos con filtros por categoría
- Carrito de compras persistente
- Checkout integrado
- Diseño responsivo y atractivo

### 🔧 PC Builder
- Armador de computadoras interactivo
- Motor de compatibilidad de componentes
- Validación de socket CPU/Motherboard
- Verificación de potencia PSU

### 💰 Punto de Venta (POS)
- Interfaz optimizada para ventas rápidas
- Soporte para lector de código de barras
- Impresión de tickets térmicos
- Gestión de pagos múltiples

### 📦 Gestión de Inventario
- CRUD completo de productos
- Control de stock con alertas de mínimo
- Especificaciones técnicas por categoría
- Subida de imágenes

### 🔨 Taller de Reparaciones
- Sistema kanban para seguimiento
- Historial de reparaciones
- Fotos de evidencia
- Consulta pública de estado

### 📊 Cotizaciones
- Generación de cotizaciones para clientes
- Items manuales o desde catálogo
- Vista interna (costos) vs cliente
- Impresión de cotizaciones

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 16** | Framework fullstack |
| **TypeScript** | Lenguaje principal |
| **Supabase** | Base de datos PostgreSQL + Auth |
| **Tailwind CSS** | Estilos |
| **Shadcn/UI** | Componentes UI |
| **Zustand** | Estado global |
| **React Hook Form + Zod** | Formularios y validación |
| **Lucide React** | Iconografía |

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (shop)/           # Rutas públicas (tienda)
│   │   ├── builder/      # PC Builder
│   │   ├── catalogo/     # Catálogo de productos
│   │   ├── contact/      # Página de contacto
│   │   └── check-repair/ # Consultar estado de reparación
│   │
│   ├── (admin)/          # Rutas privadas (admin)
│   │   ├── dashboard/    # Panel de control
│   │   ├── pos/          # Punto de venta
│   │   ├── inventory/    # Gestión de inventario
│   │   ├── quotes/       # Cotizaciones
│   │   ├── taller/       # Gestión de reparaciones
│   │   └── settings/     # Configuración
│   │
│   ├── login/            # Inicio de sesión
│   └── register/         # Registro de usuarios
│
├── components/
│   ├── ui/               # Componentes Shadcn
│   ├── shop/             # Componentes tienda
│   └── admin/            # Componentes admin
│
├── lib/
│   ├── supabase/         # Cliente Supabase
│   ├── utils.ts          # Utilidades
│   └── compatibility.ts  # Motor PC Builder
│
├── store/                # Estado global (Zustand)
│   ├── cart-store.ts     # Carrito
│   └── builder-store.ts  # PC Builder
│
└── types/
    └── database.types.ts # Tipos de BD
```

## 🚀 Instalación

### Requisitos
- Node.js 18+
- npm o pnpm
- Cuenta de Supabase

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/rkrichard91/PosWebStoreCT.git
cd PosWebStoreCT
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Configurar base de datos**

Ejecutar el script `supabase_schema.sql` en el SQL Editor de Supabase.

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📖 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilar para producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Ejecutar linter |

## 🔐 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso completo al sistema |
| **seller** | POS, inventario, cotizaciones |
| **client** | Portal cliente (órdenes, reparaciones) |

## 🌐 Despliegue

El proyecto está optimizado para **Vercel**:

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push a `main`

## 📚 Documentación Adicional

- [Manual Técnico Integral](./Manual_Tecnico_Integral.md) - Documentación técnica completa
- [Esquema de Base de Datos](./supabase_schema.sql) - Script SQL para Supabase

## 📝 Licencia

Proyecto privado - Center Tecno © 2026

---

**Desarrollado con ❤️ para Center Tecno**
