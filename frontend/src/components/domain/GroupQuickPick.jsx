import { motion } from 'framer-motion';
import { getGroupTheme } from '../../lib/theme';
import { GROUP_TYPE_CONFIG } from '../ui';

export default function GroupQuickPick({ groups, selectedId, onSelect }) {
  if (!groups.length) return null;

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {groups.map(g => {
        const active = String(g.id) === String(selectedId);
        const theme = getGroupTheme(g.groupType);
        const emoji = GROUP_TYPE_CONFIG[g.groupType]?.emoji || g.avatar || '👥';

        return (
          <motion.button
            key={g.id}
            type="button"
            onClick={() => onSelect(String(g.id))}
            whileTap={{ scale: 0.97 }}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all
              ${active
                ? `border-white/20 bg-gradient-to-r ${theme.gradient} text-white shadow-lg ${theme.glow}`
                : 'border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-white/10 hover:text-slate-200'
              }`}
          >
            <span>{emoji}</span>
            <span className="max-w-[120px] truncate">{g.groupName}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
