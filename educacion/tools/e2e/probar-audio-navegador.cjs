// Prueba local de la voz en el navegador con Firebase y Gemini SIMULADOS (no gasta).
// Uso: compilar apps/web, servir dist/ con un firebase-config.json falso y correr
//   node probar-audio-navegador.cjs <carpeta con three/node_modules> [url]
// Mide si el audio del profe llega a los parlantes (pico > 0.05 = suena).
// Punta a punta en el navegador con Firebase y Gemini SIMULADOS: ¿suena la voz del profe?
const { chromium } = require('playwright'); const fs = require('fs');
const S = process.argv[2], URL = process.argv[3] || 'http://localhost:8766/maqueta/alumno.html';
const THREE = fs.readFileSync(S + '/three/node_modules/three/build/three.module.min.js');
// 1,5 s de "voz" (tono 300 Hz) en PCM16 24 kHz, en bloques de 100 ms
const bloques = []; for (let b = 0; b < 15; b++) { const n = 2400, buf = Buffer.alloc(n * 2); for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 300 * (b * n + i) / 24000) * 12000), i * 2); bloques.push(buf.toString('base64')); }
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=document-user-activation-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, permissions: ['microphone'] });
  await ctx.addInitScript(() => {
    // medidor en cada conexión a los parlantes
    window.__med = []; const orig = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest, ...r) {
      if (dest instanceof AudioDestinationNode) { const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__med.push({ a, sr: this.context.sampleRate, ctx: this.context }); }
      return orig.call(this, dest, ...r);
    };
    window.__pico = () => Math.max(0, ...window.__med.map(m => { const d = new Float32Array(2048); m.a.getFloatTimeDomainData(d); return Math.max(...d.map(Math.abs)); }));
    window.__estados = () => window.__med.map(m => m.sr + ':' + m.ctx.state);
  });
  const page = await ctx.newPage(); const errores = [], log = [];
  page.on('pageerror', e => errores.push(e.message));
  page.on('console', m => { if (/profes|Kay|error/i.test(m.text())) log.push(m.type() + ': ' + m.text().slice(0, 160)); });
  await page.route(/three.*\.module\.min\.js/, r => r.fulfill({ body: THREE, contentType: 'text/javascript' }));
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.route(/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword/, r => r.fulfill({ json: { kind: 'x', localId: 'alu_test', email: 'dueno@alumnos.nande-educacion.local', idToken: 'h.' + Buffer.from(JSON.stringify({ sub: 'alu_test', exp: 9999999999, iat: 1 })).toString('base64url') + '.s', refreshToken: 'r', expiresIn: '3600', registered: true } }));
  await page.route(/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup/, r => r.fulfill({ json: { users: [{ localId: 'alu_test', email: 'dueno@alumnos.nande-educacion.local' }] } }));
  await page.route(/cloudfunctions\.net\/(\w+)/, r => {
    const fn = r.request().url().match(/net\/(\w+)/)[1];
    if (fn === 'eduKayToken') return r.fulfill({ json: { result: { ok: true, token: 'auth_tokens/falso', modelo: 'gemini-falso', sesionId: 'ses1', segundosMax: 600 } } });
    if (fn === 'eduProfes') return r.fulfill({ json: { result: { ok: true, profes: [{ id: 'la_profe', nombre: 'Taji', titulo: 'la profe Taji', color: '#FBBF24' }, { id: 'el_profe', nombre: 'Jochi', titulo: 'el profe Jochi', color: '#8B5CF6' }], preferencias: {} } } });
    return r.fulfill({ json: { result: { ok: true } } });
  });
  let wsMensajes = 0;
  await page.routeWebSocket(/generativelanguage\.googleapis\.com/, ws => {
    ws.onMessage(m => {
      wsMensajes++;
      const t = typeof m === 'string' ? m : m.toString();
      if (t.includes('"setup"')) {
        ws.send(JSON.stringify({ setupComplete: {} }));
        setTimeout(() => {
          bloques.forEach((d, i) => setTimeout(() => ws.send(JSON.stringify({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: d } }] } } })), i * 60));
          setTimeout(() => ws.send(JSON.stringify({ serverContent: { turnComplete: true } })), 1200);
        }, 1500);
      }
    });
  });
  await page.goto(URL); await page.tap('#jugar');
  await page.waitForFunction(() => window.__listo3D && window.ProfesVoz, null, { timeout: 30000 });
  await page.tap('.profe[data-profe="el_profe"]');
  await page.waitForSelector('#pv-entrar.ver', { timeout: 8000 });
  await page.fill('#pv-entrar input[name=usuario]', 'dueno'); await page.fill('#pv-entrar input[name=clave]', 'x');
  await page.tap('#pv-entrar .si');
  let pico = 0; const t0 = Date.now();
  while (Date.now() - t0 < 9000) { pico = Math.max(pico, await page.evaluate(() => window.__pico())); await page.waitForTimeout(100); }
  console.log('mensajes WS del cliente:', wsMensajes, '| contextos con salida:', await page.evaluate(() => window.__estados()));
  console.log('PICO de audio que llegó a los parlantes:', pico.toFixed(3), pico > 0.05 ? '→ SUENA' : '→ NO SUENA');
  console.log('píldora:', await page.textContent('#pv-pildora').catch(() => '-'), '| botón sonido visible:', await page.isVisible('#pv-sonido'));
  console.log('log:', log.slice(-6)); console.log('errores:', errores.length ? errores : 'ninguno');
  await b.close();
})();
