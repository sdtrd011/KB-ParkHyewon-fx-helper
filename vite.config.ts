/// <reference types="vitest/config" />
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/exchange-rates': {
          target: 'https://oapi.koreaexim.go.kr',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const requestUrl = new URL(req.url ?? '', 'http://localhost')
              const searchdate = requestUrl.searchParams.get('searchdate') ?? ''
              const data = requestUrl.searchParams.get('data') ?? 'AP01'
              const authkey = env.VITE_EXCHANGE_API_KEY ?? ''

              proxyReq.path = `/site/program/financial/exchangeJSON?authkey=${encodeURIComponent(authkey)}&searchdate=${encodeURIComponent(searchdate)}&data=${encodeURIComponent(data)}`
            })
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts'],
    },
  }
})
