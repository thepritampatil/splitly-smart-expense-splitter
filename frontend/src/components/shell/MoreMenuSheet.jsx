import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, TrendingUp, Settings, Bell, Users, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store';

const LINKS = [
  { to: '/settlements', icon: Wallet, label: 'Settlements' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/invites', icon: Bell, label: 'Invitations' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MoreMenuSheet({ open, onClose, onNewGroup, inviteCount = 0 }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="More options"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border border-white/8 bg-dark-800 pb-safe lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <h2 className="font-semibold text-white">More</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white touch-manipulation"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1 p-3">
              <button
                type="button"
                onClick={() => { onNewGroup(); onClose(); }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-white hover:bg-white/5 touch-manipulation"
              >
                <Users size={18} className="text-brand-400" />
                New Group
              </button>
              {LINKS.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white touch-manipulation"
                >
                  <Icon size={18} className="text-slate-500" />
                  {label}
                  {to === '/invites' && inviteCount > 0 && (
                    <span className="ml-auto rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-medium text-rose-400">
                      {inviteCount}
                    </span>
                  )}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm text-rose-400 hover:bg-rose-500/10 touch-manipulation"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
