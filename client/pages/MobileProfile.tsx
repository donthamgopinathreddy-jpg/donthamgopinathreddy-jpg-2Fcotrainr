import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, LogOut, Heart, TrendingUp, Award, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileProfile() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    height_cm: userProfile?.height_cm || '',
    weight_kg: userProfile?.weight_kg || '',
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-semibold mb-4"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Profile Card */}
        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mx-auto text-4xl mb-4">
            👤
          </div>
          <h1 className="text-2xl font-bold mb-1">{userProfile?.username}</h1>
          <p className="text-purple-100 text-sm mb-4 capitalize">{userProfile?.role}</p>

          <div className="bg-white/10 rounded-xl p-3 space-y-2 text-sm">
            <p>Email: {userProfile?.email}</p>
            <p>Height: {userProfile?.height_cm} cm</p>
            <p>Weight: {userProfile?.weight_kg} kg</p>
            <p className="font-semibold">BMI: {userProfile?.bmi?.toFixed(1)} ({userProfile?.bmi_status})</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Your Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <Heart className="text-red-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">72</p>
            <p className="text-xs text-gray-600">Followers</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <TrendingUp className="text-green-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-600">Following</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <Award className="text-yellow-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <Share2 className="text-blue-500 mx-auto mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900">500</p>
            <p className="text-xs text-gray-600">Coins</p>
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Settings</h2>

        <button className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left">
          <p className="font-semibold text-gray-900">Notification Settings</p>
          <p className="text-xs text-gray-500 mt-1">Manage your notifications</p>
        </button>

        <button className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left">
          <p className="font-semibold text-gray-900">Privacy Settings</p>
          <p className="text-xs text-gray-500 mt-1">Control your privacy</p>
        </button>

        <button className="w-full px-4 py-3 bg-white rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 text-left">
          <p className="font-semibold text-gray-900">About CoTrainr</p>
          <p className="text-xs text-gray-500 mt-1">Version 1.0.0</p>
        </button>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200 text-left mt-6"
        >
          <div className="flex items-center gap-2">
            <LogOut size={20} className="text-red-600" />
            <p className="font-semibold text-red-600">Logout</p>
          </div>
        </button>
      </div>
    </div>
  );
}
