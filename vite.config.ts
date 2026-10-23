import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('lodash')) {
              return 'lodash';
            }
            if (id.includes('moment')) {
              return 'moment';
            }
            return 'vendor-others';
          }
        },
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    commonjsOptions: {
      include: /node_modules/,
    },
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
  },
  envPrefix: ['VITE_', 'BASE'],
  plugins: [react()],
});
