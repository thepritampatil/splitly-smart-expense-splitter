import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Area, AreaChart, CartesianGrid, XAxis, YAxis,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../ui';
import { ChartReveal } from '../motion';
import { CHART_ANIMATION_MS } from '../../lib/motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { CHART_COLORS, ChartTooltip, computeAnalyticsInsights } from '../../lib/charts';
import { CATEGORY_CONFIG } from '../ui';

export default function DashboardInsights({
  monthly,
  category,
  loading,
  groupId,
  chartKey,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const chartAnimate = !reducedMotion;

  const {
    monthlyData,
    categoryData,
  } = computeAnalyticsInsights(monthly, category, CATEGORY_CONFIG);

  if (loading) {
    return (
      <div className="mb-7 grid gap-5 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="skeleton mb-4 h-4 w-32 rounded" />
          <div className="skeleton h-[220px] rounded-xl" />
        </div>
        <div className="glass-card p-5">
          <div className="skeleton mb-4 h-4 w-28 rounded" />
          <div className="skeleton h-[220px] rounded-xl" />
        </div>
      </div>
    );
  }

  const hasData = monthlyData.length > 0 || categoryData.length > 0;

  if (!hasData) {
    return (
      <div className="glass-card mb-7 p-6">
        <EmptyState
          emoji="📊"
          title="No spending insights yet"
          description="Add expenses to this group to unlock charts and trends."
          action={
            groupId ? (
              <Link to={`/groups/${groupId}`} className="btn-primary text-sm">
                Open group
              </Link>
            ) : null
          }
        />
      </div>
    );
  }

  const gradientId = `dashArea-${groupId || 'default'}`;

  return (
    <motion.div
      key={chartKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="mb-7 grid gap-5 lg:grid-cols-2"
    >
      <ChartReveal delay={0.05} className="glass-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <TrendingUp size={16} className="text-brand-400" /> Spending trend
          </h3>
          <Link to="/analytics" className="text-xs text-brand-400 hover:text-brand-300">
            Full analytics →
          </Link>
        </div>
        {monthlyData.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-500">No monthly data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#818cf8"
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={{ fill: '#6366f1', r: 3 }}
                isAnimationActive={chartAnimate}
                animationDuration={CHART_ANIMATION_MS}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartReveal>

      <ChartReveal delay={0.12} className="glass-card p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <PieIcon size={16} className="text-emerald-400" /> By category
        </h3>
        {categoryData.length === 0 ? (
          <p className="py-10 text-center text-xs text-slate-500">No category data yet</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={chartAnimate}
                  animationDuration={CHART_ANIMATION_MS}
                  animationBegin={100}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 w-full space-y-1.5">
              {categoryData.slice(0, 5).map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={chartAnimate ? { opacity: 0, x: -8 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: c.fill || CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="flex-1 truncate text-xs text-slate-300">
                    {c.emoji} {c.name}
                  </span>
                  <span className="text-xs font-medium text-white">
                    ₹{c.value.toLocaleString('en-IN')}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </ChartReveal>
    </motion.div>
  );
}
