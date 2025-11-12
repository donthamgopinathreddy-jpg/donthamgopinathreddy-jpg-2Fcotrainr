import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn: authSignIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Use effect to redirect if already logged in (e.g., from browser back button)
  useEffect(() => {
    if (user) {
      // User is already authenticated, redirect to home
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const isFormComplete = email && password && password.length >= 6;

  const handleLogin = async (retryCount = 0) => {
    if (!isFormComplete) return;

    setLoading(true);
    try {
      let loginEmail = email;

      // If user entered a username (no @ symbol), look up their email
      if (!email.includes("@")) {
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("email")
            .eq("username", email.toLowerCase())
            .single();

          if (userData?.email) {
            loginEmail = userData.email;
          } else {
            // If username not found, assume it's an email anyway and try
            loginEmail = email;
          }
        } catch (err) {
          // If lookup fails, try the input as-is (might be email)
          console.warn("Username lookup failed, trying as email:", err);
          loginEmail = email;
        }
      }

      // Use AuthContext signIn method which properly updates context state
      await authSignIn(loginEmail, password);

      toast.success("Login successful!");
      // The useEffect will handle navigation once user state is updated
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific errors
      let errorMsg = "Failed to login";

      if (error?.message?.includes("body stream already read")) {
        errorMsg = "Network error - please try again in a moment";
      } else if (error?.message?.includes("Invalid login credentials")) {
        errorMsg = "Invalid email/username or password";
      } else if (error?.message?.includes("Email not confirmed")) {
        errorMsg = "Please confirm your email address first";
      } else if (error?.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      // TODO: Implement password reset functionality with Supabase
      toast.info("Password reset link would be sent to " + resetEmail);
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error("Failed to send reset link");
    } finally {
      setResetLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormComplete && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-gray-200">
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-sm">Back to Welcome</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-3">
            <Logo size="lg" className="mx-auto" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-sm mt-2">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {!showForgotPassword ? (
            <>
              {/* Email/Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter your email or username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                Forgot password?
              </button>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={!isFormComplete || loading}
                className="w-full bg-gradient-primary text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Get Started"}
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>

              {/* Create Account Button */}
              <button
                onClick={() => navigate("/onboarding")}
                className="w-full bg-transparent border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary/10 transition-all"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              {/* Forgot Password Form */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Enter your email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                We'll send a password reset link to your email address.
              </p>

              {/* Reset Button */}
              <button
                onClick={handleForgotPassword}
                disabled={!resetEmail || resetLoading}
                className="w-full bg-gradient-primary text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>

              {/* Back Button */}
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full bg-transparent border-2 border-muted-foreground text-muted-foreground font-bold py-3 rounded-xl hover:bg-muted/10 transition-all"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
