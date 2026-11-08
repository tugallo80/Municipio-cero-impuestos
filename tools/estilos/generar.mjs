// EDU.01c — Genera las láminas de comparación de estilos y la lámina E de los talleres.
//   · educacion/estilos/capturas/{BLOQUES,PIEZAS,REAL,HORIZONTE,VIVO,PROMO,A,B}-{colegio,obra,portal}-{celular,horizontal}.jpg
//   · educacion/estilos/capturas/transicion-{1a2,2a3,3a4,4a5,5a6}-{celular,horizontal}.jpg
//   · educacion/estilos/capturas/construir-{celular,horizontal}.jpg
//   · educacion/estilos/capturas/fps.json  (medido en el navegador del contenedor, sin GPU)
//   · docs/educacion/talleres/laminas/E-mi-colegio-en-santa-cruz.{png,pdf} + vista/…jpg
//
// Uso (desde la raíz del repo):
//   node tools/estilos/generar.mjs <carpeta-recursos>
// <carpeta-recursos>: three.module.min.js (three@0.160.0) y space-grotesk-latin-700-normal.woff2
// (paquete npm @fontsource/space-grotesk). Inter se toma del sistema.
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const req = createRequire(import.meta.url);
let pw; try { pw = req('playwright'); } catch { pw = createRequire('/opt/node22/lib/node_modules/')('playwright'); }
const { chromium } = pw;
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REC = path.resolve(process.argv[2] || 'recursos');
const CAP = path.join(RAIZ, 'educacion/estilos/capturas');
const LAM = path.join(RAIZ, 'docs/educacion/talleres');
const solo = process.argv[3] || 'todo'; // todo | capturas | fps | lamina
fs.mkdirSync(CAP, { recursive: true });

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  const f = u.startsWith('/recursos/') ? path.join(REC, u.slice(10)) : path.join(RAIZ, u.endsWith('/') ? u + 'index.html' : u);
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
});
await new Promise(r => srv.listen(0, r));
const BASE = `http://127.0.0.1:${srv.address().port}`;
const nav = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function pagina(w, h, dsf) {
  const p = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dsf });
  // el CDN de three.js no se alcanza desde el contenedor: se sirve la misma versión local
  await p.route(/three\.module\.min\.js$/, r => r.fulfill({ path: path.join(REC, 'three.module.min.js'), contentType: 'text/javascript' }));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  p.on('pageerror', e => console.error('  [error]', e.message));
  return p;
}
async function abrir(p, url) {
  await p.goto(BASE + url);
  await p.waitForFunction(() => window.__listo, null, { timeout: 240000 });
  const est = await p.evaluate(() => window.__listo);
  if (est !== 'ok') throw new Error(url + ': ' + est);
}

const FORMATOS = { celular: [390, 844], horizontal: [1280, 800] };
const ESTILOS = ['BLOQUES', 'PIEZAS', 'REAL', 'HORIZONTE', 'VIVO', 'PROMO', 'A', 'B']; // C quedó fuera de la vitrina
const NOMBRE = { BLOQUES: '1 · Bloques', PIEZAS: '2 · Piezas', REAL: '3 · Mundo real', HORIZONTE: '4 · Horizonte', VIVO: '5 · Mundo vivo', PROMO: '6 · Promo', A: 'A · Maqueta Viva', B: 'B · Tierra Pintada', C: 'C · Pixel Camba (modo liviano)' };

if (solo === 'todo' || solo === 'capturas') {
  for (const e of ESTILOS) for (const v of ['colegio', 'obra', 'portal']) for (const [f, [w, h]] of Object.entries(FORMATOS)) {
    const p = await pagina(w, h, 2);
    await abrir(p, `/educacion/estilos/escena.html?estilo=${e}&vista=${v}&captura=1&calidad=alta`);
    const out = path.join(CAP, `${e}-${v}-${f}.jpg`);
    await p.waitForTimeout(400);
    await p.screenshot({ path: out, type: 'jpeg', quality: 84, timeout: 180000 });
    console.log('captura', path.relative(RAIZ, out));
    await p.close();
  }
  for (const [de, a, n] of [['BLOQUES', 'PIEZAS', '1a2'], ['PIEZAS', 'REAL', '2a3'], ['REAL', 'HORIZONTE', '3a4'], ['HORIZONTE', 'VIVO', '4a5'], ['VIVO', 'PROMO', '5a6']]) for (const [f, [w, h]] of Object.entries(FORMATOS)) {
    const p = await pagina(w, h, 2);
    await abrir(p, `/educacion/estilos/transicion.html?de=${de}&a=${a}&captura=1&calidad=alta&t=2.75`);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(CAP, `transicion-${n}-${f}.jpg`), type: 'jpeg', quality: 84, timeout: 180000 });
    console.log('captura transición', n, f);
    await p.close();
  }
  for (const [f, [w, h]] of Object.entries(FORMATOS)) {
    const p = await pagina(w, h, 2);
    await abrir(p, '/educacion/estilos/construir.html?captura=1&calidad=alta');
    await p.evaluate(() => { window.__tocar(6, 0); window.__tocar(6, 1); window.__tocar(6, 1); });
    await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(CAP, `construir-${f}.jpg`), type: 'jpeg', quality: 84 });
    await p.close();
  }
}

