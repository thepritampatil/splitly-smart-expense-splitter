import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Users, Settings } from 'lucide-react';
import { GROUP_TYPE_CONFIG, Avatar } from '../ui';
import { getGroupTheme } from '../../lib/theme';

export default function GroupHeader({
  group,
  isAdmin,
  onAddExpense,
  onInvite,
  onEdit,
}) {
  const navigate = useNavigate();
  const typeConfig = GROUP_TYPE_CONFIG[group.type] || GROUP_TYPE_CONFIG.OTHER;
  const theme = getGroupTheme(group.type);
  const emoji = group.avatar?.length <= 2 ? group.avatar : typeConfig.emoji;
  const members = group.members?.filter(m => m.status === 'ACCEPTED') || group.members || [];
  const displayMembers = members.slice(0, 5);
  const overflow = members.length - displayMembers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative mb-5 overflow-hidden rounded-2xl border border-white/[0.06] shadow-glass ${theme.glow}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_55%)]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-[1px]" aria-hidden />

      <div className="relative p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate('/groups')}
            aria-label="Back to groups"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-dark-900/40 text-slate-300 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white touch-manipulation"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-dark-900/50 text-3xl shadow-lg backdrop-blur-md ring-2 ${theme.ring}`}
            >
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <span
                className={`mb-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${theme.badgeClass}`}
              >
                {typeConfig.emoji} {typeConfig.label}
              </span>
              <h1 className="font-display truncate text-xl font-bold text-white sm:text-2xl">
                {group.groupName}
              </h1>
              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                {members.length} members · ₹{Number(group.totalExpenses || 0).toLocaleString('en-IN')} total
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={onInvite}
                  className="btn-secondary hidden py-2 text-xs sm:inline-flex touch-manipulation"
                >
                  <Users size={13} /> Invite
                </button>
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Group settings"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-dark-900/40 text-slate-400 backdrop-blur-md hover:bg-white/10 hover:text-white touch-manipulation"
                >
                  <Settings size={16} />
                </button>
              </>
            )}
            <button type="button" onClick={onAddExpense} className="btn-primary py-2 text-xs touch-manipulation">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {group.description && (
          <p className="mb-3 line-clamp-2 text-sm text-slate-400">{group.description}</p>
        )}

        {displayMembers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {displayMembers.map((m) => (
                <Avatar
                  key={m.id}
                  src={m.user?.avatar}
                  name={m.user?.fullName}
                  size="sm"
                  className="ring-2 ring-dark-800"
                />
              ))}
            </div>
            {overflow > 0 && (
              <span className="text-xs font-medium text-slate-500">+{overflow} more</span>
            )}
            <span className={`ml-auto text-xs font-medium ${theme.accent}`}>
              {typeConfig.emoji} Your space
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
