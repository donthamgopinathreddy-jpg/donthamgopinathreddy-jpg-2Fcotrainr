import Logo from "@/components/Logo";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-b from-white via-white to-gray-50 overflow-hidden">
      {/* Background Gradient Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-b from-blue-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-t from-purple-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12">
        {/* Logo with fade-in and scale animation */}
        <div className="animate-splash-fade-in-scale">
          <Logo size="2xl" className="drop-shadow-2xl" />
        </div>

        {/* Loading spinner */}
        <div className="flex gap-2 items-center justify-center">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce" style={{ animationDuration: "1.4s" }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}></div>
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}></div>
        </div>

        {/* Loading text */}
        <p className="text-gray-600 font-medium text-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>Initializing...</p>
      </div>

      <style>{`
        @keyframes splash-fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-splash-fade-in {
          animation: splash-fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
