import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // crossOriginIsolation() // Disabling this to allow Google OAuth popups
  ],
  optimizeDeps: {
    exclude: ['@sqlite.org/sqlite-wasm'],
  },
})
