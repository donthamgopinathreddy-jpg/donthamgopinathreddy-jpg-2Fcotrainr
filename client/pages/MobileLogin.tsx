import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MobileLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Sign in failed';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-sm relative z-10">
        {/* Header with logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            <span className="text-orange-500">Co</span><span className="text-gray-900">Trainr.</span>
          </div>
        </div>

        {/* Main glassmorphism card */}
        <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Title section */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
            <p className="text-gray-600 text-sm">Welcome back to your fitness journey</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password row */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 text-orange-500 disabled:opacity-50"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                disabled={isLoading}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-gray-900 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/90 text-gray-500">or</span>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center space-y-3">
            <p className="text-gray-600 text-sm">Don't have an account?</p>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              disabled={isLoading}
              className="w-full py-3 rounded-full border-2 border-orange-400 hover:border-orange-500 text-orange-500 hover:text-orange-600 font-semibold transition-all disabled:opacity-50"
            >
              Create Account
            </button>
          </div>

          {/* Demo mode button (dev only) */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => navigate('/signup')}
              disabled={isLoading}
              className="w-full py-2 rounded-full text-gray-600 hover:text-gray-700 text-xs font-medium border border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50"
            >
              Load Demo Credentials (Dev)
            </button>
          )}
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
