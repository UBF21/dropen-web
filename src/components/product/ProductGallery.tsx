import { useState } from 'react'
import type { ProductImage } from '@/types'

interface Props {
  images: ProductImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: Props) {
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [activeIdx, setActiveIdx] = useState(0)

  if (sorted.length === 0) {
    return (
      <div className="aspect-[3/4] bg-surface flex items-center justify-center text-text-muted text-sm">
        Sin imagen
      </div>
    )
  }

  const active = sorted[activeIdx]

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[3/4] overflow-hidden bg-surface">
        <img
          src={`${active.url}?width=900&quality=85`}
          alt={active.alt_text ?? productName}
          className="w-full h-full object-cover"
        />
      </div>
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
    </div>
  )
}
