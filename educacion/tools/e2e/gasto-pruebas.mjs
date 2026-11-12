// ══════════════════════════════════════════════════
//  Línea para el resumen del workflow: cuánto gastaron hoy las pruebas automáticas
//  (bolsa aparte, EDU.04e) y cuánto la bolsa general (chicos, profes y dueño).
//  Uso: EDU_DATABASE_URL=… node e2e/gasto-pruebas.mjs
// ══════════════════════════════════════════════════
import { appendFileSync } from 'node:fs'
import { initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

initializeApp({ projectId: process.env.PROYECTO || 'municipio-ia', databaseURL: process.env.EDU_DATABASE_URL })
const fecha = new Date(Date.now() - 4 * 3600e3).toISOString().slice(0, 10) // día de Bolivia
const db = getDatabase()
const [pruebas, general, demo] = await Promise.all([
  db.ref(`edu/uso_pruebas/${fecha}/costoUsd`).once('value'),
  db.ref(`edu/uso_global/${fecha}/costoUsd`).once('value'),
  db.ref(`edu/uso_demo/${fecha}/costoUsd`).once('value'),
])
const tope = Number(process.env.EDU_TOPE_COSTO_PRUEBAS_DIA_USD) || 1
const linea = `💰 Gasto de IA hoy (${fecha}, hora de Bolivia): pruebas automáticas **USD ${(pruebas.val() || 0).toFixed(3)}** de ${tope} · chicos, profes y dueño USD ${(general.val() || 0).toFixed(3)} de 5 · demo USD ${(demo.val() || 0).toFixed(3)} de 2`
console.log(linea)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${linea}\n`)
process.exit(0)
