import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function GroupActivityBanner({ insights, loading }) {
  if (loading) return <div className="skeleton mb-4 h-14 rounded-xl" />;
  if (!insights?.headline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center gap-3 rounded-xl border border-brand-500/20 bg-brand-500/8 px-4 py-3"
    >
      <Sparkles size={18} className="shrink-0 text-brand-400" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{insights.headline}</p>
        <p className="text-xs text-slate-500">
          {insights.weeklyExpenses} expenses · {insights.weeklySettlements} settlements this week
        </p>
      </div>
    </motion.div>
  );
}
