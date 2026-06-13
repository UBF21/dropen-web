import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ImageUploader from '../ImageUploader'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.webp' } }),
      }),
    },
  },
}))

describe('ImageUploader', () => {
  it('muestra la zona de arrastre', () => {
    render(<ImageUploader productId="p1" onUploaded={vi.fn()} />)
    expect(screen.getByText(/arrastrá una imagen/i)).toBeInTheDocument()
  })

  it('muestra "Seleccionar archivo" como label', () => {
    render(<ImageUploader productId="p1" onUploaded={vi.fn()} />)
    expect(screen.getByText(/seleccionar archivo/i)).toBeInTheDocument()
  })
})
