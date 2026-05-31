/** Shared Recharts helpers — dashboard & analytics */

export const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16'];

export function ChartTooltip({ active, payload, label }) {
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
}

export function formatCategoryData(category, categoryConfig) {
  return category.map(c => ({
    name: categoryConfig[c.category]?.label || c.category,
    value: Number(c.amount),
    emoji: categoryConfig[c.category]?.emoji || '📦',
    fill: c.color,
  }));
}

export function formatMonthlyData(monthly) {
  return monthly.map(m => ({
    month: m.month,
    amount: Number(m.amount),
  }));
}

export function computeAnalyticsInsights(monthly, category, categoryConfig) {
  const totalSpend = category.reduce((s, c) => s + Number(c.amount), 0);
  const peakMonth = monthly.reduce(
    (a, b) => (Number(a.amount) > Number(b.amount) ? a : b),
    { month: '—', amount: 0 }
  );
  const topCategory = category.reduce(
    (a, b) => (Number(a.amount) > Number(b.amount) ? a : b),
    { category: '-', amount: 0 }
  );

  const monthlyData = formatMonthlyData(monthly);
  const latestMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : null;

  let monthTrend = null;
  if (latestMonth && prevMonth && prevMonth.amount > 0) {
    const pct = ((latestMonth.amount - prevMonth.amount) / prevMonth.amount) * 100;
    const sign = pct >= 0 ? '+' : '';
    monthTrend = `${sign}${pct.toFixed(0)}% vs prior month`;
  }

  const topCategoryLabel =
    topCategory.category !== '-'
      ? categoryConfig[topCategory.category]?.label || topCategory.category
      : '—';

  return {
    totalSpend,
    peakMonth,
    topCategory,
    topCategoryLabel,
    latestMonth,
    monthTrend,
    monthlyData,
    categoryData: formatCategoryData(category, categoryConfig),
  };
}
