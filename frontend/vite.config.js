import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   build: {
    outDir: process.env.VITE_BASE_PATH || "/react-vite-deploy" // <-- make sure this is set to 'dist'
  },
})
