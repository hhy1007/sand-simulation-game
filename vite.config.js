import { defineConfig } from 'vite'

export default defineConfig({
  root: './public',
  server: {
    port: 5173,
    host: true,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: './public/index.html'
    }
  }
})