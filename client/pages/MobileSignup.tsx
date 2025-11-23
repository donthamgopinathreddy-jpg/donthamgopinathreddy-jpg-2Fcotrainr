import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function MobileSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1); // 1: Email/Password, 2: Profile, 3: Role
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    height: "",
    weight: "",
    role: "client",
    full_name: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.full_name || !formData.username) {
        toast.error("Please fill in all fields");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.height || !formData.weight) {
        toast.error("Please fill in all fields");
        return;
      }
      handleSignup();
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.full_name,
        role: formData.role as "client" | "trainer",
        height_cm: parseInt(formData.height),
        weight_kg: parseInt(formData.weight),
      });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white mobile:pt-safe">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate("/login"))}
          className="text-orange-600 font-semibold text-sm"
        >
          ← {step > 1 ? "Back" : "Login"}
        </button>
        <div className="flex gap-1 mt-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= step ? "bg-orange-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 text-sm mt-1">
            Join the fitness revolution
          </p>
        </div>

        {/* Step 1: Email & Password */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Name & Username */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="johndoe"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your unique identifier
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Physical Info & Role */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  placeholder="180"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="75"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["client", "trainer"] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold capitalize transition-all ${
                      formData.role === role
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-gray-300 text-gray-700 hover:border-orange-500"
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
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : step === 3 ? "Create Account" : "Next"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-orange-600 font-semibold hover:text-orange-700"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
