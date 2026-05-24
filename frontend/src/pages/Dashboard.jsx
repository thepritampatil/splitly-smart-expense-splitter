import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Receipt, Wallet, TrendingUp, ArrowRight, Clock, IndianRupee } from 'lucide-react';
import { useAuthStore, useGroupStore, useExpenseStore, useActivityStore } from '../store';
import { StatCard, SkeletonCard, EmptyState, Avatar, CATEGORY_CONFIG } from '../components/ui';
import { format } from 'date-fns';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

function ExpenseCard({ expense }) {
  const cat = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OTHER;
  return (
    <motion.div variants={fadeUp} className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors">
      <div className="w-9 h-9 bg-dark-600 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
        {cat.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{expense.description}</p>
        <p className="text-xs text-slate-500">Paid by {expense.paidBy?.fullName} · {expense.groupName}</p>
      </div>
      <p className="text-sm font-semibold text-white flex-shrink-0">₹{Number(expense.amount).toFixed(2)}</p>
    </motion.div>
  );
}

function ActivityItem({ activity }) {
  const typeColors = {
    EXPENSE_ADDED: 'bg-brand-500/15 text-brand-400',
    SETTLEMENT_CONFIRMED: 'bg-emerald-500/15 text-emerald-400',
    SETTLEMENT_INITIATED: 'bg-amber-500/15 text-amber-400',
    USER_JOINED_GROUP: 'bg-purple-500/15 text-purple-400',
    GROUP_CREATED: 'bg-cyan-500/15 text-cyan-400',
  };
  const colorClass = typeColors[activity.type] || 'bg-slate-500/15 text-slate-400';
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/4 last:border-0">
      {activity.triggeredBy ? (
        <Avatar src={activity.triggeredBy.avatar} name={activity.triggeredBy.fullName} size="sm" />
      ) : (
        <div className="w-8 h-8 bg-dark-600 rounded-full flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 leading-snug">{activity.message}</p>
        <p className="text-xs text-slate-600 mt-0.5">
          {activity.groupName && <span className="text-slate-500">{activity.groupName} · </span>}
          {activity.timestamp && format(new Date(activity.timestamp), 'MMM d, h:mm a')}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { groups, loading: groupsLoading, fetchGroups } = useGroupStore();
  const { expenses, fetchExpenses }    = useExpenseStore();
  const { activities, loading: actLoading, fetchMyActivities } = useActivityStore();

  useEffect(() => {
    fetchGroups();
    fetchMyActivities();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && groups[0]) {
      fetchExpenses(groups[0].id);
    }
  }, [groups.length]);

  const totalExpenses = groups.reduce((sum, g) => sum + (Number(g.totalExpenses) || 0), 0);
  const activeGroups = groups.length;
  const recentExpenses = expenses.slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-5 sm:p-7 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <h1 className="text-2xl font-bold text-white">
          {greeting()}, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's your financial overview</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={stagger} initial="initial" animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <motion.div variants={fadeUp}>
          <StatCard label="Active Groups" value={activeGroups} icon={Users} color="brand"
            sub={activeGroups === 0 ? 'Create your first group' : 'Groups you belong to'} />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Total Expenses" value={`₹${totalExpenses.toFixed(0)}`} icon={Receipt} color="yellow"
            sub="Across all groups" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Recent Expenses" value={recentExpenses.length} icon={IndianRupee} color="green"
            sub="Latest group expenses" />
        </motion.div>
        <motion.div variants={fadeUp}>
          <StatCard label="Activities" value={activities.length} icon={TrendingUp} color="red"
            sub="Total logged actions" />
        </motion.div>
      </motion.div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white text-sm">Recent Expenses</h2>
            <Link to="/groups" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <EmptyState icon={Receipt} title="No expenses yet"
              description="Add your first expense from any group"
              action={
                <Link to="/groups" className="btn-primary text-sm">
                  <Users size={14} /> Go to Groups
                </Link>
              } />
          ) : (
            <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-2">
              {recentExpenses.map(e => <ExpenseCard key={e.id} expense={e} />)}
            </motion.div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* My Groups */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm">My Groups</h2>
              <Link to="/groups" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All <ArrowRight size={12} />
              </Link>
            </div>
            {groupsLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            ) : groups.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No groups yet</p>
            ) : (
              <div className="space-y-1.5">
                {groups.slice(0, 5).map(g => (
                  <Link key={g.id} to={`/groups/${g.id}`}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <span className="text-lg">{g.avatar?.length <= 2 ? g.avatar : '👥'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-brand-300 transition-colors">{g.groupName}</p>
                      <p className="text-xs text-slate-500">{g.members?.length || 0} members</p>
                    </div>
                    <ArrowRight size={12} className="text-slate-600 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm">Recent Activity</h2>
              <Link to="/activity" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
                All <ArrowRight size={12} />
              </Link>
            </div>
            {actLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
              </div>
            ) : recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No activity yet</p>
            ) : (
              <div>
                {recentActivities.map(a => <ActivityItem key={a.id} activity={a} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
