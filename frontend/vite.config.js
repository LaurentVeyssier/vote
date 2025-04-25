import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/llms': 'http://localhost:8000',
      '/rankings': 'http://localhost:8000',
      '/matchup': 'http://localhost:8000',
      '/vote': 'http://localhost:8000',
      '/history': 'http://localhost:8000',
      '/analytics': 'http://localhost:8000',   // <-- Add this line!
    },
  },
});
