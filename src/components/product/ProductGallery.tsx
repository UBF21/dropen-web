import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types'
import { productImgSrc } from '@/lib/utils'

interface Props {
  images: ProductImage[]
  productName: string
  fullyAgotado?: boolean
}

export default function ProductGallery({ images, productName, fullyAgotado = false }: Props) {
  const sorted = [...images]
    .sort((a, b) => a.order - b.order)
    .filter((img) => !img.url.includes('placehold.co'))
  const [activeIdx, setActiveIdx] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (sorted.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface overflow-hidden relative">
        <img
          src={productImgSrc(null, 900, 85)}
          alt={productName}
          className={`w-full h-full object-cover ${fullyAgotado ? 'grayscale' : ''}`}
        />
        {fullyAgotado && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center pointer-events-none">
            <span className="font-display font-bold text-4xl tracking-[0.3em] uppercase text-text-primary">
              Agotado
            </span>
          </div>
        )}
      </div>
    )
  }

  const active = sorted[activeIdx]

  function goPrev() {
    setActiveIdx((i) => (i - 1 + sorted.length) % sorted.length)
  }
  function goNext() {
    setActiveIdx((i) => (i + 1) % sorted.length)
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        aria-label="Ampliar imagen"
        className="group aspect-[3/4] overflow-hidden bg-surface block"
      >
        <img
          src={productImgSrc(active.url, 900, 85)}
          alt={active.alt_text ?? productName}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08] ${fullyAgotado ? 'grayscale' : ''}`}
        />
        {fullyAgotado && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center pointer-events-none">
            <span className="font-display font-bold text-4xl tracking-[0.3em] uppercase text-text-primary">
              Agotado
            </span>
          </div>
        )}
      </button>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`flex-shrink-0 w-16 h-20 overflow-hidden border-2 transition-colors ${
                i === activeIdx ? 'border-accent' : 'border-transparent'
              }`}
            >
              <img
                src={productImgSrc(img.url, 150, 70)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false) }}
              aria-label="Cerrar"
              className="absolute top-4 right-4 text-text-primary hover:text-accent transition-colors z-10"
            >
              <X className="w-7 h-7" />
            </button>

            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  aria-label="Imagen anterior"
                  className="absolute left-4 text-text-primary hover:text-accent transition-colors z-10"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  aria-label="Imagen siguiente"
                  className="absolute right-4 text-text-primary hover:text-accent transition-colors z-10"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            <img
              src={productImgSrc(active.url, 1600, 90)}
              alt={active.alt_text ?? productName}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
