import { MotionConfig } from 'framer-motion';
import { easeOut } from '../../lib/motion';

export default function MotionProvider({ children }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.28, ease: easeOut }}
    >
      {children}
    </MotionConfig>
  );
}
