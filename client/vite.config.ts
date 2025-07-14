import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.DOCKER ? 'http://server:3000' : 'http://localhost:3000',
    },
  },
})
