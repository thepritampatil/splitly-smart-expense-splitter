/**
 * Visual theme tokens per group type — Phase 3 design system
 */
export const GROUP_THEMES = {
  HOSTEL: {
    gradient: 'from-violet-600/35 via-indigo-500/20 to-fuchsia-600/10',
    bar: 'from-violet-400 via-indigo-400 to-violet-600',
    glow: 'shadow-violet-500/20',
    accent: 'text-violet-300',
    ring: 'ring-violet-500/30',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  },
  TRIP: {
    gradient: 'from-cyan-500/30 via-sky-500/15 to-teal-500/10',
    bar: 'from-cyan-400 via-sky-400 to-teal-500',
    glow: 'shadow-cyan-500/20',
    accent: 'text-cyan-300',
    ring: 'ring-cyan-500/30',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  },
  FLATMATES: {
    gradient: 'from-amber-500/30 via-orange-500/15 to-rose-500/10',
    bar: 'from-amber-400 via-orange-400 to-rose-400',
    glow: 'shadow-amber-500/20',
    accent: 'text-amber-300',
    ring: 'ring-amber-500/30',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  },
  COLLEGE: {
    gradient: 'from-emerald-500/30 via-green-500/15 to-lime-500/10',
    bar: 'from-emerald-400 via-green-400 to-lime-500',
    glow: 'shadow-emerald-500/20',
    accent: 'text-emerald-300',
    ring: 'ring-emerald-500/30',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  },
  OFFICE: {
    gradient: 'from-slate-400/25 via-blue-500/15 to-indigo-500/10',
    bar: 'from-slate-400 via-blue-400 to-indigo-500',
    glow: 'shadow-blue-500/20',
    accent: 'text-blue-300',
    ring: 'ring-blue-500/30',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  },
  OTHER: {
    gradient: 'from-brand-500/30 via-purple-500/15 to-pink-500/10',
    bar: 'from-brand-400 via-purple-400 to-pink-400',
    glow: 'shadow-brand-500/20',
    accent: 'text-brand-300',
    ring: 'ring-brand-500/30',
    badgeClass: 'bg-brand-500/15 text-brand-300 border-brand-500/25',
  },
};

export function getGroupTheme(type) {
  return GROUP_THEMES[type] || GROUP_THEMES.OTHER;
}
