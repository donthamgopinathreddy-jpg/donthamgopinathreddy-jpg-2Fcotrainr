import {
  Activity,
  Droplet,
  Flame,
  Apple,
  TrendingUp,
  Calendar,
  Heart,
  Bell,
  Settings,
  MoreVertical,
  MessageSquare,
  Share2,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";

export default function ClientDashboardDemo() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const cardClass = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const subtextClass = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 400%22><defs><pattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22white%22 stroke-width=%220.5%22/></pattern></defs><rect width=%221200%22 height=%22400%22 fill=%22%230ea5e9%22/><rect width=%221200%22 height=%22400%22 fill=%22url(%23grid)%22/></svg>')]"></div>
        </div>

        {/* Notification Bell - Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-3 rounded-full bg-white hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg"
          >
            <Bell className="w-6 h-6 text-blue-600" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute top-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <p className="text-gray-900 font-semibold text-sm">
                Notifications
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <p className="text-gray-900 text-sm font-semibold">
                    New Client Request
                  </p>
                  <p className="text-gray-600 text-xs">
                    John wants to book a session
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <p className="text-gray-900 text-sm font-semibold">
                    Session Reminder
                  </p>
                  <p className="text-gray-600 text-xs">
                    Meeting with Jane in 1 hour
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="text-gray-900 text-sm font-semibold">
                    New Message
                  </p>
                  <p className="text-gray-600 text-xs">
                    From Mike: Thanks for the workout!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon - Top Right */}
        <div className="absolute top-6 right-6">
          <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg">
            <Settings className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative -mt-20 mx-6 mb-8">
        <div className={`${cardClass} border rounded-3xl p-6 shadow-xl`}>
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg overflow-hidden border-4 border-white transform hover:scale-105 transition-transform">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-2">
                <h1 className={`text-2xl font-bold ${textClass}`}>
                  Alex Turner
                </h1>
                <p className={`${subtextClass} text-sm`}>Fitness Enthusiast</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className={`font-semibold ${textClass}`}>72</span>
                    <span className={`${subtextClass} text-xs`}>Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className={`font-semibold ${textClass}`}>12</span>
                    <span className={`${subtextClass} text-xs`}>Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => alert("Steps updated!")}
            className="bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
          >
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                ↑ 12%
              </span>
            </div>
            <p className="text-white/90 text-sm font-medium">Today's Steps</p>
            <p className="text-3xl font-bold mt-2">8,542</p>
            <p className="text-white/80 text-xs mt-2">Goal: 10,000</p>
          </button>

          <button
            onClick={() => alert("Calories tracked!")}
            className="bg-gradient-to-br from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
          >
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                ↑ 8%
              </span>
            </div>
            <p className="text-white/90 text-sm font-medium">Calories Burned</p>
            <p className="text-3xl font-bold mt-2">542 kcal</p>
            <p className="text-white/80 text-xs mt-2">Goal: 600 kcal</p>
          </button>

          <button
            onClick={() => alert("Water logged!")}
            className="bg-gradient-to-br from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
          >
            <div className="flex items-center justify-between mb-3">
              <Droplet className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                ↑ 2%
              </span>
            </div>
            <p className="text-white/90 text-sm font-medium">Water Intake</p>
            <p className="text-3xl font-bold mt-2">6.5 L</p>
            <p className="text-white/80 text-xs mt-2">Goal: 8 L</p>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${textClass} mb-6`}>
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => alert("Track your meals!")}
              className="bg-gradient-to-br from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <Apple className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Track Meals</p>
              <p className="text-white/90 text-sm mt-1">Log nutrition</p>
            </button>

            <button
              onClick={() => alert("Find trainers now!")}
              className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Find Trainers</p>
              <p className="text-white/90 text-sm mt-1">Book sessions</p>
            </button>

            <button
              onClick={() => alert("Join the community!")}
              className="bg-gradient-to-br from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <Heart className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Community</p>
              <p className="text-white/90 text-sm mt-1">Connect & share</p>
            </button>

            <button
              onClick={() => alert("View achievements!")}
              className="bg-gradient-to-br from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group"
            >
              <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Achievements</p>
              <p className="text-white/90 text-sm mt-1">View badges</p>
            </button>
          </div>
        </div>

        {/* Daily Streak */}
        <div className={`${cardClass} border rounded-2xl p-6 shadow-lg mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${textClass}`}>Your Progress</h2>
            <span className="text-orange-500 text-sm font-semibold">
              🔥 Keep it up!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 border-l-4 border-orange-500">
              <p className={`${subtextClass} text-sm font-medium`}>
                Current Streak
              </p>
              <p className="text-4xl font-bold text-orange-600 mt-2">12</p>
              <p className={`${subtextClass} text-xs mt-2`}>Days in a row</p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 border-l-4 border-purple-500">
              <p className={`${subtextClass} text-sm font-medium`}>
                Longest Streak
              </p>
              <p className="text-4xl font-bold text-purple-600 mt-2">45</p>
              <p className={`${subtextClass} text-xs mt-2`}>Personal best</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-xl p-4 border-l-4 border-cyan-500">
              <p className={`${subtextClass} text-sm font-medium`}>
                Workouts This Week
              </p>
              <p className="text-4xl font-bold text-cyan-600 mt-2">4/7</p>
              <p className={`${subtextClass} text-xs mt-2`}>3 more to go</p>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className={`${cardClass} border rounded-2xl p-6 shadow-lg mb-8`}>
          <h2 className={`text-xl font-bold ${textClass} mb-6`}>
            Weekly Activity
          </h2>
          <div className="space-y-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, idx) => (
                <div
                  key={day}
                  className="flex items-center justify-between group"
                >
                  <span className={`${subtextClass} font-medium w-12`}>
                    {day}
                  </span>
                  <div className="flex-1 mx-4 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden group-hover:shadow-lg transition-all">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.random() * 100 + 50}%` }}
                    />
                  </div>
                  <span
                    className={`font-bold text-sm w-16 text-right ${textClass}`}
                  >
                    {(Math.random() * 10 + 5) | 0}k
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Latest Posts */}
        <div className={`${cardClass} border rounded-2xl p-6 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${textClass}`}>Community Feed</h2>
            <button
              onClick={() => alert("View all posts!")}
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
            >
              View All →
            </button>
          </div>

          <div className="space-y-6">
            {[
              {
                author: "Sarah Coach",
                time: "2 hours ago",
                content:
                  "New transformation! Check out my 12-week journey. Consistency is key! 💪",
                image: true,
                likes: 124,
                comments: 27,
              },
              {
                author: "Mike fitness",
                time: "4 hours ago",
                content:
                  "Just completed my 50k steps challenge this week! Anyone else pushing their limits?",
                image: false,
                likes: 89,
                comments: 15,
              },
            ].map((post, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl ${darkMode ? "bg-gray-700" : "bg-gray-100"} hover:shadow-md transition-all border ${darkMode ? "border-gray-600" : "border-gray-200"} group cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                      {post.author[0]}
                    </div>
                    <div>
                      <p
                        className={`font-semibold ${textClass} group-hover:text-blue-600 transition-colors`}
                      >
                        {post.author}
                      </p>
                      <p className={`${subtextClass} text-xs`}>{post.time}</p>
                    </div>
                  </div>
                  <button
                    className={`p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors`}
                  >
                    <MoreVertical className={`w-4 h-4 ${subtextClass}`} />
                  </button>
                </div>

                <p className={`${subtextClass} text-sm mb-3`}>{post.content}</p>

                {post.image && (
                  <div
                    className={`w-full h-40 ${darkMode ? "bg-gray-600" : "bg-gray-300"} rounded-lg mb-3 flex items-center justify-center ${subtextClass}`}
                  >
                    [Transformation Photo]
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-gray-300 dark:border-gray-600">
                  <button
                    onClick={() => alert("Liked!")}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group/btn"
                  >
                    <Heart className="w-4 h-4 group-hover/btn:fill-red-500 transition-all" />
                    <span className="text-xs">{post.likes}</span>
                  </button>
                  <button
                    onClick={() => alert("Comment clicked!")}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button
                    onClick={() => alert("Shared!")}
                    className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${cardClass} border-t shadow-lg px-6 py-4`}
      >
        <div className="max-w-6xl mx-auto flex justify-around">
          <button
            onClick={() => alert("Home selected")}
            className="flex flex-col items-center gap-2 p-3 rounded-xl text-blue-600 font-semibold hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => alert("Discover selected")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Discover</span>
          </button>
          <button
            onClick={() => alert("Messages selected")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => alert("Profile selected")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
