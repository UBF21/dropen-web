import { useRef } from 'react'
import {
  motion, useScroll, useTransform, useReducedMotion, AnimatePresence,
} from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', prefersReduced ? '0%' : '50%'])
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0])

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-surface" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </motion.div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display font-bold text-7xl md:text-9xl tracking-[0.2em] text-text-primary"
        >
          DROPEN
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-4 text-text-muted text-base md:text-lg tracking-widest uppercase"
        >
          Jeans baggy de edicion limitada
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
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
    </div>
  )
}
