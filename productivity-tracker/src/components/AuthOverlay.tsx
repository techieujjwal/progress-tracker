import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { cloudService } from '../services/cloudSync';
import { Mail, Lock, User, X, LogIn, UserPlus, Globe2 } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export default function AuthOverlay() {
  const isOpen = useAuthStore(s => s.isAuthModalOpen);
  const setOpen = useAuthStore(s => s.setAuthModalOpen);

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }
      const result = await cloudService.signUpWithEmail(email, password, username);
      if (!result.success) {
        setError(result.error || 'Sign up failed');
      } else {
        setSuccessMsg('Check your email for a confirmation link.');
      }
    } else {
      const result = await cloudService.signInWithEmail(email, password);
      if (!result.success) {
        setError(result.error || 'Sign in failed');
      } else {
        handleClose();
      }
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    const result = await cloudService.signInWithGoogle();
    if (!result.success) {
      setError(result.error || 'Google sign in failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 w-full max-w-[420px] bg-[#111827] border border-white/10 rounded-[24px] p-8 shadow-2xl"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                L
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {mode === 'signin' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-xs text-white/40">
                  {mode === 'signin' ? 'Sign in to sync your progress' : 'Start tracking with cloud sync'}
                </p>
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer mb-5"
            >
              <Globe2 className="w-4 h-4" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-white/30 font-semibold tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3.5">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
                >
                  {error}
                </motion.p>
              )}

              {successMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl"
                >
                  {successMsg}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
