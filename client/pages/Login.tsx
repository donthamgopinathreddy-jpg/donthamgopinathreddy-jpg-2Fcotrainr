import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Grid3x3,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { usePINAuth } from "@/hooks/usePINAuth";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import PINEntrypad from "@/components/PINEntrypad";
import PatternLock from "@/components/PatternLock";

export default function Login() {
  const navigate = useNavigate();
  const { user, signIn: authSignIn } = useAuth();
  const { verifyPIN } = usePINAuth();
  const {
    isAvailable: biometricAvailable,
    biometricType,
    isEnabled: biometricEnabled,
    loading: biometricLoading,
    authenticateWithBiometric,
    isBiometricEnabled,
  } = useBiometricAuth();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<
    "password" | "pin" | "pattern" | "biometric"
  >("password");
  const [userId, setUserId] = useState<string | null>(null);

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

  const handlePINSubmit = async (pin: string) => {
    if (!userId) {
      toast.error("User information missing");
      return;
    }

    setLoading(true);
    try {
      const isValid = await verifyPIN(userId, pin);
      if (isValid) {
        // After PIN verification, sign in the user
        await authSignIn(email, password);
        toast.success("Login successful!");
      }
    } catch (error: any) {
      console.error("PIN verification error:", error);
      toast.error(error?.message || "PIN verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePatternSubmit = async (pattern: number[]) => {
    if (!userId) {
      toast.error("User information missing");
      return;
    }

    setLoading(true);
    try {
      // Pattern verification would happen here
      // For now, we'll just sign in
      await authSignIn(email, password);
      toast.success("Login successful!");
    } catch (error: any) {
      console.error("Pattern verification error:", error);
      toast.error(error?.message || "Pattern verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (!userId) {
      toast.error("Please enter your credentials first");
      return;
    }

    setLoading(true);
    try {
      // Check if biometric is enabled for this user
      const isBioEnabled = await isBiometricEnabled(userId);
      if (!isBioEnabled) {
        toast.error("Biometric authentication is not enabled for your account");
        return;
      }

      // Trigger biometric authentication
      const success = await authenticateWithBiometric();
      if (success) {
        // After biometric verification, sign in the user
        await authSignIn(email, password);
        toast.success("Login successful!");
      } else {
        toast.error("Biometric authentication failed");
      }
    } catch (error: any) {
      console.error("Biometric auth error:", error);
      toast.error(error?.message || "Biometric authentication failed");
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 text-sm mt-2">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {!showForgotPassword ? (
            <>
              {authMethod === "password" ? (
                <>
                  {/* Email/Username Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
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

                  {/* Alternative Auth Methods */}
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-600 text-center mb-3">
                      Or sign in with
                    </p>
                    <div className={`grid ${biometricAvailable ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
                      {biometricAvailable && (
                        <button
                          onClick={() => setAuthMethod("biometric")}
                          className="flex flex-col items-center justify-center gap-1 py-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/10 transition-all"
                          title={`${biometricType === "faceId" ? "Face ID" : biometricType === "fingerprint" ? "Fingerprint" : biometricType === "pattern" ? "Pattern" : "Biometric"} Authentication`}
                        >
                          <Fingerprint className="w-5 h-5 text-gray-600" />
                          <span className="text-xs font-semibold text-gray-600">
                            {biometricType === "faceId" ? "Face" : biometricType === "fingerprint" ? "Print" : "Bio"}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => setAuthMethod("pin")}
                        className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/10 transition-all"
                      >
                        <Lock className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-600">
                          PIN
                        </span>
                      </button>
                      <button
                        onClick={() => setAuthMethod("pattern")}
                        className="flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/10 transition-all"
                      >
                        <Grid3x3 className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-600">
                          Pattern
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              ) : authMethod === "pin" ? (
                <>
                  <div className="space-y-4">
                    <p className="text-center text-gray-600">
                      Enter your credentials first to enable PIN
                    </p>
                    {!email ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Email or Username
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Enter your email or username"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (isFormComplete) {
                              setLoading(true);
                              try {
                                // Get user ID first
                                let loginEmail = email;
                                if (!email.includes("@")) {
                                  const { data: userData } = await supabase
                                    .from("users")
                                    .select("email, id")
                                    .eq("username", email.toLowerCase())
                                    .single();
                                  if (userData?.email) {
                                    loginEmail = userData.email;
                                    setUserId(userData.id);
                                  }
                                } else {
                                  const { data: userData } = await supabase
                                    .from("users")
                                    .select("id")
                                    .eq("email", email)
                                    .single();
                                  if (userData?.id) {
                                    setUserId(userData.id);
                                  }
                                }
                              } catch (error) {
                                toast.error("Could not find user account");
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          disabled={!isFormComplete || loading}
                          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                          Continue
                        </button>
                      </>
                    ) : (
                      <PINEntrypad
                        onPINSubmit={handlePINSubmit}
                        isLoading={loading}
                        onCancel={() => {
                          setAuthMethod("password");
                          setUserId(null);
                        }}
                      />
                    )}
                  </div>
                </>
              ) : authMethod === "pattern" ? (
                <>
                  <div className="space-y-4">
                    <p className="text-center text-gray-600">
                      Enter your credentials first to use pattern login
                    </p>
                    {!email ? (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Email or Username
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Enter your email or username"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (isFormComplete) {
                              setLoading(true);
                              try {
                                let loginEmail = email;
                                if (!email.includes("@")) {
                                  const { data: userData } = await supabase
                                    .from("users")
                                    .select("email, id")
                                    .eq("username", email.toLowerCase())
                                    .single();
                                  if (userData?.email) {
                                    loginEmail = userData.email;
                                    setUserId(userData.id);
                                  }
                                } else {
                                  const { data: userData } = await supabase
                                    .from("users")
                                    .select("id")
                                    .eq("email", email)
                                    .single();
                                  if (userData?.id) {
                                    setUserId(userData.id);
                                  }
                                }
                              } catch (error) {
                                toast.error("Could not find user account");
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                          disabled={!isFormComplete || loading}
                          className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                          Continue
                        </button>
                      </>
                    ) : (
                      <PatternLock
                        onPatternSubmit={handlePatternSubmit}
                        isLoading={loading}
                        onCancel={() => {
                          setAuthMethod("password");
                          setUserId(null);
                        }}
                      />
                    )}
                  </div>
                </>
              ) : null}

              {authMethod === "password" && (
                <>
                  {/* Create Account Button */}
                  <button
                    onClick={() => navigate("/onboarding")}
                    className="w-full bg-transparent border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary/10 transition-all"
                  >
                    Create Account
                  </button>
                </>
              )}

              {authMethod !== "password" && (
                <button
                  onClick={() => {
                    setAuthMethod("password");
                    setUserId(null);
                  }}
                  className="w-full bg-transparent border-2 border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Back to Password
                </button>
              )}
            </>
          ) : (
            <>
              {/* Forgot Password Form */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Enter your email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
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
