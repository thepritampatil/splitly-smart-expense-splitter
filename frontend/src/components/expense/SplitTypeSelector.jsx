import { motion } from 'framer-motion';
import { SPLIT_TYPES } from '../../lib/splitValidation';

export default function SplitTypeSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl bg-dark-900/80 p-1 ring-1 ring-white/[0.06]">
      {SPLIT_TYPES.map(type => {
        const active = value === type.value;
        return (
          <button
            key={type.value}
            type="button"
            onClick={() => onChange(type.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition-colors touch-manipulation
              ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {active && (
              <motion.div
                layoutId="split-type-pill"
                className="absolute inset-0 rounded-lg bg-brand-500/20 ring-1 ring-brand-500/30"
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              />
            )}
            <span className="relative z-10">{type.emoji}</span>
            <span className="relative z-10 hidden sm:inline">{type.label}</span>
          </button>
        );
      })}
    </div>
  );
}
