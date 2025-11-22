import { Users, TrendingUp, Star, Calendar, Clock, MessageSquare } from "lucide-react";

export default function TrainerDashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, Coach Sarah! 💪</h1>
          <p className="text-gray-600">Manage your clients and track their progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              </div>
              <Users className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
            <p className="text-blue-600 text-sm mt-2">↑ 2 new this month</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Sessions This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">18</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">6 hours scheduled</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rating</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4.9/5</p>
              </div>
              <Star className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
            <p className="text-gray-600 text-sm mt-2">Based on 48 reviews</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">$2,640</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500 opacity-20" />
            </div>
            <p className="text-green-600 text-sm mt-2">↑ 15% from last month</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client List */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Clients</h2>
            <div className="space-y-4">
              {[
                { name: "John Doe", progress: 75, nextSession: "Today at 5:00 PM" },
                { name: "Jane Smith", progress: 60, nextSession: "Tomorrow at 10:00 AM" },
                { name: "Mike Johnson", progress: 85, nextSession: "Friday at 6:00 PM" },
                { name: "Emily Brown", progress: 45, nextSession: "Saturday at 9:00 AM" },
              ].map((client, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        {client.nextSession}
                      </p>
                    </div>
                    <MessageSquare className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full"
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">{client.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Session
              </button>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message Client
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Update Progress
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>
          <div className="space-y-3">
            {[
              { time: "Today - 3:00 PM", client: "John Doe", duration: "1 hour", status: "confirmed" },
              { time: "Today - 5:00 PM", client: "Jane Smith", duration: "1 hour", status: "confirmed" },
              { time: "Tomorrow - 10:00 AM", client: "Mike Johnson", duration: "1.5 hours", status: "pending" },
            ].map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div>
                  <p className="font-semibold text-gray-900">{session.client}</p>
                  <p className="text-sm text-gray-600 mt-1">{session.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">{session.duration}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                    session.status === 'confirmed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
