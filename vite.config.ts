import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { processContribution } from './src/api/contributeHandler.ts';
import { generateAllData } from './src/scripts/generate-data.ts';

function contentWatcherPlugin(): Plugin {
  return {
    name: 'content-watcher-plugin',
    configureServer(server) {
      // Run once on server startup
      try {
        generateAllData();
      } catch (err: any) {
        console.error('Error generating data on startup:', err.message);
      }

      // Watch content directory
      const contentDir = path.resolve(import.meta.dirname, 'content');
      server.watcher.add(contentDir);
      server.watcher.on('all', (event, filePath) => {
        if (filePath.includes('/content/') && (filePath.endsWith('.txt') || filePath.endsWith('.md'))) {
          console.log(`[content-watcher] Detected ${event} on ${path.basename(filePath)}, regenerating data...`);
          try {
            generateAllData();
            server.ws.send({ type: 'full-reload' });
          } catch (err: any) {
            console.error('[content-watcher] Generation error:', err.message);
          }
        }
      });
    }
  };
}

function contributeApiPlugin(): Plugin {
  return {
    name: 'contribute-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/contribute', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const clientIp = req.socket.remoteAddress || 'local';
              const result = await processContribution(data, clientIp);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.success ? 200 : 400;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), contentWatcherPlugin(), contributeApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
