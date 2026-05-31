import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Receipt, Wallet, BarChart2, MessageSquare, TrendingUp, TrendingDown,
} from 'lucide-react';
import { useGroupStore, useExpenseStore, useSettlementStore,
         useActivityStore, useAuthStore, useGamificationStore } from '../store';
import {
  GroupActivityBanner, ActivityHeatWidget, LeaderboardCard,
} from '../components/gamification';
import {
  Avatar, EmptyState, SkeletonList, Section, ConfirmDialog,
} from '../components/ui';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import InviteMemberModal from '../components/modals/InviteMemberModal';
import { PageContainer } from '../components/shell';
import {
  GroupHeader, ExpenseCard, BalanceCard, SettlementCard,
  MemberRail, GroupDiscussion, ActivityTimeline,
  OptimizationSummaryBanner, OptimizedSettlementCard,
} from '../components/domain';
import { StaggerGrid } from '../components/motion';

const TABS = [
  { id: 'expenses',    label: 'Expenses',    icon: Receipt },
  { id: 'balances',    label: 'Balances',    icon: Wallet },
  { id: 'settlements', label: 'Settlements', icon: TrendingUp },
  { id: 'discussion',  label: 'Discussion',  icon: MessageSquare },
  { id: 'activity',    label: 'Activity',    icon: BarChart2 },
];

