import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'd3-vendor': ['d3-force', 'd3-scale'],
          'ui-vendor': ['framer-motion'],
        },
      },
    },
    // Enable compression
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
