// Genera el material impreso de los talleres con niños (EDU.01b):
// láminas A–D, cartas de mecánicas, viñetas para completar y fichas de votación.
// Salida: docs/educacion/talleres/ (PNG + PDF A3 + vistas JPG para el celular).
//
// Uso (desde la raíz del repo):
//   node tools/talleres/generar.mjs <carpeta-recursos>
// <carpeta-recursos> debe tener: three.module.min.js (three@0.160.0),
//   SpaceGrotesk-700.ttf, Inter-600.ttf, Inter-800.ttf  (ver docs/educacion/talleres/README.md)
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '../..');
const SALIDA = path.join(RAIZ, 'docs/educacion/talleres');
const RECURSOS = path.resolve(process.argv[2] || path.join(AQUI, 'recursos'));
const TMP = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'talleres-'));

// A3 apaisado a 150 ppp = 2480 × 1754 px (vista CSS 1240 × 877 con escala 2)
const W = 1240, H = 877, ESC = 2;

const LAMINAS = [
  { id: 'A', archivo: 'A-colegio-magico', titulo: 'Colegio mágico', sub: 'Cada aula es un portal', color: '#7C3AED' },
  { id: 'B', archivo: 'B-selva-nande', titulo: 'Selva Ñandé', sub: 'Río, lomas y animales', color: '#059669' },
  { id: 'C', archivo: 'C-mi-barrio', titulo: 'Mi barrio', sub: 'Santa Cruz en bloques', color: '#0284C7' },
  { id: 'D', archivo: 'D-mundo-que-creamos', titulo: 'Mundo que creamos', sub: 'Lo construimos entre todos', color: '#D97706' }
];

// ---------- servidor estático mínimo
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml' };
const servidor = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f;
  if (u.startsWith('/recursos/')) f = path.join(RECURSOS, u.slice(10));
  else if (u.startsWith('/tmp/')) f = path.join(TMP, u.slice(5));
  else f = path.join(AQUI, u);
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': tipos[path.extname(f)] || 'application/octet-stream' }); res.end(d);
  });
});
await new Promise(r => servidor.listen(0, r));
const BASE = `http://127.0.0.1:${servidor.address().port}`;

const nav = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

async function renderEscena(n, w, h) {
  const p = await nav.newPage({ viewport: { width: w, height: h } });
  p.on('console', m => m.type() === 'error' && console.error('  [escena]', m.text()));
  await p.goto(`${BASE}/escena.html?n=${n}&w=${w}&h=${h}`);
  await p.waitForFunction(() => window.__listo, null, { timeout: 180000 });
  const estado = await p.evaluate(() => window.__listo);
  if (estado !== 'ok') throw new Error(`escena ${n}: ${estado}`);
  const datos = await p.evaluate(() => document.getElementById('c').toDataURL('image/png'));
  await p.close();
  const f = path.join(TMP, `escena-${n}.png`);
  fs.writeFileSync(f, Buffer.from(datos.split(',')[1], 'base64'));
  return `/tmp/escena-${n}.png`;
}

const CSS = `
@font-face { font-family: 'Space Grotesk'; font-weight: 700; src: url(/recursos/SpaceGrotesk-700.ttf); }
@font-face { font-family: 'Inter'; font-weight: 600; src: url(/recursos/Inter-600.ttf); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url(/recursos/Inter-800.ttf); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: Inter, sans-serif; }
.t { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
`;

async function capturar(html, nombre) {
  const p = await nav.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: ESC });
  await p.goto(`${BASE}/escena.html?n=_&w=1&h=1`).catch(() => {}); // mismo origen para fuentes e imágenes
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${html}</body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const png = path.join(SALIDA, nombre + '.png');
  fs.mkdirSync(path.dirname(png), { recursive: true });
  await p.screenshot({ path: png });
  // vista liviana para el celular
  const jpg = path.join(SALIDA, 'vista', path.basename(nombre) + '.jpg');
  fs.mkdirSync(path.dirname(jpg), { recursive: true });
  const p2 = await nav.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p2.goto(`${BASE}/escena.html?n=_&w=1&h=1`).catch(() => {});
  await p2.setContent(await p.content(), { waitUntil: 'networkidle' });
  await p2.evaluate(() => document.fonts.ready);
  await p2.screenshot({ path: jpg, type: 'jpeg', quality: 78 });
  await p.close(); await p2.close();
  return png;
}

