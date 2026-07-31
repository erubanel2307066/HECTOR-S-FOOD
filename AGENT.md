# Hector's - Sistema de Pedidos

Sistema web + chatbot WhatsApp para un negocio de comida a domicilio/para llevar.
Venta de pollos, hamburguesas, tacos, guarniciones y bebidas en México.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js | 16.2.10 |
| Lenguaje | TypeScript | 5.9 |
| Frontend | React + Tailwind CSS v4 | 19.2 |
| Iconos | react-icons (Material Design) | - |
| Toasts | Sonner | 2.0 |
| Estado | React Context (CartProvider) | - |
| ORM | Prisma | 7.8 |
| DB | PostgreSQL (Supabase) | - |
| Storage | Supabase Storage (bucket menu-images) | - |
| Supabase Client | @supabase/supabase-js | - |
| DB local | PostgreSQL via @prisma/adapter-pg | - |
| WhatsApp API | Meta Cloud API (Graph v25.0) | - |
| Autenticación Admin | Cookie-based (httpOnly) | - |

---

## Estructura del Proyecto

```
hectors-food/
├── prisma/
│   ├── schema.prisma          # Esquema PostgreSQL
│   ├── migrations/            # Migraciones
│   ├── seed.ts                # Seed de datos de ejemplo
│   └── prisma.config.ts       # Config (URL de BD)
├── render.yaml                # Despliegue en Render
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── client-layout.tsx  # Layout cliente (Header + CartProvider)
│   │   ├── globals.css        # Estilos globales + Tailwind + animaciones
│   │   ├── page.tsx           # Landing page (/)
│   │   ├── menu/
│   │   │   ├── page.tsx       # Server wrapper metadata
│   │   │   └── client-page.tsx # Menú completo (/menu)
│   │   ├── admin/             # Panel de administración
│   │   │   ├── layout.tsx     # Layout admin (sidebar responsive + notificaciones)
│   │   │   ├── notifications-context.tsx # Context de notificaciones
│   │   │   ├── page.tsx       # Dashboard (/admin)
│   │   │   ├── login/         # Login (/admin/login)
│   │   │   ├── menu/          # Gestión de menú (/admin/menu)
│   │   │   ├── pedidos/       # Gestión de pedidos (/admin/pedidos)
│   │   │   ├── clientes/      # Lista de clientes (/admin/clientes)
│   │   │   ├── difusion/      # Broadcast WhatsApp (/admin/difusion)
│   │   │   └── configuracion/ # Configuración (/admin/configuracion)
│   │   └── api/
│   │       ├── menu/          # GET /api/menu, /api/menu/diario
│   │       ├── orders/        # POST /api/orders (pedidos web)
│   │       ├── admin/         # Todas las rutas admin
│   │       └── webhooks/      # WhatsApp webhook
│   ├── components/
│   │   ├── ui/icons.tsx       # Iconos centralizados (react-icons/md)
│   │   ├── ui/pagination.tsx  # Paginación reutilizable
│   │   ├── ui/form-elements.tsx # FormError, EmptyState reutilizables
│   │   └── client/            # Header, carrito, menu cards
│   ├── handlers/            # Lógica chatbot WhatsApp
│   ├── middleware.ts          # Auth gate centralizado
│   ├── lib/
│   │   ├── auth.ts          # Helper centralizado verificación admin
│   │   ├── supabase.ts      # Cliente Supabase (Storage imágenes)
│   │   ├── cart-context.tsx  # Context + Provider del carrito
│   │   ├── constants.ts     # Constantes de negocio
│   │   ├── prisma.ts        # PrismaClient con adapter-pg
│   │   ├── rate-limit.ts    # Rate limiter en memoria
│   │   ├── session.ts       # Sesiones con tokens criptográficos
│   │   ├── validation.ts    # Validación teléfono, longitudes
│   │   ├── whatsapp.ts      # Meta WhatsApp API
│   │   └── menu.ts          # Formateo menú chatbot
│   └── generated/prisma/      # Generado por Prisma (no editar)
├── .env.example
└── package.json
```

---

## Sistema Visual (Google Material Style)

