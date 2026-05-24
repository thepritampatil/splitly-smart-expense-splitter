import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion':  ['framer-motion'],
          'vendor-charts':  ['recharts'],
          'vendor-ui':      ['lucide-react', 'react-hot-toast'],
          'vendor-utils':   ['zustand', 'axios', 'date-fns', 'react-hook-form'],
        }
      }
    }
  }
})
