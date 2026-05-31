import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, ArrowRight, Archive, Filter } from 'lucide-react';
import { useGroupStore } from '../store';
import { EmptyState, SkeletonCard, GROUP_TYPE_CONFIG } from '../components/ui';
import { getGroupTheme } from '../lib/theme';
import CreateGroupModal from '../components/modals/CreateGroupModal';
import { PageContainer } from '../components/shell';
import PageTitle from '../components/ui/PageTitle';
import { StaggerGrid } from '../components/motion';
import { fadeUpItem } from '../lib/motion';

function GroupCard({ group }) {
  const typeConfig = GROUP_TYPE_CONFIG[group.type] || GROUP_TYPE_CONFIG.OTHER;
  const theme = getGroupTheme(group.type);
  const emoji = group.avatar?.length <= 2 ? group.avatar : typeConfig.emoji;
  const total = Number(group.totalExpenses || 0);

  return (
    <motion.div variants={fadeUpItem} layout>
      <Link
        to={`/groups/${group.id}`}
        className="glass-card-interactive group block overflow-hidden"
      >
        <div className={`h-1 bg-gradient-to-r ${theme.bar}`} />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-dark-900/50 text-2xl shadow-md ring-1 ${theme.ring}`}
            >
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="truncate font-display font-semibold text-white transition-colors group-hover:text-brand-300">
                  {group.groupName}
                </h3>
                <ArrowRight
                  size={15}
                  className="mt-0.5 flex-shrink-0 text-slate-600 transition-colors group-hover:text-brand-400"
                />
              </div>
              {group.description && (
                <p className="mb-2 truncate text-xs text-slate-500">{group.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${theme.badgeClass}`}>
                  {typeConfig.emoji} {typeConfig.label}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={11} /> {group.members?.length || 0}
                </span>
                <span className="ml-auto text-sm font-semibold text-white">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
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
    <PageContainer maxWidth="4xl">
      {/* Header */}
      <PageTitle
        title="My Groups"
        subtitle={`${groups.length} space${groups.length !== 1 ? 's' : ''} for shared expenses`}
        emoji="👥"
        action={
          <button type="button" onClick={() => setShowCreate(true)} className="btn-primary text-sm touch-manipulation">
            <Plus size={16} /> New Group
          </button>
        }
      />

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
          emoji={search ? '🔍' : '🏠'}
          title={search ? 'No groups found' : 'No groups yet'}
          description={search
            ? `No groups match "${search}"`
            : 'Create a hostel, trip, or flatmate space to start splitting expenses.'}
          action={
            !search && (
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
                <Plus size={15} /> Create First Group
              </button>
            )
          }
        />
      ) : (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2">
          {filtered.map(g => <GroupCard key={g.id} group={g} />)}
        </StaggerGrid>
      )}

      <AnimatePresence>
        {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </PageContainer>
  );
}
