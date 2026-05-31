import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, TrendingUp, Filter } from 'lucide-react';
import { useGroupStore, useSettlementStore, useAuthStore, useGamificationStore } from '../store';
import { StreakBanner, TrustScoreCard } from '../components/gamification';
import { EmptyState, SkeletonList, StatCard } from '../components/ui';
import { SettlementCard, OptimizationSummaryBanner, OptimizedSettlementCard } from '../components/domain';
import { PageContainer } from '../components/shell';
import PageTitle from '../components/ui/PageTitle';
import { StaggerGrid } from '../components/motion';
import { fadeUpItem } from '../lib/motion';

export default function SettlementsPage() {
  const { groups, fetchGroups } = useGroupStore();
  const {
    settlements, optimizedDebts, optimizationSummary,
    fetchSettlements, confirmPayment, declinePayment, initiatePayment,
  } = useSettlementStore();
  const { user } = useAuthStore();
  const { summary, fetchMySummary } = useGamificationStore();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups().then(() => {});
    fetchMySummary();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setLoading(true);
      fetchSettlements(parseInt(selectedGroup)).finally(() => setLoading(false));
    } else if (groups.length > 0) {
      setSelectedGroup(String(groups[0].id));
    }
  }, [selectedGroup, groups.length]);

  const filtered = settlements.filter(s => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const myDebts = optimizedDebts.filter(d => d.fromUserId === user?.id);
  const pendingConfirm = settlements.filter(s =>
    s.status === 'PROCESSING' && s.receiver?.id === user?.id
  );

  const handleConfirm = async (sid) => {
    await confirmPayment(sid, parseInt(selectedGroup));
  };

  const handleDecline = async (sid) => {
    await declinePayment(sid);
  };

  return (
    <PageContainer maxWidth="4xl">
      <PageTitle title="Settlements" subtitle="Track and confirm payments with your group" emoji="💸" />

      <StreakBanner streakCount={summary?.stats?.streakCount} longestStreak={summary?.stats?.longestStreak} />

      <div className="mb-4 max-w-sm">
        <TrustScoreCard stats={summary?.stats} />
      </div>

      {/* Alert banners */}
      {pendingConfirm.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 mb-4">
          <p className="text-sm text-amber-400 font-medium">
            🔔 {pendingConfirm.length} payment{pendingConfirm.length !== 1 ? 's' : ''} waiting for your confirmation
          </p>
        </motion.div>
      )}

      {/* Stats */}
      {optimizedDebts.length > 0 && (
        <StaggerGrid className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <motion.div variants={fadeUpItem}>
            <StatCard
              label="You Owe (Total)"
              count={myDebts.reduce((s, d) => s + Number(d.amount), 0)}
              formatCount={(n) => `₹${Math.round(n).toLocaleString('en-IN')}`}
              icon={TrendingDown}
              color="red"
            />
          </motion.div>
          <motion.div variants={fadeUpItem}>
            <StatCard label="Pending Confirm" count={pendingConfirm.length} icon={Wallet} color="yellow" sub="Awaiting your action" />
          </motion.div>
          <motion.div variants={fadeUpItem}>
            <StatCard label="Optimized Txns" count={optimizedDebts.length} icon={TrendingUp} color="green" sub="Min. to settle all" />
          </motion.div>
        </StaggerGrid>
      )}

      {/* Group + Status Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)}
          className="input-field text-sm max-w-[200px]">
          <option value="">Select group…</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.groupName}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${statusFilter === s
                  ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                  : 'bg-dark-700 border border-white/8 text-slate-400 hover:text-white'}`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {optimizationSummary && (
        <OptimizationSummaryBanner summary={optimizationSummary} />
      )}

      {myDebts.length > 0 && (
        <div className="glass-card mb-5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Your optimized payments</h3>
          <div className="space-y-2">
            {myDebts.map((d, i) => (
              <OptimizedSettlementCard
                key={`${d.fromUserId}-${d.toUserId}-${i}`}
                debt={d}
                currentUserId={user?.id}
                onPay={async (debt) => {
                  await initiatePayment({
                    receiverId: debt.toUserId,
                    amount: debt.amount,
                    groupId: parseInt(selectedGroup, 10),
                  });
                  fetchSettlements(parseInt(selectedGroup, 10));
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Settlement List */}
      {!selectedGroup ? (
        <EmptyState icon={Wallet} title="Select a group" description="Choose a group to see its settlements" />
      ) : loading ? (
        <SkeletonList count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Wallet} title="No settlements found"
          description={statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} settlements` : 'No settlements in this group yet'} />
      ) : (
        <StaggerGrid className="space-y-3">
          {filtered.map(s => (
            <motion.div key={s.id} variants={fadeUpItem} layout>
              <SettlementCard
                settlement={s}
                currentUserId={user?.id}
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                showGroupName
              />
            </motion.div>
          ))}
        </StaggerGrid>
      )}
    </PageContainer>
  );
}
