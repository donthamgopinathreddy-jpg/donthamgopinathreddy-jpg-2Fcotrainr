import { useState, useEffect } from "react";
import { ArrowLeft, Save, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useTrainingModes,
  TRAINING_MODE_OPTIONS,
  MAIN_FOCUS_OPTIONS,
} from "@/hooks/useTrainingModes";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

export default function TrainingModes() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    preferences,
    loading,
    updateTrainingModes,
    updateMainFocus,
    toggleMode,
  } = useTrainingModes();

  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedFocus, setSelectedFocus] = useState("general_fitness");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedModes(preferences.training_modes);
    setSelectedFocus(preferences.main_focus);
  }, [preferences]);

  const handleModeToggle = (modeId: string) => {
    setSelectedModes((prev) =>
      prev.includes(modeId) ? prev.filter((m) => m !== modeId) : [...prev, modeId],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update modes
      if (JSON.stringify(selectedModes) !== JSON.stringify(preferences.training_modes)) {
        await updateTrainingModes(selectedModes);
      }

      // Update focus
      if (selectedFocus !== preferences.main_focus) {
        await updateMainFocus(selectedFocus);
      }

      toast.success("Preferences saved!");
      setTimeout(() => navigate(-1), 500);
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gray-900"
            : "bg-gradient-to-br from-white to-gray-50"
        }`}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

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
                theme === "dark"
                  ? "hover:bg-gray-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Training Modes
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Training Modes Section */}
        <div className="mb-8">
          <h2
            className={`text-lg font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            🏋️ What's Your Training Style?
          </h2>
          <p
            className={`text-sm mb-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Select all that apply. We'll personalize your experience!
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {TRAINING_MODE_OPTIONS.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeToggle(mode.id)}
                className={`relative rounded-lg border-2 p-4 transition-all ${
                  selectedModes.includes(mode.id)
                    ? theme === "dark"
                      ? "border-orange-500 bg-orange-900/30"
                      : "border-orange-400 bg-orange-50"
                    : theme === "dark"
                      ? "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                {selectedModes.includes(mode.id) && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-orange-500" />
                  </div>
                )}
                <div className="text-2xl mb-2">{mode.emoji}</div>
                <p
                  className={`text-sm font-medium text-center ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {mode.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Focus Section */}
        <div className="mb-8">
          <h2
            className={`text-lg font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            🎯 Main Focus
          </h2>
          <p
            className={`text-sm mb-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            What's your primary fitness goal?
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MAIN_FOCUS_OPTIONS.map((focus) => (
              <button
                key={focus.id}
                onClick={() => setSelectedFocus(focus.id)}
                className={`relative rounded-lg border-2 p-4 transition-all ${
                  selectedFocus === focus.id
                    ? theme === "dark"
                      ? "border-orange-500 bg-orange-900/30"
                      : "border-orange-400 bg-orange-50"
                    : theme === "dark"
                      ? "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                      : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                {selectedFocus === focus.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-orange-500" />
                  </div>
                )}
                <div className="text-2xl mb-2">{focus.emoji}</div>
                <p
                  className={`text-sm font-medium text-center ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {focus.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div
          className={`rounded-lg border ${
            theme === "dark"
              ? "bg-blue-900/20 border-blue-700/50"
              : "bg-blue-50 border-blue-200"
          } p-4`}
        >
          <p
            className={`text-sm ${
              theme === "dark" ? "text-blue-300" : "text-blue-700"
            }`}
          >
            💡 These preferences help us personalize your dashboard, suggest relevant
            trainers, and track progress on activities that matter to you.
          </p>
        </div>
      </div>
    </div>
  );
}
