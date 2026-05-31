import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakBanner({ streakCount = 0, longestStreak = 0 }) {
  if (!streakCount) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center gap-3 rounded-xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-amber-500/5 px-4 py-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/15">
        <Flame size={20} className="text-orange-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{streakCount}-day settlement streak</p>
        <p className="text-xs text-slate-500">Best: {longestStreak} days · Keep settling on time</p>
      </div>
    </motion.div>
  );
}
