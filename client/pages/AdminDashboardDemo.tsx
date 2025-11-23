import { Users, UserCheck, AlertCircle, TrendingUp, BarChart3, Shield, Settings, Search, Filter } from "lucide-react";

export default function AdminDashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex gap-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <Settings className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-20">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold">↑ 12%</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Users</p>
            <p className="text-3xl font-bold text-white mt-2">1,243</p>
            <p className="text-slate-500 text-xs mt-2">+124 this month</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-green-500/50 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-orange-400 text-sm font-semibold">⚠ 23</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Active Trainers</p>
            <p className="text-3xl font-bold text-white mt-2">87</p>
            <p className="text-slate-500 text-xs mt-2">23 pending verification</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-orange-500/50 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-green-400 text-sm font-semibold">↑ 8%</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Platform Revenue</p>
            <p className="text-3xl font-bold text-white mt-2">$28.4K</p>
            <p className="text-slate-500 text-xs mt-2">+$2.2K this week</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-red-500/50 transition-all group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-red-400 text-sm font-semibold">Critical</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Issues Reported</p>
            <p className="text-3xl font-bold text-white mt-2">3</p>
            <p className="text-slate-500 text-xs mt-2">2 high priority</p>
          </div>
        </div>

        {/* User Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent User Activity</h2>
              <button className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
                <Filter className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-0 text-slate-400 font-semibold text-sm">User</th>
                    <th className="text-left py-4 px-0 text-slate-400 font-semibold text-sm">Role</th>
                    <th className="text-left py-4 px-0 text-slate-400 font-semibold text-sm">Status</th>
                    <th className="text-left py-4 px-0 text-slate-400 font-semibold text-sm">Joined</th>
                    <th className="text-left py-4 px-0 text-slate-400 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {[
                    { email: "john@example.com", role: "Client", status: "Active", joined: "2 days ago" },
                    { email: "coach@example.com", role: "Trainer", status: "Verified", joined: "1 week ago" },
                    { email: "jane@example.com", role: "Client", status: "Active", joined: "3 days ago" },
                    { email: "trainer2@example.com", role: "Trainer", status: "Pending", joined: "5 hours ago" },
                  ].map((user, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-0">
                        <div>
                          <p className="text-white font-medium">{user.email.split("@")[0]}</p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-0">
                        <span className="text-slate-300 text-sm">{user.role}</span>
                      </td>
                      <td className="py-4 px-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.status === "Active"
                              ? "bg-green-500/20 text-green-400 border border-green-500/30"
                              : user.status === "Verified"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-0">
                        <p className="text-slate-400 text-sm">{user.joined}</p>
                      </td>
                      <td className="py-4 px-0">
                        <button className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors">
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
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Admin Actions</h2>
            <div className="space-y-3">
              <button className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Manage Users
              </button>
              <button className="w-full p-3 rounded-xl bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/30 hover:border-green-500/50 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5" />
                Verify Trainers
              </button>
              <button className="w-full p-3 rounded-xl bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 hover:border-red-500/50 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Review Reports
              </button>
              <button className="w-full p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 hover:border-orange-500/50 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl mt-8">
          <h2 className="text-xl font-bold text-white mb-6">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-slate-400 text-sm">Server Status</p>
                <p className="text-white font-semibold">All Systems Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-slate-400 text-sm">Database Health</p>
                <p className="text-white font-semibold">99.9% Uptime</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/20 hover:bg-slate-700/30 transition-colors">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-slate-400 text-sm">API Response Time</p>
                <p className="text-white font-semibold">145ms Average</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-xl border-t border-slate-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-around">
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">Overview</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <Users className="w-6 h-6" />
            <span className="text-xs">Users</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-orange-400">
            <Shield className="w-6 h-6" />
            <span className="text-xs">Security</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-3 rounded-xl text-slate-400 hover:text-orange-400 transition-colors">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
