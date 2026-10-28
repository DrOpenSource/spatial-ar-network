import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  // Self-signed HTTPS: mobile browsers only grant camera access in a secure context
  plugins: [basicSsl()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true
  },
  preview: {
    host: '0.0.0.0'
  },
  build: {
    // MindAR bundles TensorFlow.js (~2 MB); split vendors out so app-only changes don't bust their cache
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      // Pages: sticker mode, on-site GPS mode, virtual mode
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        geo: fileURLToPath(new URL('./geo.html', import.meta.url)),
        virtual: fileURLToPath(new URL('./virtual.html', import.meta.url))
      },
      output: {
        manualChunks: {
          three: ['three'],
          mindar: ['mind-ar/dist/mindar-image-three.prod.js']
        }
      }
    }
  }
});
