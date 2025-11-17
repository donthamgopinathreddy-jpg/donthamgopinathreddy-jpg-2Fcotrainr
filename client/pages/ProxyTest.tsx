import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProxyTest() {
  const [status, setStatus] = useState<string>("Testing...");
  const [response, setResponse] = useState<string>("");

  const testProxy = async () => {
    try {
      setStatus("Testing Supabase connection...");
      
      // Test 1: Check if we can reach Supabase health endpoint
      const response = await fetch("/supabase-api/health", {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      setResponse(`Status: ${response.status}\n${await response.text()}`);
      setStatus("Proxy test completed");
    } catch (error) {
      setStatus("Error: " + String(error));
      setResponse("");
    }
  };

  const testAuth = async () => {
    try {
      setStatus("Testing auth client...");
      console.log("[ProxyTest] Supabase client:", supabase);
      console.log("[ProxyTest] Auth:", supabase.auth);
      
      // Test sign in - this should fail with invalid credentials but should reach our proxy/supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "testpass123",
      });

      if (error) {
        setStatus("Auth error (expected): " + error.message);
        setResponse(JSON.stringify(error, null, 2));
      } else {
        setStatus("Unexpected success");
        setResponse(JSON.stringify(data, null, 2));
      }
    } catch (error) {
      setStatus("Caught error: " + String(error));
      const errorObj = error as any;
      setResponse(JSON.stringify({
        message: errorObj.message,
        code: errorObj.code,
        details: errorObj.details,
      }, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Proxy Test Page</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Status</h2>
            <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm">
              {status}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Response</h2>
            <div className="bg-card border border-border rounded-lg p-4 font-mono text-sm max-h-96 overflow-auto whitespace-pre-wrap">
              {response || "No response yet"}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testProxy}
              className="flex-1 bg-primary text-primary-foreground font-bold py-2 rounded-lg"
            >
              Test Proxy Connection
            </button>
            <button
              onClick={testAuth}
              className="flex-1 bg-secondary text-secondary-foreground font-bold py-2 rounded-lg"
            >
              Test Auth
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Debugging Info:</h3>
            <ul className="text-sm space-y-1">
              <li>
                Supabase URL: <code className="bg-white px-2 py-1 rounded">{import.meta.env.VITE_SUPABASE_URL}</code>
              </li>
              <li>
                Current Hostname: <code className="bg-white px-2 py-1 rounded">{typeof window !== "undefined" ? window.location.hostname : "N/A"}</code>
              </li>
              <li>
                Using Proxy: <code className="bg-white px-2 py-1 rounded">{typeof window !== "undefined" && window.location.hostname !== "localhost" ? "Yes" : "No"}</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
