# Checkout Flow — Design Spec

**Feature:** Checkout completo antes de WhatsApp  
**Fecha:** 2026-06-15  
**Estado:** Aprobado

---

## Resumen

Reemplazar el botón directo de WhatsApp por un flujo de checkout de 3 pasos que recoge datos del cliente, crea una reserva+pedido en BD, muestra una animación de éxito y genera una página de detalle pública por URL.

---

## Flujo completo

```
CartDrawer
  → /checkout (wizard 3 pasos)
      Paso 1: Datos personales
      Paso 2: Dirección + Google Maps
      Paso 3: Confirmación
  → createReservations() + createOrder()
  → CheckoutSuccess animation (~3.5s)
  → /pedido/:id (página permanente)
      → botón "Confirmar vía WhatsApp"
```

---

## Datos recolectados

### Paso 1 — Datos personales
| Campo | Validación |
|---|---|
| Nombre | min 2 chars |
| Apellido | min 2 chars |
| Tipo de documento | DNI / CE / Pasaporte (segmented control) |
| Número de documento | DNI: 8 dígitos · CE: 9 dígitos · Pasaporte: 9-12 alfanumérico |

### Paso 2 — Dirección
- Input con Google Maps Places Autocomplete (restricción: `country: 'pe'`)
- Al seleccionar una sugerencia: auto-populate `address`, `lat`, `lng`, `department`, `province`, `district`
- Mostrar confirmación visual con el texto de la dirección + coordenadas
- Fallback: input de texto libre si la API key no está configurada

### Paso 3 — Confirmación
- Resumen de productos del carrito (imagen, nombre, talla, precio)
- Resumen de datos del cliente
- Botón "Confirmar reserva" → dispara creación

---

## Base de datos

### Nueva tabla: `orders`
```sql
id            UUID PK DEFAULT gen_random_uuid()
reference     TEXT UNIQUE NOT NULL  -- DRP-XXXXXXXX (mismo de reservations)
first_name    TEXT NOT NULL
last_name     TEXT NOT NULL
doc_type      TEXT NOT NULL CHECK IN ('DNI', 'CE', 'Pasaporte')
doc_number    TEXT NOT NULL
address       TEXT NOT NULL
lat           DECIMAL(10,7)
lng           DECIMAL(10,7)
department    TEXT
province      TEXT
district      TEXT
country       TEXT DEFAULT 'PE'
items         JSONB NOT NULL        -- snapshot de CartItem[]
total         DECIMAL(10,2) NOT NULL
currency      TEXT DEFAULT 'PEN'
status        TEXT DEFAULT 'pending' CHECK IN ('pending','confirmed','cancelled','expired')
reservation_ids UUID[] NOT NULL
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

**RLS:**
- SELECT: público (anyone with UUID can view their order)
- INSERT: anon permitido
- ALL: admin autenticado

---

## Animación de éxito (CheckoutSuccess)

Basada en el diseño ticket-v5. Duración: ~3.5s, luego redirect a `/pedido/:id`.

Secuencia de animación:
1. Ticket cae desde arriba (drop + scaleY)
2. Printer head dorado desliza de arriba a abajo (~3.1s)
3. Header DROPEN + fecha
4. Línea punteada se dibuja
5. Producto: imagen + nombre typewriter + detalle + precio
6. Totales: subtotal, envío, total
7. Sello RESERVADO cae (rotado -14°) sobre zona de producto/totales — efecto bounce + flash rojo
8. Línea punteada
9. Barcode se construye de izquierda a derecha + glow scan
10. Referencia DRP-XXXXXXXX

El sello puede tapar el barcode (está sobre él) — es decorativo, la animación es solo para el cliente.

---

## Página de detalle `/pedido/:id`

**Layout:** Split — imagen del producto a la izquierda (full height), datos a la derecha.

**Diseño:** Fondo oscuro `#0e0e0e`, texto `#f0ece4`, acento dorado `#c8a96e`.

**Secciones (columna derecha):**
- Referencia `DRP-XXXXXXXX` en dorado monospace
- Nombre del producto (uppercase)
- Status pill: dot dorado + "Reserva pendiente de confirmación"
- Precio total en dorado
- Divisor
- Grid 2 cols: Cliente, DNI/CE/Pasaporte, Talla/Color, Cantidad, Dirección (span 2)
- Divisor
- Barcode: negro sobre blanco estándar (compatible láser + cámara) en contenedor con borde dorado `#3a2e1a` + línea scan animada
- Botón "Confirmar vía WhatsApp" (verde `#3eb863`, fondo `#0a1a0f`)

**Sin sello RESERVADO** — el detalle es limpio.

**Acceso:** Público (cualquiera con el UUID puede ver). El barcode de reserva no permite acceso al sistema sin credenciales de admin.

---

## Mensaje WhatsApp

Formato nuevo (reemplaza el mensaje detallado actual):
```
74521803 - Felipe Montenegro
https://dropen.pe/pedido/<order-id>
```

Enviado por el cliente desde su celular al número configurado (`VITE_WHATSAPP_NUMBER`).

---

## Archivos afectados

### Nuevos
- `supabase/migrations/014_orders.sql`
- `src/lib/orders.ts`
- `src/store/order.store.ts`
- `src/components/checkout/steps/Step1Personal.tsx`
- `src/components/checkout/steps/Step2Address.tsx`
- `src/components/checkout/steps/Step3Confirm.tsx`
- `src/components/checkout/CheckoutProgress.tsx`
- `src/components/checkout/CheckoutSuccess.tsx`
- `src/pages/CheckoutPage.tsx`
- `src/pages/OrderDetailPage.tsx`

### Modificados
- `src/types/index.ts` — agregar Order, CreateOrderInput, DocType, OrderStatus
- `src/lib/whatsapp.ts` — agregar buildOrderWhatsAppMessage()
- `src/router.tsx` — rutas /checkout y /pedido/:id
- `src/components/checkout/WhatsAppCheckout.tsx` — navegar a /checkout en vez de abrir WA directo

### Dependencias nuevas
- `@googlemaps/js-api-loader` (npm install)
- `@types/google.maps` (npm install --save-dev)
- Variable de entorno: `VITE_GOOGLE_MAPS_API_KEY`

---

## Decisiones de diseño

| Decisión | Justificación |
|---|---|
| Tabla `orders` separada de `reservations` | Separación limpia: reservations = inventario temporal, orders = pedido del cliente |
| Items como JSONB snapshot | Evita joins complejos en /pedido/:id; los datos no cambian tras el pedido |
| WhatsApp desde /pedido/:id | UX: el cliente confirma intencionalmente, no automático |
| Barcode negro/blanco estándar | Compatible con lectores láser físicos y cámara |
| Google Maps autocomplete | Lat/lng exacto para delivery; departamento/provincia/distrito auto-detectados |
| Wizard 3 pasos sin stepper URL | Estado en Zustand + sessionStorage; el refresh no pierde datos |
