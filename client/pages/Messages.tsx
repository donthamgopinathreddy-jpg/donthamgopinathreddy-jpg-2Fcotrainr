import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground mb-12">Chat with trainers and nutritionists</p>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-2">Messages</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Your conversations will appear here. Start chatting with your favorite trainers and nutritionists.
          </p>
        </div>
      </div>
    </div>
  );
}
