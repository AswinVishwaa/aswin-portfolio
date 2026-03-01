import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdPlugin from 'vite-plugin-md';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mdPlugin()],
  server: {
    proxy: {
      // Forward /api/* to the local Express API server (server.js)
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
