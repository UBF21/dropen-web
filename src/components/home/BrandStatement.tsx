import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useReducedMotion, animate } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface StatProps {
  target: number
  suffix?: string
  label: string
  delay?: number
}

function CountUpStat({ target, suffix = '', label, delay = 0 }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const prefersReduced = useReducedMotion()
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    return motionValue.on('change', (v) => setDisplay(Math.round(v)))
  }, [motionValue])

  useEffect(() => {
    if (!inView) return
    if (prefersReduced) { setDisplay(target); return }
    animate(motionValue, target, { duration: 1.2, ease: 'easeOut', delay })
  }, [inView, target, prefersReduced, motionValue, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReduced ? 0 : 0.5, delay }}
      className="text-center"
    >
      <p className="font-display font-bold text-4xl text-accent tabular-nums">
        {display}{suffix}
      </p>
      <p className="text-xs text-text-muted uppercase tracking-widest mt-2">{label}</p>
    </motion.div>
  )
}

export default function BrandStatement() {
  const dur = useReducedMotion() ? 0 : 0.7
  return (
    <section className="py-32 px-4 bg-surface border-t border-b border-border">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: dur }}
          className="font-display font-bold text-4xl md:text-5xl text-text-primary tracking-wide"
        >
          Pedidos por lote para distribuidores
        </motion.h2>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 my-14">
          <CountUpStat target={50}  suffix="+"  label="Productos"    delay={0} />
          <CountUpStat target={3}   suffix=""   label="Colecciones"  delay={0.15} />
          <CountUpStat target={100} suffix="%"  label="Streetwear"   delay={0.3} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: dur, delay: 0.3 }}
        >
          <Button
            asChild
            variant="outline"
            className="border-accent text-accent hover:bg-accent hover:text-background px-10 py-3 text-xs tracking-[0.2em] uppercase rounded-none"
          >
            <Link to="/wholesale">Hacer pedido wholesale</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