### Filosofía
Diseño tipo Google/Material Design: limpio, espacioso, bordes redondeados, sombras sutiles, iconografía consistente con Material Icons, tipografía system-ui.

### Tokens (`globals.css`)
```css
@theme {
  --color-background: #f7f1e8; /* crema cálido para fondos de página */
  --color-foreground: #1c1917;
  --color-primary: #ea580c;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --animate-slide-in: slide-in 0.3s ease-out;
  --animate-fade-in: fade-in 0.2s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
  --animate-bounce-subtle: bounce-subtle 0.4s ease-out;
}
```

### Iconos (`src/components/ui/icons.tsx`)
- Usar `react-icons/md` (Material Design) para TODOS los iconos funcionales
- Importar del archivo centralizado: `import { Icon } from '@/components/ui/icons'`
- Uso: `<Icon name="cart" size={20} />`
- Emojis solo para categorías de comida (🍗 🍔 🌮 etc.)

### Patrones de UI
- **Cards**: `bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all`
- **Fondo general**: usar `bg-background` (crema cálido con degradado sutil); reservar `bg-white` para tarjetas, formularios y superficies elevadas. Esto evita el blanco puro y mantiene el contraste del texto.
- **Botones primarios**: `bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold`
- **Botones secundarios**: `bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl`
- **Inputs**: `px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500`
- **Badges estado**: `text-xs font-medium px-2.5 py-1 rounded-full ${color}`
- **Header**: `sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60`
- **Spinner**: `w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin`
- **Empty state**: Icono grande en círculo gris + texto centrado (usar `<EmptyState>` de `@/components/ui/form-elements`)
- **Toast**: Sonner para errores/éxitos en admin (no usar `alert()`)
- **Skeletons**: `loading.tsx` con `animate-pulse` para transiciones de ruta

### Admin Sidebar
- Fijo a la izquierda, 264px, `bg-white shadow-sm border-r border-gray-200`
- Items con icono + label, activo: `bg-orange-50 text-orange-600`
- Logout con icono al pie

### Carrito (CartSidebar)
- Slide-in desde la derecha con `animate-slide-in`
- Overlay `bg-black/30 backdrop-blur-sm`
- Botón flotante en footer: `fixed bottom-6 right-6 z-40 bg-orange-500 rounded-2xl shadow-lg`

---

## Base de Datos (Prisma + PostgreSQL en Supabase)

### Modelo: MenuItem
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (cuid) | PK |
| code | String (único) | Código del plato (P1, H1, T1...) |
| name | String | Nombre |
| description | String? | Descripción opcional |
| price | Float | Precio en MXN |
| category | String | Categoría (pollos, hamburguesas, tacos...) |
| image | String? | URL de la imagen (local o externa) |
| isActive | Boolean | Activo/inactivo |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Modelo: DailyMenu
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK |
| date | DateTime (único) | Fecha del menú |
| active | Boolean | Activo |
| items | String | IDs separados por coma |

### Modelo: Client
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK |
| phone | String (único) | Teléfono E.164 |
| name | String? | Nombre opcional |
| orders | Int | Contador de pedidos |
| lastOrder | DateTime? | Último pedido |
| createdAt | DateTime | Auto |

### Modelo: Order
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK |
| phone | String | Teléfono del cliente |
| items | String | JSON items del pedido |
| type | String | "delivery" \| "pickup" |
| address | String? | Dirección de entrega |
| schedule | String? | Horario |
| total | Float | Total MXN |
| status | String | pending \| confirmed \| preparing \| ready \| on_way \| delivered \| cancelled |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Modelo: Conversation
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | PK |
| phone | String (único) | Teléfono del cliente |
| step | String | Estado del diálogo |
| data | String? | JSON datos temporales |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

### Comandos DB
```bash
npm run seed                    # Poblar DB con datos de ejemplo
npx prisma migrate dev --name nombre  # Nueva migración
npx prisma studio               # Abrir Prisma Studio (GUI)
npx prisma generate             # Regenerar cliente Prisma
```

---

## Estado Actual del Proyecto

