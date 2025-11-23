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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  // Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  // Username validation function
  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    return null;
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    height_feet: "",
    height_inches: "",
    height_cm: "",
    weight_kg: "",
    weight_pounds: "",
    phone_number: "",
    country_code: "+1",
    role: "client",
    full_name: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };

    // Auto-convert height feet to cm
    if (name === "height_feet" && value) {
      const feet = parseInt(value);
      const inches = parseInt(formData.height_inches) || 0;
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      newData.height_cm = cm.toString();
    }

    // Auto-convert height inches to cm
    if (name === "height_inches" && value) {
      const feet = parseInt(formData.height_feet) || 0;
      const inches = parseInt(value);
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      newData.height_cm = cm.toString();
    }

    // Auto-convert pounds to kg
    if (name === "weight_pounds" && value) {
      const pounds = parseInt(value);
      const kg = Math.round(pounds / 2.205);
      newData.weight_kg = kg.toString();
    }

    // Auto-convert kg to pounds (if user enters kg directly)
    if (name === "weight_kg" && value) {
      const kg = parseInt(value);
      const pounds = Math.round(kg * 2.205);
      newData.weight_pounds = pounds.toString();
    }

    setFormData(newData);
    setError("");
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields");
        return;
      }
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.full_name || !formData.username) {
        setError("Please fill in all fields");
        return;
      }
      const usernameError = validateUsername(formData.username);
      if (usernameError) {
        setError(usernameError);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (
        !formData.height_feet ||
        !formData.height_inches ||
        !formData.weight_kg ||
        !formData.weight_pounds ||
        !formData.phone_number
      ) {
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
      const heightInCm = Math.round(
        (parseInt(formData.height_feet) * 12 +
          parseInt(formData.height_inches)) *
          2.54,
      );
      const weightInKg = parseInt(formData.weight_kg);

      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role as "client" | "trainer",
        height_cm: heightInCm,
        weight_kg: weightInKg,
        phone_number: formData.country_code + formData.phone_number,
        country_code: formData.country_code,
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
    <div className="min-h-screen bg-white pt-safe pb-safe overflow-hidden flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 border-b border-gray-200 px-4 py-4">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
          className="text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors duration-200 flex items-center gap-2"
        >
          ← {step > 1 ? "Back" : "Login"}
        </button>
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-8 flex-1 overflow-y-auto">
        {/* Logo */}
        {step !== 4 && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-6">
              <Logo size="lg" className="drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome! 🎉
            </h2>
            <p className="text-gray-600 mb-8">Your account is ready to go</p>
            <div className="w-1 h-16 bg-gradient-to-b from-orange-500 to-transparent rounded-full"></div>
          </div>
        )}

        {/* Error Message */}
        {error && step !== 4 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-300 backdrop-blur-sm flex items-gap-3 animate-slide-down">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Email & Password */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Min 8 chars, 1 uppercase, 1 number, 1 special character
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 pr-12 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-10 pt-6">
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 active:scale-95 text-gray-800 font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-800/30 border-t-gray-800 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Name & Username */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-orange-600 transition-colors">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="john2024"
                className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
              />
              <p className="text-xs text-gray-600 mt-2">
                3+ characters, must include at least one number
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-10 pt-6">
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 active:scale-95 text-gray-800 font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-800/30 border-t-gray-800 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Physical Info & Role */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            {/* Height Fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 transition-colors">
                Height
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 group-focus-within:text-yellow-600 transition-colors">
                    Feet
                  </label>
                  <input
                    type="text"
                    name="height_feet"
                    value={formData.height_feet}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 group-focus-within:text-yellow-600 transition-colors">
                    Inches
                  </label>
                  <input
                    type="text"
                    name="height_inches"
                    value={formData.height_inches}
                    onChange={handleInputChange}
                    placeholder="10"
                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                  />
                </div>
              </div>
              {formData.height_feet && formData.height_inches && (
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  ≈ {formData.height_cm} cm
                </p>
              )}
            </div>

            {/* Weight Fields */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 transition-colors">
                Weight
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 group-focus-within:text-yellow-600 transition-colors">
                    Kilograms (kg)
                  </label>
                  <input
                    type="text"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    placeholder="75"
                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 group-focus-within:text-yellow-600 transition-colors">
                    Pounds (lbs)
                  </label>
                  <input
                    type="text"
                    name="weight_pounds"
                    value={formData.weight_pounds}
                    onChange={handleInputChange}
                    placeholder="165"
                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Height Display in Both Formats */}
            {formData.height_feet && formData.height_inches && (
              <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Height Summary
                </label>
                <p className="text-lg font-bold text-gray-900">
                  {formData.height_feet}'{formData.height_inches}" or{" "}
                  {formData.height_cm} cm
                </p>
              </div>
            )}

            {/* Phone Number and Country Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 transition-colors">
                Contact Information
              </label>
              <div className="flex gap-3">
                <div className="w-20 group">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 group-focus-within:text-yellow-600 transition-colors">
                    Code
                  </label>
                  <select
                    name="country_code"
                    value={formData.country_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+86">+86 (CN)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+33">+33 (FR)</option>
                    <option value="+39">+39 (IT)</option>
                    <option value="+34">+34 (ES)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+55">+55 (BR)</option>
                    <option value="+27">+27 (ZA)</option>
                  </select>
                </div>
                <div className="flex-1 group">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 group-focus-within:text-yellow-600 transition-colors">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 hover:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-900 mb-3 group-focus-within:text-yellow-600 transition-colors">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["client", "trainer"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`px-5 py-4 rounded-2xl border-2 font-semibold capitalize transition-all duration-300 transform hover:scale-105 ${
                      formData.role === role
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 border-yellow-500 text-gray-800 shadow-xl shadow-yellow-400/50"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    {role === "client" ? "👤 Client" : "🏋️ Trainer"}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-10 pt-6 pb-6">
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 px-4 py-3.5 rounded-2xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 active:scale-95 text-gray-800 font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-gray-800/30 border-t-gray-800 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Login Link */}
        {step !== 4 && (
          <p className="text-center text-sm text-gray-600 mt-8 pb-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
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
