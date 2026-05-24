import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Inbox } from 'lucide-react';

// =============================================
// MODAL WRAPPER
// =============================================
export function Modal({ isOpen = true, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`modal-content w-full ${sizes[size]}`}
            onClick={e => e.stopPropagation()}>
            {title && (
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                <h2 className="font-semibold text-white text-base">{title}</h2>
                {onClose && (
                  <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// =============================================
// SKELETON LOADERS
// =============================================
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-2/3 rounded" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 2 ? 'w-1/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}

export function SkeletonText({ width = 'w-full', height = 'h-4' }) {
  return <div className={`skeleton ${height} ${width} rounded`} />;
}

// =============================================
// BADGE COMPONENT
// =============================================
const BADGE_VARIANTS = {
  green:  'badge-green',
  yellow: 'badge-yellow',
  red:    'badge-red',
  blue:   'badge-blue',
  gray:   'badge-gray',
};

export function Badge({ variant = 'gray', children, className = '' }) {
  return (
    <span className={`${BADGE_VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  );
}

// =============================================
// STATUS BADGE for settlements
// =============================================
export function SettlementBadge({ status }) {
  const config = {
    COMPLETED:  { variant: 'green',  label: 'Completed' },
    PROCESSING: { variant: 'yellow', label: 'Awaiting Confirmation' },
    PENDING:    { variant: 'gray',   label: 'Pending' },
  };
  const c = config[status] || config.PENDING;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

// =============================================
// AVATAR
// =============================================
export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    xs:  'w-6 h-6 text-xs',
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-16 h-16 text-xl',
  };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['bg-brand-600', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-600'];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  if (src) {
    return (
      <img src={src} alt={name || ''}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${sizes[size]} ${colors[colorIdx]} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 ${className}`}>
      {initials}
    </div>
  );
}

// =============================================
// EMPTY STATE
// =============================================
export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-dark-700 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
        <Icon size={28} className="text-slate-500" />
      </div>
      <h3 className="font-semibold text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
      {action}
    </motion.div>
  );
}

// =============================================
// PAGE HEADER
// =============================================
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// =============================================
// STAT CARD
// =============================================
export function StatCard({ label, value, sub, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   ring: 'ring-brand-500/20' },
    green:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    red:     { bg: 'bg-rose-500/10',    text: 'text-rose-400',    ring: 'ring-rose-500/20' },
    yellow:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   ring: 'ring-amber-500/20' },
  };
  const c = colors[color] || colors.brand;

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 ${c.bg} rounded-lg flex items-center justify-center ring-1 ${c.ring}`}>
            <Icon size={18} className={c.text} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// =============================================
// INPUT WRAPPER
// =============================================
export function FormField({ label, error, children, required }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// =============================================
// LOADING SPINNER
// =============================================
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
}

// =============================================
// SECTION WRAPPER
// =============================================
export function Section({ title, action, children, className = '' }) {
  return (
    <div className={className}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-sm font-semibold text-slate-300">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

// =============================================
// CATEGORY ICON MAP
// =============================================
export const CATEGORY_CONFIG = {
  FOOD:       { emoji: '🍕', label: 'Food',       color: 'text-orange-400' },
  UTILITIES:  { emoji: '⚡', label: 'Utilities',  color: 'text-blue-400' },
  INTERNET:   { emoji: '📶', label: 'Internet',   color: 'text-purple-400' },
  TRAVEL:     { emoji: '🚕', label: 'Travel',     color: 'text-emerald-400' },
  SHOPPING:   { emoji: '🛍️', label: 'Shopping',   color: 'text-pink-400' },
  RENT:       { emoji: '🏠', label: 'Rent',       color: 'text-amber-400' },
  OTHER:      { emoji: '📦', label: 'Other',      color: 'text-slate-400' },
};

export const GROUP_TYPE_CONFIG = {
  HOSTEL:    { emoji: '🏠', label: 'Hostel' },
  TRIP:      { emoji: '🏖️', label: 'Trip' },
  FLATMATES: { emoji: '🛏️', label: 'Flatmates' },
  COLLEGE:   { emoji: '🎓', label: 'College' },
  OFFICE:    { emoji: '💼', label: 'Office' },
  OTHER:     { emoji: '👥', label: 'Other' },
};

// =============================================
// CONFIRM DIALOG
// =============================================
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-400 mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
        <button onClick={onConfirm} className={danger ? 'btn-danger text-sm' : 'btn-primary text-sm'}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
