# Order Detail Redesign — Design Spec
**Fecha:** 2026-06-16  
**Estado:** Aprobado — pendiente de implementación

---

## Contexto

La página de detalle de pedido (`OrderDetailPage`) ya tiene un diseño sólido: layout two-column, barcode animado, datos del cliente en grid. Los cambios son quirúrgicos:

1. **Blend de imagen** — cambiar gradiente actual por vignette radial
2. **Soporte multi-producto** — agregar selector de pills horizontal cuando hay más de un ítem

---

## Decisiones de diseño

### 1. Blend de imagen (caso 1 producto y multi)

**Antes:** `linear-gradient(to right, transparent 60%, #0e0e0e 100%)`

**Después:** doble capa —
```css
background:
  radial-gradient(ellipse at 40% 50%, transparent 30%, rgba(8,7,5,.88) 85%),
  linear-gradient(to right, transparent 50%, #0e0e0e 100%);
```

El vignette radial oscurece los bordes (efecto cinematográfico que enmarca el producto) y el gradiente horizontal mantiene la transición limpia hacia el contenido.

### 2. Un solo producto (sin cambios estructurales)

- Layout actual se mantiene
- Solo se actualiza el CSS del overlay de imagen
- El nombre del producto sigue siendo `firstItem.productName`

### 3. Multi-producto — Pills horizontales con scroll

Cuando `order.items.length > 1`:

- **Pills row** aparece entre el total y el data grid
- Cada pill: thumbnail 30×40px + número correlativo (`01`, `02`, ...) debajo
- Scroll horizontal nativo (overflow-x: auto, sin scrollbar visible)
- Hint "← deslizá →" en texto muted a la derecha (solo si items > 4)
- Pill activa: borde `var(--accent)` + glow sutil + fondo `rgba(accent, 0.04)`
- Al hacer click en una pill: actualiza imagen izquierda + data grid del producto

**Estado activo (encima del data grid):**
```
[label accent] Varsity Jacket · 01
Talla / Color | M · Negro
Subtotal      | S/ 280
```

- El data grid de cliente/DNI/dirección se mantiene siempre visible (es del pedido, no del ítem)
- El barcode es del pedido (`order.reference`) — uno solo, siempre al fondo

### 4. Barcode

- Usa `JsBarcode` (ya importado en el proyecto) con format `CODE128`
- Config: `width: 1.4, height: 40, displayValue: false, background: '#ffffff', lineColor: '#000000', margin: 0`
- El SVG tiene `width: 100%` para llenar el contenedor
- El contenedor muestra la referencia del pedido debajo en texto muted
- La línea de scan animada se mantiene igual

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/pages/OrderDetailPage.tsx` | Actualizar blend CSS + agregar lógica de pills para multi-producto |
| `src/components/order/OrderBarcode.tsx` | Verificar config de JsBarcode (width/height para llenar el SVG) |

---

## Lógica de estado (React)

```typescript
const [activeItemIndex, setActiveItemIndex] = useState(0)
const activeItem = order.items[activeItemIndex]
// La imagen izquierda usa activeItem.imageUrl
// El data grid de ítem usa activeItem.productName, .size, .color, .quantity, .price
// El barcode siempre usa order.reference
```

---

## Comportamiento condicional

```
items.length === 1  → sin pills, sin número de ítem, diseño actual con nuevo blend
items.length > 1    → pills scroll + data grid del ítem activo + hint si items > 4
```

---

## Tokens de color usados

```
--bg: #0A0A0A | --surface: #0e0e0e | --border: #1A1A1A
--accent: #C9A96E | --muted: #6B6B6B | --text: #F5F0E8
```

---

## Mockups de referencia

Session companion: `.superpowers/brainstorm/127253-1781669416/content/`
- `order-detail-blend-v2.html` — comparación de blends (elegido: C vignette radial)
- `order-detail-multi.html` — comparación de multi-producto (elegido: C pills)
- `order-detail-many.html` — variantes de overflow para muchos ítems (elegido: A scroll horizontal)
