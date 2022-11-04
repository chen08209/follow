import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueMacros from 'unplugin-vue-macros/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { pkgRoot } from '@follow-ui/build-utils'
export default defineConfig({
  root: './',
  server: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@follow-ui': path.resolve(pkgRoot),
    },
  },
  plugins: [
    VueMacros({
      setupComponent: false,
      setupSFC: false,
      plugins: {
        vue: vue(),
        vueJsx: vueJsx(),
      },
    }),
  ],
})
