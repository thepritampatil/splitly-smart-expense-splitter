import { motion } from 'framer-motion';
import { getBadgeMeta } from '../../lib/badgeConfig';

export default function BadgeCard({ badge, compact = false, unlocked = true }) {
  const meta = getBadgeMeta(badge.badgeType);
  const earned = badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${meta.gradient}
        ${compact ? 'p-3' : 'p-4'} ${unlocked ? '' : 'opacity-40 grayscale'}`}
    >
      <div className="flex items-start gap-3">
        <span className={`${compact ? 'text-2xl' : 'text-3xl'}`}>{meta.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>{meta.label}</p>
          {earned && <p className="mt-0.5 text-[10px] text-slate-500">Earned {earned}</p>}
        </div>
      </div>
    </motion.div>
  );
}
