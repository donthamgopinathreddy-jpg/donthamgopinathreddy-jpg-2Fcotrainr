import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Share2, Trash2, Edit2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDietPlans } from "@/hooks/useDietPlans";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Client {
  id: string;
  full_name: string;
  username: string;
  profile_picture_url?: string;
}

export default function DietPlans() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { dietPlans, createDietPlan, shareDietPlan, deleteDietPlan } =
    useDietPlans();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    description: "",
    duration_days: "30",
    meals_per_day: "3",
    target_calories: "2000",
    macros_protein_g: "150",
    macros_carbs_g: "250",
    macros_fat_g: "65",
    notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, full_name, username, profile_picture_url")
          .eq("role", "client");

        if (!error && data) {
          setClients(data as Client[]);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };

    fetchClients();
  }, []);

  const handleCreatePlan = async () => {
    if (!formData.clientId || !formData.name) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSaving(true);
    try {
      const plan = await createDietPlan(formData.clientId, {
        name: formData.name,
        description: formData.description,
        duration_days: parseInt(formData.duration_days),
        meals_per_day: parseInt(formData.meals_per_day),
        target_calories: parseInt(formData.target_calories),
        macros_protein_g: parseInt(formData.macros_protein_g),
        macros_carbs_g: parseInt(formData.macros_carbs_g),
        macros_fat_g: parseInt(formData.macros_fat_g),
        notes: formData.notes,
        status: "active" as const,
      });

      if (plan) {
        toast.success("Diet plan created!");
        setShowCreateModal(false);
        setFormData({
          clientId: "",
          name: "",
          description: "",
          duration_days: "30",
          meals_per_day: "3",
          target_calories: "2000",
          macros_protein_g: "150",
          macros_carbs_g: "250",
          macros_fat_g: "65",
          notes: "",
        });
      }
    } catch (error) {
      toast.error("Failed to create diet plan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSharePlan = async (planId: string) => {
    const success = await shareDietPlan(planId);
    if (success) {
      toast.success("Diet plan shared with client!");
    } else {
      toast.error("Failed to share diet plan");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Delete this diet plan?")) return;
    const success = await deleteDietPlan(planId);
    if (success) {
      toast.success("Diet plan deleted");
    } else {
      toast.error("Failed to delete diet plan");
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.full_name || "Client";
  };

  return (
    <div
      className={`min-h-screen pb-20 ${
        theme === "dark"
          ? "bg-gray-900"
          : "bg-gradient-to-br from-white to-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          theme === "dark"
            ? "bg-gray-800/80 border-gray-700/50"
            : "bg-white/80 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-lg transition-colors ${
                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              🥗 Diet Plans
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>
      </div>

      {/* Diet Plans List */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {dietPlans.length === 0 ? (
          <div
            className={`rounded-lg border-2 border-dashed ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800/50"
                : "border-gray-300 bg-gray-50"
            } p-8 text-center`}
          >
            <p
              className={`text-lg font-semibold mb-2 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              No diet plans yet
            </p>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
              Create a personalized diet plan for your clients
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {dietPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border ${
                  theme === "dark"
                    ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50"
                    : "bg-white border-gray-200 hover:shadow-md"
                } p-6 transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3
                      className={`font-bold text-lg ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      For: {getClientName(plan.client_id)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.shared_at
                        ? "bg-green-500/20 text-green-600"
                        : "bg-yellow-500/20 text-yellow-600"
                    }`}
                  >
                    {plan.shared_at ? "Shared" : "Draft"}
                  </span>
                </div>

                {plan.description && (
                  <p
                    className={`text-sm mb-4 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className={`rounded p-3 ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Duration
                    </p>
                    <p className="font-semibold text-orange-500">
                      {plan.duration_days} days
                    </p>
                  </div>
                  <div
                    className={`rounded p-3 ${
                      theme === "dark" ? "bg-gray-700/50" : "bg-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Target Calories
                    </p>
                    <p className="font-semibold text-orange-500">
                      {plan.target_calories} cal
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/diet-plan/${plan.id}`)}
                    className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {!plan.shared_at && (
                    <button
                      onClick={() => handleSharePlan(plan.id)}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-600 px-3 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  )}
                  {plan.shared_at && (
                    <button
                      disabled
                      className="flex-1 bg-green-500/20 text-green-600 px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Shared
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Create Diet Plan
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`text-2xl leading-none ${
                  theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Select Client *
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: e.target.value })
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Plan Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Summer Shred Plan"
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add details about the plan..."
                  rows={3}
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_days: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Meals per Day
                  </label>
                  <input
                    type="number"
                    value={formData.meals_per_day}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meals_per_day: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-900"
                  }`}
                >
                  Target Calories
                </label>
                <input
                  type="number"
                  value={formData.target_calories}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_calories: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    theme === "dark"
                      ? "border border-gray-700 bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-900"
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    value={formData.macros_protein_g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        macros_protein_g: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    value={formData.macros_carbs_g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        macros_carbs_g: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      theme === "dark" ? "text-gray-300" : "text-gray-900"
                    }`}
                  >
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    value={formData.macros_fat_g}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        macros_fat_g: e.target.value,
                      })
                    }
                    className={`w-full rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      theme === "dark"
                        ? "border border-gray-700 bg-gray-900 text-white"
                        : "border border-gray-300 bg-white text-gray-900"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlan}
                disabled={isSaving}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
