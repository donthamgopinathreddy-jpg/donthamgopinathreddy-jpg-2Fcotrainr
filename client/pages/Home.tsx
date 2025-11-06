import { useNavigate } from "react-router-dom";
import GlassyTile from "@/components/GlassyTile";
import { Dumbbell, Apple, Flame, Footprints, Award } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-primary min-h-72 flex flex-col items-center justify-center px-6">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-60 h-60 bg-white rounded-full filter blur-3xl animate-pulse animation-delay-1000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-800 text-lg font-medium">Find your perfect trainer today</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Progress Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-4 border border-border text-center hover:border-primary transition-colors">
            <div className="flex justify-center mb-2">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">3</div>
            <p className="text-xs text-muted-foreground">Trials left</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center hover:border-primary transition-colors">
            <div className="flex justify-center mb-2">
              <Footprints className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">8.4k</div>
            <p className="text-xs text-muted-foreground">Steps today</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border text-center hover:border-primary transition-colors">
            <div className="flex justify-center mb-2">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">1,850</div>
            <p className="text-xs text-muted-foreground">Calories today</p>
          </div>
        </div>

        {/* Primary Action Tiles */}
        <div className="space-y-4">
          <GlassyTile
            icon={<Dumbbell className="w-8 h-8" />}
            title="Find Trainers"
            subtitle="Zumba, CrossFit, Boxing, Yoga & more"
            onClick={() => navigate("/discover")}
            variant="primary"
          />
          <GlassyTile
            icon={<Apple className="w-8 h-8" />}
            title="Find Nutritionists"
            subtitle="Get personalized meal plans"
            onClick={() => navigate("/discover")}
            variant="secondary"
          />
        </div>

        {/* Promo Card */}
        <div className="mt-8 bg-gradient-to-br from-orange-500/30 via-yellow-500/20 to-orange-400/30 rounded-2xl p-6 border border-white border-opacity-20 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-foreground mb-2">Unlock Premium</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get unlimited video sessions, meal tracking, and chat with professionals
          </p>
          <button className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all">
            Subscribe Now ₹199/mo
          </button>
        </div>

        {/* What's New Section */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <h3 className="text-sm font-bold text-primary mb-2">🎉 What's New</h3>
          <p className="text-xs text-muted-foreground">
            New trainers joining daily! Check the latest in Discover
          </p>
        </div>
      </div>
    </div>
  );
}
