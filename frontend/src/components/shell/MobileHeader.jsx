import { useLocation, Link } from 'react-router-dom';
import { Bell, MoreHorizontal } from 'lucide-react';

const TITLES = {
  '/dashboard': 'Home',
  '/groups': 'Groups',
  '/settlements': 'Settlements',
  '/analytics': 'Analytics',
  '/activity': 'Activity',
  '/settings': 'Settings',
  '/invites': 'Invites',
};

function getTitle(pathname) {
  if (pathname.startsWith('/groups/')) return 'Group';
  return TITLES[pathname] || 'Splitly';
}

export default function MobileHeader({ user, inviteCount = 0, onOpenMore }) {
  const { pathname } = useLocation();
  const title = getTitle(pathname);

  return (
    <header className="mobile-header flex flex-shrink-0 items-center justify-between gap-3 px-4 lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
          S
        </div>
        <h1 className="truncate text-base font-semibold text-white">{title}</h1>
      </div>

      <div className="flex flex-shrink-0 items-center gap-1">
        <Link
          to="/invites"
          aria-label={`Invitations${inviteCount ? `, ${inviteCount} pending` : ''}`}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white touch-manipulation"
        >
          <Bell size={20} />
          {inviteCount > 0 && (
            <span className="absolute right-2 top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {inviteCount > 9 ? '9+' : inviteCount}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onOpenMore}
          aria-label="More options"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white touch-manipulation"
        >
          <MoreHorizontal size={20} />
        </button>
        <Link to="/settings" aria-label="Profile settings" className="touch-manipulation">
          <img
            src={user?.avatar}
            alt=""
            className="h-9 w-9 rounded-full bg-dark-600 ring-2 ring-brand-500/30"
          />
        </Link>
      </div>
    </header>
  );
}
