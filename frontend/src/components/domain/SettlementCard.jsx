import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { Avatar, SettlementBadge } from '../ui';
import SettlementStatusTrack from './SettlementStatusTrack';

export default function SettlementCard({
  settlement,
  currentUserId,
  onConfirm,
  onDecline,
  showGroupName = false,
  className = '',
}) {
  const isReceiver = settlement.receiver?.id === currentUserId;
  const isPayer = settlement.payer?.id === currentUserId;

  return (
    <div className={`overflow-hidden rounded-2xl border border-white/[0.06] bg-dark-800/40 ${className}`}>
      <div className="border-b border-white/[0.04] px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-0.5">
              <Avatar src={settlement.payer?.avatar} name={settlement.payer?.fullName} size="md" />
              <span className="max-w-[72px] truncate text-[10px] text-slate-500">
                {isPayer ? 'You' : settlement.payer?.fullName?.split(' ')[0]}
              </span>
            </div>

            <div className="flex flex-col items-center px-1">
              <div className="flex items-center gap-1 rounded-full bg-dark-900/80 px-2.5 py-1 ring-1 ring-white/[0.06]">
                <span className="font-display text-sm font-bold text-white">
                  ₹{Number(settlement.amount).toFixed(0)}
                </span>
              </div>
              <ArrowRight size={14} className="my-0.5 text-brand-400" />
              <span className="text-[10px] text-slate-600">payment</span>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <Avatar src={settlement.receiver?.avatar} name={settlement.receiver?.fullName} size="md" />
              <span className="max-w-[72px] truncate text-[10px] text-slate-500">
                {isReceiver ? 'You' : settlement.receiver?.fullName?.split(' ')[0]}
              </span>
            </div>
          </div>

          <SettlementBadge status={settlement.status} />
        </div>

        {showGroupName && settlement.groupName && (
          <p className="mt-2 text-center text-[10px] text-slate-500">{settlement.groupName}</p>
        )}

        <p className="mt-1 text-center text-[10px] text-slate-600">
          {settlement.createdAt && format(new Date(settlement.createdAt), 'MMM d, h:mm a')}
        </p>
      </div>

      <div className="px-4 pb-4">
        <SettlementStatusTrack status={settlement.status} />

        {settlement.status === 'PROCESSING' && isReceiver && onConfirm && (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onConfirm(settlement.id)}
              className="btn-primary flex-1 justify-center py-2.5 text-xs touch-manipulation"
            >
              ✅ Confirm received
            </button>
            {onDecline && (
              <button
                type="button"
                onClick={() => onDecline(settlement.id)}
                className="btn-danger px-4 py-2.5 text-xs touch-manipulation"
                aria-label="Decline payment"
              >
                ✗
              </button>
            )}
          </div>
        )}

        {settlement.status === 'PROCESSING' && isPayer && (
          <p className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 py-2.5 text-center text-xs text-amber-300">
            ⏳ Waiting for {settlement.receiver?.fullName} to confirm
          </p>
        )}

        {settlement.status === 'COMPLETED' && (
          <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-center text-xs text-emerald-300">
            🎉 Settled
            {settlement.settledAt && ` · ${format(new Date(settlement.settledAt), 'MMM d, yyyy')}`}
          </p>
        )}
      </div>
    </div>
  );
}
