import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8090'),
    'import.meta.env.VITE_MINIO_PUBLIC_URL': JSON.stringify(process.env.VITE_MINIO_PUBLIC_URL || 'http://localhost:9000'),
  },
})
