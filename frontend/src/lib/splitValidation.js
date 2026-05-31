const TOLERANCE = 0.01;

export const SPLIT_TYPES = [
  { value: 'EQUAL', label: 'Equal', emoji: '⚖️' },
  { value: 'EXACT', label: 'Exact', emoji: '₹' },
  { value: 'PERCENTAGE', label: 'Percent', emoji: '%' },
];

export function computeEqualShares(total, participantIds) {
  const count = participantIds.length;
  if (count === 0) return {};
  const perHead = Math.floor((total / count) * 100) / 100;
  const shares = {};
  let allocated = 0;
  participantIds.forEach((id, i) => {
    if (i < count - 1) {
      shares[id] = perHead;
      allocated += perHead;
    } else {
      shares[id] = Math.round((total - allocated) * 100) / 100;
    }
  });
  return shares;
}

export function computePercentageShares(total, percentages) {
  const ids = Object.keys(percentages);
  const count = ids.length;
  const shares = {};
  let allocated = 0;
  ids.forEach((id, i) => {
    const pct = parseFloat(percentages[id]) || 0;
    if (i < count - 1) {
      const amt = Math.floor((total * pct) / 100 * 100) / 100;
      shares[id] = amt;
      allocated += amt;
    } else {
      shares[id] = Math.round((total - allocated) * 100) / 100;
    }
  });
  return shares;
}

export function validateSplit(splitType, total, selectedIds, exactAmounts, percentages) {
  if (!selectedIds.length) return { valid: false, message: 'Select at least one participant' };
  if (!total || total <= 0) return { valid: false, message: 'Enter a valid amount' };

  if (splitType === 'EXACT') {
    const sum = selectedIds.reduce((s, id) => s + (parseFloat(exactAmounts[id]) || 0), 0);
    if (Math.abs(sum - total) > TOLERANCE) {
      return {
        valid: false,
        message: `Total (₹${sum.toFixed(2)}) must equal ₹${total.toFixed(2)}`,
        remaining: total - sum,
      };
    }
  }

  if (splitType === 'PERCENTAGE') {
    const sum = selectedIds.reduce((s, id) => s + (parseFloat(percentages[id]) || 0), 0);
    if (Math.abs(sum - 100) > TOLERANCE) {
      return {
        valid: false,
        message: `Percentages must add to 100% (currently ${sum.toFixed(1)}%)`,
        remaining: 100 - sum,
      };
    }
  }

  return { valid: true, message: null, remaining: 0 };
}

export function buildParticipantsPayload(splitType, total, selectedIds, exactAmounts, percentages) {
  if (splitType === 'EQUAL') {
    const shares = computeEqualShares(total, selectedIds);
    return selectedIds.map(userId => ({ userId, shareAmount: shares[userId] }));
  }
  if (splitType === 'PERCENTAGE') {
    const shares = computePercentageShares(total, percentages);
    return selectedIds.map(userId => ({
      userId,
      shareAmount: shares[userId],
      sharePercentage: parseFloat(percentages[userId]) || 0,
    }));
  }
  return selectedIds.map(userId => ({
    userId,
    shareAmount: parseFloat(exactAmounts[userId]) || 0,
  }));
}
