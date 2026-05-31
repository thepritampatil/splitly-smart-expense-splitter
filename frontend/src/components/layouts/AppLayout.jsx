import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Wallet, TrendingUp, Activity,
  Settings, LogOut, X, Bell, Plus, ChevronDown, UserCircle,
} from 'lucide-react';
import { useAuthStore, useGroupStore } from '../../store';
import api from '../../services/api';
import AddExpenseModal from '../modals/AddExpenseModal';
import CreateGroupModal from '../modals/CreateGroupModal';
import {
  MobileBottomNav,
  FloatingActionButton,
  SideRail,
  MobileHeader,
  MoreMenuSheet,
} from '../shell';
import { PageTransition } from '../motion';
import { springModal } from '../../lib/motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/groups', icon: Users, label: 'Groups' },
  { to: '/settlements', icon: Wallet, label: 'Settlements' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
  { to: '/activity', icon: Activity, label: 'Activity' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [inviteCount, setInviteCount] = useState(0);
  const { user, logout } = useAuthStore();
  const { fetchGroups } = useGroupStore();
  const navigate = useNavigate();
  const location = useLocation();

  const loadInviteCount = useCallback(async () => {
    try {
      const res = await api.get('/groups/pending');
      setInviteCount((res.data || []).length);
    } catch {
      setInviteCount(0);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, []);
  useEffect(() => { loadInviteCount(); }, [loadInviteCount]);
  useEffect(() => {
    setSidebarOpen(false);
    setShowMoreMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">S</div>
          <span className="text-lg font-bold text-white">Splitly</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="text-slate-400 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-4 space-y-1.5 px-3">
        <button
          type="button"
          onClick={() => setShowExpenseModal(true)}
          className="btn-primary w-full justify-center py-2.5 text-sm touch-manipulation"
        >
          <Plus size={16} /> Add Expense
        </button>
        <button
          type="button"
          onClick={() => setShowGroupModal(true)}
          className="btn-secondary w-full justify-center py-2 text-sm touch-manipulation"
        >
          <Users size={16} /> New Group
        </button>
      </div>

      <div className="divider" />

      <nav className="flex-1 space-y-0.5 px-2">
        <p className="section-title">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-item touch-manipulation ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="pt-3">
          <p className="section-title">Account</p>
          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-item touch-manipulation ${isActive ? 'active' : ''}`}
          >
            <Settings size={17} /> Settings
          </NavLink>
          <NavLink
            to="/invites"
            className={({ isActive }) => `sidebar-item touch-manipulation ${isActive ? 'active' : ''}`}
          >
            <Bell size={17} /> Invites
            {inviteCount > 0 && (
              <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">
                {inviteCount > 9 ? '9+' : inviteCount}
              </span>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-white/5 p-3">
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white/5 touch-manipulation"
            onClick={() => setShowUserMenu(s => !s)}
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <img src={user?.avatar} alt="" className="h-8 w-8 rounded-full bg-dark-600 ring-2 ring-brand-500/30" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium text-white">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-1 overflow-hidden rounded-lg border border-white/8 bg-dark-700"
              >
                <button
                  type="button"
                  onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white touch-manipulation"
                >
                  <UserCircle size={15} /> Profile
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 touch-manipulation"
                >
                  <LogOut size={15} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-dark-900">
      {/* Desktop sidebar */}
      <aside className="shell-sidebar hidden w-60 flex-shrink-0 flex-col lg:flex">
        <SidebarContent />
      </aside>

      {/* Tablet icon rail — md only (SideRail duplicates nav; use collapsible md sidebar instead) */}
      <SideRail
        onAddExpense={() => setShowExpenseModal(true)}
        inviteCount={inviteCount}
      />

      {/* Mobile drawer (legacy access via More menu / optional) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={springModal}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-dark-800 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <MobileHeader
          user={user}
          inviteCount={inviteCount}
          onOpenMore={() => setShowMoreMenu(true)}
        />

        <main className="app-main flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>

        <MobileBottomNav />
        <FloatingActionButton onClick={() => setShowExpenseModal(true)} />
      </div>

      <MoreMenuSheet
        open={showMoreMenu}
        onClose={() => setShowMoreMenu(false)}
        onNewGroup={() => setShowGroupModal(true)}
        inviteCount={inviteCount}
      />

      <AnimatePresence>
        {showExpenseModal && (
          <AddExpenseModal onClose={() => setShowExpenseModal(false)} />
        )}
        {showGroupModal && (
          <CreateGroupModal
            onClose={() => {
              setShowGroupModal(false);
              loadInviteCount();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
