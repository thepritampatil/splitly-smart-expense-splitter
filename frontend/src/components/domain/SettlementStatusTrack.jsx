const STEPS = [
  { key: 'PENDING', label: 'Pending', emoji: '⏳' },
  { key: 'PROCESSING', label: 'Sent', emoji: '💸' },
  { key: 'COMPLETED', label: 'Done', emoji: '✅' },
];

const STATUS_INDEX = { PENDING: 0, PROCESSING: 1, COMPLETED: 2 };

export default function SettlementStatusTrack({ status = 'PENDING' }) {
  const activeIdx = STATUS_INDEX[status] ?? 0;

  return (
    <div className="mt-3 flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        const pending = i > activeIdx;
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 ${done || active ? 'bg-brand-500/50' : 'bg-dark-600'}`}
                />
              )}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs transition-all
                  ${done ? 'bg-emerald-500/20 ring-1 ring-emerald-500/40' : ''}
                  ${active ? 'bg-brand-500/25 ring-2 ring-brand-400/50 scale-110' : ''}
                  ${pending ? 'bg-dark-700 ring-1 ring-white/5' : ''}`}
                title={step.label}
              >
                {step.emoji}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${done ? 'bg-emerald-500/40' : 'bg-dark-600'}`}
                />
              )}
            </div>
            <span
              className={`mt-1 text-[9px] font-medium uppercase tracking-wide
                ${active ? 'text-brand-300' : done ? 'text-emerald-400/80' : 'text-slate-600'}`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
