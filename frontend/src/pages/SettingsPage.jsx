import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, LogOut, Shield, Palette } from 'lucide-react';
import { useAuthStore, useGamificationStore } from '../store';
import { ProfileBadgeSection, UserStatsWidget } from '../components/gamification';
import { Avatar, FormField } from '../components/ui';
import { PageContainer } from '../components/shell';
import PageTitle from '../components/ui/PageTitle';
import { useNavigate } from 'react-router-dom';

const AVATAR_STYLES = ['avataaars','bottts','identicon','personas','pixel-art','adventurer','lorelei'];

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuthStore();
  const { summary, badges, loading: gamificationLoading, fetchMySummary, fetchMyBadges } = useGamificationStore();

  useEffect(() => {
    fetchMySummary();
    fetchMyBadges();
  }, []);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { fullName: user?.fullName }
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [avatarStyle, setAvatarStyle] = useState('avataaars');

  const onSubmit = async (data) => {
    setLoading(true);
    await updateProfile(data);
    setLoading(false);
  };

  const handleAvatarChange = async (style) => {
    setAvatarStyle(style);
    const newAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${user?.email}`;
    await updateProfile({ avatar: newAvatar });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageContainer maxWidth="2xl">
      <PageTitle title="Settings" subtitle="Your profile and preferences" emoji="✨" />

      <div className="space-y-5">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-8 h-8 bg-brand-500/15 rounded-lg flex items-center justify-center">
              <User size={16} className="text-brand-400" />
            </div>
            <h2 className="font-semibold text-white">Profile</h2>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            <Avatar src={user?.avatar} name={user?.fullName} size="xl" />
            <div>
              <p className="text-sm font-medium text-white">{user?.fullName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              <p className="text-xs text-slate-600 mt-1">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'}</p>
            </div>
          </div>

          {/* Avatar Style Picker */}
          <div className="mb-5">
            <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <Palette size={12} /> Avatar Style
            </p>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_STYLES.map(style => (
                <button key={style} onClick={() => handleAvatarChange(style)}
                  className={`relative w-10 h-10 rounded-lg border-2 overflow-hidden transition-all
                    ${avatarStyle === style ? 'border-brand-500' : 'border-transparent hover:border-white/20'}`}>
                  <img
                    src={`https://api.dicebear.com/7.x/${style}/svg?seed=${user?.email}`}
                    alt={style}
                    className="w-full h-full object-cover bg-dark-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Full Name" error={errors.fullName?.message}>
              <input {...register('fullName', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
                className="input-field" />
            </FormField>
            <button type="submit" disabled={loading} className="btn-primary text-sm">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        <UserStatsWidget stats={summary?.stats} loading={gamificationLoading} />

        <ProfileBadgeSection badges={badges.length ? badges : summary?.recentBadges} loading={gamificationLoading} />

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-emerald-400" />
            </div>
            <h2 className="font-semibold text-white">Account</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-dark-700/60 rounded-lg">
              <Mail size={15} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email address</p>
                <p className="text-sm text-white">{user?.email}</p>
              </div>
              <span className="ml-auto badge badge-green">Verified</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-dark-700/60 rounded-lg">
              <Lock size={15} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Password</p>
                <p className="text-sm text-white">••••••••</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5 border-rose-500/20">
          <h2 className="font-semibold text-white mb-4">Danger Zone</h2>
          <button onClick={handleLogout}
            className="btn-danger w-full justify-center py-2.5">
            <LogOut size={16} /> Sign Out of Splitly
          </button>
        </motion.div>
      </div>
    </PageContainer>
  );
}
