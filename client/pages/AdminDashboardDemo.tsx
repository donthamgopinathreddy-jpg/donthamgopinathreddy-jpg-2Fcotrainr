import { Users, UserCheck, AlertCircle, TrendingUp, BarChart3, Shield } from "lucide-react";

export default function AdminDashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard 🔐</h1>
          <p className="text-gray-600">System Overview and Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1,243</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">↑ 124 new this month</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Trainers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">87</p>
              </div>
              <UserCheck className="w-12 h-12 text-green-500 opacity-20" />
            </div>
            <p className="text-blue-600 text-sm mt-2">23 pending verification</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Issues Reported</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
            <p className="text-red-600 text-sm mt-2">3 critical issues</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Platform Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$28.4K</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">↑ 32% from last month</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent User Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-gray-600 font-semibold py-3 px-0">User</th>
                    <th className="text-left text-gray-600 font-semibold py-3 px-0">Role</th>
                    <th className="text-left text-gray-600 font-semibold py-3 px-0">Status</th>
                    <th className="text-left text-gray-600 font-semibold py-3 px-0">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { email: "john@example.com", role: "Client", status: "Active", joined: "2 days ago" },
                    { email: "coach@example.com", role: "Trainer", status: "Verified", joined: "1 week ago" },
                    { email: "jane@example.com", role: "Client", status: "Active", joined: "3 days ago" },
                    { email: "trainer2@example.com", role: "Trainer", status: "Pending", joined: "5 hours ago" },
                  ].map((user, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-0 text-gray-900 font-medium">{user.email}</td>
                      <td className="py-3 px-0 text-gray-600">{user.role}</td>
                      <td className="py-3 px-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Active' ? 'bg-green-100 text-green-700' :
                          user.status === 'Verified' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-0 text-gray-600">{user.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Admin Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Manage Users
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <UserCheck className="w-5 h-5" />
                Verify Trainers
              </button>
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Review Reports
              </button>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-3">Server Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-900 font-semibold">All Systems Operational</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-3">Database Health</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-900 font-semibold">Normal - 99.9% Uptime</span>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium mb-3">API Response Time</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-900 font-semibold">Fast - 145ms Average</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