async function pdf(pngs, nombre) {
  const p = await nav.newPage();
  const html = pngs.map(f => `<div class="pag"><img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}"></div>`).join('');
  await p.setContent(`<!doctype html><html><head><style>
    @page { size: 420mm 297mm; margin: 0; }
    * { margin: 0; padding: 0; } .pag { width: 420mm; height: 297mm; page-break-after: always; overflow: hidden; }
    .pag:last-child { page-break-after: auto; } img { width: 100%; height: 100%; display: block; object-fit: contain; }
  </style></head><body>${html}</body></html>`);
  await p.pdf({ path: path.join(SALIDA, nombre + '.pdf'), width: '420mm', height: '297mm', printBackground: true });
  await p.close();
}

// ---------- 1. Láminas A–D
const todas = [];
for (const l of LAMINAS) {
  console.log('Lámina', l.id, '…');
  const img = await renderEscena(l.id, W * ESC, H * ESC);
  const html = `
  <div style="position:absolute;inset:0;background:url(${img}) center/cover"></div>
  <div style="position:absolute;left:34px;top:30px;width:150px;height:150px;border-radius:50%;background:${l.color};border:10px solid #fff;
    box-shadow:0 8px 0 rgba(0,0,0,.25);display:grid;place-items:center"><span class="t" style="font-size:96px;color:#fff;line-height:1">${l.id}</span></div>
  <div style="position:absolute;left:50%;bottom:22px;transform:translateX(-50%);background:#fff;border-radius:30px;padding:12px 40px 16px;
    box-shadow:0 10px 0 rgba(0,0,0,.25);text-align:center;border:6px solid ${l.color};white-space:nowrap">
    <div class="t" style="font-size:72px;line-height:1;color:#0F172A">${l.titulo}</div>
    <div style="font-size:26px;font-weight:600;color:#475569;margin-top:4px">${l.sub}</div></div>
  <div style="position:absolute;right:22px;bottom:12px;font-size:12px;color:rgba(255,255,255,.85);font-weight:600;text-shadow:0 1px 2px rgba(0,0,0,.5)">ÑANDÉ · Taller de mundos · lámina ${l.id}</div>`;
  const png = await capturar(html, 'laminas/' + l.archivo);
  await pdf([png], 'laminas/' + l.archivo);
  todas.push(png);
}

