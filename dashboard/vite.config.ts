import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Browser shim: the library imports `randomUUID` from 'crypto' (Node).
// Alias it to a tiny module that re-exports the Web Crypto equivalent.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: path.resolve(__dirname, 'src/lib/crypto-shim.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
