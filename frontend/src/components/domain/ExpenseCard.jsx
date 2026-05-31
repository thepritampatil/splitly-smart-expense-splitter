import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { Avatar, CATEGORY_CONFIG } from '../ui';
import { fadeUpItem } from '../../lib/motion';
import AvatarStack from './AvatarStack';

export default function ExpenseCard({
  expense,
  currentUserId,
  onEdit,
  onDelete,
  compact = false,
  showGroupName = false,
  className = '',
}) {
  const cat = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OTHER;
  const isMyExpense = currentUserId && expense.paidBy?.id === currentUserId;
  const participants = expense.participants || [];

  if (compact) {
    return (
      <motion.div variants={fadeUpItem} layout className={`list-row ${className}`}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-dark-800/80 text-lg">
          {cat.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{expense.description}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Avatar src={expense.paidBy?.avatar} name={expense.paidBy?.fullName} size="xs" />
            <p className="truncate text-xs text-slate-500">
              {expense.paidBy?.fullName}
              {showGroupName && expense.groupName && ` · ${expense.groupName}`}
            </p>
          </div>
        </div>
        <p className="flex-shrink-0 text-sm font-bold text-white">
          ₹{Number(expense.amount).toFixed(2)}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      variants={fadeUpItem}
      className={`group overflow-hidden rounded-2xl border border-white/[0.06] bg-dark-800/30 transition-colors hover:border-brand-500/20 ${className}`}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-dark-900/60 text-2xl">
          {cat.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-white">{expense.description}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-dark-900/50 px-2 py-0.5 text-[10px] font-medium ${cat.color}`}>
                  {cat.emoji} {cat.label}
                </span>
                {expense.createdAt && (
                  <span className="text-[10px] text-slate-600">
                    {format(new Date(expense.createdAt), 'MMM d, h:mm a')}
                  </span>
                )}
              </div>
            </div>
            <p className="font-display flex-shrink-0 text-lg font-bold text-white">
              ₹{Number(expense.amount).toFixed(2)}
            </p>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={expense.paidBy?.avatar} name={expense.paidBy?.fullName} size="xs" />
              <p className="truncate text-xs text-slate-400">
                Paid by{' '}
                <span className={isMyExpense ? 'font-medium text-brand-300' : 'text-slate-300'}>
                  {isMyExpense ? 'you' : expense.paidBy?.fullName}
                </span>
              </p>
            </div>
            {participants.length > 0 && (
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <span className="text-[10px] text-slate-600">Split</span>
                <AvatarStack users={participants} max={4} size="xs" />
              </div>
            )}
          </div>
        </div>

        {isMyExpense && onEdit && onDelete && (
          <div className="flex gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              aria-label="Edit expense"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/8 hover:text-white touch-manipulation"
            >
              <Edit2 size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense)}
              aria-label="Delete expense"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 touch-manipulation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
