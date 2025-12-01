import { useState } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function MobileLogin() {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail, resetMethod);
      setShowResetModal(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Reset password error:", error);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-safe pb-safe overflow-hidden flex flex-col">
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-100/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Header Section */}
        <div
          className="text-center mb-12 animate-fade-in"
          style={{ animationDuration: "0.8s" }}
        >
          <div className="inline-block mb-8 transform hover:scale-110 transition-transform duration-300 p-4 rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100">
            <Logo size="xl" className="drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-base font-medium">
            Sign in to your fitness journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-red-50 border border-red-300 flex items-center gap-3 animate-slide-down">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5">
          {/* Email Input */}
          <div
            className="group animate-fade-in-up"
            style={{ animationDelay: "0.1s", animationDuration: "0.7s" }}
          >
            <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
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
              className="w-full px-5 py-3.5 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 focus:from-orange-50 focus:to-gray-50"
            />
          </div>

          {/* Password Input */}
          <div
            className="group animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationDuration: "0.7s" }}
          >
            <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
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
                className="w-full px-5 py-3.5 pr-12 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-gray-400 focus:from-orange-50 focus:to-gray-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors duration-200 transform hover:scale-125 active:scale-95"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-all duration-300 w-full text-center py-2 hover:bg-orange-50 rounded-xl animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationDuration: "0.7s" }}
          >
            Forgot Password?
          </button>

          {/* Login Button - Yellow/Orange Gradient */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-4 mt-6 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 active:scale-95 text-gray-900 font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationDuration: "0.7s" }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-gray-900/30 border-t-gray-900 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div
            className="relative my-8 animate-fade-in-up"
            style={{ animationDelay: "0.5s", animationDuration: "0.7s" }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-600 font-medium">
                or
              </span>
            </div>
          </div>

          {/* Signup Link */}
          <div
            className="space-y-3 animate-fade-in-up"
            style={{ animationDelay: "0.6s", animationDuration: "0.7s" }}
          >
            <p className="text-center text-gray-700 text-sm font-medium">
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="w-full px-5 py-4 rounded-3xl border-2 border-orange-500 bg-white hover:bg-orange-50 active:scale-95 text-orange-600 font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Create Account
            </button>
          </div>
        </form>

        {/* Demo Mode Button (Development Only) */}
        {import.meta.env.DEV && (
          <button
            onClick={() => {
              setEmail("test@example.com");
              setPassword("password123");
              setError("");
            }}
            className="w-full max-w-sm mt-8 px-4 py-2 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border border-gray-300 text-gray-700 hover:text-gray-900 font-semibold text-xs transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Load Demo Credentials (Dev)
          </button>
        )}
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in"
          style={{ animationDuration: "0.3s" }}
        >
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scale-up"
            style={{ animationDuration: "0.4s" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Reset Password
              </h2>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Phone Number and Country Code */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  className="w-20 px-3 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  defaultValue="+1"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+27">🇿🇦 +27</option>
                </select>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Send reset link via
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetMethod("email")}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    resetMethod === "email"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📧 Email
                </button>
                <button
                  onClick={() => setResetMethod("phone")}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    resetMethod === "phone"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📱 Phone
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-semibold transition-all disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Send Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Gradient */}
      <div className="relative z-5 h-32 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none"></div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-scale-up {
          animation: scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
}
