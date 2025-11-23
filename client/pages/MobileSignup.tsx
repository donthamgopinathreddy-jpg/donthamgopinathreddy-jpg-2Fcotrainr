import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function MobileSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    height_feet: "",
    height_inches: "",
    weight_kg: "",
    weight_pounds: "",
    role: "client",
    full_name: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.full_name || !formData.username) {
        setError("Please fill in all fields");
        return;
      }
      if (formData.username.length < 3) {
        setError("Username must be at least 3 characters");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.height_feet || !formData.height_inches || !formData.weight_kg || !formData.weight_pounds) {
        setError("Please fill in all fields");
        return;
      }
      handleSignup();
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    try {
      // Check if backend is available
      const testResponse = await fetch("http://localhost:3001/api/ping", {
        method: "GET",
      }).catch(() => null);

      if (!testResponse) {
        throw new Error(
          "Backend server is not running. Please start the backend: cd server && pnpm run start:dev",
        );
      }

      const heightInCm = Math.round((parseInt(formData.height_feet) * 12 + parseInt(formData.height_inches)) * 2.54);
      const weightInKg = parseInt(formData.weight_kg);

      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role as "client" | "trainer",
        height_cm: heightInCm,
        weight_kg: weightInKg,
      });

      // Show success animation
      setStep(4);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMsg =
        error.message || "Failed to create account. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-safe pb-safe overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-slate-900/50 border-b border-white/10 px-4 py-4">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
          className="text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors duration-200 flex items-center gap-2"
        >
          ← {step > 1 ? "Back" : "Login"}
        </button>
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg shadow-orange-500/50"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-8 pb-32">
        {/* Logo */}
        {step !== 4 && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6">
              <Logo size="lg" className="drop-shadow-2xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-pink-400 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">
              Step {step} of 3 • Join the fitness revolution
            </p>
          </div>
        )}

        {/* Success State */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center min-h-96 text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/50">
              <CheckCircle2 size={48} className="text-white animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome! 🎉</h2>
            <p className="text-slate-400 mb-8">Your account is ready to go</p>
            <div className="w-1 h-16 bg-gradient-to-b from-orange-400 to-transparent rounded-full"></div>
          </div>
        )}

        {/* Error Message */}
        {error && step !== 4 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm flex items-gap-3 animate-slide-down">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <p className="text-red-300 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Email & Password */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="���•••••••"
                  className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                At least 6 characters
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Name & Username */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="johndoe"
                className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              />
              <p className="text-xs text-slate-500 mt-2">
                3+ characters, lowercase
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Physical Info & Role */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            {/* Height Fields */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 transition-colors">
                Height
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-orange-400 transition-colors">
                    Feet
                  </label>
                  <input
                    type="text"
                    name="height_feet"
                    value={formData.height_feet}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-orange-400 transition-colors">
                    Inches
                  </label>
                  <input
                    type="text"
                    name="height_inches"
                    value={formData.height_inches}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  />
                </div>
              </div>
            </div>

            {/* Weight Fields */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3 transition-colors">
                Weight
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-orange-400 transition-colors">
                    Kilograms (kg)
                  </label>
                  <input
                    type="text"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    placeholder="75"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-slate-400 mb-2 group-focus-within:text-orange-400 transition-colors">
                    Pounds (lbs)
                  </label>
                  <input
                    type="text"
                    name="weight_pounds"
                    value={formData.weight_pounds}
                    onChange={handleInputChange}
                    placeholder="165"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3 group-focus-within:text-orange-400 transition-colors">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["client", "trainer"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`px-5 py-4 rounded-2xl border-2 font-semibold capitalize transition-all duration-300 transform hover:scale-105 ${
                      formData.role === role
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white shadow-xl shadow-orange-500/50"
                        : "bg-white/5 border-white/20 text-slate-300 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    {role === "client" ? "👤 Client" : "🏋️ Trainer"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step !== 4 && (
          <div className="flex gap-3 mt-10 fixed bottom-0 left-0 right-0 px-6 py-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent backdrop-blur-sm safe-area-inset-bottom">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-white/20 font-semibold text-slate-300 hover:bg-white/10 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/75"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating...
                </>
              ) : step === 3 ? (
                "Create Account"
              ) : (
                <>
                  Next
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {/* Login Link */}
        {step !== 4 && (
          <p className="text-center text-sm text-slate-400 mt-6 pt-20">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              Sign In
            </button>
          </p>
        )}
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
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
        
        @keyframes scale-in {
          from { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
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
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
