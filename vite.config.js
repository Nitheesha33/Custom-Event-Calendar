import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/Custom-Event-Calendar", // Required for deployment (GitHub Pages, Vercel custom path)
  server: {
    host: '0.0.0.0', // Useful for preview on LAN or deployment preview
  },
});