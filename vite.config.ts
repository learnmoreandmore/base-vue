import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    /** 随 `import { ElMessage } from 'element-plus'` 等自动注入对应组件样式，免手写 style/css */
    ElementPlus({}),
    AutoImport({
      resolvers: [ElementPlusResolver({ importStyle: 'css' })],
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'css' })],
      dts: 'src/types/components.d.ts',
    }),
    basicSsl(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      /** 开发环境默认转发到本机 Ollama（OpenAI 兼容 /v1），避免浏览器直连跨域 */
      '/ai-chat': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ai-chat/, '/v1'),
      },
    },
    https: {},
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    https: {},
    proxy: {
      '/ai-chat': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ai-chat/, '/v1'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue-router')) {
            return 'vue-router'
          }
          if (id.includes('node_modules/pinia')) {
            return 'pinia'
          }
          if (id.includes('node_modules/vue') && !id.includes('vue-router')) {
            return 'vue'
          }
          if (id.includes('@element-plus/icons-vue')) {
            return 'ep-icons'
          }
          if (id.includes('node_modules/element-plus')) {
            return 'element'
          }
          if (id.includes('node_modules/echarts')) {
            return 'chart'
          }
          if (id.includes('node_modules/xlsx')) {
            return 'xlsx'
          }
          if (id.includes('node_modules/axios')) {
            return 'http'
          }
        },
      },
    },
  },
})
