import { motion, AnimatePresence } from 'framer-motion';

export default function SplitPreviewBar({ total, allocated, remaining, validation, splitType }) {
  const pct = total > 0 ? Math.min(100, (allocated / total) * 100) : 0;
  const isPercent = splitType === 'PERCENTAGE';
  const target = isPercent ? 100 : total;
  const current = isPercent ? (100 - (validation.remaining ?? 0)) : allocated;
  const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-dark-900/50 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-slate-500">
          {isPercent ? 'Percentage allocated' : 'Amount allocated'}
        </span>
        <span className={validation.valid ? 'text-emerald-400' : 'text-amber-400'}>
          {isPercent
            ? `${current.toFixed(1)}% / 100%`
            : `₹${allocated.toFixed(2)} / ₹${total.toFixed(2)}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-dark-700">
        <motion.div
          className={`h-full rounded-full ${validation.valid ? 'bg-emerald-500' : 'bg-amber-500'}`}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
      <AnimatePresence>
        {validation.message && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-rose-400"
          >
            {validation.message}
          </motion.p>
        )}
      </AnimatePresence>
      {!validation.message && validation.valid && total > 0 && (
        <p className="mt-2 text-xs text-emerald-400/80">Split looks good ✓</p>
      )}
    </div>
  );
}
