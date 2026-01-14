// FILE: vite.config.js

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: fileURLToPath(
        new URL('./src/quasar-variables.sass', import.meta.url)
      )
    }),

    // Plugin para copiar _redirects al build
    {
      name: 'copy-redirects',
      closeBundle() {
        const fs = require('fs')
        const path = require('path')
        
        const source = path.resolve(__dirname, 'public/_redirects')
        const destination = path.resolve(__dirname, 'dist/_redirects')
        
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, destination)
          console.log('✅ _redirects copiado a dist/')
        }
      }
    }
  ]
})
