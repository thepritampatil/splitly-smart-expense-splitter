import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, UserPlus, Search } from 'lucide-react';
import { Modal, FormField, Avatar, GROUP_TYPE_CONFIG } from '../ui';
import { useGroupStore, useUserStore } from '../../store';

const GROUP_TYPES = Object.entries(GROUP_TYPE_CONFIG).map(([k, v]) => ({ value: k, ...v }));

export default function CreateGroupModal({ onClose, editGroup = null }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: editGroup
      ? { groupName: editGroup.groupName, description: editGroup.description, type: editGroup.type }
      : { type: 'HOSTEL' }
  });

  const { createGroup, updateGroup } = useGroupStore();
  const { friends, searchResults, searching, searchUsers, fetchFriends, clearSearch } = useUserStore();

  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchFriends(); }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (searchQuery.length >= 2) searchUsers(searchQuery); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const addEmail = (email) => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails(prev => [...prev, trimmed]);
    }
    setEmailInput('');
    setSearchQuery('');
    clearSearch();
  };

  const removeEmail = (email) => setEmails(prev => prev.filter(e => e !== email));

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = { ...data, memberEmails: emails };

    let result;
    if (editGroup) {
      result = await updateGroup(editGroup.id, data);
    } else {
      result = await createGroup(payload);
    }

    setLoading(false);
    if (result) onClose();
  };

  return (
    <Modal title={editGroup ? 'Edit Group' : 'Create New Group'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Group Name */}
        <FormField label="Group Name" required error={errors.groupName?.message}>
          <input
            {...register('groupName', { required: 'Group name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            placeholder="e.g. Goa Trip 2025"
            className="input-field" />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <input
            {...register('description')}
            placeholder="Optional description…"
            className="input-field" />
        </FormField>

        {/* Group Type */}
        <FormField label="Group Type" required>
          <div className="grid grid-cols-3 gap-2">
            {GROUP_TYPES.map(t => (
              <label key={t.value}
                className="relative flex flex-col items-center gap-1 p-2.5 rounded-lg bg-dark-700 border border-white/8 cursor-pointer hover:border-brand-500/40 has-[:checked]:border-brand-500/60 has-[:checked]:bg-brand-500/10 transition-all text-center">
                <input type="radio" value={t.value} {...register('type')} className="absolute opacity-0" />
                <span className="text-lg">{t.emoji}</span>
                <span className="text-xs text-slate-400">{t.label}</span>
              </label>
            ))}
          </div>
        </FormField>

        {/* Add Members (only on create) */}
        {!editGroup && (
          <FormField label="Invite Members">
            {/* Friend chips */}
            {friends.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-slate-500 mb-1.5">From friend list:</p>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {friends.map(f => {
                    const added = emails.includes(f.email);
                    return (
                      <button key={f.id} type="button"
                        onClick={() => added ? removeEmail(f.email) : addEmail(f.email)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-all
                          ${added
                            ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                            : 'bg-dark-700 border-white/10 text-slate-400 hover:border-white/20'}`}>
                        <Avatar src={f.avatar} name={f.fullName} size="xs" />
                        {f.fullName.split(' ')[0]}
                        {added && <X size={10} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search / Email input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={searchQuery || emailInput}
                onChange={e => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  setEmailInput(v);
                }}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && emailInput) {
                    e.preventDefault();
                    addEmail(emailInput);
                  }
                }}
                placeholder="Search by name or type email…"
                className="input-field pl-8 text-sm" />
              {/* Search dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-dark-700 border border-white/8 rounded-lg overflow-hidden shadow-xl">
                  {searchResults.slice(0, 5).map(u => (
                    <button key={u.id} type="button"
                      onClick={() => addEmail(u.email)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors">
                      <Avatar src={u.avatar} name={u.fullName} size="sm" />
                      <div className="text-left">
                        <p className="text-sm text-white">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added email chips */}
            {emails.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {emails.map(email => (
                  <span key={email}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-500/15 border border-brand-500/30 rounded-full text-xs text-brand-300">
                    {email}
                    <button type="button" onClick={() => removeEmail(email)} className="hover:text-white">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Creating…' : editGroup ? 'Save Changes' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
