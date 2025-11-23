import { Users, Calendar, MessageSquare, TrendingUp, Bell, Settings, MoreVertical, Star, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function TrainerDashboardDemo() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const cardClass = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const subtextClass = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 overflow-hidden shadow-lg">
        {/* Notification Bell - Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-3 rounded-full bg-white hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg"
          >
            <Bell className="w-6 h-6 text-purple-600" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute top-16 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 space-y-3 z-50">
              <p className="text-gray-900 font-semibold text-sm">Notifications</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div onClick={() => alert("New client request!")} className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <p className="text-gray-900 text-sm font-semibold">New Client Request</p>
                  <p className="text-gray-600 text-xs">John wants to book a session</p>
                </div>
                <div onClick={() => alert("Session reminder!")} className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <p className="text-gray-900 text-sm font-semibold">Session Reminder</p>
                  <p className="text-gray-600 text-xs">Meeting with Jane in 1 hour</p>
                </div>
                <div onClick={() => alert("New message!")} className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <p className="text-gray-900 text-sm font-semibold">New Message</p>
                  <p className="text-gray-600 text-xs">From Mike: Thanks for the workout!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Icon - Top Right */}
        <div className="absolute top-6 right-6">
          <button className="p-3 rounded-full bg-white hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg">
            <Settings className="w-6 h-6 text-purple-600" />
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
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg overflow-hidden border-4 border-white transform hover:scale-105 transition-transform">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-2">
                <h1 className={`text-2xl font-bold ${textClass}`}>Coach Sarah</h1>
                <p className={`${subtextClass} text-sm`}>Certified Personal Trainer</p>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className={`font-semibold ${textClass}`}>4.9</span>
                    <span className={`${subtextClass} text-xs`}>(48 reviews)</span>
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

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className={`${subtextClass} text-sm`}>Active Clients</p>
              <p className={`text-2xl font-bold ${textClass} mt-1`}>12</p>
            </div>
            <div className="text-center">
              <p className={`${subtextClass} text-sm`}>Sessions/Month</p>
              <p className={`text-2xl font-bold ${textClass} mt-1`}>45</p>
            </div>
            <div className="text-center">
              <p className={`${subtextClass} text-sm`}>Earnings</p>
              <p className="text-2xl font-bold text-green-600 mt-1">$2.6K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        {/* Quick Action Tiles */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${textClass} mb-6`}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => alert("View your clients!")} className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group">
              <Users className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">View Clients</p>
              <p className="text-white/90 text-sm mt-1">Manage team</p>
            </button>

            <button onClick={() => alert("Schedule a session!")} className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group">
              <Calendar className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Schedule</p>
              <p className="text-white/90 text-sm mt-1">New session</p>
            </button>

            <button onClick={() => alert("Check your messages!")} className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group">
              <MessageSquare className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Messages</p>
              <p className="text-white/90 text-sm mt-1">Chat clients</p>
            </button>

            <button onClick={() => alert("View analytics!")} className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 text-white group">
              <TrendingUp className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">Analytics</p>
              <p className="text-white/90 text-sm mt-1">View stats</p>
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className={`${cardClass} border rounded-2xl p-6 shadow-xl mb-8`}>
          <h2 className={`text-xl font-bold ${textClass} mb-6`}>Upcoming Sessions</h2>
          <div className="space-y-3">
            {[
              { client: "John Doe", time: "Today - 3:00 PM", duration: "1 hour", status: "confirmed" },
              { client: "Jane Smith", time: "Today - 5:00 PM", duration: "1 hour", status: "confirmed" },
              { client: "Mike Johnson", time: "Tomorrow - 10:00 AM", duration: "1.5 hours", status: "pending" },
            ].map((session, idx) => (
              <button
                key={idx}
                onClick={() => alert(`Session with ${session.client}!`)}
                className={`w-full flex items-center justify-between p-4 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"} border ${darkMode ? "border-gray-600" : "border-gray-200"} group cursor-pointer`}
              >
                <div className="flex-1 text-left">
                  <p className={`font-semibold ${textClass} group-hover:text-purple-600 transition-colors`}>{session.client}</p>
                  <p className={`${subtextClass} text-sm`}>{session.time}</p>
                </div>
                <div className="text-right">
                  <p className={`${textClass} text-sm font-medium`}>{session.duration}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                      session.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className={`${cardClass} border rounded-2xl p-6 shadow-xl`}>
          <h2 className={`text-xl font-bold ${textClass} mb-6`}>Top Performing Clients</h2>
          <div className="space-y-3">
            {[
              { name: "Alex Turner", progress: 85, goal: "Weight Loss" },
              { name: "Emma Wilson", progress: 72, goal: "Muscle Gain" },
              { name: "Chris Lee", progress: 65, goal: "Endurance" },
            ].map((client, idx) => (
              <button
                key={idx}
                onClick={() => alert(`View ${client.name}'s progress!`)}
                className={`w-full p-4 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"} group cursor-pointer text-left`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`font-semibold ${textClass} group-hover:text-purple-600 transition-colors`}>{client.name}</p>
                  <p className="font-bold text-purple-600">{client.progress}%</p>
                </div>
                <p className={`${subtextClass} text-sm mb-2`}>{client.goal}</p>
                <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${client.progress}%` }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 ${cardClass} border-t shadow-lg px-6 py-4`}>
        <div className="max-w-6xl mx-auto flex justify-around">
          <button onClick={() => alert("Home")} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}>
            <Users className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => alert("Schedule")} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}>
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Schedule</span>
          </button>
          <button onClick={() => alert("Analytics")} className="flex flex-col items-center gap-2 p-3 rounded-xl text-purple-600 font-semibold hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Analytics</span>
          </button>
          <button onClick={() => alert("Messages")} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}>
            <MessageSquare className="w-6 h-6" />
            <span className="text-xs">Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
}
