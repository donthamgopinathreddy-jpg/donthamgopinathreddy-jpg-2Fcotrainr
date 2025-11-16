import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, Bell, Users, CheckCircle } from "lucide-react";

const AdminCommunication: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [title, setTitle] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      // Simulated send notification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: `Notification sent to ${recipientType === "all" ? "all users" : recipientType}`,
        variant: "default",
      });

      setTitle("");
      setMessage("");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  return (
    <AdminLayout
      title="Communication Center"
      description="Send notifications and messages to users"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Send Notification
            </h3>

            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter notification title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Send To
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">All Users</option>
                  <option value="trainers">Trainers Only</option>
                  <option value="clients">Clients Only</option>
                </select>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {sending ? "Sending..." : "Send Notification"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-gray-900">
                Notification Stats
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Last Sent:</span> 2 hours ago
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Total Sent:</span> 142
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Tips
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                Keep messages concise and clear
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                Use relevant recipient groups
              </li>
              <li className="flex gap-2">
                <span className="text-purple-600">•</span>
                Test before mass sending
              </li>
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recent Activity
            </h4>
            <div className="space-y-3 text-sm">
              <div className="pb-3 border-b border-gray-200">
                <p className="font-medium text-gray-900">Welcome Message</p>
                <p className="text-gray-500 text-xs">2 hours ago</p>
              </div>
              <div className="pb-3 border-b border-gray-200">
                <p className="font-medium text-gray-900">System Update</p>
                <p className="text-gray-500 text-xs">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunication;
