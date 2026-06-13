import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

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
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: dur, delay: 0.3 }}
          className="mt-10"
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
