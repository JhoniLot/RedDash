import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/reddash/',
  plugins: [react()],
  server: {
    proxy: {
      '/api/redtrack': {
        target: 'https://api.redtrack.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/redtrack/, ''),
      },
    },
  },
})
