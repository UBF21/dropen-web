# Checkout Redesign — Design Spec
**Fecha:** 2026-06-16  
**Estado:** Aprobado — pendiente de implementación

---

## Decisiones de diseño

### Layout: B1 — Two-column con product hero
- Columna izquierda: formulario (flex: 1)
- Columna derecha: panel de resumen sticky (width: 340px), altura = 100vh - topbar
- Max-width del shell: 900px, centrado, con border lateral

### Navegación: Nav 2 — Barra fina + contador en header
- Topbar sticky con: logo+título a la izquierda, "Paso X de 3 / [Nombre del paso]" a la derecha
- Barra de progreso de 2px full-width debajo del topbar, color accent, ancho crece 33% → 66% → 100%
- Step tabs sutiles dentro del form (texto inline, no componente separado)
- Sin stepper de dots ni pills en el topbar

### Panel derecho — Múltiples productos: Híbrido C
- **Hero**: imagen del producto activo, height 220px, gradient overlay abajo, nombre + talla + precio sobre la imagen
- **Thumbnail row**: fila de thumbnails clicables (38×50px), el activo tiene borde dorado + glow. Contador "N artículos / S/ total" al extremo derecho
- **Price breakdown**: lista de todos los productos con precio individual, fila de envío "A coordinar", divider, total grande en accent
- **Security badge**: "Reserva garantizada por 2 horas" con dot animado

### Tokens de color usados
```
--bg: #0A0A0A | --surface: #111111 | --border: #1F1F1F
--muted: #6B6B6B | --text: #F5F0E8
--accent: #C9A96E | --accent-hover: #E8C97A
```

---

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/pages/CheckoutPage.tsx` | Nuevo layout two-column, sticky panel, topbar con contador de paso |
| `src/components/checkout/CheckoutProgress.tsx` | Reemplazar por barra 2px + step tabs inline |
| `src/components/checkout/steps/Step1Personal.tsx` | Ajustar al nuevo contenedor (sin cambios en lógica) |
| `src/components/checkout/steps/Step2Address.tsx` | Ajustar al nuevo contenedor |
| `src/components/checkout/steps/Step3Confirm.tsx` | Mover lista de productos al panel derecho; form solo con datos del cliente |
| `src/components/checkout/ProductSummaryPanel.tsx` | **NUEVO** — panel derecho con hero + thumbnails + desglose |

## Comportamiento del panel en Step 3
- En Step 3 (Confirmar), el panel derecho muestra el mismo resumen
- La columna izquierda muestra: datos del cliente (read-only), dirección, botones Atrás/Confirmar
- El botón "Confirmar reserva" sigue llamando a `createReservations` + `createOrder`

## Responsividad mobile
- Por debajo de `md` (768px): layout colapsa a single column
- El panel de resumen se convierte en un acordeón colapsable en la parte superior del form
- Thumbnail row y hero se mantienen en el acordeón

---

## Mockup de referencia
`docs/superpowers/specs/checkout-redesign-fullscreen.html` (ver companion visual)  
Session: `.superpowers/brainstorm/127253-1781669416/content/checkout-fullscreen.html`
