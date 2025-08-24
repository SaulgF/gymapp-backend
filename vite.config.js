import { defineConfig } from 'vite' 
import react from '@vitejs/plugin-react' 
 
export default defineConfig({
  plugins: [react()],
  base: '/gym/',
  server: {
    host: true,
    hmr: {
      clientPort: 5173,
      port: 5173
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
}) 
