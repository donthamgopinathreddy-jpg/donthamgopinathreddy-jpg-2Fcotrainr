import { Utensils, Lock } from "lucide-react";

export default function Meals() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Meals & Tracking</h1>
        <p className="text-muted-foreground mb-12">Premium feature for meal planning and calorie tracking</p>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl p-8 border border-orange-500/30 backdrop-blur w-full">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Get personalized meal plans, macro tracking, and nutrition guidance from certified nutritionists.
            </p>
            <button className="w-full bg-gradient-primary text-gray-900 font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all">
              Upgrade Now ₹199/mo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
