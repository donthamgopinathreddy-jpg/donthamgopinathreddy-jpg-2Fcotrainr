import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

export default function MobileSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "checking" | "available" | "taken" | null
  >(null);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return "Username can only contain letters, numbers, underscore, and dash";
    }
    return null;
  };

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameStatus(null);
      return;
    }

    setUsernameChecking(true);
    setUsernameStatus("checking");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single();

      if (error?.code === "PGRST116") {
        // PGRST116 means no rows found - username is available
        setUsernameStatus("available");
      } else if (data) {
        setUsernameStatus("taken");
      }
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameStatus(null);
    } finally {
      setUsernameChecking(false);
    }
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    full_name: "",
    gender: "",
    height_feet: "",
    height_inches: "",
    height_cm: "",
    weight_kg: "",
    weight_pounds: "",
    phone_number: "",
    country_code: "+1",
    role: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };

    if (name === "height_feet" && value) {
      const feet = parseInt(value);
      const inches = parseInt(formData.height_inches) || 0;
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      newData.height_cm = cm.toString();
    }

    if (name === "height_inches" && value) {
      const feet = parseInt(formData.height_feet) || 0;
      const inches = parseInt(value);
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      newData.height_cm = cm.toString();
    }

    if (name === "weight_pounds" && value) {
      const pounds = parseInt(value);
      const kg = Math.round(pounds / 2.205);
      newData.weight_kg = kg.toString();
    }

    if (name === "weight_kg" && value) {
      const kg = parseInt(value);
      const pounds = Math.round(kg * 2.205);
      newData.weight_pounds = pounds.toString();
    }

    if (name === "username") {
      // Debounced username check
      checkUsernameAvailability(value);
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
      if (usernameStatus === "taken") {
        setError("Username is already taken");
        return;
      }
      if (usernameStatus !== "available") {
        setError("Please check username availability");
        return;
      }
      const usernameError = validateUsername(formData.username);
      if (usernameError) {
        setError(usernameError);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.height_feet || !formData.height_inches || !formData.weight_kg) {
        setError("Please fill in all fields");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!formData.phone_number) {
        setError("Please enter your phone number");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!formData.gender || !formData.role) {
        setError("Please select gender and account type");
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

      console.log("Attempting signup with data:", {
        email: formData.email,
        username: formData.username,
        full_name: formData.full_name,
        gender: formData.gender,
        role: formData.role,
        height_cm: heightInCm,
        weight_kg: weightInKg,
      });

      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name,
        gender: formData.gender,
        role: formData.role as "client" | "trainer",
        height_cm: heightInCm,
        weight_kg: weightInKg,
        phone_number: formData.country_code + formData.phone_number,
        country_code: formData.country_code,
      });

      setStep(6);
      toast.success("Account created successfully!");
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Account created! Please sign in." },
        });
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMsg = error?.message || "Failed to create account";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    "Create Account",
    "Personal Info",
    "Your Stats",
    "Contact Info",
    "Finish Setup",
    "All Set!",
  ];

  const totalSteps = 5;

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
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-8 flex-1 overflow-y-auto">
        {/* Logo and Title */}
        {step !== 6 && (
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {stepTitles[step - 1]}
            </h1>
            <p className="text-gray-600 text-sm">
              Step {step} of {totalSteps}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-red-50 border border-red-300 flex items-center gap-3 animate-slide-down">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Step 1: Email and Password */}
        {step === 1 && (
          <div className="space-y-5 max-w-md mx-auto animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-5 py-3.5 rounded-3xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 pr-12 rounded-3xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 pr-12 rounded-3xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Full Name and Username */}
        {step === 2 && (
          <div className="space-y-5 max-w-md mx-auto animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-5 py-3.5 rounded-3xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                Username
                {usernameStatus === "checking" && (
                  <span className="text-xs text-gray-500">checking...</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="johndoe"
                  className="w-full px-5 py-3.5 pr-12 rounded-3xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {usernameStatus === "available" && (
                  <Check size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {usernameStatus === "taken" && (
                  <X size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {usernameStatus === "available" && (
                <p className="text-xs text-green-600 mt-2">✓ Username available</p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-xs text-red-600 mt-2">✗ Username already taken</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Height and Weight */}
        {step === 3 && (
          <div className="space-y-5 max-w-md mx-auto animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Height
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="height_feet"
                  value={formData.height_feet}
                  onChange={handleInputChange}
                  placeholder="Feet"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="height_inches"
                  value={formData.height_inches}
                  onChange={handleInputChange}
                  placeholder="Inches"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.height_cm ? `${formData.height_cm} cm` : ""}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Weight
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  placeholder="Kilograms"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="weight_pounds"
                  value={formData.weight_pounds}
                  onChange={handleInputChange}
                  placeholder="Pounds"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Phone Number */}
        {step === 4 && (
          <div className="space-y-5 max-w-md mx-auto animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleInputChange}
                  className="w-20 px-3 py-3 rounded-2xl bg-gray-50 border-2 border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Gender and Account Type */}
        {step === 5 && (
          <div className="space-y-6 max-w-md mx-auto animate-fade-in-up">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Gender
              </label>
              <div className="flex gap-3">
                {["Male", "Female", "Other"].map((gender) => (
                  <button
                    key={gender}
                    onClick={() =>
                      setFormData({ ...formData, gender })
                    }
                    className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                      formData.gender === gender
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-4">
                Account Type
              </label>
              <div className="flex gap-3">
                {[
                  { value: "client", label: "Client" },
                  { value: "trainer", label: "Trainer" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() =>
                      setFormData({ ...formData, role: type.value as any })
                    }
                    className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${
                      formData.role === type.value
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600">
                Your account is all set. Redirecting to login...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {step !== 6 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
            className="flex-1 px-5 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
          >
            {step === 1 ? "Login" : "Back"}
          </button>
          <button
            onClick={handleNext}
            disabled={loading || (step === 2 && usernameStatus !== "available")}
            className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-gray-900/30 border-t-gray-900 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {step === 5 ? "Create Account" : "Next"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      )}

      <style>{`
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

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
