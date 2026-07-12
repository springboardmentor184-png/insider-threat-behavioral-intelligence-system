import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite project configuration with backend proxy mapping
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
