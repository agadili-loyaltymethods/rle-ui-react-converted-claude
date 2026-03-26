import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/login': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
        // Only proxy POST/PUT (API calls). GET navigations serve the React SPA.
        bypass: (req) => {
          if (req.method === 'GET') return '/index.html';
          return null;
        },
      },
      '/power-bi': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/streaks-api': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/get-mode': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/get-member-alert': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/refresh-token': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/serverinfo': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/app': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
      '/member-merge': {
        target: 'https://rcx-ui.qa.rcx-dev7.lmvi.net',
        changeOrigin: true,
        secure: false,
      },
    }
  },
});
