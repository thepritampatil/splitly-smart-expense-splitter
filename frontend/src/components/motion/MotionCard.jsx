import { motion } from 'framer-motion';
import { fadeUpItem } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * List/grid card with optional layout animation and hover lift.
 */
export default function MotionCard({
  children,
  className = '',
  layout = false,
  hoverLift = true,
  as: Tag = motion.div,
  ...props
}) {
  const reduced = usePrefersReducedMotion();
  const MotionEl = Tag;

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionEl
      className={className}
      layout={layout}
      variants={fadeUpItem}
      whileHover={hoverLift ? { y: -2, transition: { duration: 0.2 } } : undefined}
      whileTap={{ scale: 0.99 }}
      {...props}
    >
      {children}
    </MotionEl>
  );
}
