import {
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Shield,
  Settings,
  Search,
  Filter,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboardDemo() {
  const [darkMode, setDarkMode] = useState(false);

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const textClass = darkMode ? "text-white" : "text-gray-900";
  const cardClass = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const subtextClass = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${cardClass} border-b sticky top-0 z-50 shadow-md`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className={`text-3xl font-bold ${textClass}`}>
              Admin Dashboard
            </h1>
            <div className="flex gap-4">
              <div className="relative hidden sm:block">
                <Search
                  className={`absolute left-3 top-3 w-5 h-5 ${subtextClass}`}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  className={`pl-10 pr-4 py-2 rounded-lg ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                />
              </div>
              <button
                onClick={() => alert("Settings opened!")}
                className={`p-2 rounded-lg hover:${darkMode ? "bg-gray-700" : "bg-gray-200"} transition-colors`}
              >
                <Settings className={`w-6 h-6 ${subtextClass}`} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg hover:${darkMode ? "bg-gray-700" : "bg-gray-200"} transition-colors`}
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => alert("Total users: 1,243")}
            className={`${cardClass} border rounded-2xl p-6 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-left group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                ↑ 12%
              </span>
            </div>
            <p className={`${subtextClass} text-sm font-medium`}>Total Users</p>
            <p className={`text-3xl font-bold ${textClass} mt-2`}>1,243</p>
            <p className={`${subtextClass} text-xs mt-2`}>+124 this month</p>
          </button>

          <button
            onClick={() => alert("23 trainers pending verification")}
            className={`${cardClass} border rounded-2xl p-6 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-left group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-orange-600 text-sm font-semibold bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded-full">
                ⚠ 23
              </span>
            </div>
            <p className={`${subtextClass} text-sm font-medium`}>
              Active Trainers
            </p>
            <p className={`text-3xl font-bold ${textClass} mt-2`}>87</p>
            <p className={`${subtextClass} text-xs mt-2`}>
              23 pending verification
            </p>
          </button>

          <button
            onClick={() => alert("Platform revenue: $28.4K")}
            className={`${cardClass} border rounded-2xl p-6 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-left group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                ↑ 8%
              </span>
            </div>
            <p className={`${subtextClass} text-sm font-medium`}>
              Platform Revenue
            </p>
            <p className={`text-3xl font-bold ${textClass} mt-2`}>$28.4K</p>
            <p className={`${subtextClass} text-xs mt-2`}>+$2.2K this week</p>
          </button>

          <button
            onClick={() => alert("3 critical issues to review")}
            className={`${cardClass} border rounded-2xl p-6 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-left group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-red-600 text-sm font-semibold bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full">
                Critical
              </span>
            </div>
            <p className={`${subtextClass} text-sm font-medium`}>
              Issues Reported
            </p>
            <p className={`text-3xl font-bold ${textClass} mt-2`}>3</p>
            <p className={`${subtextClass} text-xs mt-2`}>2 high priority</p>
          </button>
        </div>

        {/* User Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div
            className={`lg:col-span-2 ${cardClass} border rounded-2xl p-6 shadow-lg`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${textClass}`}>
                Recent User Activity
              </h2>
              <button
                onClick={() => alert("Filters applied")}
                className={`p-2 rounded-lg hover:${darkMode ? "bg-gray-700" : "bg-gray-200"} transition-colors`}
              >
                <Filter className={`w-5 h-5 ${subtextClass}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                  >
                    <th
                      className={`text-left py-4 px-0 ${subtextClass} font-semibold text-sm`}
                    >
                      User
                    </th>
                    <th
                      className={`text-left py-4 px-0 ${subtextClass} font-semibold text-sm`}
                    >
                      Role
                    </th>
                    <th
                      className={`text-left py-4 px-0 ${subtextClass} font-semibold text-sm`}
                    >
                      Status
                    </th>
                    <th
                      className={`text-left py-4 px-0 ${subtextClass} font-semibold text-sm`}
                    >
                      Joined
                    </th>
                    <th
                      className={`text-left py-4 px-0 ${subtextClass} font-semibold text-sm`}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {[
                    {
                      email: "john@example.com",
                      role: "Client",
                      status: "Active",
                      joined: "2 days ago",
                    },
                    {
                      email: "coach@example.com",
                      role: "Trainer",
                      status: "Verified",
                      joined: "1 week ago",
                    },
                    {
                      email: "jane@example.com",
                      role: "Client",
                      status: "Active",
                      joined: "3 days ago",
                    },
                    {
                      email: "trainer2@example.com",
                      role: "Trainer",
                      status: "Pending",
                      joined: "5 hours ago",
                    },
                  ].map((user, idx) => (
                    <tr
                      key={idx}
                      className={`hover:${darkMode ? "bg-gray-700" : "bg-gray-100"} transition-colors`}
                    >
                      <td className="py-4 px-0">
                        <div>
                          <p className={`font-medium ${textClass}`}>
                            {user.email.split("@")[0]}
                          </p>
                          <p className={`${subtextClass} text-xs`}>
                            {user.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-0">
                        <span className={textClass}>{user.role}</span>
                      </td>
                      <td className="py-4 px-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "Verified"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-0">
                        <p className={`${subtextClass} text-sm`}>
                          {user.joined}
                        </p>
                      </td>
                      <td className="py-4 px-0">
                        <button
                          onClick={() => alert(`Managing ${user.email}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Actions Sidebar */}
          <div
            className={`${cardClass} border rounded-2xl p-6 shadow-lg h-fit`}
          >
            <h2 className={`text-xl font-bold ${textClass} mb-6`}>
              Admin Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => alert("Managing users...")}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <Users className="w-5 h-5" />
                Manage Users
              </button>
              <button
                onClick={() => alert("Verifying trainers...")}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <UserCheck className="w-5 h-5" />
                Verify Trainers
              </button>
              <button
                onClick={() => alert("Reviewing reports...")}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <AlertCircle className="w-5 h-5" />
                Review Reports
              </button>
              <button
                onClick={() => alert("Viewing analytics...")}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className={`${cardClass} border rounded-2xl p-6 shadow-lg mt-8`}>
          <h2 className={`text-xl font-bold ${textClass} mb-6`}>
            System Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => alert("Server status: All systems operational")}
              className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"} border ${darkMode ? "border-gray-600" : "border-gray-200"} cursor-pointer`}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-left">
                <p className={`${subtextClass} text-sm`}>Server Status</p>
                <p className={`${textClass} font-semibold`}>
                  All Systems Operational
                </p>
              </div>
            </button>
            <button
              onClick={() => alert("Database health: 99.9% uptime")}
              className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"} border ${darkMode ? "border-gray-600" : "border-gray-200"} cursor-pointer`}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-left">
                <p className={`${subtextClass} text-sm`}>Database Health</p>
                <p className={`${textClass} font-semibold`}>99.9% Uptime</p>
              </div>
            </button>
            <button
              onClick={() => alert("API response: 145ms average")}
              className={`flex items-center gap-4 p-4 rounded-xl ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors ${darkMode ? "bg-gray-700" : "bg-gray-100"} border ${darkMode ? "border-gray-600" : "border-gray-200"} cursor-pointer`}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="text-left">
                <p className={`${subtextClass} text-sm`}>API Response Time</p>
                <p className={`${textClass} font-semibold`}>145ms Average</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${cardClass} border-t shadow-lg px-6 py-4`}
      >
        <div className="max-w-7xl mx-auto flex justify-around">
          <button
            onClick={() => alert("Overview")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">Overview</span>
          </button>
          <button
            onClick={() => alert("Users")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">Users</span>
          </button>
          <button
            onClick={() => alert("Security")}
            className="flex flex-col items-center gap-2 p-3 rounded-xl text-blue-600 font-semibold hover:bg-blue-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Shield className="w-6 h-6" />
            <span className="text-xs">Security</span>
          </button>
          <button
            onClick={() => alert("Settings")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl ${subtextClass} font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
