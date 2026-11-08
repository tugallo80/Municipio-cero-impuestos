import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const aqui = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@voz-kay': resolve(aqui, '../../packages/voz-kay/src'),
      '@tutor': resolve(aqui, '../../services/ai-gateway/tutor'),
    },
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
        // Módulo de voz de los profes para la maqueta del alumno: nombre fijo
        // (/voz/profes.js) porque lo importa una página que no pasa por Vite.
        profes: resolve(aqui, 'profes/profes-voz.js'),
        // EDU.04a: cuenta y Functions de la clase grabada (/voz/clase.js) para la maqueta.
        clase: resolve(aqui, 'clase/clase-cuenta.js'),
      },
      // El módulo de los profes no exporta nada: que Vite no le quite el código.
      preserveEntrySignatures: 'allow-extension',
      output: {
        entryFileNames: (c) => (c.name === 'profes' ? 'voz/profes.js' : c.name === 'clase' ? 'voz/clase.js' : 'assets/[name]-[hash].js'),
      },
    },
  },
})
