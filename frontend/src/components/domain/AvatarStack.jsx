import { Avatar } from '../ui';

const SIZES = {
  xs: { avatar: 'xs', ring: 'ring-2 ring-dark-800', overlap: '-space-x-1.5' },
  sm: { avatar: 'sm', ring: 'ring-2 ring-dark-800', overlap: '-space-x-2' },
};

export default function AvatarStack({
  users = [],
  max = 4,
  size = 'xs',
  className = '',
}) {
  const config = SIZES[size] || SIZES.xs;
  const visible = users.slice(0, max);
  const overflow = users.length - visible.length;

  if (visible.length === 0) return null;

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex ${config.overlap}`}>
        {visible.map((u, i) => (
          <Avatar
            key={u.id || u.userId || i}
            src={u.avatar || u.user?.avatar}
            name={u.fullName || u.user?.fullName || u.name}
            size={config.avatar}
            className={config.ring}
            title={u.fullName || u.user?.fullName}
          />
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-1.5 text-[10px] font-medium text-slate-500">+{overflow}</span>
      )}
    </div>
  );
}