### ✅ Implementado recientemente
- El panel admin puede crear, editar y desactivar platos desde la interfaz.
- Los platos se guardan en la base de datos de Supabase mediante Prisma.
- El endpoint de creación de menú responde con éxito y persiste datos reales en `MenuItem`.
- El chatbot de WhatsApp responde a mensajes como “menú”, “menú completo”, “información” y “hola”.
- El bot muestra los platos activos desde la base de datos para que el cliente vea el menú.
- La autenticación del admin funciona con cookies y permite acceder a las rutas protegidas del panel.

### 🔧 Flujo operativo actual
1. El admin crea un plato desde `/admin/menu`.
2. El backend guarda el registro en Supabase mediante Prisma.
3. El chatbot lee los platos activos desde la base de datos y los envía al cliente por WhatsApp.
4. Los pedidos realizados por WhatsApp se guardan en `Order` y quedan visibles en el dashboard admin.

---

## API Endpoints

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/menu` | Items activos del menú |
| GET | `/api/menu/diario` | Menú del día (de DailyMenu o fallback a todos) |

### Admin (protegidas con cookie)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/login` | Login (body: { password }) |
| GET | `/api/admin/logout` | Logout |
| GET | `/api/admin/check` | Verificar sesión |
| GET | `/api/admin/dashboard` | Stats del dashboard |
| GET | `/api/admin/menu` | Listar items |
| POST | `/api/admin/menu` | Crear item |
| PATCH | `/api/admin/menu/[id]` | Actualizar item |
| POST | `/api/admin/upload` | Subir imagen (multipart) → { url } |
| DELETE | `/api/admin/menu/[id]` | Eliminar item |
| GET | `/api/admin/pedidos` | Listar pedidos (query: ?status=, since=, page=, search=) |
| PATCH | `/api/admin/pedidos/[id]` | Actualizar estado |
| DELETE | `/api/admin/pedidos/[id]` | Eliminar pedido |
| GET | `/api/admin/clientes` | Listar clientes (query: ?page=, search=) |
| PATCH | `/api/admin/clientes/[id]` | Actualizar cliente |
| DELETE | `/api/admin/clientes/[id]` | Eliminar cliente |
| POST | `/api/admin/difusion` | Broadcast WhatsApp |

### Webhook
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/webhooks/whatsapp` | Verificación Meta |
| POST | `/api/webhooks/whatsapp` | Recibir mensajes |

---

## Chatbot WhatsApp

### Flujo
```
Usuario escribe "Hola"
  ↓
Welcome → botones: [🍽 Menú] [📋 Completo] [ℹ️ Info]
  ↓
Menu → muestra items + precios → "Escribe códigos"
  ↓
Order → recibe códigos → tipo → dirección → horario → confirmar
  ↓
✅ Pedido en DB → Admin lo ve en dashboard
```

### Handlers
| File | Función |
|------|---------|
| `handlers/welcome.ts` | Bienvenida, menú principal, info |
| `handlers/menu.ts` | Mostrar menú del día o completo usando platos activos de la DB |
| `handlers/order.ts` | Flujo completo de pedido |

### Comportamiento del chatbot
- Responde a mensajes de texto simples para iniciar el flujo.
- Usa `prisma.menuItem.findMany({ where: { isActive: true } })` para enviar el menú al cliente.
- Mantiene el estado de conversación en `Conversation` para continuar con el pedido.
- Soporta botones interactivos para “menú del día”, “menú completo”, “información” y “hacer pedido”.

---

## Constantes de Negocio (`src/lib/constants.ts`)

| Constante | Valor |
|-----------|-------|
| `BUSINESS.name` | Hector's |
| `BUSINESS.prep` | "Se prepara al momento" |
| `BUSINESS.deliveryMax` | 45 (minutos) |
| `BUSINESS.deliveryRange` | "30–45 min" |
| `BUSINESS.hours` | Lun–Sáb 11:00 – 22:00 |
| `BUSINESS.payment` | Efectivo contra entrega |

Estas constantes se usan en toda la UI para mensajes amigables al cliente sobre el tiempo de preparación y entrega. Se muestran en:
- Landing page: callout "Todo se prepara al momento"
- `/menu`: banner en cabecera con tiempo estimado
- Cart sidebar: mensaje en selector de horario + nota en resumen + pantalla de éxito

---

## Variables de Entorno

```env
# Base de datos (Supabase PostgreSQL - pooler puerto 6543)
DATABASE_URL="postgresql://postgres.xxxxx:password@aws-0-xxx.pooler.supabase.com:6543/postgres"

