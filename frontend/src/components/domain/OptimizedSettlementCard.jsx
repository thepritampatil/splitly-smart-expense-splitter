import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Avatar } from '../ui';

export default function OptimizedSettlementCard({
  debt,
  currentUserId,
  onPay,
  showOptimizedBadge = true,
}) {
  const isMyDebt = debt.fromUserId === currentUserId;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between gap-3 rounded-xl border p-3.5
        ${isMyDebt ? 'border-rose-500/25 bg-rose-500/8' : 'border-white/[0.06] bg-dark-700/60'}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Avatar name={debt.fromUserName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm text-white">
            <span className="font-medium">{isMyDebt ? 'You' : debt.fromUserName}</span>
            <ArrowRight size={12} className="mx-1 inline text-brand-400" />
            <span className="font-medium">
              {debt.toUserId === currentUserId ? 'You' : debt.toUserName}
            </span>
          </p>
          {showOptimizedBadge && (
            <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-brand-400">
              <Sparkles size={10} /> Optimized path
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-display text-sm font-bold text-white">
          ₹{Number(debt.amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </span>
        {isMyDebt && onPay && (
          <button type="button" onClick={() => onPay(debt)} className="btn-primary px-3 py-1.5 text-xs">
            Pay
          </button>
        )}
      </div>
    </motion.div>
  );
}
