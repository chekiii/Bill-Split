import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The port your backend server will run on
const backendPort = 3001;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This rule says:
      // "If you see a request to '/api', forward it to the backend server."
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
    },
  },
});