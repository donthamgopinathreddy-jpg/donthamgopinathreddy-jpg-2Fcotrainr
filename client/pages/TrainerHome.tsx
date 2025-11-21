import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Users, TrendingUp, Star, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Client {
  id: string;
  full_name: string;
  email: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  created_at: string;
}

interface TrainerStats {
  total_clients: number;
  total_sessions: number;
  average_rating: number;
}

export default function TrainerHome() {
  const { userProfile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<TrainerStats>({
    total_clients: 0,
    total_sessions: 0,
    average_rating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchTrainerData();
    }
  }, [userProfile?.id]);

  const fetchTrainerData = async () => {
    if (!userProfile?.id) return;

    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("trainer_clients")
        .select(
          "client_id, users!inner(id, full_name, email, gender, height_cm, weight_kg, created_at)",
        )
        .eq("trainer_id", userProfile.id)
        .eq("status", "active");

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
      } else if (clientsData) {
        const formattedClients = clientsData.map((item: any) => ({
          id: item.users.id,
          full_name: item.users.full_name,
          email: item.users.email,
          gender: item.users.gender,
          height_cm: item.users.height_cm,
          weight_kg: item.users.weight_kg,
          created_at: item.users.created_at,
        }));
        setClients(formattedClients);
        setStats((prev) => ({
          ...prev,
          total_clients: formattedClients.length,
        }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {userProfile?.full_name || "Trainer"}!
          </h1>
          <p className="text-gray-600">
            Manage your clients and track your progress
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {stats.total_clients}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sessions</p>
                <p className="text-4xl font-bold text-indigo-600 mt-2">
                  {stats.total_sessions}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-indigo-200" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {stats.average_rating.toFixed(1)}
                </p>
              </div>
              <Star className="w-12 h-12 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Clients
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No active clients yet</p>
              <p className="text-gray-500 text-sm">
                Start building your client base
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Height
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {client.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {client.gender || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.height_cm ? `${client.height_cm}cm` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {client.weight_kg ? `${client.weight_kg}kg` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(client.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Trainer Profile Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bio
              </label>
              <textarea
                defaultValue="Add your professional bio here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Specialties
              </label>
              <input
                type="text"
                defaultValue="Fitness, Strength Training"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              />
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hourly Rate ($)
              </label>
              <input
                type="number"
                defaultValue="50"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg w-full transition">
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
