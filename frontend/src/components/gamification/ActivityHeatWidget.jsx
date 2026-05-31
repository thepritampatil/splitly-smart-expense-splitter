import { motion } from 'framer-motion';

export default function ActivityHeatWidget({ heatmap = [], loading }) {
  if (loading) {
    return <div className="glass-card p-4"><div className="skeleton h-16 rounded-lg" /></div>;
  }

  const maxScore = Math.max(1, ...heatmap.map((p) => Number(p.activityScore || 0)));

  return (
    <div className="glass-card p-4">
      <p className="mb-3 text-xs font-medium text-slate-500">7-day activity</p>
      <div className="flex items-end justify-between gap-1">
        {heatmap.length === 0 ? (
          <p className="w-full py-4 text-center text-xs text-slate-600">No activity data yet</p>
        ) : (
          heatmap.map((point) => {
            const h = Math.max(8, (Number(point.activityScore || 0) / maxScore) * 48);
            const day = point.day ? new Date(point.day).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2) : '';
            return (
              <div key={point.day} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-[28px] rounded-t bg-gradient-to-t from-brand-600/80 to-brand-400/40"
                  title={`${point.expenseCount} expenses, ${point.settlementCount} settlements`}
                />
                <span className="text-[9px] text-slate-600">{day}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
