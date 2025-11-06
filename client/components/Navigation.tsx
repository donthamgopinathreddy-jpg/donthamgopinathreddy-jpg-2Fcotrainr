import { Link, useLocation } from "react-router-dom";
import { Home, MapPin, MessageCircle, Utensils, User } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/discover", label: "Discover", icon: MapPin },
    { path: "/messages", label: "Messages", icon: MessageCircle },
    { path: "/meals", label: "Meals", icon: Utensils },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="flex justify-around max-w-md mx-auto w-full">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-all duration-200 relative active:scale-90 ${
                active ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-all ${active ? "scale-110" : "scale-100"}`} />
              <span className="text-xs font-medium">{label}</span>
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full shadow-lg shadow-blue-500/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
