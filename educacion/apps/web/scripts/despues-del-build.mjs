// Copia a dist/ lo que no pasa por Vite:
// - los audioWorklets de voz-kay (tienen que ser archivos reales servidos por URL)
// - la maqueta navegable de EDU.01 (/maqueta/), la presentación de EDU.14 (/presentacion/) y los estilos de EDU.01c/EDU.06a (/estilos/)
// - la config pública de Firebase si el workflow la dejó en FIREBASE_WEB_CONFIG
import { cpSync, existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const web = fileURLToPath(new URL('..', import.meta.url))
const edu = resolve(web, '../..')
const dist = resolve(web, 'dist')

cpSync(resolve(edu, 'packages/voz-kay/audioWorklets'), resolve(dist, 'audioWorklets'), { recursive: true })
if (existsSync(resolve(edu, 'maqueta'))) cpSync(resolve(edu, 'maqueta'), resolve(dist, 'maqueta'), { recursive: true })
// EDU.17b: páginas reales (imagen) de los libros de área de 2.º de secundaria para el lector "Mis textos"
const paginas = resolve(edu, 'datos/textos-oficiales/2do-secundaria/paginas')
if (existsSync(paginas)) cpSync(paginas, resolve(dist, 'maqueta/textos/paginas'), { recursive: true })
// EDU.14: presentación del proyecto para el profe del piloto (/presentacion/)
if (existsSync(resolve(edu, 'presentacion'))) cpSync(resolve(edu, 'presentacion'), resolve(dist, 'presentacion'), { recursive: true })
// EDU.06a: los estilos (evoluciones del mundo, transición de curso) que usa la maqueta del alumno
if (existsSync(resolve(edu, 'estilos'))) cpSync(resolve(edu, 'estilos'), resolve(dist, 'estilos'), { recursive: true })

const cfg = process.env.FIREBASE_WEB_CONFIG
if (cfg) {
  const c = JSON.parse(cfg)
  const publico = { apiKey: c.apiKey, authDomain: c.authDomain, projectId: c.projectId, appId: c.appId }
  writeFileSync(resolve(dist, 'firebase-config.json'), JSON.stringify(publico))
  console.log('firebase-config.json escrito (config pública, sin secretos)')
} else {
  console.log('Sin FIREBASE_WEB_CONFIG: la página de prueba no va a poder iniciar sesión (solo desarrollo local).')
}
console.log('dist/ listo')
