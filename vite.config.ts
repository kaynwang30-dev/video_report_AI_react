import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const aiApiBase = env.VITE_AI_API_BASE || 'https://open.bigmodel.cn/api/paas/v4'

  return {
    base: '/video_report_AI_react/',
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/ai-api': {
          target: aiApiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-api/, ''),
        },
      },
    },
  }
})
