import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

export function AnimatedSectionTitle({ children, className = '' }: Props) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: prefersReduced ? 0 : 0.5 }}
      className={className}
    >
      {children}
    </motion.h2>
  )
}
