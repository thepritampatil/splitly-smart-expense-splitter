import { motion } from 'framer-motion';
import { pageVariants } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export default function PageTransition({ children, className = 'min-h-full' }) {
  const reduced = usePrefersReducedMotion();

  if (!children) {
    return null;
  }

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
