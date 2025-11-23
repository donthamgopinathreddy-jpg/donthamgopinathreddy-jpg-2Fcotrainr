import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function MobileLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error: any) {
      const errorMsg = error.message || "Login failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-safe pb-safe overflow-hidden flex flex-col">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-8 transform hover:scale-110 transition-transform duration-300">
            <Logo size="xl" className="drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-pink-400 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-base">Sign in to your fitness journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm flex items-center gap-3 animate-slide-down">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5">
          {/* Email Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="your@email.com"
              className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
            />
          </div>

          {/* Password Input */}
          <div className="group">
            <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <button
            type="button"
            className="text-sm text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-200"
          >
            Forgot Password?
          </button>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3.5 mt-6 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95 text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/75 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Signup Link */}
          <p className="text-center text-slate-400 text-sm pt-4">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors duration-200"
            >
              Create one
            </button>
          </p>
        </form>

        {/* Demo Mode Button (Development Only) */}
        {import.meta.env.DEV && (
          <button
            onClick={() => {
              setEmail("test@example.com");
              setPassword("password123");
              setError("");
            }}
            className="w-full max-w-sm mt-8 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-slate-300 font-semibold text-xs transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Load Demo Credentials (Dev)
          </button>
        )}
      </div>

      {/* Bottom Gradient */}
      <div className="relative z-5 h-32 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(-20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
