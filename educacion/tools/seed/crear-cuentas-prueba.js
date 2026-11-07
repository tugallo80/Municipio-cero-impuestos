// ══════════════════════════════════════════════════
//  Crea/actualiza las cuentas de prueba de Educación y el contenido demo.
//  Lo corre el workflow "Educación — deploy" con la cuenta de deploy (Workload
//  Identity, sin llaves). Idempotente: se puede correr las veces que haga falta.
//
//  Reemplaza a seed/crearHijos.js de rubikeduai-backend: ya no guarda nombres
//  reales, y la clave no está en el repo (solo su hash bcrypt).
//
//  Uso: EDU_DATABASE_URL=https://….firebaseio.com node seed/crear-cuentas-prueba.js
// ══════════════════════════════════════════════════
const admin = require('firebase-admin');
const { cuentas, dominio } = require('./cuentas-prueba.json');
const contenido = require('./contenido-demo.json');
const reglas = require('../../database.rules.json');

admin.initializeApp({
  projectId: process.env.PROYECTO || 'municipio-ia',
  databaseURL: process.env.EDU_DATABASE_URL,
});
const db = admin.database();

(async () => {
  // Reglas de la base: todo cerrado al navegador (solo el servidor lee/escribe).
  await db.setRules(JSON.stringify(reglas));
  console.log('✅ Reglas de la base aplicadas (cerrada al navegador)');

  const usuarios = cuentas.map((c) => ({
    uid: c.uid,
    email: `${c.usuario}@${dominio}`,
    emailVerified: true,
    passwordHash: Buffer.from(c.hashBcrypt),
  }));
  const r = await admin.auth().importUsers(usuarios, { hash: { algorithm: 'BCRYPT' } });
  if (r.failureCount) {
    for (const e of r.errors) console.error(`❌ Cuenta ${usuarios[e.index].uid}: ${e.error.message}`);
    process.exit(1);
  }

  for (const c of cuentas) {
    await db.ref(`edu/uid_alumno/${c.uid}`).set(c.alumnoId);
    await db.ref(`edu/alumnos/${c.alumnoId}`).set({ curso: c.curso, estilo: c.estilo });
    console.log(`✅ Cuenta "${c.usuario}" lista (alumno ${c.alumnoId}, ${c.curso})`);
  }

  for (const [curso, datos] of Object.entries(contenido)) {
    if (curso.startsWith('_')) continue;
    await db.ref(`edu/contenido/${curso}`).set(datos);
    console.log(`✅ Contenido demo de ${curso}`);
  }
  process.exit(0);
})().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
