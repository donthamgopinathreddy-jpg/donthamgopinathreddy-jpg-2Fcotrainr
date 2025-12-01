import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FOCUS_CATEGORIES = [
  "Fat loss",
  "Muscle gain",
  "Strength",
  "Boxing",
  "MMA",
  "Yoga",
  "Mobility",
  "Physio/Rehab",
  "Endurance",
  "General fitness",
];

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  full_name: string;
  phone_number: string;
  country_code: string;
  date_of_birth: string;
  gender: string;
  height_cm: number | "";
  height_feet: number | "";
  height_inches: number | "";
  weight_kg: number | "";
  weight_lbs: number | "";
  role: "client" | "trainer";
  focus_categories: string[];
  years_of_experience: number | "";
}

export default function MobileSignup() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useFeetInches, setUseFeetInches] = useState(false);
  const [useLbs, setUseLbs] = useState(false);

  const [data, setData] = useState<SignupData>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    full_name: "",
    phone_number: "",
    country_code: "+1",
    date_of_birth: "",
    gender: "",
    height_cm: "",
    height_feet: "",
    height_inches: "",
    weight_kg: "",
    weight_lbs: "",
    role: "client",
    focus_categories: [],
    years_of_experience: "",
  });

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof SignupData, value: any) => {
    setData({ ...data, [field]: value });
  };

  const toggleCategory = (category: string) => {
    setData((prev) => ({
      ...prev,
      focus_categories: prev.focus_categories.includes(category)
        ? prev.focus_categories.filter((c) => c !== category)
        : [...prev.focus_categories, category],
    }));
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!data.email || !data.password || !data.confirmPassword) {
          toast.error("Please fill in all fields");
          return false;
        }
        if (data.password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return false;
        }
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match");
          return false;
        }
        return true;
      case 1:
        if (!data.username || !data.full_name || !data.phone_number) {
          toast.error("Please fill in all fields");
          return false;
        }
        return true;
      case 2:
        if (!data.date_of_birth || !data.gender) {
          toast.error("Please fill in all fields");
          return false;
        }
        return true;
      case 3:
        if (!data.height_cm && !useFeetInches) {
          toast.error("Please enter your height");
          return false;
        }
        if (useFeetInches && (!data.height_feet || !data.height_inches)) {
          toast.error("Please enter your height");
          return false;
        }
        return true;
      case 4:
        if (!data.weight_kg && !useLbs) {
          toast.error("Please enter your weight");
          return false;
        }
        if (!data.role) {
          toast.error("Please select your role");
          return false;
        }
        if (data.role === "trainer" && !data.years_of_experience) {
          toast.error("Please enter years of experience");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
      }
    }
  };

  const handleFinish = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      // Convert height to cm if using feet/inches
      let heightCm = data.height_cm;
      if (useFeetInches && data.height_feet && data.height_inches) {
        heightCm =
          (Number(data.height_feet) * 12 + Number(data.height_inches)) * 2.54;
      }

      // Convert weight to kg if using lbs
      let weightKg = data.weight_kg;
      if (useLbs && data.weight_lbs) {
        weightKg = Number(data.weight_lbs) / 2.205;
      }

      await signUp(data.email, data.password, {
        username: data.username,
        full_name: data.full_name,
        role: data.role,
        gender: data.gender,
        height_cm: heightCm ? Number(heightCm) : undefined,
        weight_kg: weightKg ? Number(weightKg) : undefined,
        phone_number: data.phone_number,
        country_code: data.country_code,
        age: Number(calculateAge(data.date_of_birth)),
        date_of_birth: data.date_of_birth,
      });

      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Signup failed";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Min 8 characters, 1 uppercase, 1 number, 1 special character
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={data.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                placeholder="your_username"
                value={data.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-1">Checking username…</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={data.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={data.country_code}
                  onChange={(e) =>
                    handleInputChange("country_code", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-20 px-2 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 disabled:opacity-50"
                >
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+91">+91</option>
                  <option value="+86">+86</option>
                </select>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={data.phone_number}
                  onChange={(e) =>
                    handleInputChange("phone_number", e.target.value)
                  }
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                value={data.date_of_birth}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 disabled:opacity-50"
              />
              {data.date_of_birth && (
                <p className="text-xs text-gray-500">
                  Age: {calculateAge(data.date_of_birth)} years
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleInputChange("gender", g.toLowerCase())}
                    disabled={isLoading}
                    className={`flex-1 py-2 px-4 rounded-full font-medium transition-all disabled:opacity-50 ${
                      data.gender === g.toLowerCase()
                        ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900"
                        : "bg-white/50 border border-gray-200 text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Height
              </label>

              {!useFeetInches ? (
                <input
                  type="number"
                  placeholder="170"
                  value={data.height_cm}
                  onChange={(e) =>
                    handleInputChange("height_cm", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="5"
                    value={data.height_feet}
                    onChange={(e) =>
                      handleInputChange("height_feet", e.target.value)
                    }
                    disabled={isLoading}
                    className="w-16 px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                  />
                  <span className="flex items-center text-gray-600">ft</span>
                  <input
                    type="number"
                    placeholder="10"
                    value={data.height_inches}
                    onChange={(e) =>
                      handleInputChange("height_inches", e.target.value)
                    }
                    disabled={isLoading}
                    className="w-16 px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                  />
                  <span className="flex items-center text-gray-600">in</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setUseFeetInches(!useFeetInches)}
                disabled={isLoading}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
              >
                {useFeetInches ? "Use cm" : "Use feet/inches"}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Weight
              </label>

              {!useLbs ? (
                <input
                  type="number"
                  placeholder="70"
                  value={data.weight_kg}
                  onChange={(e) =>
                    handleInputChange("weight_kg", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
              ) : (
                <input
                  type="number"
                  placeholder="154"
                  value={data.weight_lbs}
                  onChange={(e) =>
                    handleInputChange("weight_lbs", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
              )}

              <button
                type="button"
                onClick={() => setUseLbs(!useLbs)}
                disabled={isLoading}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
              >
                {useLbs ? "Use kg" : "Use lbs"}
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="flex gap-2">
                {["client", "trainer"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleInputChange("role", r)}
                    disabled={isLoading}
                    className={`flex-1 py-2 px-4 rounded-full font-medium transition-all disabled:opacity-50 capitalize ${
                      data.role === r
                        ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900"
                        : "bg-white/50 border border-gray-200 text-gray-700 hover:border-orange-300"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {data.role === "trainer" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <input
                  type="number"
                  placeholder="5"
                  value={data.years_of_experience}
                  onChange={(e) =>
                    handleInputChange("years_of_experience", e.target.value)
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-orange-400 focus:outline-none bg-white/50 backdrop-blur-sm transition-all text-gray-900 placeholder-gray-400 disabled:opacity-50"
                />
              </div>
            )}

            {data.role === "client" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Focus Categories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      disabled={isLoading}
                      className={`py-2 px-3 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                        data.focus_categories.includes(cat)
                          ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900"
                          : "bg-white/50 border border-gray-200 text-gray-700 hover:border-orange-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {data.role === "trainer" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Specialties
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FOCUS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      disabled={isLoading}
                      className={`py-2 px-3 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                        data.focus_categories.includes(cat)
                          ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900"
                          : "bg-white/50 border border-gray-200 text-gray-700 hover:border-orange-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
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
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fc659d255956c4643b6576a691786eec0%2Fa3b8ec7e06b34a03ac01ccc4e2c195b0?format=webp&width=800"
            alt="CoTrainr Logo"
            className="h-16 mx-auto"
          />
        </div>

        {/* Main glassmorphism card */}
        <div className="backdrop-blur-2xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
          {/* Progress indicator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              {[0, 1, 2, 3, 4].map((s) => (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                      s === step
                        ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-900 shadow-md"
                        : s < step
                          ? "bg-orange-300 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {s + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-300"
                style={{ width: `${((step + 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Title section */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 0 && "Create account"}
              {step === 1 && "Profile basics"}
              {step === 2 && "Personal details"}
              {step === 3 && "Height"}
              {step === 4 && "Weight and role"}
            </h1>
            <p className="text-gray-600 text-sm">Step {step + 1} of 5</p>
          </div>

          {/* Form content */}
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}
            <button
              type="button"
              onClick={step === 4 ? handleFinish : handleNext}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                step === 4
                  ? "bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-gray-900 shadow-lg hover:shadow-xl"
                  : "bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-gray-900 shadow-lg hover:shadow-xl"
              }`}
            >
              {isLoading
                ? "Processing..."
                : step === 4
                  ? "Create Account"
                  : "Next"}
              {step < 4 && <ChevronRight size={20} />}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={isLoading}
                className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
