import { motion } from 'framer-motion';
import { staggerContainer } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Wraps children that are motion items with `variants={fadeUpItem}`.
 */
export default function StaggerGrid({
  children,
  className = '',
  as: Component = motion.div,
}) {
  const reduced = usePrefersReducedMotion();
  const MotionEl = Component;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionEl
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </MotionEl>
  );
}
