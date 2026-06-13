import { useEffect } from 'react'

interface Props {
  title: string
  description?: string
  image?: string
  url?: string
}

export default function PageMeta({ title, description, image, url }: Props) {
  const fullTitle = title === 'DROPEN' ? 'DROPEN' : `${title} — DROPEN`
  const desc = description ?? 'Jeans baggy premium. Streetwear consciente desde Lima.'

  useEffect(() => {
    document.title = fullTitle
    setMeta('description', desc)
    setMeta('og:title', fullTitle)
    setMeta('og:description', desc)
    setMeta('og:type', 'website')
    if (url) setMeta('og:url', url)
    if (image) setMeta('og:image', image)
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', fullTitle)
    setMeta('twitter:description', desc)
    if (image) setMeta('twitter:image', image)
  }, [fullTitle, desc, image, url])

  return null
}

function setMeta(nameOrProperty: string, content: string) {
  const isOg = nameOrProperty.startsWith('og:') || nameOrProperty.startsWith('twitter:')
  const attr = isOg ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, nameOrProperty)
    document.head.appendChild(el)
  }
  el.content = content
}
