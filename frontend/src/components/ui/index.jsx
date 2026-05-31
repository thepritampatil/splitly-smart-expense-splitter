import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Inbox } from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { slideUpSheet, slideCenterModal, springModal } from '../../lib/motion';
import AnimatedNumber from '../motion/AnimatedNumber';

// =============================================
// MODAL WRAPPER
// =============================================
export function Modal({ isOpen = true, onClose, title, children, size = 'md' }) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  const panelMotion = isMobile ? slideUpSheet : slideCenterModal;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            variants={panelMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            className={`modal-content w-full ${sizes[size]} ${isMobile ? 'modal-content-sheet' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="modal-header border-b border-white/5 p-5">
                {isMobile && <div className="modal-drag-handle mx-auto mb-3" aria-hidden />}
                <div className="flex items-center justify-between gap-3">
                  <h2 id="modal-title" className="font-semibold text-white text-base">{title}</h2>
                  {onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close dialog"
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white touch-manipulation"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="modal-body p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================
// SKELETON LOADERS
// =============================================
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card space-y-3 p-5">
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
export function EmptyState({ icon: Icon = Inbox, title, description, action, emoji }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-dark-600/80 to-dark-700/40 shadow-glow-sm backdrop-blur-md">
        {emoji ? (
          <span className="text-3xl" role="img" aria-hidden>{emoji}</span>
        ) : (
          <Icon size={28} className="text-slate-500" />
        )}
      </div>
      <h3 className="font-display mb-1.5 font-semibold text-white">{title}</h3>
      <p className="mb-4 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {action}
    </motion.div>
  );
}

// =============================================
// PAGE HEADER
// =============================================
export function PageHeader({ title, subtitle, action, emoji }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          {emoji && <span className="mr-1.5">{emoji}</span>}
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export { default as PageTitle } from './PageTitle';

// =============================================
// STAT CARD
// =============================================
export function StatCard({ label, value, count, formatCount, sub, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:   { bg: 'bg-brand-500/10',   text: 'text-brand-400',   ring: 'ring-brand-500/20' },
    green:   { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    red:     { bg: 'bg-rose-500/10',    text: 'text-rose-400',    ring: 'ring-rose-500/20' },
    yellow:  { bg: 'bg-amber-500/10',   text: 'text-amber-400',   ring: 'ring-amber-500/20' },
  };
  const c = colors[color] || colors.brand;

  const valueNode = count != null ? (
    <AnimatedNumber
      value={count}
      format={formatCount || ((n) => String(Math.round(n)))}
    />
  ) : value;

  return (
    <div className="stat-card">
      <div className="relative z-10 mb-3 flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${c.bg} ${c.ring}`}
          >
            <Icon size={18} className={c.text} />
          </motion.div>
        )}
      </div>
      <p className="relative z-10 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{valueNode}</p>
      {sub && <p className="relative z-10 mt-1.5 text-xs text-slate-500">{sub}</p>}
      {trend != null && (
        <p className="relative z-10 mt-1 text-xs text-emerald-400">{trend}</p>
      )}
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
