import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function OptimizationSummaryBanner({ summary }) {
  if (!summary || summary.allSettled) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4"
      >
        <p className="text-sm font-medium text-emerald-300">All settled up in this group</p>
        <p className="mt-0.5 text-xs text-slate-500">No payments needed right now</p>
      </motion.div>
    );
  }

  const { optimizedTransactionCount, naiveTransactionCount, reductionPercent } = summary;
  if (optimizedTransactionCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 rounded-xl border border-brand-500/25 bg-gradient-to-r from-brand-500/10 to-violet-500/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 ring-1 ring-brand-500/30">
          <Sparkles size={18} className="text-brand-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Smart settlement optimized</p>
          <p className="mt-1 text-xs text-slate-400">
            Reduced <span className="font-medium text-brand-300">{naiveTransactionCount}</span> possible
            payments to{' '}
            <span className="font-medium text-emerald-400">{optimizedTransactionCount}</span> —{' '}
            <span className="font-medium text-white">{Math.round(reductionPercent)}% simpler</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
