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
        target: "http://localhost:3001",
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

      // Start Express on a separate port to avoid response stream issues with Vite middleware
      expressServer = http.createServer(app);
      expressServer.listen(3001, "localhost", () => {
        console.log("[Express] Server running on http://localhost:3001");
      });
    },
  };
}
