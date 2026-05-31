import { useReducedMotion } from 'framer-motion';

/**
 * Respects OS "reduce motion" via Framer Motion's hook + MotionConfig.
 */
export function usePrefersReducedMotion() {
  return useReducedMotion() ?? false;
}
