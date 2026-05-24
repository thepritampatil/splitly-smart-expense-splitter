import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, TrendingUp, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useGroupStore, useSettlementStore, useAuthStore } from '../store';
import { EmptyState, SkeletonList, SettlementBadge, Avatar, StatCard } from '../components/ui';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item    = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

export default function SettlementsPage() {
  const { groups, fetchGroups } = useGroupStore();
  const { settlements, optimizedDebts, fetchSettlements, confirmPayment, declinePayment } = useSettlementStore();
  const { user } = useAuthStore();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups().then(() => {});
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
    <div className="p-5 sm:p-7 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Settlements</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track and confirm payments</p>
        </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="You Owe (Total)"
            value={`₹${myDebts.reduce((s, d) => s + Number(d.amount), 0).toFixed(0)}`}
            icon={TrendingDown} color="red" />
          <StatCard label="Pending Confirm"
            value={pendingConfirm.length}
            icon={Wallet} color="yellow"
            sub="Awaiting your action" />
          <StatCard label="Optimized Txns"
            value={optimizedDebts.length}
            icon={TrendingUp} color="green"
            sub="Min. to settle all" />
        </div>
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

      {/* Optimized Debts suggestion */}
      {optimizedDebts.length > 0 && myDebts.length > 0 && (
        <div className="glass-card p-4 mb-5">
          <h3 className="text-sm font-semibold text-white mb-3">
            💡 Your Optimized Payments
          </h3>
          <div className="space-y-2">
            {myDebts.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-dark-700/60 rounded-lg border border-rose-500/15">
                <div>
                  <p className="text-sm text-white">
                    Pay <span className="font-medium text-rose-400">{d.toUserName}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{groups.find(g => g.id === parseInt(selectedGroup))?.groupName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">₹{Number(d.amount).toFixed(2)}</span>
                </div>
              </div>
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
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-3">
          {filtered.map(s => {
            const isPayer    = s.payer?.id === user?.id;
            const isReceiver = s.receiver?.id === user?.id;
            return (
              <motion.div key={s.id} variants={item}
                className="glass-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.payer?.fullName} size="md" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isPayer ? 'You' : s.payer?.fullName}
                        <span className="text-slate-500 mx-1.5">→</span>
                        {isReceiver ? 'You' : s.receiver?.fullName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.groupName} · {s.createdAt && format(new Date(s.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-white text-base">₹{Number(s.amount).toFixed(2)}</p>
                    <SettlementBadge status={s.status} />
                  </div>
                </div>

                {/* Actions */}
                {s.status === 'PROCESSING' && isReceiver && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleConfirm(s.id)}
                      className="btn-primary text-xs py-2 flex-1 justify-center">
                      ✓ Confirm Payment Received
                    </button>
                    <button onClick={() => handleDecline(s.id)}
                      className="btn-danger text-xs py-2 px-4">
                      ✗
                    </button>
                  </div>
                )}
                {s.status === 'PROCESSING' && isPayer && (
                  <p className="text-xs text-amber-400 mt-2 text-center bg-amber-500/8 rounded-lg py-2">
                    ⏳ Waiting for {s.receiver?.fullName} to confirm receipt
                  </p>
                )}
                {s.status === 'COMPLETED' && s.settledAt && (
                  <p className="text-xs text-emerald-400 mt-2 text-center">
                    ✅ Settled on {format(new Date(s.settledAt), 'MMM d, yyyy')}
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