// ---------- 2. Cartas de mecánicas (sesión 2)
const ic = {
  avatares: `<g><rect x="18" y="58" width="44" height="44" rx="6" fill="#F472B6"/><rect x="24" y="34" width="32" height="28" rx="5" fill="#f2c79b"/><rect x="24" y="30" width="32" height="9" fill="#422006"/>
    <rect x="78" y="50" width="48" height="52" rx="6" fill="#10B981"/><rect x="84" y="20" width="36" height="32" rx="5" fill="#d9a274"/><rect x="84" y="16" width="36" height="10" fill="#1c1917"/>
    <rect x="142" y="58" width="44" height="44" rx="6" fill="#38BDF8"/><rect x="148" y="34" width="32" height="28" rx="5" fill="#b57a4f"/><rect x="148" y="30" width="32" height="9" fill="#0f172a"/>
    <g fill="#111"><rect x="31" y="44" width="5" height="6"/><rect x="44" y="44" width="5" height="6"/><rect x="93" y="32" width="6" height="7"/><rect x="106" y="32" width="6" height="7"/><rect x="155" y="44" width="5" height="6"/><rect x="168" y="44" width="5" height="6"/></g></g>`,
  casa: `<g><rect x="40" y="62" width="120" height="70" rx="4" fill="#fde68a"/><path d="M28 66 L100 16 L172 66 Z" fill="#ef4444"/><rect x="88" y="90" width="26" height="42" fill="#7c4a1e"/>
    <rect x="54" y="80" width="22" height="20" fill="#bae6fd"/><rect x="128" y="80" width="22" height="20" fill="#bae6fd"/>
    <path d="M160 18 c-8 -12 -26 -4 -16 10 l16 14 l16 -14 c10 -14 -8 -22 -16 -10z" fill="#F472B6"/></g>`,
  ranking: `<g><rect x="74" y="50" width="52" height="82" fill="#FDE047"/><rect x="20" y="78" width="52" height="54" fill="#cbd5e1"/><rect x="128" y="96" width="52" height="36" fill="#fdba74"/>
    <text x="100" y="98" font-family="Space Grotesk" font-weight="700" font-size="34" text-anchor="middle" fill="#0F172A">1</text>
    <text x="46" y="114" font-family="Space Grotesk" font-weight="700" font-size="30" text-anchor="middle" fill="#0F172A">2</text>
    <text x="154" y="124" font-family="Space Grotesk" font-weight="700" font-size="26" text-anchor="middle" fill="#0F172A">3</text>
    <path d="M84 18 l8 14 l8 -14 l8 14 l8 -14 v24 h-32z" fill="#F59E0B"/></g>`,
  regalos: `<g><rect x="42" y="66" width="116" height="66" rx="4" fill="#A78BFA"/><rect x="34" y="48" width="132" height="24" rx="4" fill="#8B5CF6"/>
    <rect x="92" y="48" width="16" height="84" fill="#FDE047"/><path d="M100 48 c-20 -30 -46 -10 -26 0z M100 48 c20 -30 46 -10 26 0z" fill="none" stroke="#FDE047" stroke-width="9"/></g>`,
  tutor: `<g><rect x="40" y="38" width="92" height="84" rx="10" fill="#10B981"/><rect x="50" y="52" width="72" height="50" rx="6" fill="#064E3B"/>
    <rect x="62" y="64" width="12" height="16" fill="#ECFDF5"/><rect x="98" y="64" width="12" height="16" fill="#ECFDF5"/><rect x="74" y="88" width="24" height="5" fill="#6EE7B7"/>
    <rect x="83" y="16" width="6" height="22" fill="#cbd5e1"/><rect x="78" y="8" width="16" height="12" fill="#FDE047"/>
    <path d="M146 60 q12 20 0 40 M160 50 q22 30 0 60 M174 40 q30 40 0 80" fill="none" stroke="#38BDF8" stroke-width="7" stroke-linecap="round"/></g>`,
  secreto: `<g><rect x="30" y="20" width="120" height="112" fill="#a8a29e"/><rect x="58" y="44" width="64" height="88" fill="#1e1b4b"/>
    <path d="M58 44 L84 54 L84 132 L58 132 Z" fill="#7c4a1e"/>
    <circle cx="96" cy="84" r="12" fill="#e9d5ff" opacity=".8"/><circle cx="110" cy="100" r="16" fill="#e9d5ff" opacity=".7"/><circle cx="100" cy="118" r="14" fill="#e9d5ff" opacity=".8"/>
    <text x="104" y="76" font-family="Space Grotesk" font-weight="700" font-size="34" text-anchor="middle" fill="#FDE047">?</text>
    <g transform="translate(150 70) rotate(30)"><circle cx="0" cy="0" r="14" fill="none" stroke="#facc15" stroke-width="8"/><rect x="-4" y="12" width="8" height="40" fill="#facc15"/><rect x="4" y="36" width="12" height="7" fill="#facc15"/><rect x="4" y="46" width="9" height="6" fill="#facc15"/></g></g>`,
  equipo: `<g>${[0, 1, 2, 3, 4].map(i => `<rect x="${14 + i * 36}" y="${60 - (i % 2) * 8}" width="30" height="32" rx="4" fill="${['#10B981', '#F59E0B', '#38BDF8', '#F472B6', '#A78BFA'][i]}"/><rect x="${18 + i * 36}" y="${38 - (i % 2) * 8}" width="22" height="22" rx="4" fill="${['#f2c79b', '#d9a274', '#b57a4f', '#e8b98c', '#8d5a3b'][i]}"/>`).join('')}
    <rect x="20" y="108" width="160" height="22" rx="11" fill="#e5e7eb"/><rect x="20" y="108" width="112" height="22" rx="11" fill="#10B981"/></g>`,
  idea: `<g><circle cx="100" cy="66" r="40" fill="none" stroke="#94a3b8" stroke-width="7" stroke-dasharray="12 10"/><rect x="84" y="108" width="32" height="16" rx="4" fill="#94a3b8"/>
    <text x="100" y="84" font-family="Space Grotesk" font-weight="700" font-size="52" text-anchor="middle" fill="#94a3b8">?</text></g>`
};
const CARTAS = [
  ['avatares', 'Ver a mis compañeros', '#FCE7F3'], ['casa', 'Visitar su casa', '#FEF3C7'], ['ranking', 'Ranking', '#F1F5F9'], ['regalos', 'Regalos', '#EDE9FE'],
  ['tutor', 'Tutor que habla', '#D1FAE5'], ['secreto', 'Lugar secreto', '#E0E7FF'], ['equipo', 'Equipo del curso', '#E0F2FE'], ['idea', 'Mi idea', '#FFFFFF']
];
{
  const html = `<div style="position:absolute;inset:0;background:#fff;padding:26px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:0">
    ${CARTAS.map(([k, t, fondo]) => `<div style="border:2px dashed #cbd5e1;padding:14px;display:flex">
      <div style="flex:1;border-radius:26px;background:${fondo};border:5px solid #0F172A;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
        <svg viewBox="0 0 200 140" width="230" height="161">${ic[k]}</svg>
        <div class="t" style="font-size:32px;color:#0F172A;text-align:center;line-height:1.05;padding:0 8px">${t}</div></div></div>`).join('')}
  </div>
  <div style="position:absolute;left:30px;top:8px;font-size:12px;color:#64748b;font-weight:600">✂ Recortar por la línea punteada · ÑANDÉ · Taller 2 · cartas</div>`;
  const png = await capturar(html, 'cartas');
  await pdf([png], 'cartas');
  todas.push(png);
}

