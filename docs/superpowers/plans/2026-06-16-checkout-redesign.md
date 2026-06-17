# Checkout Redesign — Plan de implementación
**Fecha:** 2026-06-16  
**Spec:** `docs/superpowers/specs/2026-06-16-checkout-redesign.md`  
**Estimado:** ~4-5h | 6 archivos (1 nuevo componente)

---

## Contexto rápido

Rediseño visual completo del flujo de checkout. La lógica de negocio (`createReservations`, `createOrder`, validaciones de form) **no cambia**. Solo cambia la presentación: layout two-column, topbar con progreso, panel de resumen sticky a la derecha con hero + thumbnails.

---

## Tareas

### Tarea 1 — Leer el estado actual (obligatorio antes de todo)

- [ ] `src/pages/CheckoutPage.tsx` — estructura de pasos, estado del form
- [ ] `src/components/checkout/CheckoutProgress.tsx` — componente de progreso actual
- [ ] `src/components/checkout/steps/Step1Personal.tsx` — estructura del form personal
- [ ] `src/components/checkout/steps/Step2Address.tsx` — estructura del form de dirección
- [ ] `src/components/checkout/steps/Step3Confirm.tsx` — estructura de confirmación (importante: aquí puede estar la lista de productos actualmente)
- [ ] `src/hooks/useCart.ts` o similar — entender cómo se accede a los ítems del carrito

---

### Tarea 2 — Crear `ProductSummaryPanel.tsx` (nuevo componente)

**Ruta:** `src/components/checkout/ProductSummaryPanel.tsx`

Props:
```typescript
interface ProductSummaryPanelProps {
  items: CartItem[]           // ítems del carrito
  activeIdx: number           // índice del producto activo (controlado por padre)
  onSelectItem: (i: number) => void
}
```

Estructura del panel (de arriba a abajo):

1. **Hero** `h-[220px]` — imagen del ítem activo, `object-cover object-top`, opacity 85%
   - Gradient overlay abajo: `linear-gradient(transparent, #0e0e0e)`
   - Sobre la imagen (absolute bottom): nombre + variante + precio del ítem

2. **Thumbnail row** `px-5 py-3 border-b border-[#1a1a1a]`
   - Thumbnails `w-[38px] h-[50px]`, activo con `border-accent + shadow`
   - Al extremo derecho: "N artículos" + total en accent

3. **Price breakdown** `px-5 py-4`
   - Una fila por ítem: nombre + precio individual
   - Fila "Envío" → "A coordinar" en accent muted
   - `<hr>` + total grande en accent con `font-mono`

4. **Security badge** `mx-5`
   - Dot dorado animado (pulse) + texto "Reserva garantizada por 2 horas"

5. `mt-auto` watermark "Dropen · Checkout seguro"

---

### Tarea 3 — Refactorizar `CheckoutProgress.tsx`

Reemplazar el componente actual por la barra de 2px:

```tsx
// El componente recibe currentStep: 1 | 2 | 3
// Renderiza solo la barra — el label del paso va en CheckoutPage
export function CheckoutProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="h-[2px] bg-[#181818]">
      <div
        className="h-full bg-accent transition-all duration-400"
        style={{ width: `${(currentStep / 3) * 100}%` }}
      />
    </div>
  )
}
```

El topbar con "Paso X de 3 / Nombre del paso" se construye en `CheckoutPage` directamente (no es responsabilidad de este componente).

---

### Tarea 4 — Refactorizar `CheckoutPage.tsx`

Esta es la tarea más grande. Cambios:

**a) Nuevo estado:**
```tsx
const [activeItemIdx, setActiveItemIdx] = useState(0)
```

**b) Nuevo layout general:**
```tsx
<div className="min-h-screen bg-background flex flex-col">
  {/* Topbar sticky */}
  <div className="sticky top-0 z-10 border-b border-[#1f1f1f] bg-background px-10 py-3.5 flex items-center justify-between">
    <div>
      <p className="text-[8px] tracking-[5px] text-muted uppercase">Dropen</p>
      <p className="text-lg font-black tracking-[4px] uppercase">Checkout</p>
    </div>
    <div className="text-right">
      <p className="text-[8px] tracking-[3px] text-[#444] uppercase">Paso {step} de 3</p>
      <p className="text-[10px] tracking-[3px] text-accent uppercase font-semibold mt-0.5">
        {stepNames[step]}
      </p>
    </div>
  </div>
  
  {/* Progress bar */}
  <CheckoutProgress currentStep={step} />

  {/* Shell two-column */}
  <div className="flex-1 flex justify-center">
    <div className="w-full max-w-[900px] flex min-h-[calc(100vh-65px)] border-x border-[#1f1f1f]">
      {/* Columna form */}
      <div className="flex-1 px-12 py-11 border-r border-[#1f1f1f]">
        {/* Step tabs sutiles */}
        {/* Renderizado condicional del step activo */}
      </div>

      {/* Panel derecho sticky */}
      <div className="w-[340px] flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
        <ProductSummaryPanel
          items={cartItems}
          activeIdx={activeItemIdx}
          onSelectItem={setActiveItemIdx}
        />
      </div>
    </div>
  </div>
</div>
```

