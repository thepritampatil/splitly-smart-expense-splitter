import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, Receipt, Wallet, BarChart2,
  MessageSquare, Settings, Trash2, Edit2, UserMinus,
  Send, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { useGroupStore, useExpenseStore, useSettlementStore,
         useActivityStore, useMessageStore, useAuthStore } from '../store';
import {
  Avatar, Badge, SettlementBadge, EmptyState, SkeletonList,
  Section, CATEGORY_CONFIG, ConfirmDialog, StatCard
} from '../components/ui';
import AddExpenseModal from '../components/modals/AddExpenseModal';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import InviteMemberModal from '../components/modals/InviteMemberModal';

const TABS = [
  { id: 'expenses',    label: 'Expenses',    icon: Receipt },
  { id: 'balances',    label: 'Balances',    icon: Wallet },
  { id: 'settlements', label: 'Settlements', icon: TrendingUp },
  { id: 'discussion',  label: 'Discussion',  icon: MessageSquare },
  { id: 'activity',    label: 'Activity',    icon: BarChart2 },
];

// ---- Sub-components ----

function ExpenseCard({ expense, onEdit, onDelete, currentUserId }) {
  const cat = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.OTHER;
  const isMyExpense = expense.paidBy?.id === currentUserId;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-xl bg-dark-700/60 border border-white/4 hover:border-white/10 transition-all group">
      <div className="w-10 h-10 bg-dark-600 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
        {cat.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-white text-sm truncate">{expense.description}</p>
          <p className="text-base font-bold text-white flex-shrink-0">₹{Number(expense.amount).toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="badge badge-gray text-xs">{cat.label}</span>
          <span className="text-xs text-slate-500">
            Paid by {isMyExpense ? <span className="text-brand-400">you</span> : expense.paidBy?.fullName}
          </span>
          <span className="text-xs text-slate-600">
            · {expense.createdAt && format(new Date(expense.createdAt), 'MMM d')}
          </span>
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {expense.participants?.slice(0, 5).map(p => (
            <span key={p.userId} title={`${p.fullName}: ₹${Number(p.shareAmount).toFixed(2)}`}
              className="text-xs bg-dark-600 text-slate-400 px-1.5 py-0.5 rounded">
              {p.fullName?.split(' ')[0]}
            </span>
          ))}
          {expense.participants?.length > 5 && (
            <span className="text-xs text-slate-500">+{expense.participants.length - 5}</span>
          )}
        </div>
      </div>
      {isMyExpense && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(expense)}
            className="p-1.5 hover:bg-white/8 rounded text-slate-400 hover:text-white transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(expense)}
            className="p-1.5 hover:bg-rose-500/15 rounded text-slate-400 hover:text-rose-400 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function BalanceCard({ balance, currentUserId, onSettle, optimizedDebts }) {
  const isMe = balance.userId === currentUserId;
  const net = Number(balance.netBalance);
  const myDebt = optimizedDebts.find(d => d.fromUserId === balance.userId && d.toUserId === currentUserId);
  const owedToMe = optimizedDebts.find(d => d.fromUserId === currentUserId && d.toUserId === balance.userId);

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all
      ${isMe ? 'bg-brand-500/8 border-brand-500/20' : 'bg-dark-700/60 border-white/4'}`}>
      <Avatar src={undefined} name={balance.fullName} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">
          {balance.fullName}{isMe ? ' (you)' : ''}
        </p>
        <div className="flex gap-3 mt-0.5">
          <span className="text-xs text-slate-500">Paid ₹{Number(balance.totalPaid).toFixed(0)}</span>
          <span className="text-xs text-slate-500">Owes ₹{Number(balance.totalOwed).toFixed(0)}</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`flex items-center gap-1 font-bold text-sm justify-end
          ${net > 0 ? 'text-emerald-400' : net < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
          {net > 0 ? <TrendingUp size={14} /> : net < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
          {net > 0 ? '+' : ''}₹{Math.abs(net).toFixed(2)}
        </div>
        <p className="text-xs text-slate-600 mt-0.5">
          {net > 0 ? 'gets back' : net < 0 ? 'owes' : 'settled'}
        </p>
      </div>
    </div>
  );
}

function SettlementCard({ settlement, currentUserId, onConfirm, onDecline }) {
  const isReceiver = settlement.receiver?.id === currentUserId;
  const isPayer    = settlement.payer?.id === currentUserId;

  return (
    <div className="p-4 rounded-xl bg-dark-700/60 border border-white/4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Avatar name={settlement.payer?.fullName} size="sm" />
          <div>
            <p className="text-sm text-white">
              <span className="font-medium">{isPayer ? 'You' : settlement.payer?.fullName}</span>
              {' → '}
              <span className="font-medium">{isReceiver ? 'You' : settlement.receiver?.fullName}</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {settlement.createdAt && format(new Date(settlement.createdAt), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-white">₹{Number(settlement.amount).toFixed(2)}</p>
          <SettlementBadge status={settlement.status} />
        </div>
      </div>
      {/* Action buttons */}
      {settlement.status === 'PROCESSING' && isReceiver && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onConfirm(settlement.id)}
            className="btn-primary text-xs py-1.5 flex-1 justify-center">
            ✓ Confirm Received
          </button>
          <button onClick={() => onDecline(settlement.id)}
            className="btn-danger text-xs py-1.5 flex-1 justify-center">
            ✗ Decline
          </button>
        </div>
      )}
      {settlement.status === 'PROCESSING' && isPayer && (
        <p className="text-xs text-amber-400 mt-2 text-center">⏳ Waiting for {settlement.receiver?.fullName} to confirm</p>
      )}
      {settlement.status === 'COMPLETED' && (
        <p className="text-xs text-emerald-400 mt-2 text-center">
          ✅ Confirmed {settlement.settledAt && format(new Date(settlement.settledAt), 'MMM d')}
        </p>
      )}
    </div>
  );
}

function Discussion({ groupId }) {
  const { messages, loading, fetchMessages, sendMessage } = useMessageStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');
  const { groupActivities, fetchGroupActivities } = useActivityStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages(groupId);
    fetchGroupActivities(groupId);
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(groupId, input.trim());
    setInput('');
  };

  // Merge messages + activity items sorted by time
  const combined = [
    ...messages.map(m => ({ ...m, _type: 'message' })),
    ...groupActivities.map(a => ({ ...a, _type: 'activity', createdAt: a.timestamp })),
  ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
        {combined.length === 0 && !loading && (
          <EmptyState icon={MessageSquare} title="No messages yet" description="Start the conversation!" />
        )}
        {combined.map((item, i) => {
          if (item._type === 'activity') {
            return (
              <div key={`a-${item.id}`} className="text-center">
                <span className="text-xs text-slate-600 bg-dark-700/60 px-3 py-1 rounded-full">
                  {item.message}
                </span>
              </div>
            );
          }
          const isMe = item.sender?.id === user?.id;
          return (
            <div key={`m-${item.id}`} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <Avatar src={item.sender?.avatar} name={item.sender?.fullName} size="sm" className="flex-shrink-0 mt-1" />
              <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && <p className="text-xs text-slate-500 px-1">{item.sender?.fullName}</p>}
                <div className={`px-3 py-2 rounded-2xl text-sm ${isMe
                  ? 'bg-brand-500/20 border border-brand-500/30 text-white rounded-br-sm'
                  : 'bg-dark-700 border border-white/6 text-slate-200 rounded-bl-sm'}`}>
                  {item.content}
                </div>
                <p className="text-xs text-slate-600 px-1">
                  {item.createdAt && format(new Date(item.createdAt), 'h:mm a')}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message… (Enter to send)"
          className="input-field flex-1 text-sm" />
        <button onClick={handleSend} disabled={!input.trim()} className="btn-primary px-3 py-2">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ---- MAIN COMPONENT ----

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, loading: groupLoading, fetchGroup, removeMember, archiveGroup } = useGroupStore();
  const { expenses, balances, loading: expLoading, fetchExpenses, fetchBalances, deleteExpense } = useExpenseStore();
  const { settlements, optimizedDebts, loading: settlLoading, fetchSettlements, initiatePayment, confirmPayment, declinePayment } = useSettlementStore();
  const { user } = useAuthStore();

  const [tab, setTab]                     = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditGroup, setShowEditGroup]   = useState(false);
  const [showInvite, setShowInvite]         = useState(false);
  const [editExpense, setEditExpense]       = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState(null);
  const [payTarget, setPayTarget]           = useState(null);

  useEffect(() => {
    if (id) {
      fetchGroup(parseInt(id));
      fetchExpenses(parseInt(id));
      fetchBalances(parseInt(id));
      fetchSettlements(parseInt(id));
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
      <div className="p-5 sm:p-7 max-w-4xl mx-auto">
        <div className="skeleton h-8 w-48 rounded mb-4" />
        <SkeletonList count={3} />
      </div>
    );
  }

  if (!group) return (
    <div className="p-7 text-center text-slate-400">Group not found.</div>
  );

  const typeEmoji = group.avatar?.length <= 2 ? group.avatar : '👥';

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/groups')}
          className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-11 h-11 bg-dark-600 rounded-xl flex items-center justify-center text-2xl border border-white/8 flex-shrink-0">
            {typeEmoji}
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-lg truncate">{group.groupName}</h1>
            <p className="text-xs text-slate-500">
              {group.members?.length || 0} members · ₹{Number(group.totalExpenses || 0).toLocaleString('en-IN')} total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <>
              <button onClick={() => setShowInvite(true)}
                className="btn-secondary text-xs py-2 hidden sm:flex">
                <Users size={13} /> Invite
              </button>
              <button onClick={() => setShowEditGroup(true)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                <Settings size={16} />
              </button>
            </>
          )}
          <button onClick={() => setShowAddExpense(true)} className="btn-primary text-xs py-2">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

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
      <div className="flex gap-1 bg-dark-700/50 p-1 rounded-xl mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center
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
                <EmptyState icon={Receipt} title="No expenses yet"
                  description="Add the first expense for this group"
                  action={
                    <button onClick={() => setShowAddExpense(true)} className="btn-primary text-sm">
                      <Plus size={14} /> Add Expense
                    </button>
                  } />
               ) : (
                <div className="space-y-2.5">
                  {expenses.map(e => (
                    <ExpenseCard key={e.id} expense={e}
                      currentUserId={user?.id}
                      onEdit={exp => setEditExpense(exp)}
                      onDelete={exp => setDeleteTarget(exp)} />
                  ))}
                </div>
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
                      <BalanceCard key={b.userId} balance={b}
                        currentUserId={user?.id}
                        optimizedDebts={optimizedDebts}
                        onSettle={handlePayDebt} />
                    ))}
                  </div>
                )}
              </Section>

              {optimizedDebts.length > 0 && (
                <Section title="💡 Optimized Settlements (Minimum Transactions)">
                  <p className="text-xs text-slate-500 mb-3">
                    Our algorithm calculated the minimum {optimizedDebts.length} transaction{optimizedDebts.length !== 1 ? 's' : ''} to settle all debts.
                  </p>
                  <div className="space-y-2">
                    {optimizedDebts.map((d, i) => {
                      const isMyDebt = d.fromUserId === user?.id;
                      return (
                        <div key={i}
                          className={`flex items-center justify-between gap-3 p-3 rounded-xl border
                            ${isMyDebt ? 'bg-rose-500/8 border-rose-500/20' : 'bg-dark-700/60 border-white/4'}`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar name={d.fromUserName} size="sm" />
                            <p className="text-sm text-white truncate">
                              <span className="font-medium">{isMyDebt ? 'You' : d.fromUserName}</span>
                              <span className="text-slate-500 mx-1">→</span>
                              <span className="font-medium">{d.toUserId === user?.id ? 'You' : d.toUserName}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-bold text-white">₹{Number(d.amount).toFixed(2)}</span>
                            {isMyDebt && (
                              <button onClick={() => handlePayDebt(d)}
                                className="btn-primary text-xs py-1.5 px-3">
                                Pay
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
          {tab === 'discussion' && <Discussion groupId={parseInt(id)} />}

          {/* ACTIVITY TAB */}
          {tab === 'activity' && <GroupActivityTab groupId={parseInt(id)} />}
        </motion.div>
      </AnimatePresence>

      {/* Members sidebar panel */}
      <div className="mt-6 glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Members ({group.members?.length || 0})</h3>
          {isAdmin && (
            <button onClick={() => setShowInvite(true)}
              className="text-xs text-brand-400 hover:text-brand-300">
              + Invite
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {group.members?.map(m => (
            <div key={m.id}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-dark-700 rounded-lg border border-white/5 group">
              <Avatar name={m.user?.fullName} size="xs" />
              <span className="text-xs text-slate-300">{m.user?.fullName?.split(' ')[0]}</span>
              {m.role === 'ADMIN' && <span className="badge badge-blue text-xs">Admin</span>}
              {isAdmin && m.user?.id !== user?.id && (
                <button onClick={() => setRemoveMemberTarget(m)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all ml-1">
                  <UserMinus size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
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
    </div>
  );
}

function GroupActivityTab({ groupId }) {
  const { groupActivities, fetchGroupActivities } = useActivityStore();
  useEffect(() => { fetchGroupActivities(groupId); }, [groupId]);

  return (
    <div className="space-y-1">
      {groupActivities.length === 0 ? (
        <EmptyState icon={BarChart2} title="No activity yet" description="Actions in this group will appear here" />
      ) : groupActivities.map(a => (
        <div key={a.id} className="flex items-start gap-3 py-3 border-b border-white/4 last:border-0">
          {a.triggeredBy ? (
            <Avatar name={a.triggeredBy.fullName} size="sm" />
          ) : (
            <div className="w-8 h-8 bg-dark-600 rounded-full flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300">{a.message}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {a.timestamp && format(new Date(a.timestamp), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
