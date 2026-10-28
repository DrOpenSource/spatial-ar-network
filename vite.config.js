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
  }
});
