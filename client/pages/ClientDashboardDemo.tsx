import { Activity, Droplet, Flame, Apple, TrendingUp, Calendar, Heart } from "lucide-react";

export default function ClientDashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, Alex! 👋</h1>
          <p className="text-gray-600">Here's your fitness journey at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Steps</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">8,542</p>
              </div>
              <Activity className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">↑ 12% from yesterday</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Calories Burned</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">542 kcal</p>
              </div>
              <Flame className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">Goal: 600 kcal</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Water Intake</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">6.5 L</p>
              </div>
              <Droplet className="w-12 h-12 text-cyan-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">Goal: 8 L</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">BMI</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">22.5</p>
              </div>
              <Heart className="w-12 h-12 text-red-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">Normal weight</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Weekly Activity</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, idx) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">{day}</span>
                  <div className="flex-1 mx-4 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full"
                      style={{ width: `${Math.random() * 100 + 50}%` }}
                    />
                  </div>
                  <span className="text-gray-900 font-bold text-sm">{Math.random() * 10 + 5 | 0}k steps</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Apple className="w-5 h-5" />
                Log Meal
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Activity className="w-5 h-5" />
                Log Workout
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Droplet className="w-5 h-5" />
                Book Trainer
              </button>
            </div>
          </div>
        </div>

        {/* Recent Meals */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Meals</h2>
          <div className="space-y-4">
            {[
              { name: "Oatmeal with Berries", calories: 350, time: "7:30 AM" },
              { name: "Chicken Salad", calories: 450, time: "1:00 PM" },
              { name: "Protein Shake", calories: 200, time: "4:30 PM" },
            ].map((meal, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{meal.name}</p>
                  <p className="text-sm text-gray-500">{meal.time}</p>
                </div>
                <span className="text-lg font-bold text-orange-500">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
