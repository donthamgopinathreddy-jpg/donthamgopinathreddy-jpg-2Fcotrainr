import Logo from "@/components/Logo";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-b from-white via-white to-gray-50 overflow-hidden">
      {/* Background Gradient Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-b from-yellow-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-t from-orange-100 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-12">
        {/* Logo with fade-in and scale animation */}
        <div className="animate-splash-fade-in-scale">
          <Logo size="2xl" className="drop-shadow-2xl" />
        </div>

        {/* Loading spinner */}
        <div className="flex gap-2 items-center justify-center">
          <div
            className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-bounce"
            style={{ animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}
          ></div>
        </div>

        {/* Loading text */}
        <p
          className="text-gray-600 font-medium text-sm animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          Initializing...
        </p>
      </div>

      <style>{`
        @keyframes splash-fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(-40px) rotate(-5deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.05) translateY(0) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotate(0deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float-up {
          0% {
            transform: translateY(10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-splash-fade-in-scale {
          animation: splash-fade-in-scale 1.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .animate-fade-in {
          animation: fade-in 1.2s ease-in 0.6s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
