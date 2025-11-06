import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Users, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import GlassyTile from "@/components/GlassyTile";
import { usePermissions } from "@/hooks/usePermissions";

type OnboardingStep = "welcome" | "form" | "role" | "permissions";
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
  const { signUp, demoMode } = useAuth();
  const { requestAllPermissions, loading: permissionLoading } = usePermissions();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "trainer" | null>(null);
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
    } else if (step === "role") {
      setStep("permissions");
    }
  };

  const handlePermissionsSkip = async () => {
    await handleRoleSelectComplete();
  };

  const handlePermissionsAllow = async () => {
    await requestAllPermissions();
    await handleRoleSelectComplete();
  };

  const handleRoleSelectComplete = async () => {
    if (!userRole) return;
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
        role: userRole,
        gender: formData.gender as Gender,
        weight_kg: parseFloat(formData.weight),
        height_cm: parseFloat(formData.height),
      });

      toast.success("Account created successfully!");

      if (userRole === "trainer") {
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

  const handleRoleSelect = (role: "client" | "trainer") => {
    setUserRole(role);
    setStep("permissions");
  };

  const handleDemoMode = async (demoRole: "client" | "trainer" = "client") => {
    setLoading(true);
    try {
      await demoMode(demoRole);
      toast.success(`Entered ${demoRole} demo mode!`);
      navigate(demoRole === "trainer" ? "/trainer-dashboard" : "/");
    } catch (error: any) {
      console.error("Demo mode error:", error);
      toast.error("Failed to enter demo mode");
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
            onClick={() => {
              if (step === "form") {
                setStep("welcome");
              } else if (step === "role") {
                setStep("form");
              } else if (step === "permissions") {
                setStep("role");
                setUserRole(null);
              }
            }}
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
            <Logo size="2xl" className="mx-auto mb-6" />
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

          <div className="w-full max-w-sm space-y-2">
            <button
              onClick={() => handleDemoMode("client")}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Try Demo (Client)"}
            </button>
            <button
              onClick={() => handleDemoMode("trainer")}
              disabled={loading}
              className="w-full bg-blue-100 text-blue-900 font-bold py-4 rounded-xl hover:bg-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Try Demo (Trainer)"}
            </button>
          </div>
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
              icon={<Users className="w-8 h-8 text-cyan-600" />}
              title="I'm a Client"
              subtitle="I want to find trainers and improve my fitness"
              onClick={() => handleRoleSelect("client")}
              className="text-left cursor-pointer"
              variant="primary"
            />

            <GlassyTile
              icon={<Award className="w-8 h-8 text-amber-600" />}
              title="I'm a Trainer"
              subtitle="I want to share my expertise and earn"
              onClick={() => handleRoleSelect("trainer")}
              className="text-left cursor-pointer"
              variant="secondary"
            />
          </div>
        </div>
      )}

      {/* Permissions Step */}
      {step === "permissions" && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-md w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Enable Permissions</h2>
              <p className="text-muted-foreground mb-6">
                To provide the best experience, we need access to:
              </p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span><strong>Location</strong> - Find nearby trainers</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span><strong>Camera</strong> - Video training sessions</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span><strong>Microphone</strong> - Audio during calls</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handlePermissionsAllow}
              disabled={loading || permissionLoading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              {permissionLoading ? "Requesting..." : "Enable Permissions"}
            </button>

            <button
              onClick={handlePermissionsSkip}
              disabled={loading}
              className="w-full bg-gray-100 text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Skip for Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
