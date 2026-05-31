import BadgeCard from './BadgeCard';
import { StaggerGrid } from '../motion';
import { fadeUpItem } from '../../lib/motion';
import { motion } from 'framer-motion';

export default function BadgeGrid({ badges = [], emptyMessage = 'No badges yet — keep splitting and settling!' }) {
  if (!badges.length) {
    return <p className="py-6 text-center text-xs text-slate-500">{emptyMessage}</p>;
  }

  return (
    <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {badges.map((b) => (
        <motion.div key={`${b.badgeType}-${b.tier}`} variants={fadeUpItem}>
          <BadgeCard badge={b} compact />
        </motion.div>
      ))}
    </StaggerGrid>
  );
}
