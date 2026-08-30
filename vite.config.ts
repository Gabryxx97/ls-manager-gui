import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { version } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8084",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
