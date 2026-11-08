// Escenas de bloques para las láminas de los talleres con niños (EDU.01b).
// Diseño propio: nada de arte, personajes ni marcas de juegos existentes.
// Se usa desde escena.html (?n=A&w=...&h=...) y lo captura generar.mjs con Playwright.
import * as THREE from './recursos/three.module.min.js';

// ------------------------------------------------------------------ utilidades
const caja = new THREE.BoxGeometry(1, 1, 1);
const cacheMat = {};
function mat(color, extra) {
  const k = color + (extra ? JSON.stringify(extra) : '');
  return cacheMat[k] || (cacheMat[k] = new THREE.MeshLambertMaterial({ color, ...(extra || {}) }));
}
let escena;
function B(x, y, z, sx, sy, sz, color, padre = escena, extra) {
  const m = new THREE.Mesh(caja, mat(color, extra));
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = !(extra && extra.transparent); m.receiveShadow = true;
  padre.add(m); return m;
}
function grupo(x = 0, y = 0, z = 0, ry = 0, padre = escena) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; padre.add(g); return g;
}
// pseudoaleatorio estable (las láminas salen iguales cada vez)
let semilla = 7;
const azar = () => { semilla = (semilla * 16807) % 2147483647; return (semilla - 1) / 2147483646; };
const elegir = arr => arr[Math.floor(azar() * arr.length)];

// Terreno de columnas de bloques: alto(x,z) -> entero, color(x,z,h) -> color
function terreno(x0, x1, z0, z1, alto, color) {
  const celdas = [];
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const h = alto(x, z); if (h === null) continue;
    celdas.push([x, z, h]);
  }
  const im = new THREE.InstancedMesh(caja, new THREE.MeshLambertMaterial(), celdas.length);
  const m4 = new THREE.Matrix4(), c = new THREE.Color();
  celdas.forEach(([x, z, h], i) => {
    const alto = Math.max(h, .2) + 2; // se hunde 2 bloques para que no se vean huecos
    m4.makeScale(1, alto, 1); m4.setPosition(x, h - alto / 2, z);
    im.setMatrixAt(i, m4); im.setColorAt(i, c.set(color(x, z, h)));
  });
  im.castShadow = true; im.receiveShadow = true; escena.add(im);
  return im;
}

