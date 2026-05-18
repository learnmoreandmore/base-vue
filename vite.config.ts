import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'
import DefineOptions from 'unplugin-vue-define-options/vite'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production' || mode === 'analyze'
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      vue(),
      DefineOptions(),
      ElementPlus({}),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/types/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
        dts: 'src/types/components.d.ts',
        dirs: ['src/components'],
      }),
      basicSsl(),
      ...(isProd
        ? [
            // 0.5.1 在单次构建中双实例会共享 mtimeCache，第二个算法不产出文件；需要 .br 可换 compression2 或单独再跑一步
            viteCompression({
              algorithm: 'gzip',
              threshold: 10240,
              ext: '.gz',
            }),
          ]
        : []),
      ...(isAnalyze
        ? [
            visualizer({
              filename: 'dist/stats.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
            }),
          ]
        : []),
    ],

    server: {
      host: '0.0.0.0',
      port: 5173,
      open: false,
      cors: true,
      strictPort: false,
      hmr: { overlay: true },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
        },
        '/ai-chat': {
          target: 'http://127.0.0.1:11434',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/ai-chat/, '/v1'),
        },
      },
      https: {},
    },

    preview: {
      host: '0.0.0.0',
      port: 4173,
      cors: true,
      https: {},
      proxy: {
        '/ai-chat': {
          target: 'http://127.0.0.1:11434',
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/ai-chat/, '/v1'),
        },
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },

    css: {
      devSourcemap: false,
    },

    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'axios', 'echarts', 'lodash-es', 'element-plus'],
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1200,
      reportCompressedSize: false,
      minify: 'esbuild',
      ...(isProd
        ? {
            esbuild: {
              drop: ['debugger', 'console'] as ('debugger' | 'console')[],
            },
          }
        : {}),
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
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
            if (id.includes('node_modules/lodash-es') || id.includes('node_modules/lodash')) {
              return 'lodash'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
    },
  }
})