function GroupActivityTab({ groupId }) {
  const { groupActivities, fetchGroupActivities } = useActivityStore();
  useEffect(() => { fetchGroupActivities(groupId); }, [groupId]);

  if (groupActivities.length === 0) {
    return (
      <EmptyState
        emoji="📋"
        title="No activity yet"
        description="Expenses, payments, and joins will show up in this timeline."
      />
    );
  }

  return <ActivityTimeline activities={groupActivities} showGroup={false} />;
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const { currentGroup, loading: groupLoading, fetchGroup, removeMember } = useGroupStore();
  const { expenses, balances, loading: expLoading, fetchExpenses, fetchBalances, deleteExpense } = useExpenseStore();
  const {
    settlements, optimizedDebts, optimizationSummary, loading: settlLoading,
    fetchSettlements, initiatePayment, confirmPayment, declinePayment,
  } = useSettlementStore();
  const { user } = useAuthStore();
  const {
    groupInsights, groupHeatmap, groupLeaderboard, groupLoading: gamificationLoading,
    fetchGroupGamification,
  } = useGamificationStore();

  const [tab, setTab]                     = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditGroup, setShowEditGroup]   = useState(false);
  const [showInvite, setShowInvite]         = useState(false);
  const [editExpense, setEditExpense]       = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);

  useEffect(() => {
    if (id) {
      fetchGroup(parseInt(id));
      fetchExpenses(parseInt(id));
      fetchBalances(parseInt(id));
      fetchSettlements(parseInt(id));
      fetchGroupGamification(parseInt(id));
    }
  }, [id]);

  const group = currentGroup;
  const isAdmin = group?.members?.find(m => m.user?.id === user?.id)?.role === 'ADMIN';
  const myBalance = balances.find(b => b.userId === user?.id);
  const myNet = Number(myBalance?.netBalance || 0);

  const handleDeleteExpense = async () => {
    if (deleteTarget) {
      await deleteExpense(deleteTarget.id, parseInt(id));
      setDeleteTarget(null);
      fetchBalances(parseInt(id));
      fetchSettlements(parseInt(id));
    }
  };

  const handlePayDebt = async (debt) => {
    await initiatePayment({ receiverId: debt.toUserId, amount: debt.amount, groupId: parseInt(id) });
    fetchSettlements(parseInt(id));
  };

  const handleConfirm = async (settlementId) => {
    await confirmPayment(settlementId, parseInt(id));
    fetchBalances(parseInt(id));
  };

  const handleDecline = async (settlementId) => {
    await declinePayment(settlementId);
    fetchSettlements(parseInt(id));
  };

  if (groupLoading && !group) {
    return (
      <PageContainer maxWidth="4xl">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <SkeletonList count={3} />
      </PageContainer>
    );
  }

  if (!group) return (
    <PageContainer maxWidth="4xl" className="text-center text-slate-400">
      Group not found.
    </PageContainer>
  );

  return (
    <PageContainer maxWidth="4xl" className="!px-4 sm:!px-6">
      <GroupActivityBanner
        insights={groupInsights[parseInt(id)]}
        loading={gamificationLoading}
      />

      <GroupHeader
        group={group}
        isAdmin={isAdmin}
        onAddExpense={() => setShowAddExpense(true)}
        onInvite={() => setShowInvite(true)}
        onEdit={() => setShowEditGroup(true)}
      />

      {/* Balance banner */}
      {myNet !== 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-xl border mb-4 flex items-center justify-between
            ${myNet > 0
              ? 'bg-emerald-500/8 border-emerald-500/20'
              : 'bg-rose-500/8 border-rose-500/20'}`}>
          <div className="flex items-center gap-2">
            {myNet > 0 ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-rose-400" />}
            <span className="text-sm font-medium text-white">
              {myNet > 0 ? `You are owed` : `You owe`}
              <span className={`ml-1 font-bold ${myNet > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{Math.abs(myNet).toFixed(2)}
              </span>
              {' in this group'}
            </span>
          </div>
          {myNet < 0 && optimizedDebts.filter(d => d.fromUserId === user?.id).length > 0 && (
            <button onClick={() => setTab('settlements')} className="text-xs text-brand-400 hover:text-brand-300">
              Settle →
            </button>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-dark-700/50 p-1 scrollbar-hide snap-x snap-mandatory">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex min-h-[44px] min-w-[88px] flex-1 snap-start items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all whitespace-nowrap touch-manipulation
              ${tab === t.id
                ? 'bg-dark-600 text-white shadow-sm border border-white/8'
                : 'text-slate-500 hover:text-slate-300'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}>

          {/* EXPENSES TAB */}
          {tab === 'expenses' && (
            <div>
              {expLoading ? <SkeletonList count={3} /> :
               expenses.length === 0 ? (
                <EmptyState emoji="🍕" title="No expenses yet"
                  description="Split the first pizza, rent, or trip cost with your group."
                  action={
                    <button onClick={() => setShowAddExpense(true)} className="btn-primary text-sm">
                      <Plus size={14} /> Add Expense
                    </button>
                  } />
               ) : (
                <StaggerGrid className="space-y-2.5">
                  {expenses.map(e => (
                    <ExpenseCard key={e.id} expense={e}
                      currentUserId={user?.id}
                      onEdit={exp => setEditExpense(exp)}
                      onDelete={exp => setDeleteTarget(exp)} />
                  ))}
                </StaggerGrid>
               )}
            </div>
          )}

          {/* BALANCES TAB */}
          {tab === 'balances' && (
            <div className="space-y-3">
              <Section title="Member Balances">
                {balances.length === 0 ? (
                  <EmptyState icon={Wallet} title="No balances yet" description="Add expenses to see balances" />
                ) : (
                  <div className="space-y-2">
                    {balances.map(b => (
                      <BalanceCard key={b.userId} balance={b} currentUserId={user?.id} />
                    ))}
                  </div>
                )}
              </Section>

              {(optimizationSummary || optimizedDebts.length > 0) && (
                <Section title="Smart settlements">
                  <OptimizationSummaryBanner summary={optimizationSummary} />
                  <div className="space-y-2">
                    {optimizedDebts.map((d, i) => (
                      <OptimizedSettlementCard
                        key={`${d.fromUserId}-${d.toUserId}-${i}`}
                        debt={d}
                        currentUserId={user?.id}
                        onPay={handlePayDebt}
                      />
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* SETTLEMENTS TAB */}
          {tab === 'settlements' && (
            <div className="space-y-3">
              {settlLoading ? <SkeletonList count={3} /> :
               settlements.length === 0 ? (
                <EmptyState icon={Wallet} title="No settlements yet"
                  description="Settlements will appear here once members start paying each other" />
               ) : (
                settlements.map(s => (
                  <SettlementCard key={s.id} settlement={s}
                    currentUserId={user?.id}
                    onConfirm={handleConfirm}
                    onDecline={handleDecline} />
                ))
               )}
            </div>
          )}

          {/* DISCUSSION TAB */}
          {tab === 'discussion' && <GroupDiscussion groupId={parseInt(id)} />}

          {/* ACTIVITY TAB */}
          {tab === 'activity' && <GroupActivityTab groupId={parseInt(id)} />}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ActivityHeatWidget heatmap={groupHeatmap[parseInt(id)]} loading={gamificationLoading} />
        <LeaderboardCard entries={groupLeaderboard[parseInt(id)]} loading={gamificationLoading} />
      </div>

      <div className="mt-6">
        <MemberRail
          members={group.members}
          groupType={group.type}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onInvite={() => setShowInvite(true)}
          onRemoveMember={setRemoveMemberTarget}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal prefillGroupId={parseInt(id)} onClose={() => {
            setShowAddExpense(false);
            fetchBalances(parseInt(id));
            fetchSettlements(parseInt(id));
          }} />
        )}
        {editExpense && (
          <AddExpenseModal editExpense={editExpense} onClose={() => {
            setEditExpense(null);
            fetchBalances(parseInt(id));
          }} />
        )}
        {showEditGroup && (
          <CreateGroupModal editGroup={group} onClose={() => setShowEditGroup(false)} />
        )}
        {showInvite && (
          <InviteMemberModal groupId={parseInt(id)} onClose={() => setShowInvite(false)} />
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteExpense} danger
        title="Delete Expense"
        message={`Delete "${deleteTarget?.description}" (₹${Number(deleteTarget?.amount || 0).toFixed(2)})? This cannot be undone.`}
        confirmLabel="Delete" />

      <ConfirmDialog
        isOpen={!!removeMemberTarget} onClose={() => setRemoveMemberTarget(null)}
        onConfirm={async () => {
          await removeMember(parseInt(id), removeMemberTarget.user.id);
          setRemoveMemberTarget(null);
        }} danger
        title="Remove Member"
        message={`Remove ${removeMemberTarget?.user?.fullName} from the group?`}
        confirmLabel="Remove" />
    </PageContainer>
  );
}

