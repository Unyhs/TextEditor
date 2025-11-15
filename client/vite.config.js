import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server:{
    host:'0.0.0.0',
    port:5173,
    hmr:{
      host:'localhost',
      port:3000,
      protocol:'ws'
    },
    proxy: {
      '/api': {
        target: 'http://server:8082',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep /api prefix
      },
      '/socket.io': { 
        target: 'http://server:8082',
        changeOrigin: true,
        ws: true, // Mandatory for the WebSocket connection to succeed
      },
    }
  },
  plugins: [react(),tailwindcss()],

})
