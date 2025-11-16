import { Dumbbell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function TrainingHubCard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const plan = userProfile?.subscription_plan || "free";

  return (
    <div
      onClick={() => navigate("/training-hub")}
      className="bg-gradient-to-br from-orange-400 via-red-400 to-purple-500 rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20 backdrop-blur-md overflow-hidden relative group"
    >
      {/* Background animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-4">
        {/* Icon and Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Training Hub</h3>
              <p className="text-sm text-white/80">Workouts & Nutrition</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Features Preview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span>🏋️</span>
            <span>Weekly Workout Plans</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span>🍎</span>
            <span>Diet Planning</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90">
            <span>📊</span>
            <span>Progress Tracking</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <button className="w-full py-2 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-all text-sm">
            {plan === "free"
              ? "Subscribe to unlock full features"
              : "Access Training Hub"}
          </button>
        </div>
      </div>
    </div>
  );
}
