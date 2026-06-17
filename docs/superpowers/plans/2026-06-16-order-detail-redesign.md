# Order Detail Redesign — Plan de implementación
**Fecha:** 2026-06-16  
**Spec:** `docs/superpowers/specs/2026-06-16-order-detail-redesign.md`  
**Estimado:** ~2h | 2 archivos modificados

---

## Contexto rápido

Cambios quirúrgicos sobre `OrderDetailPage`. Sin nuevos componentes, sin cambios de datos. Todo es presentación + estado local de `activeItemIndex`.

---

## Tareas

### Tarea 1 — Leer el estado actual
**Objetivo:** Entender exactamente qué hay en `OrderDetailPage.tsx` y `OrderBarcode.tsx` antes de tocar nada.

- [ ] Leer `src/pages/OrderDetailPage.tsx` completo
- [ ] Leer `src/components/order/OrderBarcode.tsx` para ver la config actual de JsBarcode

---

### Tarea 2 — Actualizar blend de imagen (`OrderDetailPage.tsx`)

**Cambio:** reemplazar el overlay `::after` del panel izquierdo.

```tsx
// ANTES (className inline o style)
style={{ background: 'linear-gradient(to right, transparent 60%, #0e0e0e 100%)' }}

// DESPUÉS
style={{
  background: `
    radial-gradient(ellipse at 40% 50%, transparent 30%, rgba(8,7,5,.88) 85%),
    linear-gradient(to right, transparent 50%, #0e0e0e 100%)
  `
}}
```

Aplica tanto al caso 1 producto como a multi-producto.

---

### Tarea 3 — Agregar estado de ítem activo

Al inicio del componente, después de derivar `firstItem`:

```tsx
const [activeIdx, setActiveIdx] = useState(0)
const activeItem = order.items[activeIdx] ?? order.items[0]
```

Actualizar todas las referencias a `firstItem` (imagen, nombre de producto) para que usen `activeItem` en su lugar.  
El data grid de cliente/DNI/dirección **no cambia** — pertenece al pedido.

---

### Tarea 4 — Pills de scroll horizontal (condicional)

Insertar **solo cuando** `order.items.length > 1`, entre el total y el divider del data grid:

```tsx
{order.items.length > 1 && (
  <div className="relative">
    {order.items.length > 4 && (
      <p className="text-[7px] text-right tracking-[2px] text-[#333] mb-1">← deslizá →</p>
    )}
    <div className="flex gap-[5px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {order.items.map((item, i) => (
        <button
          key={i}
          onClick={() => setActiveIdx(i)}
          className={`flex flex-col items-center gap-[3px] p-1 border flex-shrink-0 w-[38px] transition-all ${
            i === activeIdx
              ? 'border-accent bg-[rgba(201,169,110,0.04)]'
              : 'border-[#1f1f1f] bg-[#0a0a0a]'
          }`}
        >
          <div className="w-[30px] h-[40px] overflow-hidden flex-shrink-0">
            {item.imageUrl
              ? <img src={item.imageUrl} className="w-full h-full object-cover object-top" />
              : <div className="w-full h-full bg-[#1a1a1a]" />
            }
          </div>
          <span className={`text-[6px] tracking-[1px] font-mono ${i === activeIdx ? 'text-accent' : 'text-[#444]'}`}>
            {String(i + 1).padStart(2, '0')}
          </span>
        </button>
      ))}
    </div>
  </div>
)}
```

Debajo de las pills, mostrar el detalle del ítem activo:

```tsx
{order.items.length > 1 && (
  <div className="mb-3">
    <p className="text-[7px] tracking-[2px] uppercase text-accent font-bold mb-1">
      {activeItem.productName} · {String(activeIdx + 1).padStart(2, '0')}
    </p>
    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
      <div>
        <p className="text-[6px] tracking-[3px] uppercase text-[#333]">Talla / Color</p>
        <p className="text-[8px] text-[#777]">{activeItem.size} · {activeItem.color}</p>
      </div>
      <div>
        <p className="text-[6px] tracking-[3px] uppercase text-[#333]">Subtotal</p>
        <p className="text-[8px] text-accent font-mono">{currency.formatShort(activeItem.price * activeItem.quantity)}</p>
      </div>
    </div>
  </div>
)}
```

---

### Tarea 5 — Verificar config de JsBarcode (`OrderBarcode.tsx`)

Confirmar que el SVG generado tenga:
- `width="100%"` en el elemento `<svg>` o configurado via `JsBarcode`
- `height: 40` en la config
- Si usa `width` numérico fijo → cambiar a `100%` para que llene el contenedor

Si hay discrepancia con la spec, ajustar en `OrderBarcode.tsx`.

---

### Tarea 6 — Verificar en dev server

```bash
npm run dev
```

Casos a verificar:
- [ ] Pedido con 1 ítem → no aparecen pills, blend correcto
- [ ] Pedido con 3 ítems → pills visibles, click cambia imagen y data grid de ítem
- [ ] Pedido con 8+ ítems → scroll horizontal funciona, hint "deslizá" visible
- [ ] Barcode se renderiza y llena el ancho del contenedor
- [ ] Línea de scan animada funciona sobre el barcode

---

## Orden de ejecución

```
Tarea 1 (leer) → Tarea 2 (blend) → Tarea 3 (estado) → Tarea 4 (pills) → Tarea 5 (barcode) → Tarea 6 (verificar)
```

Todas son secuenciales — cada tarea depende de la anterior.

---

## Archivos modificados

| Archivo | Tipo de cambio |
|---|---|
| `src/pages/OrderDetailPage.tsx` | CSS blend + estado activeIdx + pills condicionales |
| `src/components/order/OrderBarcode.tsx` | Config JsBarcode (solo si necesita ajuste) |
