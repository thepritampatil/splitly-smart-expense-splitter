/** Shared Framer Motion presets — Phase 4 */

export const easeOut = [0.22, 1, 0.36, 1];

export const spring = { type: 'spring', damping: 26, stiffness: 320 };

export const springModal = { type: 'spring', damping: 28, stiffness: 340 };

export const springSnappy = { type: 'spring', damping: 22, stiffness: 400 };

export const duration = {
  fast: 0.18,
  normal: 0.28,
  slow: 0.45,
};

/** Route-level page enter/exit */
export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: duration.fast, ease: easeOut },
  },
};

/** Staggered list / grid children */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const fadeUpItem = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: spring },
};

/** Modals */
export const slideUpSheet = {
  initial: { opacity: 0, y: '100%' },
  animate: { opacity: 1, y: 0, transition: springModal },
  exit: { opacity: 0, y: '100%', transition: { duration: 0.2 } },
};

export const slideCenterModal = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springModal },
  exit: { opacity: 0, scale: 0.95, y: 16, transition: { duration: 0.15 } },
};

/** Chart reveal wrapper */
export const chartReveal = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.slow, ease: easeOut },
  },
};

/** Recharts defaults (when motion not reduced) */
export const CHART_ANIMATION_MS = 800;
