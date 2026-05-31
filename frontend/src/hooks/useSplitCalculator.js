import { useMemo } from 'react';
import {
  computeEqualShares,
  computePercentageShares,
  validateSplit,
} from '../lib/splitValidation';

export default function useSplitCalculator({
  splitType,
  total,
  selectedIds,
  exactAmounts,
  percentages,
}) {
  const amount = parseFloat(total) || 0;

  const shares = useMemo(() => {
    if (!selectedIds.length || amount <= 0) return {};
    if (splitType === 'EQUAL') return computeEqualShares(amount, selectedIds);
    if (splitType === 'PERCENTAGE') return computePercentageShares(amount, percentages);
    const map = {};
    selectedIds.forEach(id => {
      map[id] = parseFloat(exactAmounts[id]) || 0;
    });
    return map;
  }, [splitType, amount, selectedIds, exactAmounts, percentages]);

  const validation = useMemo(
    () => validateSplit(splitType, amount, selectedIds, exactAmounts, percentages),
    [splitType, amount, selectedIds, exactAmounts, percentages]
  );

  const allocated = useMemo(
    () => Object.values(shares).reduce((s, v) => s + v, 0),
    [shares]
  );

  return {
    shares,
    validation,
    allocated,
    remaining: amount - allocated,
    amount,
  };
}