if (solo === 'todo' || solo === 'fps') {
  // fps en el navegador del contenedor (render por software, SIN GPU): es un piso, no la tablet real
  const res = { nota: 'Chromium headless con SwiftShader (CPU, sin GPU) en el contenedor de la sesión. Resolución normal (no la de captura). Mediana de 6 s.', fecha: new Date().toISOString().slice(0, 10), medidas: [] };
  const mediana = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  // cuadros por segundo reales durante 8 s (sirve también cuando hay menos de 1 fps)
  const medir = p => p.evaluate(() => new Promise(r => {
    let n = 0; const t0 = performance.now();
    const f = () => { n++; if (performance.now() - t0 < 8000) requestAnimationFrame(f); else r(Math.round(n * 10000 / (performance.now() - t0)) / 10); };
    requestAnimationFrame(f);
  }));
  for (const [f, [w, h]] of Object.entries(FORMATOS)) {
    for (const e of ESTILOS) {
      const p = await pagina(w, h, 1);
      await abrir(p, `/educacion/estilos/escena.html?estilo=${e}&vista=general&calidad=fija`);
      await p.waitForTimeout(1500);
      const fps = await medir(p);
      const d = await p.evaluate(() => window.__info());
      res.medidas.push({ estilo: e, pagina: `${NOMBRE[e]} (vista Todo)`, formato: f, fps, llamadasDeDibujo: d.llamadas, triangulos: d.triangulos, armadoMs: d.armadoMs });
      console.log('fps', e, f, fps);
      await p.close();
    }
    {
      const p = await pagina(w, h, 1);
      await abrir(p, '/educacion/estilos/transicion.html?de=VIVO&a=PROMO');
      await p.waitForTimeout(1500);
      const fps = await medir(p);
      res.medidas.push({ pagina: 'transición 5 → 6 (dos mundos a la vez)', formato: f, fps });
      console.log('fps transición', f, fps);
      await p.close();
    }
    const p = await pagina(w, h, 1);
    await abrir(p, '/educacion/estilos/construir.html');
    for (let k = 0; k < 6; k++) { await p.evaluate(k => window.__tocar(k, 6), k); await p.waitForTimeout(400); }
    await p.waitForTimeout(4000);
    const fps = await p.evaluate(() => window.__fps.slice(1));
    res.medidas.push({ pagina: 'construir (A, tocando celdas)', formato: f, fps: mediana(fps) });
    console.log('fps construir', f, mediana(fps));
    await p.close();
  }
  fs.writeFileSync(path.join(CAP, 'fps.json'), JSON.stringify(res, null, 2) + '\n');
}

if (solo === 'todo' || solo === 'lamina') {
  // Lámina E: "Mi colegio en Santa Cruz" (A3 apaisado, 150 ppp), estilo A
  const W = 1240, H = 877;
  const p = await pagina(W, H, 2);
  await abrir(p, '/educacion/estilos/escena.html?estilo=A&tipo=mapa&vista=lamina&captura=1&calidad=alta&etiquetas=0&limpia=1');
  const fondo = (await p.screenshot({ type: 'png' })).toString('base64');
  await p.close();
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: 'Space Grotesk'; font-weight: 700; src: url(/recursos/space-grotesk-latin-700-normal.woff2); }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: Inter, sans-serif; }
    .t { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
  </style></head><body>
  <div style="position:absolute;inset:0;background:url(data:image/png;base64,${fondo}) center/cover"></div>
  <div style="position:absolute;left:34px;top:30px;width:150px;height:150px;border-radius:50%;background:#10B981;border:10px solid #fff;
    box-shadow:0 8px 0 rgba(0,0,0,.25);display:grid;place-items:center"><span class="t" style="font-size:96px;color:#fff;line-height:1">E</span></div>
  <div style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:#fff;border-radius:30px;padding:12px 40px 16px;
    box-shadow:0 10px 0 rgba(0,0,0,.25);text-align:center;border:6px solid #10B981;white-space:nowrap">
    <div class="t" style="font-size:66px;line-height:1;color:#0F172A">Mi colegio en Santa Cruz</div>
    <div style="font-size:25px;font-weight:600;color:#475569;margin-top:4px">Construí tu colegio, hacé crecer el bosque y visitá otros por portales</div></div>
  <div style="position:absolute;right:22px;top:16px;font-size:12px;color:rgba(0,0,0,.55);font-weight:600">ÑANDÉ · Taller de mundos · lámina E · estilo A "Maqueta Viva"</div>
  </body></html>`;
  const tmp = path.join(RAIZ, 'educacion/estilos/_lamina-tmp.html');
  fs.writeFileSync(tmp, html);
  try {
    const nombre = 'E-mi-colegio-en-santa-cruz';
    const q = await pagina(W, H, 2);
    await q.goto(BASE + '/educacion/estilos/_lamina-tmp.html', { waitUntil: 'networkidle' });
    await q.evaluate(() => document.fonts.ready);
    const png = path.join(LAM, 'laminas', nombre + '.png');
    await q.screenshot({ path: png });
    const q1 = await pagina(W, H, 1);
    await q1.goto(BASE + '/educacion/estilos/_lamina-tmp.html', { waitUntil: 'networkidle' });
    await q1.evaluate(() => document.fonts.ready);
    await q1.screenshot({ path: path.join(LAM, 'vista', nombre + '.jpg'), type: 'jpeg', quality: 78 });
    const pd = await nav.newPage();
    await pd.setContent(`<!doctype html><html><head><style>@page { size: 420mm 297mm; margin: 0; } * { margin: 0; padding: 0; }
      img { width: 420mm; height: 297mm; display: block; object-fit: contain; }</style></head>
      <body><img src="data:image/png;base64,${fs.readFileSync(png).toString('base64')}"></body></html>`);
    await pd.pdf({ path: path.join(LAM, 'laminas', nombre + '.pdf'), width: '420mm', height: '297mm', printBackground: true });
    console.log('lámina E lista');
    await q.close(); await q1.close(); await pd.close();
  } finally { fs.rmSync(tmp, { force: true }); }
}

await nav.close();
srv.close();
