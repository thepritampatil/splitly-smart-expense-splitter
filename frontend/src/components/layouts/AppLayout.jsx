import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Receipt, TrendingUp, Activity,
  Settings, LogOut, Menu, X, Bell, Plus, ChevronDown,
  Wallet, UserCircle, Home
} from 'lucide-react';
import { useAuthStore, useGroupStore } from '../../store';
import AddExpenseModal from '../modals/AddExpenseModal';
import CreateGroupModal from '../modals/CreateGroupModal';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/groups',    icon: Users,           label: 'Groups' },
  { to: '/settlements',icon: Wallet,         label: 'Settlements' },
  { to: '/analytics', icon: TrendingUp,      label: 'Analytics' },
  { to: '/activity',  icon: Activity,        label: 'Activity' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuthStore();
  const { fetchGroups } = useGroupStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { fetchGroups(); }, []);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">S</div>
          <span className="font-bold text-white text-lg">Splitly</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-3 mb-4 space-y-1.5">
        <button onClick={() => setShowExpenseModal(true)}
          className="w-full btn-primary justify-center text-sm py-2.5">
          <Plus size={16} /> Add Expense
        </button>
        <button onClick={() => setShowGroupModal(true)}
          className="w-full btn-secondary justify-center text-sm py-2">
          <Users size={16} /> New Group
        </button>
      </div>

      <div className="divider" />

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        <p className="section-title">Navigation</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <div className="pt-3">
          <p className="section-title">Account</p>
          <NavLink to="/settings"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Settings size={17} /> Settings
          </NavLink>
          <NavLink to="/invites"
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <Bell size={17} /> Invites
          </NavLink>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
             onClick={() => setShowUserMenu(s => !s)}>
          <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full bg-dark-600 ring-2 ring-brand-500/30" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
        <AnimatePresence>
          {showUserMenu && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-1 bg-dark-700 border border-white/8 rounded-lg overflow-hidden">
              <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                <UserCircle size={15} /> Profile
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10">
                <LogOut size={15} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-dark-800 border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-dark-800 border-r border-white/5 z-50 lg:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-dark-800 border-b border-white/5 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center text-xs font-bold">S</div>
            <span className="font-bold text-white">Splitly</span>
          </div>
          <img src={user?.avatar} alt="" className="w-7 h-7 rounded-full bg-dark-600 ring-2 ring-brand-500/30" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full">
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showExpenseModal && (
          <AddExpenseModal onClose={() => setShowExpenseModal(false)} />
        )}
        {showGroupModal && (
          <CreateGroupModal onClose={() => setShowGroupModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
