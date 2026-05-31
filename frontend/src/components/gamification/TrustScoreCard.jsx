import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';

export default function TrustScoreCard({ stats, loading }) {
  if (loading) {
    return <div className="glass-card p-5"><div className="skeleton h-24 rounded-lg" /></div>;
  }
  if (!stats) return null;

  const trust = Number(stats.trustScore || 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Trust score</p>
      <div className="flex items-center gap-4">
        <ProgressRing value={trust} max={100} label="Trust" />
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Streak</span>
            <span className="font-medium text-white">{stats.streakCount} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Settlements</span>
            <span className="font-medium text-white">{stats.totalSettlements}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Success rate</span>
            <span className="font-medium text-emerald-400">{Number(stats.settlementSuccessRate || 0).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
