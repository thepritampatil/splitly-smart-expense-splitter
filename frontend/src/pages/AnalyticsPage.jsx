import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Area, AreaChart
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useGroupStore, useAnalyticsStore } from '../store';
import { EmptyState, StatCard, SkeletonCard, CATEGORY_CONFIG } from '../components/ui';
import { PageContainer } from '../components/shell';
import PageTitle from '../components/ui/PageTitle';
import { ChartReveal, StaggerGrid } from '../components/motion';
import { fadeUpItem, CHART_ANIMATION_MS } from '../lib/motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-dark-700/95 px-3 py-2 text-sm shadow-glass backdrop-blur-md">
      {label && <p className="mb-1 text-xs text-slate-400">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
          ₹{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { groups, fetchGroups } = useGroupStore();
  const { monthly, category, loading, fetchAnalytics } = useAnalyticsStore();
  const [selectedGroup, setSelectedGroup] = useState('');
  const reducedMotion = usePrefersReducedMotion();
  const chartAnimate = !reducedMotion;

  useEffect(() => { fetchGroups(); }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchAnalytics(parseInt(selectedGroup));
    } else if (groups.length > 0) {
      setSelectedGroup(String(groups[0].id));
    }
  }, [selectedGroup, groups.length]);

  const totalSpend = category.reduce((s, c) => s + Number(c.amount), 0);
  const peakMonth = monthly.reduce((a, b) => Number(a.amount) > Number(b.amount) ? a : b, { amount: 0 });
  const topCategory = category.reduce((a, b) => Number(a.amount) > Number(b.amount) ? a : b, { category: '-', amount: 0 });

  const categoryData = category.map(c => ({
    name: CATEGORY_CONFIG[c.category]?.label || c.category,
    value: Number(c.amount),
    emoji: CATEGORY_CONFIG[c.category]?.emoji || '📦',
    fill: c.color,
  }));

  const monthlyData = monthly.map(m => ({
    month: m.month,
    amount: Number(m.amount),
  }));

  const chartKey = `${selectedGroup}-${monthlyData.length}-${categoryData.length}`;

  return (
    <PageContainer maxWidth="5xl">
      <PageTitle
        title="Analytics"
        subtitle="Spending insights and trends"
        emoji="📊"
        action={
          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            className="input-field max-w-[180px] text-sm"
          >
            <option value="">Select group…</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.groupName}</option>
            ))}
          </select>
        }
      />

      {!selectedGroup ? (
        <EmptyState icon={TrendingUp} title="Select a group" description="Choose a group to view analytics" />
      ) : loading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        </div>
      ) : (
        <motion.div
          key={chartKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          <StaggerGrid className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <motion.div variants={fadeUpItem}>
              <StatCard
                label="Total Spend"
                count={totalSpend}
                formatCount={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`}
                icon={TrendingUp}
                color="brand"
              />
            </motion.div>
            <motion.div variants={fadeUpItem}>
              <StatCard
                label="Peak Month"
                value={peakMonth.month || '—'}
                icon={BarChart2}
                color="yellow"
                sub={peakMonth.amount ? `₹${Number(peakMonth.amount).toLocaleString('en-IN')}` : 'No data'}
              />
            </motion.div>
            <motion.div variants={fadeUpItem}>
              <StatCard
                label="Top Category"
                value={topCategory.category !== '-' ? (CATEGORY_CONFIG[topCategory.category]?.label || topCategory.category) : '—'}
                icon={PieIcon}
                color="green"
                sub={topCategory.amount ? `₹${Number(topCategory.amount).toLocaleString('en-IN')}` : 'No data'}
              />
            </motion.div>
          </StaggerGrid>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartReveal delay={0.05} className="glass-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp size={16} className="text-brand-400" /> Monthly Spending
              </h3>
              {monthlyData.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-500">No monthly data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      fill="url(#colorAmt)"
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
                <PieIcon size={16} className="text-emerald-400" /> By Category
              </h3>
              {categoryData.length === 0 ? (
                <p className="py-10 text-center text-xs text-slate-500">No category data yet</p>
              ) : (
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={chartAnimate}
                        animationDuration={CHART_ANIMATION_MS}
                        animationBegin={100}
                      >
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {categoryData.map((c, i) => (
                      <motion.div
                        key={c.name}
                        initial={chartAnimate ? { opacity: 0, x: -8 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                          style={{ background: c.fill || COLORS[i % COLORS.length] }}
                        />
                        <span className="flex-1 text-xs text-slate-300">{c.emoji} {c.name}</span>
                        <span className="text-xs font-medium text-white">
                          ₹{c.value.toLocaleString('en-IN')}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </ChartReveal>
          </div>

          {monthlyData.length > 1 && (
            <ChartReveal delay={0.18} className="glass-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart2 size={16} className="text-amber-400" /> Monthly Comparison
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="amount"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    isAnimationActive={chartAnimate}
                    animationDuration={CHART_ANIMATION_MS}
                    animationEasing="ease-out"
                  >
                    {monthlyData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${240 + i * 15}, 80%, ${60 - i * 3}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartReveal>
          )}
        </motion.div>
      )}
    </PageContainer>
  );
}
