import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',        // relative folder inside frontend
    emptyOutDir: true      // cleans the folder before building
  },
  base: './'               // important for relative paths
})
