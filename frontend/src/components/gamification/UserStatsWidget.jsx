import TrustScoreCard from './TrustScoreCard';
import StreakCounter from './StreakCounter';

export default function UserStatsWidget({ stats, loading }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TrustScoreCard stats={stats} loading={loading} />
      <div className="glass-card flex flex-col items-center justify-center p-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Current streak</p>
        <StreakCounter count={stats?.streakCount ?? 0} />
      </div>
    </div>
  );
}
