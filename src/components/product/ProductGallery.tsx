import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/types'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [activeIdx, setActiveIdx] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (sorted.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface flex items-center justify-center text-text-muted text-sm">
        Sin imagen
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
          src={`${active.url}?width=900&quality=85`}
          alt={active.alt_text ?? productName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />
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
                src={`${img.url}?width=150&quality=70`}
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
              src={`${active.url}?width=1600&quality=90`}
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
