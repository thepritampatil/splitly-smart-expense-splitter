import { AnimatedNumber } from '../motion';

export default function StreakCounter({ count = 0 }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-orange-400">
        <AnimatedNumber value={count} />
      </p>
      <p className="text-xs text-slate-500">day streak</p>
    </div>
  );
}
