import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Zap, Shield, TrendingUp, ArrowRight, CheckCircle,
  IndianRupee, Activity, Sparkles, ChevronRight
} from 'lucide-react';

const FEATURES = [
  { icon: IndianRupee, title: 'Smart Expense Splitting', desc: 'Equal or exact split with automatic balance calculation across all group members.', color: 'brand' },
  { icon: Zap, title: 'Debt Optimization Algorithm', desc: 'Greedy algorithm minimizes total transactions needed to settle all group debts.', color: 'yellow' },
  { icon: Shield, title: 'Two-Step Settlement', desc: 'Payer marks payment, receiver confirms — complete transparency, no disputes.', color: 'green' },
  { icon: Activity, title: 'Live Activity Feed', desc: 'Every action is logged — expenses added, payments made, members joined.', color: 'purple' },
  { icon: TrendingUp, title: 'Spending Analytics', desc: 'Monthly trends and category breakdowns with beautiful interactive charts.', color: 'rose' },
  { icon: Users, title: 'Friend List System', desc: 'Auto-adds group members to your friend list for quick future invites.', color: 'cyan' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create a Group', desc: 'Set up your hostel, trip, or flatmate group and invite members by email.' },
  { step: '02', title: 'Add Expenses', desc: 'Log who paid, split equally or by exact amount, choose a category.' },
  { step: '03', title: 'See Optimized Debts', desc: 'Our algorithm calculates minimum transactions to settle everything.' },
  { step: '04', title: 'Settle & Confirm', desc: 'Payer marks payment sent, receiver confirms — balance auto-updates.' },
];

const iconColors = {
  brand: 'bg-brand-500/15 text-brand-400',
  yellow: 'bg-amber-500/15 text-amber-400',
  green: 'bg-emerald-500/15 text-emerald-400',
  purple: 'bg-purple-500/15 text-purple-400',
  rose: 'bg-rose-500/15 text-rose-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center font-bold text-sm">S</div>
            <span className="font-display text-lg font-bold">Splitly</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">Login</Link>
            <Link to="/signup" className="btn-primary text-sm py-2">Get Started <ArrowRight size={14} /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-xs text-brand-300 mb-6">
            <Sparkles size={12} /> Collaborative Finance Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-display text-4xl font-bold leading-tight sm:text-6xl mb-5">
            Split expenses,
            <br />
            <span className="text-gradient">not friendships</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Splitly is a collaborative expense platform for hostel mates, trip groups,
            flatmates, and office teams — with smart debt optimization and transparent settlement workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/signup" className="btn-primary px-6 py-3 text-base w-full sm:w-auto justify-center">
              Start for Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary px-6 py-3 text-base w-full sm:w-auto justify-center">
              Sign In
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-x-6 gap-y-2 justify-center mt-8 text-xs text-slate-500">
            {['JWT Authentication', 'Debt Optimization Algorithm', 'Two-step Settlement', 'Free to use'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-emerald-400" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-dark-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">How Splitly Works</h2>
            <p className="text-slate-400">Four steps to fair, transparent expense sharing</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="glass-card p-5">
                <span className="text-3xl font-black text-brand-500/20 block mb-3">{step.step}</span>
                <h3 className="font-semibold text-white mb-1.5 text-sm">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Everything you need</h2>
            <p className="text-slate-400">A complete collaborative finance system</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="glass-card p-5">
                <div className={`w-10 h-10 ${iconColors[f.color]} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-white mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4 bg-dark-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Built for real groups</h2>
          <p className="text-slate-400 mb-8">Wherever people share expenses</p>
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            {[['🏠','Hostel Mates'],['🏖️','Trip Groups'],['🛏️','Flatmates'],['🎓','College Events'],['💼','Office Outings'],['👨‍👩‍👧','Family Trips']].map(([emoji, label]) => (
              <span key={label} className="px-4 py-2 bg-dark-700 border border-white/8 rounded-full text-slate-300 hover:border-brand-500/30 transition-colors">
                {emoji} {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to split fairly?</h2>
          <p className="text-slate-400 mb-8">Join your group and start tracking expenses in minutes.</p>
          <Link to="/signup" className="btn-primary px-8 py-3.5 text-base inline-flex mx-auto">
            Create Your Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-600">
        <p>© 2025 Splitly — Collaborative Expense Platform. Built with React + Spring Boot.</p>
      </footer>
    </div>
  );
}
