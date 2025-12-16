import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Mock API plugin for development
const mockApiPlugin = () => ({
  name: 'mock-api',
  configureServer(server) {
    server.middlewares.use('/api/v2/models', (req, res, next) => {
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          "0": {
            "model_name": "helmet-vest-y11m",
            "version": "1.0.0",
            "task": "detection",
            "description": "施工现场安全防护检测模型，用于安全帽和反光背心识别，适用于白天和室内弱光场景。"
          },
          "1": {
            "model_name": "fire-smoke-p-tfc-exca-roller",
            "version": "1.0.0",
            "task": "detection",
            "description": "施工现场安全防护检测模型，用于明火、烟雾、人员、警示桩、挖掘机和压路机识别，适用于白天。"
          }
        }));
      } else {
        next();
      }
    });
  }
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), mockApiPlugin()],
      define: {

        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_USE_CUSTOM_API': JSON.stringify(env.VITE_USE_CUSTOM_API),
        'process.env.VITE_API_ENDPOINT': JSON.stringify(env.VITE_API_ENDPOINT)

      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
      }
    };
});
