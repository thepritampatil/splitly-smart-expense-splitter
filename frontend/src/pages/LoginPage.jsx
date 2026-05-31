import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../store';
import { FormField } from '../components/ui';

function AuthLayout({ children, title, subtitle, link, linkText, linkTo }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900 px-4">
      <div className="pointer-events-none absolute top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-64 w-64 rounded-full bg-purple-500/8 blur-[80px]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-black text-white shadow-glow-sm">S</div>
          <span className="font-display text-xl font-bold text-white">Splitly</span>
        </div>
        <div className="surface-elevated p-7">
          <h1 className="font-display mb-1 text-xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
          {children}
          <p className="text-center text-xs text-slate-500 mt-5">
            {linkText}{' '}
            <Link to={linkTo} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">{link}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// =============================================
// LOGIN PAGE
// =============================================
export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    const ok = await login(data);
    if (ok) navigate('/dashboard');
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your Splitly account"
      linkText="Don't have an account?" link="Sign up" linkTo="/signup">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" error={errors.email?.message}>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="email" {...register('email', { required: 'Email is required' })}
              placeholder="you@example.com" className="input-field pl-9" autoComplete="email" />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPass ? 'text' : 'password'}
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••" className="input-field pl-9 pr-10" autoComplete="current-password" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </FormField>

        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? 'Signing in…' : <>Sign In <ArrowRight size={15} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}

// =============================================
// SIGNUP PAGE
// =============================================
export function SignupPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data) => {
    const ok = await signup(data);
    if (ok) navigate('/dashboard');
  };

  return (
    <AuthLayout title="Create account" subtitle="Start splitting expenses with your group"
      linkText="Already have an account?" link="Sign in" linkTo="/login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" error={errors.fullName?.message}>
          <div className="relative">
            <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Min 2 characters' }
            })}
              placeholder="Your full name" className="input-field pl-9" autoComplete="name" />
          </div>
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="email" {...register('email', { required: 'Email is required' })}
              placeholder="you@example.com" className="input-field pl-9" autoComplete="email" />
          </div>
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type={showPass ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' }
              })}
              placeholder="Min 6 characters" className="input-field pl-9 pr-10" autoComplete="new-password" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </FormField>

        <button type="submit" disabled={loading}
          className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? 'Creating account…' : <>Create Account <ArrowRight size={15} /></>}
        </button>

        <p className="text-center text-xs text-slate-600">
          By signing up you agree to fair expense splitting 🤝
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
