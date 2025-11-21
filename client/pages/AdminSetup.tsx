import { useState } from "react";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/supabase/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: "admin",
        }),
      });

      console.log("[AdminSetup] Response status:", response.status);

      // Read the response body only once
      let responseBody = "";
      try {
        responseBody = await response.text();
        console.log("[AdminSetup] Response body length:", responseBody.length);
      } catch (readError) {
        console.error("[AdminSetup] Failed to read response:", readError);
        toast.error("Failed to read server response");
        return;
      }

      // Parse JSON if possible
      let result: any = {};
      if (responseBody) {
        try {
          result = JSON.parse(responseBody);
        } catch {
          result = { error: responseBody };
        }
      }

      if (!response.ok) {
        const errorMessage = result?.error || `Failed to create admin account (${response.status})`;
        toast.error(errorMessage);
        return;
      }

      setSetupComplete(true);
      toast.success("Admin account created successfully!");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Setup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create admin account");
    } finally {
      setIsLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Success!
          </h1>
          <p className="text-gray-600 mb-4">
            Admin account created successfully. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Setup
          </h1>
          <p className="text-gray-600">Create your admin account</p>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-5">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cotrainr.app"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              This will create the admin account for your CoTrainr platform
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all duration-200"
          >
            {isLoading ? "Creating Admin Account..." : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Admin account setup for CoTrainr
        </p>
      </div>
    </div>
  );
}
