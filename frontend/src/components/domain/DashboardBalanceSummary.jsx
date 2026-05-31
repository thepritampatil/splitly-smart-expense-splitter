import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Avatar } from '../ui';

export default function DashboardBalanceSummary({ balance, groupId, groupName, loading }) {
  if (loading) {
    return (
      <div className="glass-card p-5">
        <div className="skeleton mb-3 h-4 w-24 rounded" />
        <div className="skeleton h-16 rounded-xl" />
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="glass-card p-5">
        <h2 className="mb-3 text-sm font-semibold text-white">Your balance</h2>
        <p className="text-center text-xs text-slate-500 py-4">
          Add expenses in {groupName || 'this group'} to see your balance
        </p>
      </div>
    );
  }

  const net = Number(balance.netBalance);
  const status = net > 0
    ? { emoji: '💚', label: 'You get back', color: 'text-emerald-400', Icon: TrendingUp }
    : net < 0
      ? { emoji: '💸', label: 'You owe', color: 'text-rose-400', Icon: TrendingDown }
      : { emoji: '✅', label: 'All settled', color: 'text-slate-300', Icon: Minus };

  const { Icon } = status;

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Your balance</h2>
        {groupId && (
          <Link
            to={`/groups/${groupId}`}
            className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
          >
            Details <ArrowRight size={12} />
          </Link>
        )}
      </div>
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-brand-500/10 via-transparent to-violet-500/5 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={balance.fullName} size="md" className="ring-2 ring-brand-500/30" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500">{groupName}</p>
            <p className={`mt-1 flex items-center gap-1 font-display text-2xl font-bold ${status.color}`}>
              <Icon size={18} />
              {net > 0 ? '+' : net < 0 ? '-' : ''}₹{Math.abs(net).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {status.emoji} {status.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
