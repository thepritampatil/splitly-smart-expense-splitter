import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Wallet, TrendingUp, Activity,
  Settings, Bell, Plus, LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store';

const MAIN_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/settlements', icon: Wallet, label: 'Settlements' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/activity', icon: Activity, label: 'Activity' },
];

const ACCOUNT_ITEMS = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/invites', icon: Bell, label: 'Invites' },
];

function RailLink({ to, icon: Icon, label, badge }) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        `relative flex h-11 w-11 items-center justify-center rounded-xl transition-all touch-manipulation
        ${isActive
          ? 'bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30'
          : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`
      }
    >
      <Icon size={20} />
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  );
}

export default function SideRail({ onAddExpense, onNewGroup, inviteCount = 0 }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside
      className="shell-sidebar hidden md:flex lg:hidden w-[72px] flex-shrink-0 flex-col items-center gap-1 py-4"
      aria-label="Compact navigation"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
        S
      </div>

      <button
        type="button"
        onClick={onAddExpense}
        title="Add expense"
        aria-label="Add expense"
        className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20 active:scale-95 transition-transform touch-manipulation"
      >
        <Plus size={20} />
      </button>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {MAIN_ITEMS.map((item) => (
          <RailLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1 border-t border-white/5 pt-3 w-full px-2">
        {ACCOUNT_ITEMS.map((item) => (
          <RailLink
            key={item.to}
            {...item}
            badge={item.to === '/invites' ? inviteCount : 0}
          />
        ))}
        <button
          type="button"
          onClick={() => { logout(); navigate('/login'); }}
          title="Log out"
          aria-label="Log out"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors touch-manipulation"
        >
          <LogOut size={18} />
        </button>
        {user?.avatar && (
          <img
            src={user.avatar}
            alt=""
            className="mt-2 h-9 w-9 rounded-full ring-2 ring-brand-500/30"
          />
        )}
      </div>
    </aside>
  );
}
