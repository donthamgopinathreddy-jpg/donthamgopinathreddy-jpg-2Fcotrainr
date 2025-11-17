import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function ProxyTest() {
  const { signIn: authSignIn } = useAuth();
  const [status, setStatus] = useState<string>("Ready to test");
  const [response, setResponse] = useState<string>("");
  const [email, setEmail] = useState("cotrainr26@gmail.com");
  const [password, setPassword] = useState("Cotrainr@261025");

  const testPing = async () => {
    try {
      setStatus("Testing /api/ping endpoint...");
      console.log("Fetching from /api/ping");

      const response = await fetch("/api/ping", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      setResponse(`Status: ${response.status}\nResponse: ${JSON.stringify(json, null, 2)}`);
      setStatus(`Ping test completed - Status ${response.status}`);
    } catch (error) {
      setStatus("Fetch Error: " + String(error));
      setResponse(`Error type: ${error instanceof Error ? error.name : typeof error}\nMessage: ${String(error)}`);
      console.error("[ProxyTest] Fetch error:", error);
    }
  };

  const testHealth = async () => {
    try {
      setStatus("Testing /api/supabase/health endpoint...");
      console.log("Fetching from /api/supabase/health");

      const response = await fetch("/api/supabase/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();
      setResponse(`Status: ${response.status}\nResponse: ${JSON.stringify(json, null, 2)}`);
      setStatus(`Health test completed - Status ${response.status}`);
    } catch (error) {
      setStatus("Fetch Error: " + String(error));
      setResponse(`Error type: ${error instanceof Error ? error.name : typeof error}\nMessage: ${String(error)}`);
      console.error("[ProxyTest] Fetch error:", error);
    }
  };

  const testAuthAPI = async () => {
    try {
      setStatus("Testing /api/supabase/auth/signin endpoint...");
      console.log("[ProxyTest] Testing /api/supabase/auth/signin");

      // Test sign in via our API wrapper - this should fail with invalid credentials but should reach our server
      const response = await fetch("/api/supabase/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || "test@example.com",
          password: password || "testpass123",
        }),
      });

      const json = await response.json();
      setResponse(`Status: ${response.status}\nResponse: ${JSON.stringify(json, null, 2)}`);

      if (response.ok) {
        setStatus("Auth test successful (got token)");
      } else {
        setStatus(`Auth test completed - Error: ${json.error}`);
      }
    } catch (error) {
      setStatus("Caught error: " + String(error));
      const errorObj = error as any;
      setResponse(JSON.stringify({
        message: errorObj.message,
        code: errorObj.code,
        details: errorObj.details,
      }, null, 2));
      console.error("[ProxyTest] Error:", error);
    }
  };

  const testAuthContext = async () => {
    try {
      setStatus("Testing AuthContext signIn method...");
      console.log("[ProxyTest] Testing authSignIn");

      await authSignIn(email || "test@example.com", password || "testpass123");

      setStatus("Auth context test successful!");
      setResponse("User signed in successfully");
    } catch (error) {
      setStatus("Auth context error: " + String(error));
      const errorObj = error as any;
      setResponse(JSON.stringify({
        message: errorObj?.message,
        code: errorObj?.code,
        details: errorObj?.details,
      }, null, 2));
      console.error("[ProxyTest] Auth context error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">API & Authentication Test Page</h1>

        <div className="space-y-4">
          {/* Input Fields */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Test Credentials</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                placeholder="Enter password"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm">
              {status}
            </div>
          </div>

          {/* Response */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Response</h2>
            <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm max-h-96 overflow-auto whitespace-pre-wrap">
              {response || "No response yet"}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={testPing}
              className="bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600"
            >
              Test /api/ping
            </button>
            <button
              onClick={testHealth}
              className="bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600"
            >
              Test /api/supabase/health
            </button>
            <button
              onClick={testAuthAPI}
              className="bg-orange-500 text-white font-bold py-2 rounded-lg hover:bg-orange-600"
            >
              Test /api/supabase/auth/signin
            </button>
            <button
              onClick={testAuthContext}
              className="bg-purple-500 text-white font-bold py-2 rounded-lg hover:bg-purple-600"
            >
              Test AuthContext
            </button>
          </div>

          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Debugging Info:</h3>
            <ul className="text-sm space-y-1">
              <li>
                Supabase URL: <code className="bg-white px-2 py-1 rounded text-xs">{import.meta.env.VITE_SUPABASE_URL}</code>
              </li>
              <li>
                Current Hostname: <code className="bg-white px-2 py-1 rounded text-xs">{typeof window !== "undefined" ? window.location.hostname : "N/A"}</code>
              </li>
              <li>
                Current Origin: <code className="bg-white px-2 py-1 rounded text-xs">{typeof window !== "undefined" ? window.location.origin : "N/A"}</code>
              </li>
              <li>
                Environment: <code className="bg-white px-2 py-1 rounded text-xs">{import.meta.env.MODE}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