function cartelTexto(texto, { fondo = null, color = '#0F172A', tam = 200, ancho = 256, alto = 256, fuente = 'Space Grotesk' } = {}) {
  const c = document.createElement('canvas'); c.width = ancho; c.height = alto;
  const g = c.getContext('2d');
  if (fondo) { g.fillStyle = fondo; g.beginPath(); g.roundRect(8, 8, ancho - 16, alto - 16, 40); g.fill(); }
  g.fillStyle = color; g.font = `700 ${tam}px "${fuente}", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(texto, ancho / 2, alto / 2 + tam * .06);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function sprite(texto, x, y, z, escala = 2, op = {}, padre = escena) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cartelTexto(texto, op), transparent: true }));
  s.position.set(x, y, z); s.scale.set(escala * (op.ancho || 256) / 256, escala * (op.alto || 256) / 256, 1); padre.add(s); return s;
}
// Panel plano con textura (portales, pizarras)
function plano(tex, x, y, z, w, h, ry = 0, padre = escena, brillo = true) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
    brillo ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshLambertMaterial({ map: tex }));
  m.position.set(x, y, z); m.rotation.y = ry; padre.add(m); return m;
}

// ------------------------------------------------------------------ personajes propios
const PIELES = ['#f2c79b', '#d9a274', '#b57a4f', '#8d5a3b', '#e8b98c'];
const ROPA = ['#10B981', '#F59E0B', '#38BDF8', '#F472B6', '#A78BFA', '#FB923C', '#EF4444', '#FDE047'];
// Niño de bloques. pose: 'parado' | 'camina' | 'festeja' | 'saluda' | 'carga' | 'agachado'
function nino(x, z, ry = 0, o = {}, padre = escena) {
  const y0 = o.y || 0;
  const g = grupo(x, y0, z, ry, padre);
  const piel = o.piel || elegir(PIELES), remera = o.remera || elegir(ROPA);
  const pant = o.pantalon || elegir(['#334155', '#1e3a8a', '#7c2d12', '#365314']);
  const pelo = o.pelo || elegir(['#1c1917', '#422006', '#57351c', '#0f172a']);
  const pose = o.pose || 'parado';
  const s = o.escala || 1; g.scale.setScalar(s);
  const pI = B(-.2, .38, 0, .34, .75, .38, pant, g), pD = B(.2, .38, 0, .34, .75, .38, pant, g);
  B(0, 1.22, 0, .86, .95, .52, remera, g);
  B(0, 2.02, 0, .76, .68, .66, piel, g);
  B(-.17, 2.08, .335, .1, .12, .02, '#111827', g); B(.17, 2.08, .335, .1, .12, .02, '#111827', g);
  B(0, 1.86, .335, .24, .05, .02, '#7f1d1d', g);
  B(0, 2.42, -.02, .8, .2, .72, pelo, g);
  if (o.colita) B(0, 2.05, -.42, .3, .5, .2, pelo, g);
  if (o.gorra) { B(0, 2.48, 0, .82, .14, .74, o.gorra, g); B(0, 2.43, .45, .5, .06, .3, o.gorra, g); }
  if (o.mochila) B(0, 1.25, -.36, .6, .7, .22, o.mochila, g);
  const bI = B(-.57, 1.25, 0, .24, .78, .28, piel, g), bD = B(.57, 1.25, 0, .24, .78, .28, piel, g);
  [bI, bD].forEach(b => { b.geometry = caja; });
  const pivote = (b, ang, eje = 'x') => { // gira desde el hombro
    b.position.y = 1.25 + .39 * Math.cos(ang) - .39 + .39; // aproximado
    b.rotation[eje] = ang;
  };
  if (pose === 'festeja') { bI.rotation.z = 2.6; bD.rotation.z = -2.6; bI.position.set(-.72, 1.85, 0); bD.position.set(.72, 1.85, 0); }
  if (pose === 'saluda') { bD.rotation.z = -2.5; bD.position.set(.74, 1.85, 0); }
  if (pose === 'carga') { bI.rotation.x = -1.4; bD.rotation.x = -1.4; bI.position.set(-.45, 1.45, .35); bD.position.set(.45, 1.45, .35); }
  if (pose === 'camina') { pI.rotation.x = .45; pD.rotation.x = -.45; bI.rotation.x = -.5; bD.rotation.x = .5; }
  if (pose === 'senala') { bD.rotation.x = -1.5; bD.position.set(.57, 1.55, .38); }
  void pivote;
  return g;
}
// Kay: tutor robot-cubo flotante, propio de ÑANDÉ
function kay(x, y, z, ry = 0, s = 1, padre = escena) {
  const g = grupo(x, y, z, ry, padre); g.scale.setScalar(s);
  B(0, 0, 0, 1.1, 1, 1, '#10B981', g);
  B(0, .05, .51, .86, .62, .02, '#064E3B', g);
  B(-.2, .12, .53, .16, .2, .02, '#ECFDF5', g, { emissive: '#ECFDF5' });
  B(.2, .12, .53, .16, .2, .02, '#ECFDF5', g, { emissive: '#ECFDF5' });
  B(0, -.12, .53, .3, .06, .02, '#6EE7B7', g);
  B(0, .65, 0, .08, .3, .08, '#d1d5db', g);
  B(0, .85, 0, .2, .2, .2, '#FDE047', g, { emissive: '#a16207' });
  B(-.62, 0, 0, .14, .5, .5, '#047857', g); B(.62, 0, 0, .14, .5, .5, '#047857', g);
  const som = new THREE.Mesh(new THREE.CircleGeometry(.5, 20), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .18 }));
  som.rotation.x = -Math.PI / 2; som.position.set(x, .03, z); escena.add(som);
  return g;
}
function arbol(x, y, z, o = {}) {
  const h = o.alto || 2 + Math.floor(azar() * 2);
  B(x, y + h / 2, z, .7, h, .7, o.tronco || '#7c4a1e');
  const hojas = o.hojas || elegir(['#2f8f46', '#3fa356', '#2a7d3c']);
  B(x, y + h + .6, z, 2.6, 1.6, 2.6, hojas);
  B(x, y + h + 1.7, z, 1.6, .9, 1.6, o.hojas2 || '#4cb865');
}
function palmera(x, y, z) {
  const h = 4 + Math.floor(azar() * 2);
  for (let i = 0; i < h; i++) B(x + Math.sin(i * .3) * .15, y + i + .5, z, .45, 1, .45, i % 2 ? '#8b5a2b' : '#7a4b22');
  const top = y + h + .2;
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2, f = B(x + Math.cos(a) * 1.1, top - .25, z + Math.sin(a) * 1.1, 2.4, .14, .55, k % 2 ? '#3fa356' : '#2f8f46');
    f.rotation.y = -a; f.rotation.z = -.35;
  }
}
function toborochi(x, y, z, flor = '#f472b6') {
  B(x, y + .7, z, .9, 1.4, .9, '#8ca36b');
  B(x, y + 1.9, z, 1.3, 1.2, 1.3, '#9db479');
  B(x, y + 3, z, .8, 1.2, .8, '#8ca36b');
  B(x - .8, y + 3.6, z, 1.2, .3, .3, '#7c4a1e'); B(x + .8, y + 3.7, z, 1.2, .3, .3, '#7c4a1e');
  B(x, y + 4.3, z, 3.2, 1.2, 3.2, flor);
  B(x, y + 5.1, z, 2, .8, 2, '#f9a8d4');
  B(x + 1.3, y + 4, z + .6, 1, .8, 1, '#ec4899');
}
function jaguar(x, y, z, ry = 0, s = 1) {
  const g = grupo(x, y, z, ry); g.scale.setScalar(s);
  const am = '#f2a93b', os = '#3b2410';
  B(0, .85, 0, 1, .7, 2.2, am, g);
  [[-.32, .9], [.32, .9], [-.32, -.8], [.32, -.8]].forEach(([px, pz]) => B(px, .3, pz, .28, .6, .28, am, g));
  B(0, 1.15, 1.35, .82, .7, .7, am, g); B(0, .98, 1.75, .5, .32, .2, '#fde2b8', g);
  B(-.25, 1.25, 1.71, .1, .12, .02, '#111', g); B(.25, 1.25, 1.71, .1, .12, .02, '#111', g);
  B(0, 1.08, 1.86, .16, .1, .04, '#111', g);
  B(-.3, 1.58, 1.3, .2, .2, .12, am, g); B(.3, 1.58, 1.3, .2, .2, .12, am, g);
  const cola = B(0, 1.1, -1.5, .2, .2, 1.1, am, g); cola.rotation.x = -.5;
  [[-.3, .3], [.2, -.4], [-.1, -.8], [.3, .6], [0, 0], [-.35, -.2], [.25, .15]].forEach(([px, pz]) => B(px, 1.21, pz, .2, .04, .2, os, g));
  [[-.51, .2], [-.51, -.5], [.51, .4], [.51, -.3]].forEach(([px, pz]) => B(px, .9, pz, .02, .18, .18, os, g));
  return g;
}
function capibara(x, y, z, ry = 0, s = 1) {
  const g = grupo(x, y, z, ry); g.scale.setScalar(s);
  const c = '#9a6b45';
  B(0, .6, 0, .9, .7, 1.5, c, g); B(0, .8, .95, .7, .6, .6, c, g); B(0, .7, 1.27, .55, .38, .12, '#6b4a2f', g);
  B(-.2, 1.13, .85, .14, .12, .1, '#5b3d26', g); B(.2, 1.13, .85, .14, .12, .1, '#5b3d26', g);
  B(-.22, .92, 1.25, .08, .08, .02, '#111', g); B(.22, .92, 1.25, .08, .08, .02, '#111', g);
  [[-.3, .5], [.3, .5], [-.3, -.5], [.3, -.5]].forEach(([px, pz]) => B(px, .15, pz, .22, .3, .22, '#7c5636', g));
  return g;
}
function paraba(x, y, z, ry = 0, s = 1) {
  const g = grupo(x, y, z, ry); g.scale.setScalar(s);
  B(0, .5, 0, .4, .7, .4, '#dc2626', g); B(0, 1, .05, .36, .36, .36, '#dc2626', g);
  B(0, .95, .3, .14, .2, .2, '#f5f5f4', g); B(0, .9, .42, .12, .16, .12, '#1c1917', g);
  B(-.24, .5, -.05, .1, .55, .35, '#2563eb', g); B(.24, .5, -.05, .1, .55, .35, '#2563eb', g);
  B(-.25, .3, -.05, .08, .2, .3, '#facc15', g); B(.25, .3, -.05, .08, .2, .3, '#facc15', g);
  const c = B(0, -.1, -.2, .14, .8, .12, '#dc2626', g); c.rotation.x = .3;
  return g;
}
function tucan(x, y, z, ry = 0, s = 1) {
  const g = grupo(x, y, z, ry); g.scale.setScalar(s);
  B(0, .5, 0, .4, .7, .4, '#111827', g); B(0, .95, .05, .36, .36, .36, '#111827', g);
  B(0, .8, .2, .3, .25, .1, '#f8fafc', g);
  B(0, .92, .5, .2, .22, .5, '#f97316', g); B(0, .99, .79, .14, .12, .12, '#111827', g);
  B(-.12, 1, .24, .07, .07, .02, '#38bdf8', g); B(.12, 1, .24, .07, .07, .02, '#38bdf8', g);
  return g;
}
function nube(x, y, z, s = 1) {
  const g = grupo(x, y, z); g.scale.setScalar(s);
  B(0, 0, 0, 4, 1, 2, '#ffffff', g); B(.6, .7, 0, 2.4, 1, 1.6, '#ffffff', g); B(-1.4, .3, .2, 1.6, .8, 1.4, '#f8fafc', g);
  g.traverse(o => { o.castShadow = false; });
  return g;
}
function brillos(cx, cy, cz, n, radio, colores) {
  for (let i = 0; i < n; i++) {
    const a = azar() * Math.PI * 2, r = azar() * radio;
    const m = B(cx + Math.cos(a) * r, cy + azar() * radio * .6, cz + Math.sin(a) * r, .22, .22, .22, elegir(colores), escena, { emissive: elegir(colores) });
    m.rotation.set(azar(), azar(), azar()); m.castShadow = false;
  }
}

// ------------------------------------------------------------------ escenas
const ESCENAS = {};

// A — Colegio mágico: cada aula es un portal
ESCENAS.A = () => {
  const cielo = ['#4c1d95', '#a855f7', '#f9a8d4'];
  terreno(-34, 34, -30, 22, (x, z) => {
    const d = Math.hypot(x, z + 6);
    return d < 18 ? 0 : Math.floor((d - 18) / 5);
  }, (x, z, h) => {
    if (Math.hypot(x, z + 6) < 11 && (Math.abs(x) < 1.6 || Math.abs(z + 2) < 1.6)) return (x + z) % 2 ? '#e7d8b1' : '#ddcb9c';
    if (Math.hypot(x, z + 2) < 4) return (x + z) % 2 ? '#cbd5e1' : '#e2e8f0';
    return h > 1 ? '#3f8f4a' : ((x * 3 + z) % 5 === 0 ? '#5fae4f' : (x + z) % 2 ? '#6bbd57' : '#64b552');
  });
  // castillo-colegio al fondo
  const piedra = '#e7e0d0', piedra2 = '#d6ccb6', techo = '#7c3aed';
  B(0, 5, -17, 18, 10, 6, piedra);
  for (let x = -8.5; x <= 8.5; x += 2) B(x, 10.4, -14.2, 1, .8, .6, piedra2);
  [[-10, -16], [10, -16], [0, -19.5]].forEach(([tx, tz], i) => {
    const h = i === 2 ? 17 : 13;
    B(tx, h / 2, tz, 4, h, 4, piedra2);
    B(tx, h + .6, tz, 4.6, 1.2, 4.6, techo); B(tx, h + 1.6, tz, 3.2, 1, 3.2, techo); B(tx, h + 2.4, tz, 1.8, .8, 1.8, techo);
    B(tx, h + 3.6, tz, .2, 1.6, .2, '#e5e7eb'); B(tx + .6, h + 4, tz, 1, .6, .06, '#10B981');
    B(tx, h - 3, tz + 2.01, 1.2, 1.8, .1, '#fde047', escena, { emissive: '#b45309' });
  });
  for (let x = -7; x <= 7; x += 3.5) for (const y of [3, 7]) B(x, y, -13.97, 1.4, 1.8, .1, '#fde68a', escena, { emissive: '#92400e' });
  B(0, 2, -13.95, 3, 4, .2, '#5b3a1a'); B(0, 4.3, -13.9, 3.6, .6, .3, piedra2);
  // portales en semicírculo
  const portales = [
    { c: '#10B981', s: '1+2', x: -11, z: -4 }, { c: '#F59E0B', s: 'Abc', x: -6, z: -9 },
    { c: '#22D3EE', s: '🌱', x: 6, z: -9 }, { c: '#A78BFA', s: '🗺️', x: 11, z: -4 }, { c: '#FB923C', s: '🎨', x: 0, z: -10.5 }
  ];
  portales.forEach(p => {
    const ry = Math.atan2(-p.x, -(p.z + 1)) ;
    const g = grupo(p.x, 0, p.z, ry);
    B(-1.6, 2.2, 0, .9, 4.4, .9, '#a8a29e', g); B(1.6, 2.2, 0, .9, 4.4, .9, '#a8a29e', g);
    B(0, 4.7, 0, 4.1, .9, .9, '#a8a29e', g); B(0, 5.3, 0, 2.2, .5, .9, '#a8a29e', g);
    B(-1.6, 4.9, .3, .4, .4, .4, p.c, g, { emissive: p.c });
    const c = document.createElement('canvas'); c.width = 256; c.height = 384; const gg = c.getContext('2d');
    const gr = gg.createRadialGradient(128, 192, 10, 128, 192, 200); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, p.c); gr.addColorStop(1, '#1e1b4b');
    gg.fillStyle = gr; gg.fillRect(0, 0, 256, 384);
    for (let r = 30; r < 220; r += 26) { gg.strokeStyle = 'rgba(255,255,255,.35)'; gg.lineWidth = 6; gg.beginPath(); gg.arc(128, 192, r, r / 30, r / 30 + 4); gg.stroke(); }
    gg.font = '700 84px "Space Grotesk", "Noto Color Emoji", sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillStyle = '#fff';
    gg.fillText(p.s, 128, 196);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    plano(t, 0, 2.15, .05, 2.3, 4.3, 0, g);
    brillos(p.x, 1.5, p.z, 8, 2.5, ['#ffffff', p.c, '#fde047']);
  });
  // libros flotantes
  [[-4, 7, -3], [4.5, 8, -5], [-8, 9, -10], [8, 6.5, 0], [0, 9.5, -6]].forEach(([x, y, z], i) => {
    const g = grupo(x, y, z, i); g.rotation.z = .3 * (i % 2 ? 1 : -1);
    B(0, 0, 0, 1.6, .35, 1.2, elegir(['#dc2626', '#2563eb', '#16a34a', '#9333ea']), g); B(.05, 0, 0, 1.45, .26, 1.1, '#fefce8', g);
  });
  brillos(0, 9, -6, 40, 18, ['#fde047', '#ffffff', '#f9a8d4']);
  // fuente mágica central
  B(0, .3, -2, 3, .6, 3, '#cbd5e1'); B(0, .62, -2, 2.4, .1, 2.4, '#7dd3fc', escena, { emissive: '#0369a1' });
  B(0, 1.4, -2, .5, 1.6, .5, '#e2e8f0'); B(0, 2.4, -2, .9, .9, .9, '#a855f7', escena, { emissive: '#6b21a8' });
  // niños y Kay
  nino(-2.5, 3, 2.6, { pose: 'saluda', mochila: '#F59E0B', remera: '#10B981' });
  nino(2.4, 2.4, -2.2, { pose: 'camina', mochila: '#38BDF8', remera: '#F472B6', colita: true });
  nino(-8.5, -1.5, 2.2, { pose: 'camina', remera: '#FDE047', gorra: '#1e3a8a' });
  nino(7.5, -2.5, -2.4, { pose: 'senala', remera: '#A78BFA' });
  kay(.2, 3.4, 3.2, -.3, 1);
  return { cielo, camara: [0, 12, 22], mira: [0, 1, -6], fov: 50, niebla: ['#c4b5fd', 45, 110] };
};

// B — Selva / Isla Ñandé (inspirada en Santa Cruz: Amboró, Piraí, lomas de arena, fauna)
ESCENAS.B = () => {
  const cielo = ['#38bdf8', '#7dd3fc', '#e0f2fe'];
  const rioX = z => Math.sin(z * .14) * 5 + 2;
  const enRio = (x, z) => Math.abs(x - rioX(z)) < 2.6 + (z > 6 ? 1 : 0);
  const mar = (x, z) => Math.hypot(x * .75, (z + 4) * 1.05) > 33;
  terreno(-44, 44, -38, 26, (x, z) => {
    if (mar(x, z)) return -1;
    if (enRio(x, z)) return -1;
    // Amboró (montañas verdes a la izquierda-fondo)
    const mont = Math.max(0, 12 - Math.hypot((x + 18) * .7, (z + 20) * .8)) + Math.max(0, 9 - Math.hypot((x + 4) * .8, (z + 26)));
    // lomas de arena (derecha)
    const loma = Math.max(0, 5 - Math.hypot((x - 18) * .6, (z + 6) * .9) * .9) + Math.max(0, 4 - Math.hypot((x - 24) * .7, (z - 4)) * .9);
    return Math.floor(Math.max(mont, loma) + (Math.hypot(x * .75, (z + 4)) > 30 ? 0 : 1));
  }, (x, z, h) => {
    if (h < 0) return mar(x, z) ? ((x + z) % 3 ? '#0ea5e9' : '#38bdf8') : ((x + z) % 2 ? '#a16207' : '#92400e');
    const loma = Math.hypot((x - 18) * .6, (z + 6) * .9) < 6 || Math.hypot((x - 24) * .7, (z - 4)) < 5;
    if (loma) return (x + 2 * z) % 3 ? '#f4c27a' : '#eab563';
    if (Math.hypot(x * .75, (z + 4) * 1.05) > 30.5) return '#fde68a';
    if (Math.abs(x - rioX(z)) < 3.6) return '#d6c08a';
    if (h > 7) return '#2a6f37';
    if (h > 3) return (x + z) % 2 ? '#2f8f46' : '#2a7d3c';
    return (x * 3 + z) % 5 === 0 ? '#5fae4f' : (x + z) % 2 ? '#6bbd57' : '#64b552';
  });
  // agua (río Piraí, color barroso, y mar alrededor)
  const agua = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshLambertMaterial({ color: '#38bdf8', transparent: true, opacity: .55 }));
  agua.rotation.x = -Math.PI / 2; agua.position.y = -.35; escena.add(agua);
  // bosque nuboso en el Amboró
  for (let i = 0; i < 70; i++) {
    const x = -34 + azar() * 40, z = -34 + azar() * 22;
    const h = Math.floor(Math.max(0, 12 - Math.hypot((x + 18) * .7, (z + 20) * .8)) + Math.max(0, 9 - Math.hypot((x + 4) * .8, (z + 26)))) + 1;
    if (Math.hypot(x * .75, (z + 4) * 1.05) > 29) continue;
    arbol(Math.round(x), h, Math.round(z), { hojas: elegir(['#166534', '#15803d', '#1f7a3a']), hojas2: '#22a052', alto: 2 });
  }
  nube(-18, 15, -22, 1.4); nube(-6, 13, -28, 1.1); nube(-26, 12, -14, 1); nube(12, 16, -26, 1.2);
  // selva junto al río
  for (let i = 0; i < 26; i++) {
    const z = -12 + azar() * 22, lado = azar() > .5 ? 1 : -1, x = rioX(z) + lado * (4.5 + azar() * 5);
    if (x > 12 || x < -14) continue;
    azar() > .5 ? palmera(Math.round(x), 1, Math.round(z)) : arbol(Math.round(x), 1, Math.round(z));
  }
  toborochi(-10, 1, 8); toborochi(14, 1, 12, '#f9a8d4');
  // fauna
  jaguar(-5.5, 1, 9, .9, 1.1);
  capibara(rioX(13) - 4, 1, 13, 1.8); capibara(rioX(15) - 3.8, 1, 15.5, 2.2, .7);
  paraba(-10.2, 6.4, 8.4, .4, 1.1); paraba(-9.4, 6.2, 7.8, -.3, 1);
  tucan(rioX(-2) + 5, 6.2, -2, .5, 1.2);
  // balsa en el río
  const bx = rioX(4), bal = grupo(bx, -.2, 4, .5);
  B(0, 0, 0, 2.4, .3, 1.6, '#a16207', bal); B(0, .9, 0, .12, 1.6, .12, '#78350f', bal); B(.45, 1.3, 0, .8, .6, .05, '#10B981', bal);
  // niños y Kay restaurando: brotes nuevos
  nino(2.8 + 5, 9.5, -2.6, { y: 1, pose: 'festeja', remera: '#10B981', mochila: '#F59E0B' });
  nino(-1.5, 14.5, 2.8, { y: 1, pose: 'carga', remera: '#38BDF8', colita: true });
  nino(10.5, 7, -2.2, { y: 1, pose: 'senala', remera: '#FB923C', gorra: '#dc2626' });
  [[-0.5, 16.2], [1, 16.6], [-2.3, 16.4]].forEach(([x, z]) => { B(x, 1.3, z, .2, .6, .2, '#65a30d'); B(x, 1.7, z, .6, .3, .6, '#84cc16'); });
  kay(4.5, 3.6, 11.5, -.5, 1);
  brillos(-0.6, 2, 16.3, 10, 1.6, ['#fde047', '#bbf7d0']);
  return { cielo, camara: [6, 20, 34], mira: [0, -2, -2], fov: 50, niebla: ['#bae6fd', 60, 130] };
};

// C — Mi barrio / Santa Cruz en bloques (casas genéricas, nada identificable)
ESCENAS.C = () => {
  const cielo = ['#0ea5e9', '#7dd3fc', '#fef3c7'];
  const calle = (x, z) => ((x % 14 + 14) % 14 < 3) || ((z % 14 + 14) % 14 < 3);
  terreno(-36, 36, -36, 22, () => 0, (x, z) => {
    if (calle(x, z)) {
      const cx = (x % 14 + 14) % 14, cz = (z % 14 + 14) % 14;
      if ((cx === 1 && z % 3 === 0 && cz >= 3) || (cz === 1 && x % 3 === 0 && cx >= 3)) return '#facc15';
      return '#4b5563';
    }
    const cx = (x % 14 + 14) % 14, cz = (z % 14 + 14) % 14;
    if (cx === 3 || cx === 13 || cz === 3 || cz === 13) return '#d6d3d1';
    return '#8bc34a';
  });
  const coloresCasa = ['#fde68a', '#fecaca', '#bae6fd', '#d9f99d', '#fbcfe8', '#fed7aa', '#e9d5ff', '#ffffff', '#a7f3d0'];
  const techos = ['#b45309', '#9a3412', '#7c2d12', '#57534e'];
  function casa(x, z, ry) {
    const g = grupo(x, 0, z, ry), w = 3 + Math.floor(azar() * 2), h = 2.5 + Math.floor(azar() * 2) * 1.5;
    const col = elegir(coloresCasa);
    B(0, h / 2, 0, w, h, 3, col, g);
    if (azar() > .4) { B(0, h + .3, 0, w + .4, .6, 3.4, elegir(techos), g); B(0, h + .8, 0, w - .6, .5, 2.4, elegir(techos), g); }
    else B(0, h + .15, 0, w + .2, .3, 3.2, '#e7e5e4', g);
    B(-w / 4, .9, 1.51, .9, 1.8, .06, '#5b3a1a', g);
    B(w / 4, 1.5, 1.51, .9, .8, .06, '#bae6fd', g);
    if (h > 3) { B(-w / 4, 3.4, 1.51, .8, .7, .06, '#bae6fd', g); B(w / 4, 3.4, 1.51, .8, .7, .06, '#bae6fd', g); }
    if (azar() > .6) { B(0, 2.6, 1.8, w, .15, .7, elegir(['#10B981', '#f97316', '#0284c7']), g); }
  }
  for (let bx = -2; bx <= 1; bx++) for (let bz = -2; bz <= 1; bz++) {
    const x0 = bx * 14 + 3, z0 = bz * 14 + 3;
    if (bx === 0 && bz === -1) continue; // plaza
    if (bx === -1 && bz === 0) continue; // cancha
    for (let i = 0; i < 3; i++) {
      casa(x0 + 2.5 + i * 3.5, z0 + 2.4, Math.PI);
      casa(x0 + 2.5 + i * 3.5, z0 + 8.6, 0);
    }
  }
  // plaza con toborochis y kiosco
  const px = 10, pz = -4;
  B(px, .08, pz, 10, .16, 10, '#e7e5e4');
  B(px, .5, pz, 3.4, .8, 3.4, '#f5f5f4'); for (const [dx, dz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) B(px + dx, 2, pz + dz, .3, 2.6, .3, '#ffffff');
  B(px, 3.5, pz, 4.2, .5, 4.2, '#10B981'); B(px, 4, pz, 2.6, .5, 2.6, '#10B981'); B(px, 4.4, pz, 1, .4, 1, '#FDE047');
  toborochi(px - 3.7, 0, pz - 3.5); toborochi(px + 3.7, 0, pz + 3.4, '#f9a8d4'); toborochi(px + 3.6, 0, pz - 3.6, '#fbcfe8');
  arbol(px - 3.7, 0, pz + 3.6);
  for (const [dx, dz] of [[-2.6, 0], [2.6, 0]]) B(px + dx, .35, pz + dz, .6, .3, 1.8, '#a16207');
  // cancha de fútbol
  const cx = -11 + 3, cz = 3 + 7 - 3;
  B(cx + 2, .06, cz, 10, .12, 8, '#16a34a'); B(cx + 2, .14, cz, .1, .02, 8, '#ffffff');
  for (const dx of [-3, 7]) { B(cx + dx, 1, cz - 1.2, .2, 2, .2, '#fff'); B(cx + dx, 1, cz + 1.2, .2, 2, .2, '#fff'); B(cx + dx, 2, cz, .2, .2, 2.6, '#fff'); }
  B(cx + 3, .35, cz + 1, .5, .5, .5, '#ffffff');
  nino(cx + 1, cz + 2, .6, { pose: 'camina', remera: '#F59E0B' }); nino(cx + 4.5, cz - 1, -2, { pose: 'festeja', remera: '#38BDF8' });
  nino(cx - 1.8, cz - .5, 1.6, { pose: 'parado', remera: '#EF4444', gorra: '#111827' });
  // puesto de frutas
  const mx = 1.5, mz = 2.5;
  B(mx, .6, mz, 3, 1.2, 1.4, '#a16207'); B(mx, 2.4, mz, 3.4, .2, 2, '#F472B6'); B(mx - 1.5, 1.5, mz + .8, .15, 1.8, .15, '#78350f'); B(mx + 1.5, 1.5, mz + .8, .15, 1.8, .15, '#78350f');
  [['#f97316', -1], ['#facc15', -.3], ['#22c55e', .4], ['#dc2626', 1.1]].forEach(([c, dx]) => B(mx + dx, 1.35, mz + .3, .55, .3, .55, c));
  // micro (bus) genérico y bicicleta
  const mg = grupo(1.5, 0, -12.5, Math.PI / 2);
  B(0, 1.5, 0, 2.4, 2.2, 6.5, '#16a34a', mg); B(0, 1.8, 0, 2.45, .6, 6.55, '#bbf7d0', mg); B(0, 2.7, 0, 2.2, .2, 6.2, '#f5f5f4', mg);
  for (const dz of [-2.2, 2.2]) for (const dx of [-1.2, 1.2]) B(dx, .45, dz, .3, .9, .9, '#111827', mg);
  B(0, 1.8, 3.26, 2, .9, .05, '#bae6fd', mg);
  // niños del barrio + Kay
  nino(4.2, -6, 1.2, { pose: 'saluda', remera: '#10B981', mochila: '#F59E0B' });
  nino(5.5, -2, 2.6, { pose: 'camina', remera: '#A78BFA', colita: true });
  kay(6.4, 3.4, -5.5, -.4, 1);
  nube(-14, 16, -26, 1.3); nube(12, 18, -30, 1.4);
  return { cielo, camara: [0, 19, 22], mira: [5, -2, -6], fov: 50, niebla: ['#e0f2fe', 60, 120] };
};

// D — Un mundo que construye el curso desde cero
ESCENAS.D = () => {
  const cielo = ['#0d9488', '#5eead4', '#ecfeff'];
  terreno(-20, 20, -18, 16, (x, z) => (Math.abs(x) > 17 || z < -15 || z > 13) ? null : 0,
    (x, z) => (x + z) % 2 ? '#86d36a' : '#7ccb60');
  // borde de la isla flotante
  for (let x = -17; x <= 17; x++) for (const z of [-15, 13]) B(x, -2.5, z, 1, 3, 1, '#8b5a2b');
  for (let z = -15; z <= 13; z++) for (const x of [-17, 17]) B(x, -2.5, z, 1, 3, 1, '#7a4b22');
  B(0, -5, -1, 30, 2, 24, '#6b4423'); B(0, -7, -1, 20, 2, 16, '#5b3a1a'); B(0, -8.6, -1, 10, 1.4, 8, '#4a2f16');
  // líneas de grilla (lote para construir)
  const lineas = new THREE.GridHelper(34, 34, '#ffffff', '#ffffff'); lineas.material.opacity = .18; lineas.material.transparent = true;
  lineas.position.set(0, .02, -1); escena.add(lineas);
  // torre a medio construir
  const colores = ['#ef4444', '#f59e0b', '#fde047', '#10b981', '#38bdf8', '#a78bfa', '#f472b6', '#ffffff'];
  for (let y = 0; y < 6; y++) for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
    if (y > 3 && (x + z + y) % 3 === 0) continue;
    if (y === 5 && x === 1) continue;
    if (Math.abs(x) + Math.abs(z) === 0 && y < 4) continue;
    B(-8 + x, y + .5, -6 + z, 1, 1, 1, colores[(y + 4) % colores.length]);
  }
  // fantasma de lo que falta (planos del curso)
  const fantasma = { transparent: true, opacity: .25 };
  for (let y = 6; y < 9; y++) for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++)
    if (y < 8 || (x === 0 && z === 0)) B(-8 + x, y + .5, -6 + z, .96, .96, .96, '#ffffff', escena, fantasma);
  // puente a medio hacer sobre un arroyo
  for (let z = -15; z <= 13; z++) B(7, -.3, z, 3, .6, 1, '#38bdf8', escena, { transparent: true, opacity: .9 });
  for (let x = 5; x <= 9; x++) { if (x === 8 || x === 9) B(x, .5, 0, 1, .3, 2.6, '#ffffff', escena, fantasma); else B(x, .5, 0, 1, .3, 2.6, '#a16207'); }
  B(5, 1.2, -1.2, .3, 1.2, .3, '#78350f'); B(5, 1.2, 1.2, .3, 1.2, .3, '#78350f');
  // casita del curso
  const cg = grupo(10, 0, -9, -.4);
  B(0, 1.5, 0, 4, 3, 3.6, '#fde68a', cg); B(0, 3.3, 0, 4.4, .6, 4, '#ef4444', cg); B(0, 3.8, 0, 3, .5, 2.6, '#ef4444', cg);
  B(0, 1, 1.81, 1, 2, .05, '#5b3a1a', cg); B(1.2, 1.8, 1.81, .8, .7, .05, '#bae6fd', cg);
  B(-1.6, 4.3, 0, .6, 1.4, .6, '#ef4444', cg, fantasma);
  // jardín y árbol plantado por el curso
  arbol(-13, 0, 7, { alto: 3 }); arbol(13, 0, 8, { alto: 2 });
  for (let i = 0; i < 6; i++) B(-12 + i, .25, 10, .8, .5, .8, elegir(['#f472b6', '#fde047', '#f97316']));
  // cajones con bloques de colores (la paleta)
  colores.forEach((c, i) => {
    const x = -4 + i * 1.3;
    B(x, .4, 9, 1.1, .8, 1.1, '#8b5a2b'); B(x, .9, 9, .8, .4, .8, c);
  });
  // niños construyendo + Kay
  nino(-6, -3.4, 2.6, { pose: 'carga', remera: '#10B981', mochila: '#F59E0B' });
  B(-6 + .0, 1.5, -3.4 - .55, .7, .7, .7, '#38bdf8');
  nino(-10.5, -3, 2.2, { pose: 'senala', remera: '#F472B6', colita: true });
  nino(4.5, 2.2, 1.6, { pose: 'carga', remera: '#FDE047' }); B(4.9, 1.5, 2.4, .7, .7, .7, '#a16207');
  nino(1, 6.5, 3, { pose: 'festeja', remera: '#38BDF8', gorra: '#dc2626' });
  nino(-2, 8.6, 3.4, { pose: 'parado', remera: '#A78BFA' });
  kay(-3, 4, -2, .4, 1);
  // bloques volando hacia la torre
  [[-5, 5.5, -5, '#ef4444'], [-6.5, 7.5, -4.5, '#10b981'], [-4.5, 3.6, -4, '#fde047']].forEach(([x, y, z, c]) => { const m = B(x, y, z, .9, .9, .9, c); m.rotation.set(.3, .5, .2); });
  brillos(-8, 8, -6, 14, 3, ['#ffffff', '#fde047']);
  nube(-14, 12, -20, 1.2); nube(10, 14, -22, 1); nube(18, 6, 6, .8);
  return { cielo, camara: [1, 13, 21], mira: [-1, -1.5, -2], fov: 50, niebla: ['#ccfbf1', 60, 120] };
};

// ---------------- Viñetas para completar (sesión 2): escenario neutro
function fondoNeutro() {
  terreno(-16, 16, -16, 12, () => 0, (x, z) => (x * 3 + z) % 5 === 0 ? '#5fae4f' : (x + z) % 2 ? '#6bbd57' : '#64b552');
  arbol(-7, 0, -8); arbol(7, 0, -9); arbol(-11, 0, -3); arbol(10, 0, -2);
  nube(-6, 10, -14, .9); nube(6, 11, -16, 1);
}
function tablero(x, z, ry, simbolo = '🎯') {
  const g = grupo(x, 0, z, ry);
  B(-1.2, 1, 0, .2, 2, .2, '#78350f', g); B(1.2, 1, 0, .2, 2, .2, '#78350f', g);
  B(0, 2.4, 0, 3, 1.8, .2, '#a16207', g);
  plano(cartelTexto(simbolo, { fondo: '#fef3c7', tam: 150 }), 0, 2.4, .12, 1.6, 1.6, 0, g);
  return g;
}
ESCENAS.v1 = () => { fondoNeutro(); tablero(1.2, -1.5, -.2); nino(-1.4, .5, .5, { remera: '#10B981', mochila: '#F59E0B' }); kay(-2.6, 2.6, -.6, .5, .8);
  return { cielo: ['#7dd3fc', '#bae6fd', '#f0f9ff'], camara: [0, 4, 9], mira: [0, 1.8, -1], fov: 45, niebla: ['#e0f2fe', 20, 50] }; };
ESCENAS.v2 = () => { fondoNeutro(); nino(0, 1, 0, { remera: '#10B981', mochila: '#F59E0B', pose: 'carga' });
  // barra de 4 cuartos, 3 de colores
  ['#10B981', '#10B981', '#10B981', '#e5e7eb'].forEach((c, i) => B(-1.5 + i + .5, 1.6, 2.1, .95, .9, .9, c));
  kay(2, 2.5, .5, -.6, .8); sprite('3/4', 0, 3.4, 2.1, 1.6, { fondo: '#ffffff', tam: 120, ancho: 256, alto: 160 });
  return { cielo: ['#7dd3fc', '#bae6fd', '#f0f9ff'], camara: [0, 4, 9], mira: [0, 1.8, 0], fov: 45, niebla: ['#e0f2fe', 20, 50] }; };
function llave(x, y, z, s = 1) {
  const g = grupo(x, y, z, 0); g.scale.setScalar(s); g.rotation.z = -.5;
  const o = { emissive: '#a16207' };
  B(0, .7, 0, .9, .25, .25, '#facc15', g, o); B(0, .25, 0, .25, .65, .25, '#facc15', g, o); B(-.36, .25, 0, .25, .65, .25, '#facc15', g, o); B(.36, .25, 0, .25, .65, .25, '#facc15', g, o);
  B(0, -.5, 0, .25, 1.6, .25, '#facc15', g, o); B(.25, -1.05, 0, .35, .2, .25, '#facc15', g, o); B(.25, -.75, 0, .25, .18, .25, '#facc15', g, o);
  return g;
}
ESCENAS.v3 = () => { fondoNeutro(); nino(0, .5, 0, { remera: '#10B981', mochila: '#F59E0B', pose: 'festeja' }); llave(0, 3.9, .3, 1); brillos(0, 3.4, .3, 14, 1.8, ['#fde047', '#ffffff']); kay(2.3, 2.4, 0, -.5, .8);
  return { cielo: ['#7dd3fc', '#bae6fd', '#f0f9ff'], camara: [0, 4, 9], mira: [0, 2.2, 0], fov: 45, niebla: ['#e0f2fe', 20, 50] }; };
ESCENAS.v4 = () => { fondoNeutro();
  // muro con puerta entreabierta y niebla
  for (let x = -6; x <= 6; x++) for (let y = 0; y < 5; y++) if (!(Math.abs(x) <= 1 && y < 3)) B(x, y + .5, -2, 1, 1, 1, (x + y) % 2 ? '#a8a29e' : '#9ca3af');
  const p = B(-1.2, 1.5, -1.3, .2, 3, 1.6, '#5b3a1a'); p.rotation.y = .5;
  B(0, 1.5, -2.4, 2.6, 3, .1, '#1e1b4b');
  const niebla = { transparent: true, opacity: .55 };
  for (let i = 0; i < 16; i++) { const m = B(-1.2 + azar() * 2.4, .3 + azar() * 2.6, -1.8 + azar() * 1.6, .5 + azar() * .4, .4, .4, '#e9d5ff', escena, niebla); m.castShadow = false; }
  sprite('?', 0, 4.3, -1.6, 1.6, { color: '#fde047', tam: 220 });
  nino(-.4, 2.8, Math.PI, { remera: '#10B981', mochila: '#F59E0B' }); llave(.4, 1.3, 3.3, .35);
  return { cielo: ['#7dd3fc', '#bae6fd', '#f0f9ff'], camara: [3.5, 4.5, 9], mira: [0, 1.8, -1], fov: 45, niebla: ['#e0f2fe', 20, 50] }; };
ESCENAS.v5 = () => { fondoNeutro(); tablero(-1.8, -1.6, .25);
  nino(-1.2, .8, .3, { remera: '#F472B6', colita: true }); sprite('?', -1.2, 3.4, .8, 1.3, { fondo: '#ffffff', color: '#0F172A', tam: 170 });
  nino(2.4, 1.2, -1.2, { remera: '#10B981', mochila: '#F59E0B', pose: 'camina' });
  return { cielo: ['#7dd3fc', '#bae6fd', '#f0f9ff'], camara: [0, 4, 9], mira: [0, 1.8, -.5], fov: 45, niebla: ['#e0f2fe', 20, 50] }; };

// ------------------------------------------------------------------ render
export async function dibujar(nombre, w, h, canvas) {
  semilla = 7 + nombre.charCodeAt(0) * 13;
  await document.fonts.ready;
  escena = new THREE.Scene();
  const cfg = ESCENAS[nombre]();
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(w, h, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputColorSpace = THREE.SRGBColorSpace;
  const cc = document.createElement('canvas'); cc.width = 4; cc.height = 256;
  const gc = cc.getContext('2d'), gr = gc.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, cfg.cielo[0]); gr.addColorStop(.55, cfg.cielo[1]); gr.addColorStop(1, cfg.cielo[2]);
  gc.fillStyle = gr; gc.fillRect(0, 0, 4, 256);
  const cielo = new THREE.CanvasTexture(cc); cielo.colorSpace = THREE.SRGBColorSpace; escena.background = cielo;
  if (cfg.niebla) escena.fog = new THREE.Fog(cfg.niebla[0], cfg.niebla[1], cfg.niebla[2]);
  escena.add(new THREE.HemisphereLight('#ffffff', '#4d6b35', 1.5));
  const sol = new THREE.DirectionalLight('#fff4d6', 2.1);
  sol.position.set(18, 30, 14); sol.castShadow = true;
  sol.shadow.mapSize.set(4096, 4096);
  Object.assign(sol.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 120 });
  sol.shadow.bias = -0.0005; sol.shadow.normalBias = .03;
  escena.add(sol);
  const cam = new THREE.PerspectiveCamera(cfg.fov, w / h, .1, 400);
  cam.position.set(...cfg.camara); cam.lookAt(...cfg.mira);
  r.render(escena, cam);
  return true;
}
