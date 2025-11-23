import { Users, Calendar, MessageSquare, TrendingUp, Bell, Settings, MoreVertical, Star } from "lucide-react";
import { useState } from "react";

export default function TrainerDashboardDemo() {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 1200 400%22><defs><pattern id=%22grid%22 width=%2240%22 height=%2240%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 40 0 L 0 0 0 40%22 fill=%22none%22 stroke=%22white%22 stroke-width=%220.5%22/></pattern></defs><rect width=%221200%22 height=%22400%22 fill=%22%23667eea%22/><rect width=%221200%22 height=%22400%22 fill=%22url(%23grid)%22/></svg>')]"></div>
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
              <p className="text-slate-300 font-semibold text-sm">Notifications</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <p className="text-white text-sm font-semibold">New Client Request</p>
                  <p className="text-slate-400 text-xs">John wants to book a session</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <p className="text-white text-sm font-semibold">Session Reminder</p>
                  <p className="text-slate-400 text-xs">Meeting with Jane in 1 hour</p>
                </div>
                <div className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                  <p className="text-white text-sm font-semibold">New Message</p>
                  <p className="text-slate-400 text-xs">From Mike: Thanks for the workout!</p>
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
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg overflow-hidden border-4 border-slate-800 transform hover:scale-105 transition-transform">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-2">
                <h1 className="text-2xl font-bold text-white">Coach Sarah</h1>
                <p className="text-slate-400 text-sm">Certified Personal Trainer</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-white font-semibold">4.9</span>
                    <span className="text-slate-400 text-sm">(48 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* More Options */}
            <button className="p-2 rounded-full hover:bg-slate-700 transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-slate-400 text-sm">Active Clients</p>
              <p className="text-2xl font-bold text-white mt-1">12</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm">Sessions/Month</p>
              <p className="text-2xl font-bold text-white mt-1">45</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm">Earnings</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">$2.6K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        {/* Quick Action Tiles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* View Clients */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 transition-all transform hover:scale-105 active:scale-95">
              <Users className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">View Clients</p>
              <p className="text-blue-300 text-sm mt-1">Manage team</p>
            </button>

            {/* Schedule Session */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 transition-all transform hover:scale-105 active:scale-95">
              <Calendar className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Schedule</p>
              <p className="text-purple-300 text-sm mt-1">New session</p>
            </button>

            {/* Messages */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/30 hover:border-green-500/50 transition-all transform hover:scale-105 active:scale-95">
              <MessageSquare className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Messages</p>
              <p className="text-green-300 text-sm mt-1">Chat clients</p>
            </button>

            {/* Analytics */}
            <button className="group p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 hover:border-orange-500/50 transition-all transform hover:scale-105 active:scale-95">
              <TrendingUp className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-white">Analytics</p>
              <p className="text-orange-300 text-sm mt-1">View stats</p>
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Upcoming Sessions</h2>
          <div className="space-y-3">
            {[
              { client: "John Doe", time: "Today - 3:00 PM", duration: "1 hour", status: "confirmed" },
              { client: "Jane Smith", time: "Today - 5:00 PM", duration: "1 hour", status: "confirmed" },
              { client: "Mike Johnson", time: "Tomorrow - 10:00 AM", duration: "1.5 hours", status: "pending" },
            ].map((session, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors border border-slate-600/30 group cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">{session.client}</p>
                  <p className="text-slate-400 text-sm">{session.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-sm font-medium">{session.duration}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                      session.status === "confirmed"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Top Performing Clients</h2>
          <div className="space-y-3">
            {[
              { name: "Alex Turner", progress: 85, goal: "Weight Loss" },
              { name: "Emma Wilson", progress: 72, goal: "Muscle Gain" },
              { name: "Chris Lee", progress: 65, goal: "Endurance" },
            ].map((client, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">{client.name}</p>
                  <p className="text-orange-400 font-bold">{client.progress}%</p>
                </div>
                <p className="text-slate-400 text-sm mb-2">{client.goal}</p>
                <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-around">
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <Users className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Schedule</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-orange-400">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Analytics</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
}
