import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'

export function AnimatedNumber({ value, suffix = '', decimals = 0, className }) {
  const count = useCountUp(value)
  return (
    <span className={className}>
      {(count / Math.pow(10, decimals)).toFixed(decimals)}
      {suffix}
    </span>
  )
}

export function FadeIn({ children, delay = 0, y = 24, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
