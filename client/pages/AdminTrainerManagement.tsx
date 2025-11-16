import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Star,
  TrendingUp,
  Users,
  Loader,
  Award,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Trainer {
  id: string;
  full_name: string;
  email: string;
  verified_trainer: boolean;
  verification_status: string;
  created_at: string;
}

const AdminTrainerManagement: React.FC = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, verified_trainer, created_at")
        .eq("role", "trainer")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const trainersWithStatus = (data || []).map((t: any) => ({
        ...t,
        verification_status: t.verified_trainer ? "verified" : "pending",
      }));

      setTrainers(trainersWithStatus);
    } catch (err) {
      console.error("Error fetching trainers:", err);
      toast({
        title: "Error",
        description: "Failed to fetch trainers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return <div>Please log in</div>;
  }

  const verifiedCount = trainers.filter((t) => t.verified_trainer).length;
  const pendingCount = trainers.filter((t) => !t.verified_trainer).length;

  return (
    <AdminLayout
      title="Trainer Management"
      description="Manage and monitor all trainers on the platform"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-semibold uppercase">
                Total Trainers
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {trainers.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-semibold uppercase">
                Verified
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {verifiedCount}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-60" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 backdrop-blur-md border border-white/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-semibold uppercase">
                Pending
              </p>
              <p className="text-3xl font-bold text-amber-900 mt-2">
                {pendingCount}
              </p>
            </div>
            <Clock className="w-12 h-12 text-amber-500 opacity-60" />
          </div>
        </div>
      </div>

      {/* Trainers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : trainers.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No trainers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer) => (
                  <tr
                    key={trainer.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {trainer.full_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{trainer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          trainer.verified_trainer
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {trainer.verified_trainer ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {new Date(trainer.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTrainerManagement;
