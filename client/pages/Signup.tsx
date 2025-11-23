import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Weight, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const DOWNLOAD_REASONS = [
  "Find Trainers",
  "Fitness Tracking",
  "Workout Plans",
  "Other",
];

// Password validation function
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character";
  }
  return null;
};

// Username validation function
const validateUsername = (username: string): string | null => {
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }
  if (!/[0-9]/.test(username)) {
    return "Username must include at least one number";
  }
  return null;
};

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    height_feet: "",
    height_inches: "",
    height_cm: "",
    weight_kg: "",
    weight_pounds: "",
    phone_number: "",
    country_code: "+1",
    gender: "male",
    role: "client" as "client" | "trainer" | "admin",
    downloadReasons: [] as string[],
    otherReason: "",
    full_name: "",
  });

  const [usernameStatus, setUsernameStatus] = useState<
    "checking" | "available" | "taken" | null
  >(null);

  // Check username availability
  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameStatus(null);
      return;
    }

    setUsernameStatus("checking");
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      if (error?.code === "PGRST116") {
        // No rows = available
        setUsernameStatus("available");
      } else if (data) {
        setUsernameStatus("taken");
      } else {
        setUsernameStatus("available");
      }
    } catch (err) {
      setUsernameStatus("taken");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
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

    // Auto-convert kg to pounds
    if (name === "weight_kg" && value) {
      const kg = parseInt(value);
      const pounds = Math.round(kg * 2.205);
      newData.weight_pounds = pounds.toString();
    }

    setFormData(newData);

    if (name === "username") {
      checkUsername(value);
    }
  };

  const handleReasonToggle = (reason: string) => {
    setFormData((prev) => ({
      ...prev,
      downloadReasons: prev.downloadReasons.includes(reason)
        ? prev.downloadReasons.filter((r) => r !== reason)
        : [...prev.downloadReasons, reason],
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    if (
      !formData.height_feet ||
      !formData.height_inches ||
      !formData.weight_kg ||
      !formData.weight_pounds
    ) {
      toast.error("Please enter your height and weight");
      return;
    }

    if (usernameStatus !== "available") {
      toast.error("Username is not available");
      return;
    }

    if (formData.downloadReasons.length === 0) {
      toast.error("Please select at least one reason");
      return;
    }

    setLoading(true);
    try {
      // Calculate height in cm from feet and inches
      const heightInCm = Math.round(
        (parseInt(formData.height_feet) * 12 +
          parseInt(formData.height_inches)) *
          2.54,
      );
      const weightInKg = parseInt(formData.weight_kg);

      // Sign up with auth
      await signUp(formData.email, formData.password, {
        username: formData.username.toLowerCase(),
        full_name: formData.username,
        role: formData.role,
        height_cm: heightInCm,
        weight_kg: weightInKg,
        gender: formData.gender,
        phone_number: formData.country_code + formData.phone_number,
        country_code: formData.country_code,
      });

      // Store survey data
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        await supabase.from("user_surveys").insert({
          user_id: authData.user.id,
          download_reasons: formData.downloadReasons,
          other_reason:
            formData.downloadReasons.includes("Other") && formData.otherReason
              ? formData.otherReason
              : null,
        });
      }

      toast.success("Account created successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CoTrainr</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-5"
        >
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="john2024"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              3+ characters, must include at least one number
            </p>
            {usernameStatus && (
              <p
                className={`text-sm mt-2 ${
                  usernameStatus === "available"
                    ? "text-green-600"
                    : usernameStatus === "checking"
                      ? "text-blue-600"
                      : "text-red-600"
                }`}
              >
                {usernameStatus === "available"
                  ? "✓ Available"
                  : usernameStatus === "checking"
                    ? "Checking..."
                    : "✗ Not available"}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Min 8 characters, 1 uppercase, 1 number, 1 special character
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Height
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Ruler className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="height_feet"
                  value={formData.height_feet}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Feet (e.g., 5)"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="height_inches"
                  value={formData.height_inches}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Inches (e.g., 10)"
                />
              </div>
            </div>
            {formData.height_feet && formData.height_inches && (
              <p className="text-xs text-gray-600 mt-2 font-medium">
                {formData.height_feet}'{formData.height_inches}" or{" "}
                {formData.height_cm} cm
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Weight
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Weight className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Kilograms (e.g., 75)"
                />
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="weight_pounds"
                  value={formData.weight_pounds}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Pounds (e.g., 165)"
                />
              </div>
            </div>
          </div>

          {/* Height Display in Both Formats */}
          {formData.height_feet && formData.height_inches && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
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
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Contact Information
            </label>
            <div className="flex gap-3">
              <div className="w-32">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Country Code
                </label>
                <select
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              What's your role?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["client", "trainer"] as const).map((r) => (
                <label
                  key={r}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === r
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 bg-white hover:border-orange-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={formData.role === r}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as any })
                    }
                    className="mr-2"
                  />
                  <span className="font-semibold text-gray-900 capitalize">
                    {r}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Download Reasons */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Why did you download this app? (select all that apply)
            </label>
            <div className="space-y-2">
              {DOWNLOAD_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.downloadReasons.includes(reason)}
                    onChange={() => handleReasonToggle(reason)}
                    className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-gray-900">{reason}</span>
                </label>
              ))}
            </div>

            {/* Other reason text field */}
            {formData.downloadReasons.includes("Other") && (
              <textarea
                name="otherReason"
                value={formData.otherReason}
                onChange={handleInputChange}
                placeholder="Please specify..."
                className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            )}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:opacity-50 text-gray-800 font-bold py-3 rounded-lg transition-all mt-6 transform hover:scale-105 active:scale-95"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
