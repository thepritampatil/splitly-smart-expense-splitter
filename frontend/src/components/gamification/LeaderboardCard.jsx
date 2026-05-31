import { motion } from 'framer-motion';
import { Avatar } from '../ui';
import { StaggerGrid } from '../motion';
import { fadeUpItem } from '../../lib/motion';

export default function LeaderboardCard({ entries = [], loading, title = 'Group leaderboard' }) {
  if (loading) {
    return <div className="glass-card p-4"><div className="skeleton h-32 rounded-lg" /></div>;
  }

  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      {entries.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-500">Leaderboard fills as members stay active</p>
      ) : (
        <StaggerGrid className="space-y-2">
          {entries.slice(0, 5).map((e) => (
            <motion.div
              key={e.userId}
              variants={fadeUpItem}
              layout
              className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2"
            >
              <span className={`w-6 text-center text-xs font-bold ${e.rank <= 3 ? 'text-brand-400' : 'text-slate-500'}`}>
                #{e.rank}
              </span>
              <Avatar src={e.avatar} name={e.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{e.fullName}</p>
                <p className="text-[10px] text-slate-500">{e.label}</p>
              </div>
              <span className="text-xs font-medium text-emerald-400">
                {Number(e.score).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </motion.div>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
