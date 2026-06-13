import { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

// ─── Constants ────────────────────────────────────────────────────────────────

const BARCODE_CONFIG = {
  format: 'CODE128',
  /** Ancho de cada barra en px. 1.8 balancea legibilidad y espacio horizontal */
  barWidth: 1.8,
  /** Altura de barras en px — valor por defecto */
  defaultHeight: 56,
  displayValue: true,
  /** Tamaño del texto del SKU debajo del código */
  fontSize: 11,
  /** Fondo siempre blanco: CODE128 requiere alto contraste */
  background: '#ffffff',
  lineColor: '#000000',
  /** Margen interno en px */
  margin: 6,
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

interface BarcodeDisplayProps {
  /** Valor a codificar. Si está vacío el componente no renderiza nada. */
  value: string
  /** Texto alternativo bajo el código. Por defecto usa `value`. */
  label?: string
  /** Alto de las barras en px. Default: 56 */
  height?: number
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renderiza un código de barras CODE128 en un SVG.
 * SRP: solo genera el SVG — el contenedor blanco es responsabilidad del padre.
 */
export default function BarcodeDisplay({
  value,
  label,
  height = BARCODE_CONFIG.defaultHeight,
  className = '',
}: BarcodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !value) return
    try {
      JsBarcode(svgRef.current, value, {
        format: BARCODE_CONFIG.format,
        width: BARCODE_CONFIG.barWidth,
        height,
        displayValue: BARCODE_CONFIG.displayValue,
        text: label ?? value,
        fontSize: BARCODE_CONFIG.fontSize,
        background: BARCODE_CONFIG.background,
        lineColor: BARCODE_CONFIG.lineColor,
        margin: BARCODE_CONFIG.margin,
      })
    } catch {
      // SKU con caracteres fuera del conjunto CODE128 — no renderizar
    }
  }, [value, label, height])

  if (!value) return null

  return (
    <svg
      ref={svgRef}
      className={`w-full ${className}`}
      aria-label={`Código de barras: ${label ?? value}`}
      role="img"
    />
  )
}
