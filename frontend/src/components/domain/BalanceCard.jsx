import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Avatar } from '../ui';

export default function BalanceCard({ balance, currentUserId }) {
  const isMe = balance.userId === currentUserId;
  const net = Number(balance.netBalance);

  const status = net > 0
    ? { emoji: '💚', label: 'gets back', color: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' }
    : net < 0
      ? { emoji: '💸', label: 'owes', color: 'text-rose-400', bg: 'bg-rose-500/8 border-rose-500/20' }
      : { emoji: '✅', label: 'settled up', color: 'text-slate-400', bg: 'bg-dark-700/60 border-white/[0.04]' };

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${status.bg}
        ${isMe ? 'ring-1 ring-brand-500/25' : ''}`}
    >
      <Avatar name={balance.fullName} size="md" className={isMe ? 'ring-2 ring-brand-500/40' : ''} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">
          {balance.fullName}
          {isMe && <span className="ml-1 text-xs text-brand-400">(you)</span>}
        </p>
        <div className="mt-0.5 flex gap-3 text-xs text-slate-500">
          <span>Paid ₹{Number(balance.totalPaid).toLocaleString('en-IN')}</span>
          <span>Owes ₹{Number(balance.totalOwed).toLocaleString('en-IN')}</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`flex items-center justify-end gap-1 text-sm font-bold ${status.color}`}>
          {net > 0 ? <TrendingUp size={14} /> : net < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
          {net > 0 ? '+' : ''}₹{Math.abs(net).toFixed(2)}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {status.emoji} {status.label}
        </p>
      </div>
    </div>
  );
}
