import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Modal, Avatar, FormField } from '../ui';
import { useGroupStore, useUserStore } from '../../store';

export default function InviteMemberModal({ groupId, onClose }) {
  const { inviteMember } = useGroupStore();
  const { searchResults, searching, searchUsers, clearSearch } = useUserStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { if (query.length >= 2) searchUsers(query); else clearSearch(); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleInvite = async (email) => {
    setLoading(true);
    const ok = await inviteMember(groupId, email);
    setLoading(false);
    if (ok) { setQuery(''); clearSearch(); }
  };

  return (
    <Modal title="Invite Member" onClose={onClose} size="sm">
      <FormField label="Search by name or email">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="name or email@example.com"
            className="input-field pl-8 text-sm" autoFocus />
          {query && (
            <button onClick={() => { setQuery(''); clearSearch(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              <X size={13} />
            </button>
          )}
        </div>
      </FormField>

      {searching && <p className="text-xs text-slate-500 py-2 text-center">Searching…</p>}

      {searchResults.length > 0 && (
        <div className="mt-2 space-y-1">
          {searchResults.map(u => (
            <div key={u.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-dark-700 border border-white/5">
              <Avatar src={u.avatar} name={u.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{u.fullName}</p>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
              </div>
              <button onClick={() => handleInvite(u.email)} disabled={loading}
                className="btn-primary text-xs py-1.5 px-3">
                Invite
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Direct email invite */}
      {query.includes('@') && searchResults.length === 0 && (
        <div className="mt-3 p-3 rounded-lg bg-dark-700 border border-white/5">
          <p className="text-xs text-slate-400 mb-2">Send invite to:</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white">{query}</p>
            <button onClick={() => handleInvite(query)} disabled={loading}
              className="btn-primary text-xs py-1.5 px-3">
              Send Invite
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 mt-3">
        The user must have a Splitly account. They'll need to accept the invite.
      </p>
    </Modal>
  );
}
