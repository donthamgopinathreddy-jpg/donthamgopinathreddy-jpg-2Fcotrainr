import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft, Mail, Lock, Phone, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { usePermissions } from "@/hooks/usePermissions";
import { cmToFeetInchesString, inchesToCm, cmToFeetInches } from "@/lib/utils";

type OnboardingStep =
  | "welcome"
  | "username"
  | "fullname"
  | "email"
  | "password"
  | "phone"
  | "role"
  | "gender"
  | "height"
  | "weight"
  | "dateOfBirth"
  | "permissions";
type Gender = "male" | "female" | "other" | "";

interface FormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  countryCode: string;
  phoneNumber: string;
  gender: Gender;
  height: string;
  weight: string;
  age: string;
  dateOfBirth: string;
}

const COUNTRY_CODES = [
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Germany", code: "+49", flag: "🇩🇪" },
  { name: "France", code: "+33", flag: "🇫🇷" },
  { name: "Japan", code: "+81", flag: "🇯🇵" },
  { name: "China", code: "+86", flag: "🇨🇳" },
  { name: "Brazil", code: "+55", flag: "🇧🇷" },
  { name: "Mexico", code: "+52", flag: "🇲🇽" },
  { name: "South Korea", code: "+82", flag: "🇰🇷" },
  { name: "Singapore", code: "+65", flag: "🇸🇬" },
  { name: "Dubai", code: "+971", flag: "🇦🇪" },
  { name: "Pakistan", code: "+92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { signUp, demoMode } = useAuth();
  const { requestAllPermissions, loading: permissionLoading } =
    usePermissions();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "trainer" | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    fullName: "",
    email: "",
    password: "",
    countryCode: "+91",
    phoneNumber: "",
    gender: "",
    height: "",
    weight: "",
    age: "",
    dateOfBirth: "",
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [heightUnit, setHeightUnit] = useState<"cm" | "inches">("cm");

  // Username availability checking
  const [usernameStatus, setUsernameStatus] = useState<
    "checking" | "available" | "taken" | null
  >(null);
  const [usernameError, setUsernameError] = useState("");

  // Password validation state
  const [passwordFeedback, setPasswordFeedback] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasSpecialChar: false,
  });

  const passwordRegex = {
    minLength: /.{8,}/,
    upperCase: /[A-Z]/,
    specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  };

  const isPasswordValid =
    passwordRegex.minLength.test(formData.password) &&
    passwordRegex.upperCase.test(formData.password) &&
    passwordRegex.specialChar.test(formData.password);

  // Get height value in centimeters for storage
  const getHeightInCm = (): number => {
    if (!formData.height.trim()) return 0;
    const heightValue = parseFloat(formData.height);
    if (isNaN(heightValue)) return 0;
    if (heightUnit === "cm") {
      return heightValue;
    } else if (heightUnit === "inches") {
      return inchesToCm(heightValue);
    } else {
      // feet format - convert to cm
      const totalInches = heightValue * 12;
      return inchesToCm(totalInches);
    }
  };

  // Check username availability
  useEffect(() => {
    if (!formData.username) {
      setUsernameStatus(null);
      setUsernameError("");
      return;
    }

    // Allow special characters and numbers in username
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(formData.username)) {
      setUsernameStatus("taken");
      setUsernameError(
        "Username can only contain letters, numbers, -, _, and .",
      );
      return;
    }

    const checkAvailability = async () => {
      setUsernameStatus("checking");
      try {
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("username", formData.username.toLowerCase())
          .single();

        if (data) {
          setUsernameStatus("taken");
          setUsernameError("This username is already taken");
        } else {
          setUsernameStatus("available");
          setUsernameError("");
        }
      } catch (error: any) {
        if (error?.code === "PGRST116") {
          // No rows returned = username available
          setUsernameStatus("available");
          setUsernameError("");
        } else {
          setUsernameStatus("taken");
          setUsernameError("Error checking availability");
        }
      }
    };

    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  // Update password feedback
  useEffect(() => {
    setPasswordFeedback({
      hasMinLength: passwordRegex.minLength.test(formData.password),
      hasUpperCase: passwordRegex.upperCase.test(formData.password),
      hasSpecialChar: passwordRegex.specialChar.test(formData.password),
    });
  }, [formData.password]);

  const handleNext = () => {
    const steps: OnboardingStep[] = [
      "username",
      "fullname",
      "email",
      "password",
      "phone",
      "role",
    ];

    if (step === "welcome") {
      setStep("username");
    } else if (step === "username" && usernameStatus === "available") {
      setStep("fullname");
    } else if (step === "fullname" && formData.fullName.trim()) {
      setStep("email");
    } else if (step === "email" && formData.email.includes("@")) {
      setStep("password");
    } else if (step === "password" && isPasswordValid) {
      setStep("phone");
    } else if (step === "phone" && formData.phoneNumber.trim()) {
      setStep("role");
    } else if (step === "role" && userRole) {
      if (userRole === "trainer") {
        setStep("gender");
      } else {
        setStep("gender");
      }
    } else if (step === "gender" && formData.gender) {
      setStep("height");
    } else if (step === "height" && formData.height.trim()) {
      setStep("weight");
    } else if (step === "weight" && formData.weight.trim()) {
      setStep("dateOfBirth");
    } else if (step === "dateOfBirth" && formData.dateOfBirth) {
      setStep("permissions");
    }
  };

  const handleBack = () => {
    const backSequence: Record<OnboardingStep, OnboardingStep> = {
      username: "welcome",
      fullname: "username",
      email: "fullname",
      password: "email",
      phone: "password",
      role: "phone",
      gender: "role",
      height: "gender",
      weight: "height",
      dateOfBirth: "weight",
      permissions: "dateOfBirth",
      welcome: "welcome",
    };

    setStep(backSequence[step]);
    if (step === "role") setUserRole(null);
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

  const handleCompleteSignup = async () => {
    if (!userRole) return;
    setLoading(true);
    try {
      // Calculate age from date of birth
      let age = 25; // default
      if (formData.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
      }

      await signUp(formData.email, formData.password, {
        username: formData.username,
        full_name: formData.fullName,
        role: userRole,
        gender: formData.gender as Gender,
        phone_number: `${formData.countryCode} ${formData.phoneNumber}`,
        date_of_birth: formData.dateOfBirth,
        age: age,
        weight_kg: parseFloat(formData.weight),
        height_cm: getHeightInCm(),
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

  const handlePermissionsAllow = async () => {
    await requestAllPermissions();
    await handleCompleteSignup();
  };

  const handlePermissionsSkip = async () => {
    await handleCompleteSignup();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Back Button */}
      {step !== "welcome" && (
        <div className="px-4 py-4 border-b border-border">
          <button
            onClick={handleBack}
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
              Connect with verified trainers, track your nutrition, and join a
              fitness community.
            </p>
            <p className="text-sm text-muted-foreground">
              It all starts with getting to know you better.
            </p>
          </div>

          <button
            onClick={handleNext}
            className="w-full max-w-sm bg-gradient-primary text-gray-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </button>

          {import.meta.env.DEV && (
            <div className="w-full max-w-sm space-y-2 pt-4">
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
          )}

          <div className="text-center pt-4">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Username Step */}
      {step === "username" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose your username
              </h2>
              <p className="text-muted-foreground">
                This is how other users will identify you
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="john_doe123"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value.toLowerCase(),
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {usernameStatus === "checking" && (
                <p className="text-sm text-amber-600 mt-2">
                  Checking availability...
                </p>
              )}
              {usernameStatus === "available" && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Username available
                </p>
              )}
              {usernameStatus === "taken" && (
                <p className="text-sm text-red-600 mt-2">✗ {usernameError}</p>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                Letters, numbers, dots, hyphens, and underscores allowed
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={usernameStatus !== "available" || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Full Name Step */}
      {step === "fullname" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your name?
              </h2>
              <p className="text-muted-foreground">
                We'll use this to personalize your experience
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.fullName.trim() || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Email Step */}
      {step === "email" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your email?
              </h2>
              <p className="text-muted-foreground">
                You'll use this to sign in
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.email.includes("@") || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Password Step */}
      {step === "password" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Create a password
              </h2>
              <p className="text-muted-foreground">Keep your account secure</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${passwordFeedback.hasMinLength ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${passwordFeedback.hasUpperCase ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    At least one uppercase letter (A-Z)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${passwordFeedback.hasSpecialChar ? "bg-green-500" : "bg-gray-300"}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    At least one special character (!@#$%^&*)
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!isPasswordValid || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Phone Number Step */}
      {step === "phone" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your phone number?
              </h2>
              <p className="text-muted-foreground">
                We'll use this for contact and bookings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                {/* Country Code Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="bg-card border border-border rounded-lg px-3 py-3 min-w-20 font-medium text-foreground hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {formData.countryCode}
                  </button>

                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto w-48">
                      {COUNTRY_CODES.map((country) => (
                        <button
                          key={country.code}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              countryCode: country.code,
                            }));
                            setShowCountryDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors text-sm text-foreground"
                        >
                          <span className="mr-2">{country.flag}</span>
                          {country.name} ({country.code})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="123 456 7890"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your full number: {formData.countryCode} {formData.phoneNumber}
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.phoneNumber.trim() || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Role Selection Step */}
      {step === "role" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your role?
              </h2>
              <p className="text-muted-foreground">
                Choose how you'll use CoTrainr
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setUserRole("client");
                  setStep("gender");
                }}
                className="w-full p-4 rounded-lg border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <h3 className="font-semibold text-foreground">Client</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get fit with personalized training
                </p>
              </button>

              <button
                onClick={() => {
                  setUserRole("trainer");
                  setStep("gender");
                }}
                className="w-full p-4 rounded-lg border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <h3 className="font-semibold text-foreground">Trainer</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Build your coaching business
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gender Step */}
      {step === "gender" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your gender?
              </h2>
              <p className="text-muted-foreground">
                This helps us tailor recommendations
              </p>
            </div>

            <div className="space-y-3">
              {["male", "female", "other"].map((gender) => (
                <button
                  key={gender}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      gender: gender as Gender,
                    }));
                    setStep("height");
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all font-medium ${
                    formData.gender === gender
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Height Step */}
      {step === "height" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your height?
              </h2>
              <p className="text-muted-foreground">Enter feet and inches</p>
            </div>

            {/* Feet and Inches Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Feet
                  </label>
                  <input
                    type="number"
                    placeholder="5"
                    min="0"
                    max="10"
                    value={
                      formData.height
                        ? cmToFeetInches(parseFloat(formData.height)).feet
                        : ""
                    }
                    onChange={(e) => {
                      const feet = parseInt(e.target.value) || 0;
                      const inches = formData.height
                        ? cmToFeetInches(parseFloat(formData.height)).inches
                        : 0;
                      const totalInches = feet * 12 + inches;
                      setFormData((prev) => ({
                        ...prev,
                        height: inchesToCm(totalInches).toString(),
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Inches
                  </label>
                  <input
                    type="number"
                    placeholder="11"
                    min="0"
                    max="11"
                    value={
                      formData.height
                        ? cmToFeetInches(parseFloat(formData.height)).inches
                        : ""
                    }
                    onChange={(e) => {
                      const feet = formData.height
                        ? cmToFeetInches(parseFloat(formData.height)).feet
                        : 0;
                      const inches = parseInt(e.target.value) || 0;
                      const totalInches = feet * 12 + inches;
                      setFormData((prev) => ({
                        ...prev,
                        height: inchesToCm(totalInches).toString(),
                      }));
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              {formData.height.trim() && (
                <div
                  className={`rounded-lg p-3 ${
                    heightUnit === "cm"
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <p className="text-sm font-medium text-blue-900">
                    Height: {cmToFeetInchesString(parseFloat(formData.height))}{" "}
                    ({parseFloat(formData.height)} cm)
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.height.trim() || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Weight Step */}
      {step === "weight" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your weight?
              </h2>
              <p className="text-muted-foreground">Enter in kilograms</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="75"
                value={formData.weight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, weight: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <button
              onClick={handleNext}
              disabled={!formData.weight.trim() || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Date of Birth Step */}
      {step === "dateOfBirth" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                What's your date of birth?
              </h2>
              <p className="text-muted-foreground">
                This helps us create personalized workout recommendations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {formData.dateOfBirth && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Age:</strong>{" "}
                  {(() => {
                    const today = new Date();
                    const birthDate = new Date(formData.dateOfBirth);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && today.getDate() < birthDate.getDate())
                    ) {
                      age--;
                    }
                    return age;
                  })()}{" "}
                  years
                </p>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={!formData.dateOfBirth || loading}
              className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Permissions Step */}
      {step === "permissions" && (
        <div className="flex-1 flex flex-col px-4 py-8 overflow-y-auto">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Enable Permissions
              </h2>
              <p className="text-muted-foreground">
                We need a few permissions to give you the best experience
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                    📹
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Camera</p>
                  <p className="text-xs text-blue-700">
                    For video calls with trainers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                    🎤
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Microphone
                  </p>
                  <p className="text-xs text-blue-700">
                    For audio during calls and messages
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                    📍
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Location
                  </p>
                  <p className="text-xs text-blue-700">
                    To find trainers near you
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs">
                    🔔
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Notifications
                  </p>
                  <p className="text-xs text-blue-700">
                    Stay updated with messages and reminders
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePermissionsAllow}
                disabled={loading || permissionLoading}
                className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {permissionLoading ? "Requesting..." : "Allow All"}
              </button>

              <button
                onClick={handlePermissionsSkip}
                disabled={loading}
                className="w-full bg-transparent border-2 border-muted-foreground text-muted-foreground font-bold py-3 rounded-xl hover:bg-muted/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
