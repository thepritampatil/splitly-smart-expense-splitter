import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { IndianRupee } from 'lucide-react';
import { Modal, FormField, Avatar, CATEGORY_CONFIG } from '../ui';
import SplitTypeSelector from '../expense/SplitTypeSelector';
import SplitPreviewBar from '../expense/SplitPreviewBar';
import useSplitCalculator from '../../hooks/useSplitCalculator';
import { buildParticipantsPayload } from '../../lib/splitValidation';
import { useExpenseStore, useGroupStore, useAuthStore } from '../../store';

const CATEGORIES = Object.entries(CATEGORY_CONFIG).map(([k, v]) => ({ value: k, ...v }));

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
    },
  });

  const { groups } = useGroupStore();
  const { createExpense, updateExpense, fetchBalances } = useExpenseStore();
  const { user } = useAuthStore();

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [exactAmounts, setExactAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [loading, setLoading] = useState(false);

  const watchGroupId = watch('groupId');
  const watchAmount = watch('amount');
  const watchSplitType = watch('splitType');

  useEffect(() => {
    if (watchGroupId) {
      const group = groups.find(g => String(g.id) === String(watchGroupId));
      if (group?.members) {
        const accepted = group.members.filter(m => m.status === 'ACCEPTED');
        const ids = accepted.map(m => m.user.id);
        setSelectedMembers(ids);
        const initAmt = {};
        const initPct = {};
        accepted.forEach(m => {
          initAmt[m.user.id] = '';
          initPct[m.user.id] = '';
        });
        setExactAmounts(initAmt);
        setPercentages(initPct);
      }
    }
  }, [watchGroupId, groups]);

  useEffect(() => {
    if (editExpense) {
      setSelectedMembers(editExpense.participants.map(p => p.userId));
      if (editExpense.splitType === 'EXACT') {
        const amounts = {};
        editExpense.participants.forEach(p => { amounts[p.userId] = String(p.shareAmount); });
        setExactAmounts(amounts);
      }
      if (editExpense.splitType === 'PERCENTAGE') {
        const pcts = {};
        editExpense.participants.forEach(p => {
          pcts[p.userId] = String(p.sharePercentage ?? '');
        });
        setPercentages(pcts);
      }
    }
  }, [editExpense]);

  const currentGroupObj = groups.find(g => String(g.id) === String(watchGroupId));
  const acceptedMembers = currentGroupObj?.members?.filter(m => m.status === 'ACCEPTED') || [];

  const { shares, validation, allocated, remaining, amount } = useSplitCalculator({
    splitType: watchSplitType,
    total: watchAmount,
    selectedIds: selectedMembers,
    exactAmounts,
    percentages,
  });

  const toggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const onSubmit = async (data) => {
    if (!validation.valid || selectedMembers.length === 0) return;

    const participants = buildParticipantsPayload(
      data.splitType,
      parseFloat(data.amount),
      selectedMembers,
      exactAmounts,
      percentages
    );

    setLoading(true);
    const payload = {
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      splitType: data.splitType,
      groupId: parseInt(data.groupId, 10),
      participants,
    };

    const result = editExpense
      ? await updateExpense(editExpense.id, payload)
      : await createExpense(payload);

    setLoading(false);
    if (result) {
      await fetchBalances(parseInt(data.groupId, 10));
      onClose();
    }
  };

  return (
    <Modal title={editExpense ? 'Edit Expense' : 'Add New Expense'} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Group" required error={errors.groupId?.message}>
          <select {...register('groupId', { required: 'Select a group' })} className="input-field">
            <option value="">Select a group…</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.avatar} {g.groupName}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Description" required error={errors.description?.message}>
          <input
            {...register('description', { required: 'Description is required' })}
            placeholder="What was this expense for?"
            className="input-field"
          />
        </FormField>

        <FormField label="Total Amount (₹)" required error={errors.amount?.message}>
          <div className="relative">
            <IndianRupee size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be > 0' } })}
              placeholder="0.00"
              className="input-field pl-8"
            />
          </div>
        </FormField>

        <FormField label="Category">
          <select {...register('category')} className="input-field text-sm">
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Split method">
          <SplitTypeSelector
            value={watchSplitType}
            onChange={v => setValue('splitType', v)}
          />
        </FormField>

        {amount > 0 && selectedMembers.length > 0 && (
          <SplitPreviewBar
            total={amount}
            allocated={allocated}
            remaining={remaining}
            validation={validation}
            splitType={watchSplitType}
          />
        )}

        {acceptedMembers.length > 0 && (
          <FormField label="Split among">
            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {acceptedMembers.map(({ user: member }) => {
                const isSelected = selectedMembers.includes(member.id);
                const isCurrentUser = member.id === user?.id;
                const share = shares[member.id];

                return (
                  <motion.div
                    key={member.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleMember(member.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-all touch-manipulation
                      ${isSelected ? 'border-brand-500/30 bg-brand-500/10' : 'border-transparent bg-dark-700 hover:border-white/10'}`}
                  >
                    <Avatar src={member.avatar} name={member.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">
                        {member.fullName}{isCurrentUser ? ' (you)' : ''}
                      </p>
                      {isSelected && watchSplitType === 'EQUAL' && share != null && (
                        <p className="text-xs text-emerald-400">₹{share.toFixed(2)} each</p>
                      )}
                      {isSelected && watchSplitType === 'PERCENTAGE' && share != null && (
                        <p className="text-xs text-slate-500">
                          → ₹{share.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {isSelected && watchSplitType === 'EXACT' && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={exactAmounts[member.id] || ''}
                        onChange={e => setExactAmounts(a => ({ ...a, [member.id]: e.target.value }))}
                        onClick={e => e.stopPropagation()}
                        placeholder="0.00"
                        className="w-24 rounded-md border border-white/10 bg-dark-600 px-2 py-1 text-right text-xs text-white focus:border-brand-500/50 focus:outline-none"
                      />
                    )}

                    {isSelected && watchSplitType === 'PERCENTAGE' && (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={percentages[member.id] || ''}
                          onChange={e => setPercentages(p => ({ ...p, [member.id]: e.target.value }))}
                          placeholder="0"
                          className="w-16 rounded-md border border-white/10 bg-dark-600 px-2 py-1 text-right text-xs text-white focus:border-brand-500/50 focus:outline-none"
                        />
                        <span className="text-xs text-slate-500">%</span>
                      </div>
                    )}

                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded
                        ${isSelected ? 'bg-brand-500' : 'border border-white/20'}`}
                    >
                      {isSelected && <span className="text-xs text-white">✓</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </FormField>
        )}

        <div className="sticky-actions -mx-5 mt-4 flex gap-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <button type="button" onClick={onClose} className="btn-secondary min-h-[44px] flex-1 justify-center touch-manipulation">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !validation.valid || selectedMembers.length === 0}
            className="btn-primary min-h-[44px] flex-1 justify-center touch-manipulation"
          >
            {loading ? 'Saving…' : editExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
