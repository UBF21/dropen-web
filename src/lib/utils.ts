import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SUPABASE_STORAGE = 'supabase.co/storage'

// Solo añade parámetros de optimización a URLs de Supabase Storage.
// URLs externas (placehold.co, etc.) se usan tal cual.
export function productImgSrc(url: string | null | undefined, width = 600): string {
  const DEFAULT =
    'https://icfqhtiujsboyrggxpqu.supabase.co/storage/v1/object/public/product-images/marzuk-nike-5578104_1920.jpg'
  if (!url || url.includes('placehold.co')) return DEFAULT
  if (url.includes(SUPABASE_STORAGE)) return `${url}?width=${width}&quality=80`
  return url
}
