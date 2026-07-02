import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      {
        name: 'fix-ws-send',
        configureServer(server) {
          if (server.ws && !server.ws.send) {
            server.ws.send = () => {};
          } else if (!server.ws) {
            server.ws = { send: () => {}, on: () => {}, off: () => {} } as any;
          }
        }
      },
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000
        },
        devOptions: {
          enabled: false
        },
        manifest: {
          name: 'GATE EC 2027 Dashboard',
          short_name: 'GATE Tracker',
          description: 'A high-stakes exam productivity and performance tracking dashboard for GATE EC 2027.',
          theme_color: '#0D0F14',
          background_color: '#0D0F14',
          icons: [
            {
              src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎯</text></svg>',
              sizes: '192x192',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    // Externalize native modules so Vite doesn't try to bundle them
    // These are only used in Electron's main process (Node.js), not the renderer
    optimizeDeps: {
      exclude: ['better-sqlite3']
    },
    build: {
      rollupOptions: {
        external: ['better-sqlite3', 'electron']
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
