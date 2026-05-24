import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Plus, Minus, IndianRupee } from 'lucide-react';
import { Modal, FormField, Avatar, CATEGORY_CONFIG } from '../ui';
import { useExpenseStore, useGroupStore, useAuthStore } from '../../store';

const CATEGORIES = Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ value: k, ...v }));
const SPLIT_TYPES = [
  { value: 'EQUAL', label: 'Split Equally' },
  { value: 'EXACT', label: 'Exact Amounts' },
];

export default function AddExpenseModal({ onClose, prefillGroupId = null, editExpense = null }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: editExpense ? {
      description: editExpense.description,
      amount: editExpense.amount,
      category: editExpense.category,
      splitType: editExpense.splitType,
      groupId: String(editExpense.groupId),
    } : {
      category: 'FOOD',
      splitType: 'EQUAL',
      groupId: prefillGroupId ? String(prefillGroupId) : '',
    }
  });

  const { groups, currentGroup } = useGroupStore();
  const { createExpense, updateExpense, fetchBalances } = useExpenseStore();
  const { user } = useAuthStore();

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [exactAmounts, setExactAmounts] = useState({});
  const [loading, setLoading] = useState(false);

  const watchGroupId = watch('groupId');
  const watchAmount = watch('amount');
  const watchSplitType = watch('splitType');

  // Populate members when group changes
  useEffect(() => {
    if (watchGroupId) {
      const group = groups.find(g => String(g.id) === String(watchGroupId));
      if (group?.members) {
        const accepted = group.members.filter(m => m.status === 'ACCEPTED');
        setSelectedMembers(accepted.map(m => m.user.id));
        const initAmounts = {};
        accepted.forEach(m => { initAmounts[m.user.id] = ''; });
        setExactAmounts(initAmounts);
      }
    }
  }, [watchGroupId, groups]);

  // Prefill for edit
  useEffect(() => {
    if (editExpense) {
      setSelectedMembers(editExpense.participants.map(p => p.userId));
      if (editExpense.splitType === 'EXACT') {
        const amounts = {};
        editExpense.participants.forEach(p => { amounts[p.userId] = String(p.shareAmount); });
        setExactAmounts(amounts);
      }
    }
  }, [editExpense]);

  const currentGroupObj = groups.find(g => String(g.id) === String(watchGroupId));
  const acceptedMembers = currentGroupObj?.members?.filter(m => m.status === 'ACCEPTED') || [];

  const toggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const equalShare = () => {
    const count = selectedMembers.length;
    const amt = parseFloat(watchAmount) || 0;
    return count > 0 ? (amt / count).toFixed(2) : '0.00';
  };

  const exactTotal = () =>
    Object.entries(exactAmounts)
      .filter(([k]) => selectedMembers.includes(Number(k)))
      .reduce((sum, [, v]) => sum + (parseFloat(v) || 0), 0);

  const onSubmit = async (data) => {
    if (selectedMembers.length === 0) {
      return;
    }

    const participants = selectedMembers.map(userId => ({
      userId,
      shareAmount: watchSplitType === 'EQUAL'
        ? parseFloat(equalShare())
        : parseFloat(exactAmounts[userId] || 0),
    }));

    setLoading(true);
    const payload = {
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      splitType: data.splitType,
      groupId: parseInt(data.groupId),
      participants,
    };

    const result = editExpense
      ? await updateExpense(editExpense.id, payload)
      : await createExpense(payload);

    setLoading(false);
    if (result) {
      await fetchBalances(parseInt(data.groupId));
      onClose();
    }
  };

  const amountErr = watchSplitType === 'EXACT' && watchAmount
    ? Math.abs(exactTotal() - parseFloat(watchAmount)) > 0.01
      ? `Total (₹${exactTotal().toFixed(2)}) must equal ₹${parseFloat(watchAmount).toFixed(2)}`
      : null
    : null;

  return (
    <Modal
      title={editExpense ? 'Edit Expense' : 'Add New Expense'}
      onClose={onClose}
      size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Group Select */}
        <FormField label="Group" required error={errors.groupId?.message}>
          <select {...register('groupId', { required: 'Select a group' })} className="input-field">
            <option value="">Select a group…</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.avatar} {g.groupName}</option>
            ))}
          </select>
        </FormField>

        {/* Description */}
        <FormField label="Description" required error={errors.description?.message}>
          <input
            {...register('description', { required: 'Description is required' })}
            placeholder="What was this expense for?"
            className="input-field" />
        </FormField>

        {/* Amount */}
        <FormField label="Total Amount (₹)" required error={errors.amount?.message}>
          <div className="relative">
            <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number" step="0.01" min="0.01"
              {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })}
              placeholder="0.00"
              className="input-field pl-8" />
          </div>
        </FormField>

        {/* Category + Split Row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category">
            <select {...register('category')} className="input-field text-sm">
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Split Type">
            <select {...register('splitType')} className="input-field text-sm">
              {SPLIT_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Members */}
        {acceptedMembers.length > 0 && (
          <FormField label="Split Among">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {acceptedMembers.map(({ user: member }) => {
                const isSelected = selectedMembers.includes(member.id);
                const isCurrentUser = member.id === user?.id;
                return (
                  <motion.div
                    key={member.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border transition-all
                      ${isSelected
                        ? 'bg-brand-500/10 border-brand-500/30'
                        : 'bg-dark-700 border-transparent hover:border-white/10'}`}>
                    <Avatar src={member.avatar} name={member.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {member.fullName}{isCurrentUser ? ' (you)' : ''}
                      </p>
                    </div>
                    {isSelected && watchSplitType === 'EQUAL' && (
                      <span className="text-xs font-mono text-emerald-400">₹{equalShare()}</span>
                    )}
                    {isSelected && watchSplitType === 'EXACT' && (
                      <input
                        type="number" step="0.01" min="0"
                        value={exactAmounts[member.id] || ''}
                        onChange={e => setExactAmounts(a => ({ ...a, [member.id]: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        placeholder="0.00"
                        className="w-24 px-2 py-1 text-xs bg-dark-600 border border-white/10 rounded-md text-white text-right focus:outline-none focus:border-brand-500/50"
                      />
                    )}
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-brand-500' : 'border border-white/20'}`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {amountErr && <p className="text-xs text-rose-400 mt-1">{amountErr}</p>}
          </FormField>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !!amountErr || selectedMembers.length === 0}
            className="btn-primary flex-1 justify-center">
            {loading ? 'Saving…' : editExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