**c) Step tabs inline** (dentro de la columna form):
```tsx
const stepNames = { 1: 'Datos personales', 2: 'Envío', 3: 'Confirmar' }
<div className="flex mb-8">
  {[1,2,3].map(s => (
    <div key={s} className={`flex-1 text-center pb-2 text-[8px] tracking-[2px] uppercase border-b-2 ${
      s === step ? 'text-accent border-accent' :
      s < step  ? 'text-[#555] border-[#2a2a2a]' : 'text-[#333] border-transparent'
    }`}>
      {['①','②','③'][s-1]} {stepNames[s]}
    </div>
  ))}
</div>
```

**d) Remover la lista de productos de `Step3Confirm`** si está ahí actualmente — ya vive en el panel derecho.

---

### Tarea 5 — Ajustar Steps 1, 2 y 3

Los steps deben quitarse cualquier padding externo propio (el contenedor ya lo provee) y cualquier referencia a lista de productos.

- `Step1Personal` — sin cambios de lógica, solo verificar que no tiene su propio layout wrapper
- `Step2Address` — ídem
- `Step3Confirm` — quitar lista de productos si existe; mantener solo los datos del cliente en modo read-only + botones Atrás/Confirmar

---

### Tarea 6 — Responsividad mobile

Debajo de `md` (768px):

- Layout colapsa a single column
- Panel de resumen se convierte en acordeón colapsable encima del form
- `ProductSummaryPanel` recibe prop `collapsed?: boolean` para el estado mobile

```tsx
// En CheckoutPage
const [summaryOpen, setSummaryOpen] = useState(false)

// mobile: acordeón
<div className="md:hidden border-b border-[#1f1f1f]">
  <button onClick={() => setSummaryOpen(v => !v)} className="w-full px-4 py-3 flex justify-between">
    <span>Ver resumen ({cartItems.length} artículos)</span>
    <span className="text-accent">{summaryOpen ? '▲' : '▼'} {currency.formatShort(total)}</span>
  </button>
  {summaryOpen && <ProductSummaryPanel ... />}
</div>

// desktop: sticky
<div className="hidden md:block w-[340px] flex-shrink-0 sticky top-[65px] h-[calc(100vh-65px)]">
  <ProductSummaryPanel ... />
</div>
```

---

### Tarea 7 — Verificar en dev server

```bash
npm run dev
```

Casos a verificar:
- [ ] Step 1 → topbar muestra "Paso 1 de 3 / Datos personales", barra 33%
- [ ] Step 2 → barra 66%, step tab ② activo
- [ ] Step 3 → barra 100%, panel derecho sigue visible
- [ ] Panel sticky: no se mueve al scrollear el form
- [ ] Thumbnail activo con borde dorado, click cambia hero
- [ ] Mobile (< 768px): panel colapsa en acordeón arriba
- [ ] Confirmar reserva sigue funcionando (lógica intacta)

---

## Orden de ejecución

```
Tarea 1 (leer todo) →
Tarea 2 (ProductSummaryPanel nuevo) →
Tarea 3 (CheckoutProgress) →
Tarea 4 (CheckoutPage layout) →
Tarea 5 (Steps 1/2/3 ajustes) →
Tarea 6 (mobile) →
Tarea 7 (verificar)
```

---

## Archivos modificados / creados

| Archivo | Tipo |
|---|---|
| `src/components/checkout/ProductSummaryPanel.tsx` | **NUEVO** |
| `src/pages/CheckoutPage.tsx` | Modificado — layout + estado |
| `src/components/checkout/CheckoutProgress.tsx` | Modificado — reemplazar por barra 2px |
| `src/components/checkout/steps/Step3Confirm.tsx` | Modificado — quitar lista de productos |
| `src/components/checkout/steps/Step1Personal.tsx` | Modificado menor — wrapper padding |
| `src/components/checkout/steps/Step2Address.tsx` | Modificado menor — wrapper padding |
