import { motion } from 'framer-motion';
import { chartReveal } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function ChartReveal({ children, delay = 0, className = '' }) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={chartReveal}
      initial="initial"
      animate="animate"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
