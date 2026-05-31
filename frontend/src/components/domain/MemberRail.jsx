import { UserMinus, Crown } from 'lucide-react';
import { Avatar } from '../ui';
import { getGroupTheme } from '../../lib/theme';
import { GROUP_TYPE_CONFIG } from '../ui';

export default function MemberRail({
  members = [],
  groupType,
  isAdmin,
  currentUserId,
  onInvite,
  onRemoveMember,
}) {
  const theme = getGroupTheme(groupType);
  const typeConfig = GROUP_TYPE_CONFIG[groupType] || GROUP_TYPE_CONFIG.OTHER;
  const accepted = members.filter(m => m.status === 'ACCEPTED' || !m.status);

  return (
    <div className="glass-card overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${theme.bar}`} />
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-semibold text-white">
              {typeConfig.emoji} Members
            </h3>
            <p className="text-xs text-slate-500">{accepted.length} in this space</p>
          </div>
          {isAdmin && onInvite && (
            <button
              type="button"
              onClick={onInvite}
              className="text-xs font-medium text-brand-400 hover:text-brand-300 touch-manipulation"
            >
              + Invite
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {accepted.map((m) => {
            const isMe = m.user?.id === currentUserId;
            const memberAdmin = m.role === 'ADMIN';
            return (
              <div
                key={m.id}
                className={`group relative flex min-w-[88px] flex-shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 transition-colors
                  ${isMe ? 'border-brand-500/30 bg-brand-500/10' : 'border-white/[0.06] bg-dark-800/50 hover:border-white/10'}`}
              >
                <div className="relative">
                  <Avatar src={m.user?.avatar} name={m.user?.fullName} size="md" />
                  {memberAdmin && (
                    <span
                      className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/90 text-[8px]"
                      title="Admin"
                    >
                      <Crown size={10} className="text-dark-900" />
                    </span>
                  )}
                </div>
                <span className="max-w-full truncate text-center text-xs font-medium text-slate-300">
                  {m.user?.fullName?.split(' ')[0]}
                  {isMe && ' (you)'}
                </span>
                {isAdmin && !isMe && onRemoveMember && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(m)}
                    aria-label={`Remove ${m.user?.fullName}`}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg bg-dark-900/80 text-slate-500 opacity-100 transition-all hover:bg-rose-500/20 hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                  >
                    <UserMinus size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
