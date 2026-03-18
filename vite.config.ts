import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('react-dom') || id.includes('react/')) return 'vendor'
          if (id.includes('@tanstack/react-query')) return 'query'
          if (id.includes('react-router-dom')) return 'router'
          if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) return 'form'
        },
      },
    },
  },
})
