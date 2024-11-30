import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Mail, Lock, AlertCircle } from 'lucide-react';

type AuthMode = 'signin' | 'signup';

export const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient();

  const validateEmail = (email: string) => {
    if (!email.endsWith('@zenon.ngo')) {
      return 'Only @zenon.ngo email addresses are allowed';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setError('Please check your email for the confirmation link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zenon-light-bg dark:bg-zenon-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zenon-light-card dark:bg-zenon-dark-card rounded-zenon p-8 shadow-card dark:shadow-card-dark">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zenon-light-text dark:text-zenon-dark-text mb-2">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="text-sm text-zenon-light-text/60 dark:text-zenon-dark-text/60">
              {mode === 'signin'
                ? 'Welcome back to Scientific Watch'
                : 'Join Scientific Watch'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zenon-light-text dark:text-zenon-dark-text mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-text/10 dark:border-zenon-dark-text/10 rounded-input focus:outline-none focus:border-zenon-primary text-zenon-light-text dark:text-zenon-dark-text"
                  placeholder="your.name@zenon.ngo"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zenon-light-text/30 dark:text-zenon-dark-text/30" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zenon-light-text dark:text-zenon-dark-text mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pl-10 bg-zenon-light-bg dark:bg-zenon-dark-bg border border-zenon-light-text/10 dark:border-zenon-dark-text/10 rounded-input focus:outline-none focus:border-zenon-primary text-zenon-light-text dark:text-zenon-dark-text"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zenon-light-text/30 dark:text-zenon-dark-text/30" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-2.5 rounded-zenon text-white transition-colors ${
                loading
                  ? 'bg-zenon-primary/70 cursor-not-allowed'
                  : 'bg-zenon-primary hover:bg-zenon-primary-hover'
              }`}
            >
              {loading
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Account'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-zenon-primary hover:underline"
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
