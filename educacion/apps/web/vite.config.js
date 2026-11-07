import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const aqui = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: { '@voz-kay': resolve(aqui, '../../packages/voz-kay/src') },
    // voz-kay vive fuera de esta carpeta: sus imports se resuelven con los node_modules de acá.
    dedupe: ['@google/genai'],
  },
  server: { fs: { allow: [resolve(aqui, '../..')] } },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        portada: resolve(aqui, 'index.html'),
        pruebaMotor: resolve(aqui, 'prueba-motor/index.html'),
      },
    },
  },
})
