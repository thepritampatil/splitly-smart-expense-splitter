import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/**
 * Smooth count-up for KPI values.
 * @param {number} value - target number
 * @param {(n: number) => string} format - formatter (receives rounded value)
 */
export default function AnimatedNumber({ value = 0, format = (n) => String(n), className = '' }) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const target = Number(value) || 0;

    if (reduced) {
      setDisplay(target);
      return;
    }

    const controls = animate(display, target, {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from latest display on value change
  }, [value, reduced]);

  return <span className={className}>{format(display)}</span>;
}
