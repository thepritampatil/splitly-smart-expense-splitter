import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Receipt, ArrowRight, PieChart as PieIcon, BarChart2,
} from 'lucide-react';
import {
  useAuthStore, useGroupStore, useExpenseStore,
  useActivityStore, useAnalyticsStore, useGamificationStore,
} from '../store';
import { TrustScoreCard, BadgeGrid, StreakBanner } from '../components/gamification';
import { StatCard, SkeletonCard, EmptyState, CATEGORY_CONFIG } from '../components/ui';
import {
  ExpenseCard, ActivityTimeline, GroupQuickPick,
  DashboardInsights, DashboardBalanceSummary,
} from '../components/domain';
import { PageContainer } from '../components/shell';
import PageTitle from '../components/ui/PageTitle';
import { StaggerGrid } from '../components/motion';
import { fadeUpItem } from '../lib/motion';
import { computeAnalyticsInsights } from '../lib/charts';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { groups, loading: groupsLoading, fetchGroups } = useGroupStore();
  const { expenses, balances, loading: expLoading, fetchExpenses, fetchBalances } = useExpenseStore();
  const { activities, loading: actLoading, fetchMyActivities } = useActivityStore();
  const { monthly, category, loading: analyticsLoading, fetchAnalytics } = useAnalyticsStore();
  const { summary, loading: gamificationLoading, fetchMySummary } = useGamificationStore();

  const [selectedGroup, setSelectedGroup] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchMyActivities();
    fetchMySummary();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroup) {
      setSelectedGroup(String(groups[0].id));
    }
  }, [groups.length, selectedGroup]);

  const groupId = selectedGroup ? parseInt(selectedGroup, 10) : null;
  const selectedGroupData = groups.find(g => g.id === groupId);

  useEffect(() => {
    if (!groupId) return;
    fetchExpenses(groupId);
    fetchBalances(groupId);
    fetchAnalytics(groupId);
  }, [groupId]);

  const totalExpenses = groups.reduce((sum, g) => sum + (Number(g.totalExpenses) || 0), 0);
  const activeGroups = groups.length;
  const recentExpenses = expenses.slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  const insights = useMemo(
    () => computeAnalyticsInsights(monthly, category, CATEGORY_CONFIG),
    [monthly, category]
  );

  const myBalance = balances.find(b => b.userId === user?.id);
  const kpiLoading = groupsLoading || (groupId && analyticsLoading);

  const chartKey = `${selectedGroup}-${insights.monthlyData.length}-${insights.categoryData.length}`;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <PageContainer maxWidth="6xl">
      <div className="page-hero">
        <PageTitle
          title={`${greeting()}, ${user?.fullName?.split(' ')[0]}`}
          subtitle="Spending insights and activity across your groups"
          emoji="👋"
          gradient
        />
      </div>

      <StreakBanner
        streakCount={summary?.stats?.streakCount}
        longestStreak={summary?.stats?.longestStreak}
      />

      {groups.length > 1 && (
        <GroupQuickPick
          groups={groups}
          selectedId={selectedGroup}
          onSelect={setSelectedGroup}
        />
      )}

      {/* KPI row */}
      {kpiLoading && !insights.latestMonth ? (
        <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : (
        <StaggerGrid className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <motion.div variants={fadeUpItem}>
            <StatCard
              label="Active Groups"
              count={activeGroups}
              icon={Users}
              color="brand"
              sub={activeGroups === 0 ? 'Create your first group' : 'Groups you belong to'}
            />
          </motion.div>
          <motion.div variants={fadeUpItem}>
            <StatCard
              label="Total Spend"
              count={insights.totalSpend || totalExpenses}
              formatCount={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`}
              icon={Receipt}
              color="yellow"
              sub={selectedGroupData ? `In ${selectedGroupData.groupName}` : 'Across all groups'}
            />
          </motion.div>
          <motion.div variants={fadeUpItem}>
            <StatCard
              label="This Month"
              count={insights.latestMonth?.amount ?? 0}
              formatCount={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`}
              icon={BarChart2}
              color="green"
              sub={insights.latestMonth?.month || 'Latest period'}
              trend={insights.monthTrend}
            />
          </motion.div>
          <motion.div variants={fadeUpItem}>
            <StatCard
              label="Top Category"
              value={insights.topCategoryLabel}
              icon={PieIcon}
              color="red"
              sub={
                insights.topCategory.amount
                  ? `₹${Number(insights.topCategory.amount).toLocaleString('en-IN')}`
                  : 'No category data'
              }
            />
          </motion.div>
        </StaggerGrid>
      )}

      {/* Charts */}
      {groups.length > 0 && (
        <DashboardInsights
          monthly={monthly}
          category={category}
          loading={analyticsLoading && !!groupId}
          groupId={groupId}
          chartKey={chartKey}
        />
      )}

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Expenses</h2>
            <Link
              to={groupId ? `/groups/${groupId}` : '/groups'}
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
            >
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {expLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-14 rounded-lg" />)}
            </div>
          ) : recentExpenses.length === 0 ? (
            <EmptyState
              emoji="🍕"
              title="No expenses yet"
              description="Start your first hostel expense — pick a group and split it with your crew."
              action={
                <Link to="/groups" className="btn-primary text-sm">
                  <Users size={14} /> Go to Groups
                </Link>
              }
            />
          ) : (
            <StaggerGrid className="space-y-2">
              {recentExpenses.map(e => (
                <ExpenseCard key={e.id} expense={e} compact showGroupName={groups.length > 1} />
              ))}
            </StaggerGrid>
          )}
        </div>

        <div className="space-y-5">
          <TrustScoreCard stats={summary?.stats} loading={gamificationLoading} />

          <div className="glass-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Recent badges</h2>
            <BadgeGrid badges={summary?.recentBadges || []} />
          </div>

          <DashboardBalanceSummary
            balance={myBalance}
            groupId={groupId}
            groupName={selectedGroupData?.groupName}
            loading={expLoading && !!groupId}
          />

          <div className="glass-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">My Groups</h2>
              <Link to="/groups" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                All <ArrowRight size={12} />
              </Link>
            </div>
            {groupsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            ) : groups.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No groups yet</p>
            ) : (
              <div className="space-y-1.5">
                {groups.slice(0, 5).map(g => (
                  <Link
                    key={g.id}
                    to={`/groups/${g.id}`}
                    onClick={() => setSelectedGroup(String(g.id))}
                    className={`group flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-white/5
                      ${String(g.id) === selectedGroup ? 'bg-brand-500/10 ring-1 ring-brand-500/20' : ''}`}
                  >
                    <span className="text-lg">{g.avatar?.length <= 2 ? g.avatar : '👥'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white transition-colors group-hover:text-brand-300">
                        {g.groupName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {g.members?.length || 0} members · ₹{Number(g.totalExpenses || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <ArrowRight size={12} className="text-slate-600 transition-colors group-hover:text-brand-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card max-h-96 overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
              <Link to="/activity" className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                All <ArrowRight size={12} />
              </Link>
            </div>
            {actLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-10 rounded-lg" />)}
              </div>
            ) : recentActivities.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">No activity yet</p>
            ) : (
              <ActivityTimeline activities={recentActivities} showGroup stagger={false} />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
