import { User, Edit2, LogOut } from "lucide-react";

export default function Profile() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-primary px-4 py-12 text-center text-gray-900">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Your Profile</h1>
          <p className="text-gray-800">Sign in to view your details</p>
        </div>

        {/* Profile Content */}
        <div className="px-4 py-8 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="text-2xl font-bold text-primary mb-1">0</div>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="text-2xl font-bold text-primary mb-1">0</div>
              <p className="text-xs text-muted-foreground">Hours</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="text-2xl font-bold text-primary mb-1">0</div>
              <p className="text-xs text-muted-foreground">Streak</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 mt-8">
            <button className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors">
              <Edit2 className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Edit Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Subscription</span>
            </button>
            <button className="w-full flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:bg-muted transition-colors text-destructive">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
