import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, ArrowRight, Archive, Filter } from 'lucide-react';
import { useGroupStore } from '../store';
import { EmptyState, SkeletonCard, Badge, GROUP_TYPE_CONFIG } from '../components/ui';
import CreateGroupModal from '../components/modals/CreateGroupModal';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

function GroupCard({ group }) {
  const typeConfig = GROUP_TYPE_CONFIG[group.type] || GROUP_TYPE_CONFIG.OTHER;
  const emoji = group.avatar?.length <= 2 ? group.avatar : typeConfig.emoji;
  const total = Number(group.totalExpenses || 0);

  return (
    <motion.div variants={fadeUp}>
      <Link to={`/groups/${group.id}`}
        className="glass-card p-5 block hover:border-brand-500/30 transition-all group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-dark-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-white/5">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors truncate">
                {group.groupName}
              </h3>
              <ArrowRight size={15} className="text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-0.5" />
            </div>
            {group.description && (
              <p className="text-xs text-slate-500 truncate mb-2">{group.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="badge badge-blue">{typeConfig.label}</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Users size={11} /> {group.members?.length || 0} members
              </span>
              <span className="text-xs text-slate-400 font-medium ml-auto">
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function GroupsPage() {
  const { groups, loading, fetchGroups } = useGroupStore();
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const filtered = groups.filter(g => {
    const matchSearch = g.groupName.toLowerCase().includes(search.toLowerCase()) ||
                        g.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || g.type === filter;
    return matchSearch && matchFilter;
  });

  const filterTypes = ['ALL', ...Object.keys(GROUP_TYPE_CONFIG)];

  return (
    <div className="p-5 sm:p-7 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">My Groups</h1>
          <p className="text-sm text-slate-500 mt-0.5">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          <Plus size={16} /> New Group
        </button>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search groups…"
            className="input-field pl-9 text-sm" />
        </div>

        {/* Type Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterTypes.map(type => {
            const config = GROUP_TYPE_CONFIG[type];
            return (
              <button key={type}
                onClick={() => setFilter(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex-shrink-0
                  ${filter === type
                    ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                    : 'bg-dark-700 border border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/20'}`}>
                {config ? `${config.emoji} ${config.label}` : 'All Groups'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Group Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No groups found' : 'No groups yet'}
          description={search
            ? `No groups match "${search}"`
            : 'Create a group to start tracking shared expenses with your friends'}
          action={
            !search && (
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
                <Plus size={15} /> Create First Group
              </button>
            )
          }
        />
      ) : (
        <motion.div
          variants={stagger} initial="initial" animate="animate"
          className="grid sm:grid-cols-2 gap-4">
          {filtered.map(g => <GroupCard key={g.id} group={g} />)}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
