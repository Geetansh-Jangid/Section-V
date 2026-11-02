import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import contributeHandler from './api/contribute.ts';
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
        contributeHandler(req, res);
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react() as any, tailwindcss() as any, contentWatcherPlugin(), contributeApiPlugin()],
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
