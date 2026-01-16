// FILE: vite.config.js

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

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
        const source = resolve(process.cwd(), 'public/_redirects')
        const destination = resolve(process.cwd(), 'dist/_redirects')
        
        if (existsSync(source)) {
          copyFileSync(source, destination)
          console.log('✅ _redirects copiado a dist/')
        } else {
          console.warn('⚠️ No se encontró public/_redirects')
        }
      }
    }
  ],

  // ✅ Agregar configuración del servidor de desarrollo
  server: {
    port: 3000, // Opcional: cambia el puerto si quieres
    // ✅ Esto soluciona el error 404 al recargar
    historyApiFallback: true,
    // ✅ Abrir el navegador automáticamente (opcional)
    open: true
  },

  // ✅ También para el modo preview
  preview: {
    port: 3000,
    historyApiFallback: true
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})