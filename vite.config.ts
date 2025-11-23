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
    rollupOptions: {
      external: [
        "@capacitor/core",
        "@capacitor/camera",
        "@capacitor/geolocation",
        "@capacitor/local-notifications",
        "@capacitor/device",
        "@capacitor/preferences",
        "@capacitor/network",
        "@capacitor/keyboard",
        "@capacitor/status-bar",
        "@capacitor/app",
        "@capacitor/android",
      ],
    },
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

      // Start Express on port 3000 (NestJS backend uses 3001)
      expressServer = http.createServer(app);
      expressServer.listen(3000, "localhost", () => {
        console.log("[Express] Server running on http://localhost:3000");
      });
    },
  };
}
