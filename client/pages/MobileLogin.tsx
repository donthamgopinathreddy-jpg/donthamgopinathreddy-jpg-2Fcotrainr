import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pt-safe">
      {/* Header */}
      <div className="text-center py-12">
        <Logo size="xl" className="mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600 mt-2">Sign in to your fitness journey</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="px-4 space-y-4 pb-8">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <button
          type="button"
          className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
        >
          Forgot Password?
        </button>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 mt-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Signup Link */}
      <div className="px-4 py-6 border-t border-gray-200">
        <p className="text-center text-gray-600 mb-4">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            Create one
          </button>
        </p>
      </div>

      {/* Demo Mode Button */}
      {import.meta.env.DEV && (
        <div className="px-4 pb-8">
          <button
            onClick={() => {
              setEmail("demo@cotrainr.app");
              setPassword("password123");
            }}
            className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
          >
            Load Demo Credentials (Dev)
          </button>
        </div>
      )}
    </div>
  );
}
