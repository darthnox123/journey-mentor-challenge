import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.DUFFEL_API_BASE_URL
  const apiToken = env.DUFFEL_API_TOKEN
  const duffelVersion = env.DUFFEL_VERSION

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api/duffel': {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/duffel/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiToken) {
                proxyReq.setHeader('Authorization', `Bearer ${apiToken}`)
              }
              proxyReq.setHeader('Duffel-Version', duffelVersion)
              proxyReq.setHeader('Accept', 'application/json')
            })
          },
        },
      },
    },
  }
})
