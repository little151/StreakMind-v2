import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => {
  const __root = path.resolve(__dirname); // ✅ base dir of project

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            (await import("@replit/vite-plugin-cartographer")).cartographer(),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__root, "client", "src"),       // ✅ @ → client/src
        "@shared": path.resolve(__root, "shared"),        // ✅ shared alias
        "@assets": path.resolve(__root, "attached_assets"), // ✅ assets alias
      },
    },
    root: path.resolve(__root, "client"),
    build: {
      outDir: path.resolve(__root, "dist", "public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
