import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Droplet,
  Footprints,
  TrendingUp,
  Dumbbell,
  Apple,
  UtensilsCrossed,
  Newspaper,
  MessageCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { statsApi, mealsApi } from '@/lib/api';

export default function MobileHome() {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Load today's stats
      const response = await statsApi.getDailyStats(today, today);
      if (response && response.length > 0) {
        setStats(response[0]);
      } else {
        setStats({ steps: 0, calories_burned: 0, water_intake_ml: 0, distance_km: 0 });
      }

      // Load today's meals
      const mealsResponse = await mealsApi.getMeals(today);
      setMeals(mealsResponse || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const stepProgress = Math.min((stats?.steps || 0) / 10000, 1);
  const waterProgress = Math.min((stats?.water_intake_ml || 0) / 2000, 1);
  const calorieGoal = 2000;
  const calorieProgress = Math.min((stats?.calories_burned || 0) / calorieGoal, 1);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-orange-100 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold">{userProfile?.username || 'Friend'}</h1>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center"
          >
            👤
          </button>
        </div>

        {/* BMI Card */}
        {userProfile?.bmi && (
          <div className="bg-white/20 backdrop-blur rounded-2xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-orange-100 text-sm">Your BMI</p>
                <h2 className="text-3xl font-bold">{userProfile.bmi.toFixed(1)}</h2>
                <p className="text-orange-100 text-xs mt-1">{userProfile.bmi_status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{userProfile.height_cm}cm</p>
                <p className="text-sm">{userProfile.weight_kg}kg</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Today's Stats</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Steps */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Footprints className="text-blue-500" size={24} />
              <span className="text-xs font-semibold text-gray-600">
                {Math.round(stepProgress * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Steps</p>
            <p className="text-xl font-bold text-gray-900">{stats?.steps || 0}</p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all"
                style={{ width: `${stepProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Calories */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Flame className="text-red-500" size={24} />
              <span className="text-xs font-semibold text-gray-600">
                {Math.round(calorieProgress * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Calories</p>
            <p className="text-xl font-bold text-gray-900">{stats?.calories_burned || 0}</p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div
                className="bg-red-500 h-1 rounded-full transition-all"
                style={{ width: `${calorieProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Water */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Droplet className="text-cyan-500" size={24} />
              <span className="text-xs font-semibold text-gray-600">
                {Math.round(waterProgress * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Water</p>
            <p className="text-xl font-bold text-gray-900">{stats?.water_intake_ml || 0}ml</p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div
                className="bg-cyan-500 h-1 rounded-full transition-all"
                style={{ width: `${waterProgress * 100}%` }}
              />
            </div>
          </div>

          {/* Distance */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="text-green-500" size={24} />
              <span className="text-xs font-semibold text-gray-600">Today</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Distance</p>
            <p className="text-xl font-bold text-gray-900">{(stats?.distance_km || 0).toFixed(1)}km</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-gray-900 mt-8">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/discover')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
          >
            <Dumbbell size={28} />
            <span className="text-sm font-semibold">Find Trainers</span>
          </button>

          <button
            onClick={() => navigate('/meals')}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
          >
            <Apple size={28} />
            <span className="text-sm font-semibold">Log Meals</span>
          </button>

          <button
            onClick={() => navigate('/feed')}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
          >
            <Newspaper size={28} />
            <span className="text-sm font-semibold">Community</span>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-lg transition-all"
          >
            <MessageCircle size={28} />
            <span className="text-sm font-semibold">Messages</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around safe-area-inset-bottom">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 text-orange-600"
        >
          <TrendingUp size={24} />
          <span className="text-xs font-semibold">Home</span>
        </button>
        <button
          onClick={() => navigate('/discover')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
        >
          <Dumbbell size={24} />
          <span className="text-xs font-semibold">Discover</span>
        </button>
        <button
          onClick={() => navigate('/messages')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
        >
          <MessageCircle size={24} />
          <span className="text-xs font-semibold">Chat</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
        >
          <Settings size={24} />
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </div>
    </div>
  );
}