// ---------- 3. Viñetas para completar (2×2 por hoja)
const TIRAS = [
  { titulo: '¿Qué pasa cuando terminás la misión?', paneles: ['v1', 'v2', 'v3', null] },
  { titulo: '¿Qué hay detrás de la puerta?', paneles: ['v4', null, null, null] },
  { titulo: 'Un compañero necesita ayuda', paneles: ['v5', null, null, null] }
];
const PW = 560, PH = 360; // tamaño CSS de cada viñeta
const vinetas = [];
for (const [i, tira] of TIRAS.entries()) {
  console.log('Viñetas', i + 1, '…');
  const imgs = [];
  for (const v of tira.paneles) imgs.push(v ? await renderEscena(v, PW * ESC, PH * ESC) : null);
  const html = `<div style="position:absolute;inset:0;background:#fff;padding:22px 40px">
    <div class="t" style="font-size:44px;color:#0F172A;text-align:center;margin-bottom:12px">${tira.titulo}</div>
    <div style="display:grid;grid-template-columns:repeat(2,${PW}px);grid-template-rows:repeat(2,${PH}px);gap:20px 30px;justify-content:center">
    ${imgs.map((im, k) => `<div style="position:relative;border:6px solid #0F172A;border-radius:22px;overflow:hidden;background:${im ? `url(${im}) center/cover` : '#fff'}">
      <div class="t" style="position:absolute;left:10px;top:10px;width:48px;height:48px;border-radius:50%;background:#10B981;color:#fff;display:grid;place-items:center;font-size:28px">${k + 1}</div>
      ${im ? '' : '<svg style="position:absolute;right:14px;bottom:14px" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z M14 6.5l2.5 2.5"/></svg>'}
    </div>`).join('')}</div></div>
    <div style="position:absolute;right:30px;bottom:8px;font-size:12px;color:#64748b;font-weight:600">ÑANDÉ · Taller 2 · viñetas ${i + 1}/3</div>`;
  const png = await capturar(html, `vinetas-${i + 1}`);
  vinetas.push(png); todas.push(png);
}
await pdf(vinetas, 'vinetas');

// ---------- 4. Fichas de votación (sesión 1)
{
  const cara = (c, boca) => `<svg viewBox="0 0 100 100" width="118" height="118"><circle cx="50" cy="50" r="46" fill="${c}" stroke="#0F172A" stroke-width="4"/>
    <circle cx="35" cy="40" r="6" fill="#0F172A"/><circle cx="65" cy="40" r="6" fill="#0F172A"/><path d="${boca}" fill="none" stroke="#0F172A" stroke-width="6" stroke-linecap="round"/></svg>`;
  const F = [['#22c55e', 'M30 62 Q50 80 70 62'], ['#facc15', 'M32 66 L68 66'], ['#ef4444', 'M30 72 Q50 56 70 72']];
  const html = `<div style="position:absolute;inset:0;background:#fff;padding:34px 30px;display:grid;grid-template-columns:repeat(9,1fr);grid-template-rows:repeat(6,1fr);place-items:center">
    ${F.flatMap(([c, b]) => Array(18).fill(cara(c, b))).join('')}</div>
    <div style="position:absolute;left:30px;top:8px;font-size:12px;color:#64748b;font-weight:600">Fichas: verde = "quiero vivir acá" · amarilla = "más o menos" · roja = "aburrido" · ✂ recortar · ÑANDÉ · Taller 1</div>`;
  const png = await capturar(html, 'fichas');
  await pdf([png], 'fichas');
  todas.push(png);
}

await pdf(todas, 'todo-para-imprimir');
await nav.close(); servidor.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log('Listo en', SALIDA);
