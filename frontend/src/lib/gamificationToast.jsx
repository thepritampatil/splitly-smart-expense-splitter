import toast from 'react-hot-toast';
import { getBadgeMeta } from './badgeConfig';

export function showBadgeUnlockToast(badgeType) {
  const meta = getBadgeMeta(badgeType);
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 rounded-xl border border-white/10 bg-dark-800/95 px-4 py-3 shadow-xl backdrop-blur-md
          ${t.visible ? 'animate-in' : ''}`}
        style={{ maxWidth: 320 }}
      >
        <span className="text-2xl">{meta.emoji}</span>
        <div>
          <p className="text-xs font-medium text-brand-300">Badge unlocked</p>
          <p className="text-sm font-semibold text-white">{meta.label}</p>
        </div>
      </div>
    ),
    { duration: 4000, position: 'top-right' }
  );
}

export function showStreakToast(streakCount) {
  toast(`🔥 ${streakCount}-day settlement streak!`, { icon: '🔥' });
}

export function showTrustScoreToast(score) {
  toast(`💎 Trust score: ${Math.round(score)}`, { icon: '💎' });
}
