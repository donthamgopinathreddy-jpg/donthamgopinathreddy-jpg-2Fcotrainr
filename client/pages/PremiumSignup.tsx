import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Ruler,
  Weight,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/Logo";

const DOWNLOAD_REASONS = [
  "Find Trainers",
  "Fitness Tracking",
  "Workout Plans",
  "Other",
];

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  height_cm: string;
  height_ft: string;
  height_in: string;
  weight_kg: string;
  weight_lbs: string;
  gender: string;
  role: "client" | "trainer";
  downloadReasons: string[];
  otherReason: string;
}

type SignupStep =
  | "username"
  | "email"
  | "password"
  | "height"
  | "weight"
  | "profile"
  | "survey"
  | "complete";

export default function PremiumSignup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState<SignupStep>("username");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    height_cm: "",
    height_ft: "",
    height_in: "",
    weight_kg: "",
    weight_lbs: "",
    gender: "male",
    role: "client",
    downloadReasons: [],
    otherReason: "",
  });

  const [usernameStatus, setUsernameStatus] = useState<
    "checking" | "available" | "taken" | null
  >(null);

  // Height conversion helpers
  const cmToFeetInches = (cm: number) => {
    const inches = Math.round(cm / 2.54);
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return { feet, inches: remainingInches };
  };

  const feetInchesToCm = (feet: number, inches: number) => {
    return Math.round((feet * 12 + inches) * 2.54);
  };

  const handleHeightCmChange = (value: string) => {
    setData((prev) => {
      const cm = parseInt(value) || 0;
      const { feet, inches } = cmToFeetInches(cm);
      return {
        ...prev,
        height_cm: value,
        height_ft: feet.toString(),
        height_in: inches.toString(),
      };
    });
  };

  const handleHeightFeetChange = (value: string) => {
    setData((prev) => {
      const feet = parseInt(value) || 0;
      const inches = parseInt(prev.height_in) || 0;
      const cm = feetInchesToCm(feet, inches);
      return { ...prev, height_ft: value, height_cm: cm.toString() };
    });
  };

  const handleHeightInchesChange = (value: string) => {
    setData((prev) => {
      const feet = parseInt(prev.height_ft) || 0;
      const inches = parseInt(value) || 0;
      const cm = feetInchesToCm(feet, inches);
      return { ...prev, height_in: value, height_cm: cm.toString() };
    });
  };

  // Weight conversion helpers
  const kgToLbs = (kg: number) => Math.round(kg * 2.20462);
  const lbsToKg = (lbs: number) => Math.round(lbs / 2.20462);

  const handleWeightKgChange = (value: string) => {
    setData((prev) => {
      const kg = parseFloat(value) || 0;
      const lbs = kgToLbs(kg);
      return { ...prev, weight_kg: value, weight_lbs: lbs.toString() };
    });
  };

  const handleWeightLbsChange = (value: string) => {
    setData((prev) => {
      const lbs = parseFloat(value) || 0;
      const kg = lbsToKg(lbs);
      return { ...prev, weight_lbs: value, weight_kg: kg.toString() };
    });
  };

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus("checking");
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      setUsernameStatus(existingUser ? "taken" : "available");
    } catch (err) {
      setUsernameStatus("available");
    }
  };

  const handleNext = async () => {
    switch (step) {
      case "username":
        if (!data.username) {
          toast.error("Please enter username");
          return;
        }
        if (usernameStatus !== "available") {
          toast.error("Username not available");
          return;
        }
        setStep("email");
        break;

      case "email":
        if (!data.email || !data.email.includes("@")) {
          toast.error("Please enter valid email");
          return;
        }
        setStep("password");
        break;

      case "password":
        if (!data.password || data.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return;
        }
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }
        setStep("height");
        break;

      case "height":
        if (!data.height_cm) {
          toast.error("Please enter height");
          return;
        }
        setStep("weight");
        break;

      case "weight":
        if (!data.weight_kg) {
          toast.error("Please enter weight");
          return;
        }
        setStep("profile");
        break;

      case "profile":
        setStep("survey");
        break;

      case "survey":
        if (data.downloadReasons.length === 0) {
          toast.error("Please select at least one reason");
          return;
        }
        await handleSignup();
        break;
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, {
        username: data.username.toLowerCase(),
        full_name: data.username,
        role: data.role,
        height_cm: parseInt(data.height_cm),
        weight_kg: parseFloat(data.weight_kg),
        gender: data.gender,
      });

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        await supabase.from("user_surveys").insert({
          user_id: authData.user.id,
          download_reasons: data.downloadReasons,
          other_reason: data.downloadReasons.includes("Other")
            ? data.otherReason
            : null,
        });
      }

      toast.success("Account created!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const steps: SignupStep[] = [
      "username",
      "email",
      "password",
      "height",
      "weight",
      "profile",
      "survey",
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const progressPercent =
    (([
      "username",
      "email",
      "password",
      "height",
      "weight",
      "profile",
      "survey",
    ].indexOf(step) +
      1) /
      8) *
    100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            Transform your fitness journey
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-center text-slate-500 text-xs mt-3">
            Step{" "}
            {[
              "username",
              "email",
              "password",
              "height",
              "weight",
              "profile",
              "survey",
            ].indexOf(step) + 1}{" "}
            of 7
          </p>
        </div>

        {/* Step Forms with smooth transitions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
          {/* Username Step */}
          {step === "username" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose your username
                </h2>
                <p className="text-slate-400 text-sm">
                  Make it unique and memorable
                </p>
              </div>

              <div className="relative group">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  value={data.username}
                  onChange={(e) => {
                    setData({ ...data, username: e.target.value });
                    checkUsername(e.target.value);
                  }}
                  placeholder="username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                {usernameStatus && (
                  <span
                    className={`absolute right-4 top-4 text-sm font-semibold ${usernameStatus === "available" ? "text-green-400" : usernameStatus === "checking" ? "text-blue-400" : "text-red-400"}`}
                  >
                    {usernameStatus === "available"
                      ? "✓"
                      : usernameStatus === "checking"
                        ? "..."
                        : "✗"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Email Step */}
          {step === "email" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Enter your email
                </h2>
                <p className="text-slate-400 text-sm">
                  We'll use this to sign you in
                </p>
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Password Step */}
          {step === "password" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Create a password
                </h2>
                <p className="text-slate-400 text-sm">At least 6 characters</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={data.password}
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={data.confirmPassword}
                    onChange={(e) =>
                      setData({ ...data, confirmPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Height Step */}
          {step === "height" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's your height?
                </h2>
                <p className="text-slate-400 text-sm">
                  Help us personalize your experience
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Ruler className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="number"
                    value={data.height_cm}
                    onChange={(e) => handleHeightCmChange(e.target.value)}
                    placeholder="0"
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-4 text-slate-400 text-sm">
                    cm
                  </span>
                </div>

                <div className="text-center text-slate-500 text-sm">Or</div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <input
                      type="number"
                      value={data.height_ft}
                      onChange={(e) => handleHeightFeetChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-10 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center"
                    />
                    <span className="absolute right-3 top-4 text-slate-400 text-sm">
                      ft
                    </span>
                  </div>
                  <div className="relative group">
                    <input
                      type="number"
                      value={data.height_in}
                      onChange={(e) => handleHeightInchesChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-4 pr-10 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center"
                    />
                    <span className="absolute right-3 top-4 text-slate-400 text-sm">
                      in
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Weight Step */}
          {step === "weight" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's your weight?
                </h2>
                <p className="text-slate-400 text-sm">
                  This helps us track your progress
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Weight className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="number"
                    value={data.weight_kg}
                    onChange={(e) => handleWeightKgChange(e.target.value)}
                    placeholder="0"
                    step="0.1"
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-4 text-slate-400 text-sm">
                    kg
                  </span>
                </div>

                <div className="text-center text-slate-500 text-sm">Or</div>

                <div className="relative group">
                  <Weight className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="number"
                    value={data.weight_lbs}
                    onChange={(e) => handleWeightLbsChange(e.target.value)}
                    placeholder="0"
                    step="0.1"
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                  <span className="absolute right-4 top-4 text-slate-400 text-sm">
                    lbs
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Profile Step */}
          {step === "profile" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Complete your profile
                </h2>
                <p className="text-slate-400 text-sm">
                  Tell us a bit about yourself
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={data.gender}
                    onChange={(e) =>
                      setData({ ...data, gender: e.target.value })
                    }
                    className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    What's your role?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["client", "trainer"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setData({ ...data, role: r })}
                        className={`p-4 rounded-2xl font-semibold transition-all ${
                          data.role === r
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
                            : "bg-slate-700/50 text-slate-300 border border-slate-600 hover:border-orange-500 hover:text-white"
                        }`}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Survey Step */}
          {step === "survey" && (
            <div className="animate-fadeIn space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Why CoTrainr?
                </h2>
                <p className="text-slate-400 text-sm">
                  Help us understand your goals
                </p>
              </div>

              <div className="space-y-3">
                {DOWNLOAD_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => {
                      setData((prev) => ({
                        ...prev,
                        downloadReasons: prev.downloadReasons.includes(reason)
                          ? prev.downloadReasons.filter((r) => r !== reason)
                          : [...prev.downloadReasons, reason],
                      }));
                    }}
                    className={`w-full p-4 rounded-2xl text-left font-semibold transition-all border-2 ${
                      data.downloadReasons.includes(reason)
                        ? "bg-orange-500/20 border-orange-500 text-orange-300"
                        : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-orange-500"
                    }`}
                  >
                    {data.downloadReasons.includes(reason) ? "✓ " : "◯ "}{" "}
                    {reason}
                  </button>
                ))}
              </div>

              {data.downloadReasons.includes("Other") && (
                <textarea
                  value={data.otherReason}
                  onChange={(e) =>
                    setData({ ...data, otherReason: e.target.value })
                  }
                  placeholder="Tell us more..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step !== "username" && (
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-4 bg-slate-700/50 hover:bg-slate-700 text-white font-semibold rounded-2xl border border-slate-600 hover:border-slate-500 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-orange-500/50 active:scale-95"
          >
            {loading
              ? "Creating..."
              : step === "survey"
                ? "Create Account"
                : "Next"}
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
