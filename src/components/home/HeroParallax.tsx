import { useRef, useId } from 'react'
import {
  motion, useScroll, useTransform, useReducedMotion, AnimatePresence,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const HERO_BG =
  'https://icfqhtiujsboyrggxpqu.supabase.co/storage/v1/object/public/product-images/hero/jeans-stack.jpg'
const HERO_PANEL =
  'https://icfqhtiujsboyrggxpqu.supabase.co/storage/v1/object/public/product-images/hero/jeans-detail.jpg'

export default function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const grainId = useId()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '50%'])
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])
  const panelY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '-65px'])

  return (
    <motion.div
      ref={ref}
      className="relative h-screen overflow-hidden"
      {...(prefersReduced
        ? {}
        : {
            initial: { clipPath: 'inset(50% 50% 50% 50%)' },
            animate: { clipPath: 'inset(0% 0% 0% 0%)' },
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] },
          }
      )}
    >
      <motion.div style={{ y: bgY }} className="absolute inset-0" aria-hidden="true">
        <img
          src={HERO_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
      </motion.div>

      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden="true"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id={grainId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${grainId})`} />
        </svg>
      </div>

      {/* Panel editorial flotante — solo desktop */}
      <motion.div
        style={{ y: panelY }}
        className="absolute right-0 top-0 h-full w-[38%] hidden md:block border-l border-border overflow-hidden"
        aria-hidden="true"
        {...(prefersReduced
          ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6 } }
          : {
              initial: { clipPath: 'inset(0% 0% 0% 100%)' },
              animate: { clipPath: 'inset(0% 0% 0% 0%)' },
              transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.4 },
            }
        )}
      >
        <img
          src={HERO_PANEL}
          alt=""
          className="w-full h-full object-cover object-center"
        />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 md:pr-[40%]">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: prefersReduced ? 0 : 0.9 }}
          className="font-display font-bold text-7xl md:text-9xl tracking-[0.2em] text-text-primary"
        >
          DROPEN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: prefersReduced ? 0.3 : 1.2 }}
          className="mt-4 text-text-muted text-base md:text-lg tracking-widest uppercase"
        >
          Jeans baggy de edición limitada
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: prefersReduced ? 0.6 : 1.5 }}
          className="mt-10"
        >
          <Button
            asChild
            className="bg-accent hover:bg-accent-hover text-background px-10 py-3 text-xs tracking-[0.2em] uppercase rounded-none"
          >
            <Link to="/colecciones">Ver colecciones</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <AnimatePresence>
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          aria-hidden="true"
        >
          <motion.div
            animate={prefersReduced ? {} : { y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-6 h-6 text-text-muted" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
