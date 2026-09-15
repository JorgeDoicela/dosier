import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: 3010,
      host: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5185',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.removeAllListeners('error');
            proxy.on('error', (err, _req, res) => {
              if (err.message.includes('ECONNREFUSED')) {
                if (res) {
                  if ('writeHead' in res) {
                    if (!res.headersSent) {
                      res.writeHead(502, { 'Content-Type': 'text/plain' });
                    }
                    res.end('Backend offline (ECONNREFUSED)');
                  } else if ('destroy' in res) {
                    res.destroy();
                  }
                }
                return;
              }
              console.error('Proxy API error:', err);
            });
          }
        },
        '/hubs': {
          target: 'http://127.0.0.1:5185',
          ws: true,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.removeAllListeners('error');
            proxy.on('error', (err, _req, res) => {
              if (err.message.includes('ECONNREFUSED')) {
                if (res) {
                  if ('writeHead' in res) {
                    if (!res.headersSent) {
                      res.writeHead(502, { 'Content-Type': 'text/plain' });
                    }
                    res.end('Backend offline (ECONNREFUSED)');
                  } else if ('destroy' in res) {
                    res.destroy();
                  }
                }
                return;
              }
              console.error('Proxy Hubs error:', err);
            });
          }
        }
      }
    },
    resolve: {
      dedupe: ['yjs', 'y-prosemirror']
    },
    optimizeDeps: {
      include: ['yjs', 'y-prosemirror', 'date-fns'],
      exclude: ['@tiptap/pm']
    },
    build: {
      chunkSizeWarningLimit: 1500
    }
  }
})
