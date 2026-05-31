export const BADGE_CONFIG = {
  FAST_SETTLER: { label: 'Fast Settler', emoji: '⚡', gradient: 'from-amber-500/20 to-orange-600/10' },
  TRUSTED_PAYER: { label: 'Trusted Payer', emoji: '💎', gradient: 'from-cyan-500/20 to-blue-600/10' },
  CONSISTENT_CONTRIBUTOR: { label: 'Consistent Contributor', emoji: '🔥', gradient: 'from-orange-500/20 to-red-600/10' },
  FOOD_SPONSOR: { label: 'Food Sponsor', emoji: '🍕', gradient: 'from-yellow-500/20 to-amber-600/10' },
  TRIP_CAPTAIN: { label: 'Trip Captain', emoji: '🏖️', gradient: 'from-sky-500/20 to-indigo-600/10' },
  GROUP_LEADER: { label: 'Group Leader', emoji: '🚀', gradient: 'from-violet-500/20 to-purple-600/10' },
  EXPENSE_MASTER: { label: 'Expense Master', emoji: '🧾', gradient: 'from-emerald-500/20 to-teal-600/10' },
  RELIABLE_ROOMMATE: { label: 'Reliable Roommate', emoji: '🤝', gradient: 'from-green-500/20 to-emerald-600/10' },
};

export function getBadgeMeta(badgeType) {
  return BADGE_CONFIG[badgeType] || { label: badgeType, emoji: '🏆', gradient: 'from-brand-500/20 to-brand-600/10' };
}