# Supabase (para Storage de imágenes)
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIs..."

# Admin (usar solo UNA de las dos opciones)
# Opción 1: Hash bcrypt (RECOMENDADO para producción)
# Generar con: node -e "console.log(require('bcryptjs').hashSync('tu_contraseña', 12))"
ADMIN_PASSWORD_HASH="$2b$12$..."
# Opción 2: Contraseña en texto plano (solo desarrollo)
# ADMIN_PASSWORD="hectors123"

# Meta WhatsApp Cloud API
WHATSAPP_TOKEN=""
WHATSAPP_PHONE_ID=""
WHATSAPP_VERIFY_TOKEN="hectors_verify_2024"
WHATSAPP_APP_SECRET=""

# Número público para botón WhatsApp (formato E.164 sin +)
NEXT_PUBLIC_WHATSAPP_NUMBER="521234567890"
```

---

## Despliegue en Render

### Requisitos previos (tú)
1. Crear proyecto en [supabase.com](https://supabase.com) (plan gratis)
2. En Supabase: Settings > Database > Connection string → copiar URI **directa** (puerto 5432)
3. En Supabase: Settings > API → copiar **Project URL** y **service_role key**
4. En Supabase: **Storage > New bucket** → `menu-images` como **público**

### Deploy
1. Ir a [render.com](https://render.com) y conectar repositorio de GitHub
2. Render detecta `render.yaml` automáticamente
3. En el Dashboard de Render, llenar las env vars marcadas como `sync: false`:
   - `DATABASE_URL` — de Supabase (directa, puerto 5432)
   - `SUPABASE_URL` — de Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` — de Supabase
   - `ADMIN_PASSWORD_HASH` — generar con `node -e "console.log(require('bcryptjs').hashSync('tu_contraseña', 12))"`
   - `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_APP_SECRET` — de Meta
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` — número E.164 sin +

### Después del deploy (Render Shell)
Render ejecuta build y start automáticamente. Luego, en la consola de Render:
```bash
npx prisma migrate deploy   # Crear tablas en Supabase
npx prisma db seed           # Poblar datos de ejemplo
```

---

## Notificaciones (Admin)

- Sidebar muestra badge rojo con conteo de pedidos pendientes
- Polling cada 10s actualiza el conteo
- Dashboard muestra notificación animada cuando hay pedidos nuevos
- Sonido de notificación al recibir pedido

---

## Responsive (Admin)

- Desktop: sidebar fijo a la izquierda (288px)
- Móvil (< 1024px): sidebar oculto, botón hamburguesa
- Navegación cierra sidebar automáticamente en móvil
- Overlay oscuro detrás del sidebar en móvil

---

## Paginación y Búsqueda

### Componente Pagination (`src/components/ui/pagination.tsx`)
- Reutilizable: `{ page, totalPages, onPageChange }`
- Botones: ← Anterior | Página X de Y | Siguiente →
- Se oculta automáticamente si totalPages <= 1

### Endpoints paginados
- `GET /api/admin/pedidos?page=1&limit=20&search=&status=&since=` → `{ orders, total, page, totalPages }`
- `GET /api/admin/clientes?page=1&limit=20&search=` → `{ clients, total, page, totalPages }`

### Búsqueda
- Pedidos: filtro por teléfono
- Clientes: filtro por nombre o teléfono
- Menú admin: filtro por nombre (client-side, sin API)

---

## Seguridad

### Autenticación Admin
- **Sesión**: Token criptográfico de 32 bytes (`crypto.randomBytes`) almacenado en memoria (`src/lib/session.ts`)
- **Cookie**: `admin_session` con flags `httpOnly`, `secure` (en producción), `sameSite: 'strict'`, expiración 24h
- **Middleware**: `src/middleware.ts` verifica token antes de que llegue a cualquier handler admin
- **Auth helper**: `src/lib/auth.ts` centraliza la verificación para todos los endpoints
- **Logout**: Cambiado de GET a POST para prevenir CSRF logout
- **Rate limiting**: Login limitado a 5 intentos/min por IP (`src/lib/rate-limit.ts`)
- **Rate limiting orders**: Máximo 10 pedidos/min por IP
- **Rate limiting difusión**: Máximo 1 difusión/min

### Hash de Contraseña
- Soporta `ADMIN_PASSWORD_HASH` (bcrypt) o `ADMIN_PASSWORD` (texto plano para desarrollo)
- Generar hash: `node -e "console.log(require('bcryptjs').hashSync('tu_contraseña', 12))"`
- Paquete: `bcryptjs` + `@types/bcryptjs`

### Webhook WhatsApp
- Verificación de firma HMAC con `X-Hub-Signature-256`
- Requiere `WHATSAPP_APP_SECRET` en .env
- `crypto.timingSafeEqual` para prevenir timing attacks
- `JSON.parse` con try/catch en todos los parsing de conversación

### Headers de Seguridad (`next.config.ts`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### Validación de Entrada
- **Teléfono**: 10 dígitos locales. `sanitizePhone()` quita código de país 52 automáticamente. Consistente entre web y WhatsApp
- **Longitudes máximas**: name=200, address=500, message=2000, description=1000
- **Total de pedidos**: Recalculado en servidor usando precios de DB (no confía en el cliente)
- **Menú**: Whitelist de campos permitidos en create/update (previene mass assignment)
- **Upload**: Magic bytes validation (no solo MIME type), máximo 5MB

### Protección CSRF
- Cookie `sameSite: 'strict'` previene envío cross-origin
- Logout por POST (no GET) previene CSRF logout via `<img>`
- Pedidos requieren origin check implícito por sameSite

### Archivos de Seguridad
```
src/lib/session.ts        # Sesiones en memoria con tokens criptográficos
src/lib/auth.ts           # Helper centralizado de verificación admin
src/lib/rate-limit.ts     # Rate limiter en memoria
src/lib/validation.ts     # Validación de teléfono, longitudes
src/middleware.ts          # Auth gate para /admin y /api/admin
```

---

## Comandos

```bash
npm run dev              # Puerto 3000
npm run build            # Build producción
npm run start            # Servidor producción
npm run seed             # Poblar DB
npm run lint             # ESLint
npx prisma studio        # GUI DB
npx tsc --noEmit         # TypeScript check
```

---

## Reglas de Desarrollo

1. **Iconos**: Siempre usar `<Icon name="..." />` de `@/components/ui/icons`. No emojis para funciones.
2. **Carrito**: Usar `CartProvider` + `useCart()` hook de `@/lib/cart-context`
3. **Admin**: No usa CartProvider. El layout admin es independiente.
4. **Rutas cliente**: No usar route groups `(client)`. El `client-layout.tsx` detecta `/admin` y aplica layout correspondiente.
5. **Import paths**: Usar `@/` alias
6. **Estilos**: Tailwind CSS v4, no CSS modules ni styled-components
7. **Imágenes**: Subir imágenes de menú por `POST /api/admin/upload` a Supabase Storage (bucket `menu-images` público). El fondo del hero público se almacena en `public/images/hero-food.png` y debe renderizarse con `next/image`, `fill`, `priority` y una capa de contraste para mantener textos legibles. La ilustración circular del aviso de preparación usa `public/images/chef-preparation.png` con `next/image`, `fill` y `object-cover`.
8. **Formato teléfono**: 10 dígitos locales (sin código de país). `sanitizePhone()` quita +52 automáticamente
9. **Admin auth**: Cookie `admin_session` con token criptográfico (32 bytes hex), httpOnly, sameSite strict, 24h expiración. Sesiones en memoria (`src/lib/session.ts`). Middleware centralizado verifica auth antes de llegar a los handlers.
10. **Placeholders**: Seed usa `https://picsum.photos/seed/{codigo}/400/300`
