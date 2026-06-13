import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import type { Collection } from '@/types'

interface Props {
  collections: Collection[]
  limit?: number
}

export default function DropsGrid({ collections, limit }: Props) {
  const prefersReduced = useReducedMotion()
  const items = limit ? collections.slice(0, limit) : collections

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-display font-bold text-3xl tracking-widest text-text-primary mb-12 uppercase">
          Drops
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((col, i) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: prefersReduced ? 0 : 0.5,
                delay: prefersReduced ? 0 : i * 0.1,
              }}
            >
              <Link
                to={`/colecciones/${col.slug}`}
                className="group block relative overflow-hidden aspect-[4/5] bg-surface border border-border"
              >
                {col.cover_url ? (
                  <img
                    src={`${col.cover_url}?width=800&quality=80`}
                    alt={col.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-text-muted text-xs tracking-widest uppercase mb-1">Coleccion</p>
                  <h3 className="font-display font-bold text-2xl text-text-primary">{col.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
