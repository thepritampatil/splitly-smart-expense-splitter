// ActivityPage.jsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Receipt, Wallet, UserPlus, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { useActivityStore } from '../store';
import { EmptyState, Avatar } from '../components/ui';

const TYPE_CONFIG = {
  EXPENSE_ADDED:        { icon: Receipt,  color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  EXPENSE_UPDATED:      { icon: Receipt,  color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  EXPENSE_DELETED:      { icon: Receipt,  color: 'text-rose-400',    bg: 'bg-rose-500/10' },
  SETTLEMENT_INITIATED: { icon: Wallet,   color: 'text-amber-400',   bg: 'bg-amber-500/10' },
  SETTLEMENT_CONFIRMED: { icon: Wallet,   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  USER_JOINED_GROUP:    { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  USER_LEFT_GROUP:      { icon: Users,    color: 'text-rose-400',    bg: 'bg-rose-500/10' },
  GROUP_CREATED:        { icon: Users,    color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  GROUP_UPDATED:        { icon: Settings, color: 'text-slate-400',   bg: 'bg-slate-500/10' },
  MEMBER_INVITED:       { icon: UserPlus, color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  MEMBER_REMOVED:       { icon: Users,    color: 'text-rose-400',    bg: 'bg-rose-500/10' },
};

export default function ActivityPage() {
  const { activities, loading, fetchMyActivities } = useActivityStore();
  useEffect(() => { fetchMyActivities(); }, []);

  return (
    <div className="p-5 sm:p-7 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Activity Feed</h1>
        <p className="text-sm text-slate-500 mt-0.5">All actions across your groups</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : activities.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet"
          description="Join a group and start adding expenses to see activity here" />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-dark-600" />
          <div className="space-y-1">
            {activities.map((a, i) => {
              const conf = TYPE_CONFIG[a.type] || TYPE_CONFIG.GROUP_CREATED;
              const Icon = conf.icon;
              return (
                <motion.div key={a.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 py-3 pl-1">
                  <div className={`w-8 h-8 ${conf.bg} rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-2 ring-dark-900`}>
                    <Icon size={14} className={conf.color} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-slate-200 leading-snug">{a.message}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {a.groupName && (
                        <span className="text-xs text-brand-400/70 bg-brand-500/8 px-1.5 py-0.5 rounded">
                          {a.groupName}
                        </span>
                      )}
                      <span className="text-xs text-slate-600">
                        {a.timestamp && format(new Date(a.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
