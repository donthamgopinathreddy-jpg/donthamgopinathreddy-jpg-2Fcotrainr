import { useState } from "react";
import {
  X,
  Bell,
  MapPin,
  Camera,
  Mic,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { usePermissions, PermissionType } from "@/hooks/usePermissions";

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionsModal({
  isOpen,
  onClose,
}: PermissionsModalProps) {
  const { theme } = useTheme();
  const { permissions, loading, requestPermission } = usePermissions();
  const [requestedPermission, setRequestedPermission] =
    useState<PermissionType | null>(null);

  if (!isOpen) return null;

  const permissionsList = [
    {
      type: "notifications" as PermissionType,
      icon: Bell,
      label: "Notifications",
      description: "Get alerts for important events",
    },
    {
      type: "location" as PermissionType,
      icon: MapPin,
      label: "Location",
      description: "Track your activity and location",
    },
    {
      type: "camera" as PermissionType,
      icon: Camera,
      label: "Camera",
      description: "For trainer verification and video calls",
    },
    {
      type: "microphone" as PermissionType,
      icon: Mic,
      label: "Microphone",
      description: "For voice calls and meetings",
    },
    {
      type: "calls" as PermissionType,
      icon: Phone,
      label: "Phone Calls",
      description: "For direct phone communication",
    },
  ];

  const handleRequestPermission = async (type: PermissionType) => {
    setRequestedPermission(type);
    await requestPermission(type);
    setRequestedPermission(null);
  };

  const allGranted = Object.values(permissions).every((perm) => perm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col ${
          theme === "dark"
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            theme === "dark"
              ? "border-gray-800 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h2
            className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            App Permissions
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Status */}
            {allGranted && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${
                  theme === "dark"
                    ? "bg-green-900/30 border border-green-700/50"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p
                  className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-700"}`}
                >
                  All permissions granted! You're all set.
                </p>
              </div>
            )}

            {!allGranted && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 ${
                  theme === "dark"
                    ? "bg-blue-900/30 border border-blue-700/50"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p
                  className={`text-sm font-medium ${theme === "dark" ? "text-blue-400" : "text-blue-700"}`}
                >
                  Grant permissions to enhance your experience
                </p>
              </div>
            )}

            {/* Permissions List */}
            <div className="space-y-3 mt-4">
              {permissionsList.map(
                ({ type, icon: Icon, label, description }) => {
                  const isGranted = permissions[type];
                  const isRequesting = requestedPermission === type;

                  return (
                    <div
                      key={type}
                      className={`p-4 rounded-xl flex items-start gap-3 transition-all ${
                        theme === "dark"
                          ? "bg-gray-800 hover:bg-gray-700"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 mt-1 ${isGranted ? "text-green-500" : "text-gray-400"}`}
                      />

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                        >
                          {label}
                        </p>
                        <p
                          className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleRequestPermission(type)}
                        disabled={isGranted || isRequesting || loading}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex-shrink-0 transition-all whitespace-nowrap ${
                          isGranted
                            ? theme === "dark"
                              ? "bg-green-900/30 text-green-400 border border-green-700/50"
                              : "bg-green-50 text-green-700 border border-green-200"
                            : `${
                                theme === "dark"
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              } disabled:opacity-50`
                        }`}
                      >
                        {isGranted ? "✓" : isRequesting ? "..." : "Allow"}
                      </button>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`border-t p-4 ${
            theme === "dark"
              ? "border-gray-800 bg-gray-800/50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
