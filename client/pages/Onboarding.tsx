import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";

type OnboardingStep = "welcome" | "form" | "role";
type Gender = "male" | "female" | "other";

interface FormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  gender: Gender | "";
  height: string;
  weight: string;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    fullName: "",
    email: "",
    password: "",
    gender: "",
    height: "",
    weight: "",
  });

  const isFormComplete =
    formData.username &&
    formData.fullName &&
    formData.email &&
    formData.password &&
    formData.password.length >= 6 &&
    formData.gender &&
    formData.height &&
    formData.weight;

  const handleContinue = () => {
    if (step === "welcome") {
      setStep("form");
    } else if (step === "form" && isFormComplete) {
      setStep("role");
    }
  };

  const handleRoleSelect = async (role: "client" | "trainer") => {
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
        role,
        gender: formData.gender as Gender,
        weight_kg: parseFloat(formData.weight),
        height_cm: parseFloat(formData.height),
      });

      toast.success("Account created successfully!");

      if (role === "trainer") {
        navigate("/trainer-signup");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Indicator */}
      {step !== "welcome" && (
        <div className="px-4 py-4 border-b border-border">
          <button
            onClick={() => setStep(step === "form" ? "welcome" : "form")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
      )}

      {/* Welcome Step */}
      {step === "welcome" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-8">
            <Logo size="lg" className="mx-auto mb-6" />
            <p className="text-muted-foreground text-lg">
              Your personal fitness companion
            </p>
          </div>

          <div className="max-w-sm space-y-4 mb-12">
            <p className="text-foreground font-medium">
              Connect with verified trainers, track your nutrition, and join a fitness community.
            </p>
            <p className="text-sm text-muted-foreground">
              It all starts with getting to know you better.
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="w-full max-w-sm bg-gradient-primary text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Registration Form Step */}
      {step === "form" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Tell us about you</h2>
              <p className="text-muted-foreground">We'll use this to personalize your experience</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <input
                type="text"
                placeholder="johndoe"
                value={formData?.username ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, username: e.target.value }))
                }
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData?.fullName ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={formData?.email ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={formData?.password ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {(formData?.password ?? "").length > 0 && (formData?.password ?? "").length < 6 && (
                <p className="text-xs text-red-500 mt-1">Password must be at least 6 characters</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
              <div className="flex gap-2">
                {(["male", "female", "other"] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setFormData((prev) => ({ ...prev, gender }))}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      formData?.gender === gender
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Height (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={formData?.height ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, height: e.target.value }))
                  }
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="75"
                  value={formData?.weight ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, weight: e.target.value }))
                  }
                  className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!isFormComplete}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Role Selection Step */}
      {step === "role" && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">What brings you here?</h2>
              <p className="text-muted-foreground">Choose your account type to get started</p>
            </div>

            <GlassyTile
              icon={<span className="text-4xl">🏋️</span>}
              title="I'm a Client"
              subtitle="I want to find trainers and improve my fitness"
              onClick={() => handleRoleSelect("client")}
              className="text-left cursor-pointer"
              variant="primary"
            />

            <GlassyTile
              icon={<span className="text-4xl">👨‍🏫</span>}
              title="I'm a Trainer"
              subtitle="I want to share my expertise and earn"
              onClick={() => handleRoleSelect("trainer")}
              className="text-left cursor-pointer"
              variant="secondary"
            />
          </div>
        </div>
      )}
    </div>
  );
}
