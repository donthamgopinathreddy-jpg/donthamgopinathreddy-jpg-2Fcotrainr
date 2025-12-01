import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";
import http from "http";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [".", "./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
    proxy: {
      "/api/": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist/spa",
    sourcemap: mode === "development",
    target: "es2015",
    minify: "esbuild",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

let expressServer: http.Server | null = null;

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve",
    configureServer() {
      const app = createServer();

      // Start Express on port 3000, listening on localhost
      expressServer = http.createServer(app);
      expressServer.listen(3000, "127.0.0.1", () => {
        console.log("[Express] Server running on http://localhost:3000");
        console.log(
          "[Express] Vite proxy will forward /api requests to this server",
        );
      });

      // Handle server errors
      expressServer.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.error("[Express] Port 3000 is already in use");
          console.error("[Express] Try: lsof -ti:3000 | xargs kill -9");
        } else {
          console.error("[Express] Server error:", err);
        }
      });
    },
  };
}
