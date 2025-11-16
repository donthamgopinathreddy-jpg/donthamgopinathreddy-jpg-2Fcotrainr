import { Lock, Zap, Crown } from "lucide-react";

interface SubscriptionBannerProps {
  plan: "free" | "basic" | "premium";
}

export default function SubscriptionBanner({
  plan,
}: SubscriptionBannerProps) {
  const bannerConfig = {
    free: {
      icon: Lock,
      title: "Free Plan",
      description: "Get started with basic workouts and meal tracking",
      color: "from-gray-500 to-gray-600",
      textColor: "text-white",
      buttonText: "Upgrade to Basic",
    },
    basic: {
      icon: Zap,
      title: "Basic Plan",
      description: "Unlock all workouts and limited diet planning",
      color: "from-blue-500 to-blue-600",
      textColor: "text-white",
      buttonText: "Upgrade to Premium",
    },
    premium: {
      icon: Crown,
      title: "Premium Plan",
      description: "Everything unlocked - full access to all features",
      color: "from-amber-500 via-orange-500 to-red-500",
      textColor: "text-white",
      buttonText: "You're all set!",
    },
  };

  const config = bannerConfig[plan];
  const Icon = config.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${config.color} p-8 backdrop-blur-md border border-white/10 shadow-2xl`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className={`text-3xl font-bold ${config.textColor} mb-2`}>
              {config.title}
            </h2>
            <p className={`${config.textColor} text-lg opacity-90`}>
              {config.description}
            </p>

            {plan !== "premium" && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-white/80">
                  {plan === "free"
                    ? "✓ Basic workouts\n✓ Meal tracker"
                    : "✓ All workouts\n✓ Limited diet planner"}
                </p>
              </div>
            )}
          </div>
        </div>

        {plan !== "premium" && (
          <button className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl backdrop-blur-md border border-white/30 transition-all hover:shadow-lg ml-4 whitespace-nowrap">
            {config.buttonText}
          </button>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white/30 rounded-full animate-bounce"></div>
      <div className="absolute bottom-4 right-8 w-1 h-1 bg-white/20 rounded-full animate-pulse"></div>
    </div>
  );
}
