import { motion } from 'framer-motion';
import { fadeUpItem } from '../../lib/motion';

export default function PageTitle({
  title,
  subtitle,
  action,
  gradient = false,
  emoji,
  className = '',
}) {
  return (
    <motion.div
      variants={fadeUpItem}
      initial="initial"
      animate="animate"
      className={`mb-6 flex items-start justify-between gap-4 ${className}`}
    >
      <div className="min-w-0">
        {gradient ? (
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {emoji && <span className="mr-2">{emoji}</span>}
            <span className="text-gradient">{title}</span>
          </h1>
        ) : (
          <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
            {emoji && <span className="mr-1.5">{emoji}</span>}
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
