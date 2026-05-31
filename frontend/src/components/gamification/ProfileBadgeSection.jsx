import BadgeGrid from './BadgeGrid';

export default function ProfileBadgeSection({ badges, loading }) {
  return (
    <div className="glass-card p-5">
      <h2 className="mb-4 text-sm font-semibold text-white">Achievements</h2>
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : (
        <BadgeGrid badges={badges} />
      )}
    </div>
  );
}
