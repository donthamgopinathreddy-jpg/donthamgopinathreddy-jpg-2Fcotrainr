import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const isFormComplete = email && password && password.length >= 6;

  const handleLogin = async () => {
    if (!isFormComplete) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-6 border-b border-border">
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
              <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {!showForgotPassword ? (
            <>
              {/* Email/Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
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
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
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
                <label className="block text-sm font-medium text-foreground">
                  Enter your email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
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
