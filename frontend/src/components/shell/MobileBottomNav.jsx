import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, Activity, User } from 'lucide-react';

const ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/settings', icon: User, label: 'Profile' },
];

export default function MobileBottomNav() {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/groups') return location.pathname.startsWith('/groups');
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 z-30 lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {ITEMS.map(({ to, icon: Icon, label }, index) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[52px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors touch-manipulation
                ${active ? 'text-brand-400' : 'text-slate-500 active:text-slate-300'}`}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-x-2 top-1 h-0.5 rounded-full bg-brand-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={22} strokeWidth={active ? 2.25 : 1.75} className="relative z-10" />
              <span className="relative z-10">{label}</span>
              {/* Center gap for FAB between Groups and Activity */}
              {index === 1 && <span className="pointer-events-none absolute -right-6 w-12" aria-hidden />}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
