import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import { useGroupStore, useAnalyticsStore } from '../store';
import { EmptyState, StatCard } from '../components/ui';
import { CATEGORY_CONFIG } from '../components/ui';

const COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#8b5cf6','#06b6d4','#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      {label && <p className="text-slate-400 text-xs mb-1">{label}</p>}
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

  useEffect(() => { fetchGroups(); }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchAnalytics(parseInt(selectedGroup));
    } else if (groups.length > 0) {
      setSelectedGroup(String(groups[0].id));
    }
  }, [selectedGroup, groups.length]);

  const totalSpend  = category.reduce((s, c) => s + Number(c.amount), 0);
  const peakMonth   = monthly.reduce((a, b) => Number(a.amount) > Number(b.amount) ? a : b, { amount: 0 });
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

  return (
    <div className="p-5 sm:p-7 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Spending insights and trends</p>
        </div>
        <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
          className="input-field text-sm max-w-[180px]">
          <option value="">Select group…</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.groupName}</option>
          ))}
        </select>
      </div>

      {!selectedGroup ? (
        <EmptyState icon={TrendingUp} title="Select a group" description="Choose a group to view analytics" />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Total Spend" value={`₹${Number(totalSpend).toLocaleString('en-IN')}`}
              icon={TrendingUp} color="brand" />
            <StatCard label="Peak Month"
              value={peakMonth.month || '—'}
              icon={BarChart2} color="yellow"
              sub={peakMonth.amount ? `₹${Number(peakMonth.amount).toLocaleString('en-IN')}` : 'No data'} />
            <StatCard label="Top Category"
              value={topCategory.category !== '-' ? (CATEGORY_CONFIG[topCategory.category]?.label || topCategory.category) : '—'}
              icon={PieIcon} color="green"
              sub={topCategory.amount ? `₹${Number(topCategory.amount).toLocaleString('en-IN')}` : 'No data'} />
          </div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Monthly Trend - Area Chart */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-400" /> Monthly Spending
              </h3>
              {monthlyData.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No monthly data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2}
                      fill="url(#colorAmt)" dot={{ fill: '#6366f1', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category Pie Chart */}
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <PieIcon size={16} className="text-emerald-400" /> By Category
              </h3>
              {categoryData.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No category data yet</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="value">
                        {categoryData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {categoryData.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: c.fill || COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-slate-300 flex-1">{c.emoji} {c.name}</span>
                        <span className="text-xs font-medium text-white">
                          ₹{c.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart - Monthly comparison */}
          {monthlyData.length > 1 && (
            <div className="glass-card p-5">
              <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-amber-400" /> Monthly Comparison
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]}
                    maxBarSize={48}>
                    {monthlyData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${240 + i * 15}, 80%, ${60 - i * 3}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
