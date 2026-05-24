import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check } from 'lucide-react';
import { useGroupStore, useAuthStore } from '../store';
import { EmptyState, GROUP_TYPE_CONFIG } from '../components/ui';
import api from '../services/api';

export default function InvitesPage() {
  const { acceptInvite } = useGroupStore();
  const [pendingGroups, setPendingGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  const loadPending = async () => {
    try {
      const res = await api.get('/groups/pending');
      setPendingGroups(res.data || []);
    } catch {
      setPendingGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPending(); }, []);

  const handleAccept = async (groupId) => {
    setAccepting(groupId);
    const ok = await acceptInvite(groupId);
    setAccepting(null);
    if (ok) setPendingGroups(prev => prev.filter(g => g.id !== groupId));
  };

  return (
    <div className="p-5 sm:p-7 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Invitations</h1>
        <p className="text-sm text-slate-500 mt-0.5">Pending group invitations for you</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : pendingGroups.length === 0 ? (
        <EmptyState icon={Bell} title="No pending invitations"
          description="When someone invites you to a group, it will appear here" />
      ) : (
        <motion.div className="space-y-3">
          {pendingGroups.map(g => {
            const typeConfig = GROUP_TYPE_CONFIG[g.type] || GROUP_TYPE_CONFIG.OTHER;
            const emoji = g.avatar?.length <= 2 ? g.avatar : typeConfig.emoji;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">{g.groupName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {typeConfig.label} · {g.members?.length || 0} members
                    {g.createdBy && ` · Invited by ${g.createdBy.fullName}`}
                  </p>
                </div>
                <button onClick={() => handleAccept(g.id)} disabled={accepting === g.id}
                  className="flex items-center gap-1.5 px-3 py-2 text-emerald-400 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <Check size={14} /> {accepting === g.id ? '…' : 'Accept'}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(26,26,36,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-xs text-slate-500 flex items-start gap-2">
          <Bell size={13} className="mt-0.5 flex-shrink-0 text-indigo-400" />
          Accepting an invite automatically adds group members to your friend list for quick future invites.
        </p>
      </div>
    </div>
  );
}
