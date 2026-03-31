// frontend/vite.config.js
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // All /auth and /tasks requests go to FastAPI
      "/auth": "http://localhost:8000",
      "/tasks": "http://localhost:8000",
      "/health": "http://localhost:8000",
      // WebSocket proxy
      "/tasks/ws": {
        target: "ws://localhost:8000",
        ws: true,
      },
    },
  },
});
