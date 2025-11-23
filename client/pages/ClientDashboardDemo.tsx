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
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

export default function ClientDashboardDemo() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 400%22><defs><pattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22white%22 stroke-width=%220.5%22/></pattern></defs><rect width=%221200%22 height=%22400%22 fill=%22%230ea5e9%22/><rect width=%221200%22 height=%22400%22 fill=%22url(%23grid)%22/></svg>')]"></div>
        </div>

        {/* Notification Bell - Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all transform hover:scale-110"
          >
            <Bell className="w-6 h-6 text-white" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute top-16 left-0 w-80 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <p className="text-slate-300 font-semibold text-sm">
                Notifications
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <p className="text-white text-sm font-semibold">
                    Coach Sarah approved your booking
                  </p>
                  <p className="text-slate-400 text-xs">
                    Session tomorrow at 10 AM
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <p className="text-white text-sm font-semibold">
                    You unlocked an achievement!
                  </p>
                  <p className="text-slate-400 text-xs">
                    Week Warrior - 7 day streak
                  </p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <p className="text-white text-sm font-semibold">
                    New message from Coach
                  </p>
                  <p className="text-slate-400 text-xs">
                    Great workout session today!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon - Top Right */}
        <div className="absolute top-6 right-6">
          <button className="p-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all transform hover:scale-110">
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative -mt-20 mx-6 mb-8">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-start flex-1">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg overflow-hidden border-4 border-slate-800 transform hover:scale-105 transition-transform">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-2">
                <h1 className="text-2xl font-bold text-white">Alex Turner</h1>
                <p className="text-slate-400 text-sm">Fitness Enthusiast</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="text-white font-semibold">72</span>
                    <span className="text-slate-400 text-xs">Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-white font-semibold">12</span>
                    <span className="text-slate-400 text-xs">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* More Options */}
            <button className="p-2 rounded-full hover:bg-slate-700 transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        {/* Today's Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 hover:border-orange-500/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-orange-500/20 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-green-400 text-sm font-semibold">
                ↑ 12%
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Today's Steps</p>
            <p className="text-3xl font-bold text-white mt-2">8,542</p>
            <p className="text-orange-400 text-xs mt-2">Goal: 10,000</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 hover:border-red-500/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-red-500/20 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-green-400 text-sm font-semibold">↑ 8%</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Calories Burned
            </p>
            <p className="text-3xl font-bold text-white mt-2">542 kcal</p>
            <p className="text-red-400 text-xs mt-2">Goal: 600 kcal</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-2xl p-6 hover:shadow-lg hover:shadow-cyan-500/20 transition-all group cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <Droplet className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-green-400 text-sm font-semibold">↑ 2%</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Water Intake</p>
            <p className="text-3xl font-bold text-white mt-2">6.5 L</p>
            <p className="text-cyan-400 text-xs mt-2">Goal: 8 L</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Track Meals */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 hover:border-orange-500/50 transition-all transform hover:scale-105 active:scale-95">
              <Apple className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Track Meals</p>
              <p className="text-orange-300 text-sm mt-1">Log nutrition</p>
            </button>

            {/* Find Trainers */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 transition-all transform hover:scale-105 active:scale-95">
              <TrendingUp className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Find Trainers</p>
              <p className="text-purple-300 text-sm mt-1">Book sessions</p>
            </button>

            {/* Community */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 hover:from-pink-500/30 hover:to-pink-600/30 border border-pink-500/30 hover:border-pink-500/50 transition-all transform hover:scale-105 active:scale-95">
              <Heart className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Community</p>
              <p className="text-pink-300 text-sm mt-1">Connect & share</p>
            </button>

            {/* Achievements */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 border border-yellow-500/30 hover:border-yellow-500/50 transition-all transform hover:scale-105 active:scale-95">
              <TrendingUp className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Achievements</p>
              <p className="text-yellow-300 text-sm mt-1">View badges</p>
            </button>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Your Progress</h2>
            <span className="text-orange-400 text-sm font-semibold">
              🔥 Keep it up!
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">
                Current Streak
              </p>
              <p className="text-4xl font-bold text-orange-400 mt-2">12</p>
              <p className="text-slate-400 text-xs mt-2">Days in a row</p>
            </div>

            {/* Longest Streak */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">
                Longest Streak
              </p>
              <p className="text-4xl font-bold text-purple-400 mt-2">45</p>
              <p className="text-slate-400 text-xs mt-2">Personal best</p>
            </div>

            {/* This Week */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 rounded-xl p-4">
              <p className="text-slate-400 text-sm font-medium">
                Workouts This Week
              </p>
              <p className="text-4xl font-bold text-cyan-400 mt-2">4/7</p>
              <p className="text-slate-400 text-xs mt-2">3 more to go</p>
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Weekly Activity</h2>
          <div className="space-y-4">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, idx) => (
                <div
                  key={day}
                  className="flex items-center justify-between group"
                >
                  <span className="text-slate-400 font-medium w-12">{day}</span>
                  <div className="flex-1 mx-4 bg-slate-700/30 rounded-full h-3 overflow-hidden group-hover:bg-slate-700/50 transition-colors">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all"
                      style={{ width: `${Math.random() * 100 + 50}%` }}
                    />
                  </div>
                  <span className="text-slate-300 font-bold text-sm w-16 text-right">
                    {(Math.random() * 10 + 5) | 0}k steps
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Latest Posts */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Community Feed</h2>
            <button className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
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
                className="p-4 rounded-xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors border border-slate-600/30 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                      {post.author[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {post.author}
                      </p>
                      <p className="text-slate-400 text-xs">{post.time}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-slate-600 transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                <p className="text-slate-300 text-sm mb-3">{post.content}</p>

                {post.image && (
                  <div className="w-full h-40 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg mb-3 flex items-center justify-center text-slate-400">
                    [Transformation Photo]
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-slate-600/30">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors group/btn">
                    <Heart className="w-4 h-4 group-hover/btn:fill-red-400 transition-all" />
                    <span className="text-xs">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-around">
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-orange-400">
            <Activity className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Discover</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <Heart className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
