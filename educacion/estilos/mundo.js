// ÑANDÉ · EDU.01c — Propuestas de estilo visual.
// La MISMA escena (colegio cruceño, bosque que se restaura, portal, ciudad por anillos,
// los dos profes y dos alumnos) dibujada en tres direcciones de arte:
//   A "Maqueta Viva"  — low poly facetado, diorama, luz de tarde horneada.
//   B "Tierra Pintada" — dos tonos + contorno de tinta, paleta más saturada.
//   C "Pixel Camba"   — la geometría de A a ~50% de resolución y 32 colores.
//
// Pensado para tablet de gama baja: TODO es MeshBasicMaterial con colores por vértice
// (la luz y la oclusión se calculan una sola vez al armar la escena), sin sombras en
// tiempo real (sombras falsas bajo los objetos), pocas llamadas de dibujo (la escena
// entera se fusiona en unas pocas mallas) y niebla.
//
// Uso:  const mundo = crearMundo(THREE, 'A')        // escena completa
//       const mapa  = crearMundo(THREE, 'A', 'mapa') // lámina E: Santa Cruz por anillos

export const ESTILOS = {
  A: {
    letra: 'A', nombre: 'Maqueta Viva', color: '#10B981',
    corto: 'Low poly facetado, como una maqueta tallada en madera y arcilla.',
    costo: 'bajo'
  },
  B: {
    letra: 'B', nombre: 'Tierra Pintada', color: '#D9A441',
    corto: 'Dibujo de dos tonos con contorno de tinta; patrones solo como acentos.',
    costo: 'medio'
  },
  C: {
    letra: 'C', nombre: 'Pixel Camba', color: '#5FB7C9',
    corto: 'La maqueta dibujada con pocos píxeles y 32 colores.',
    costo: 'el más bajo'
  }
};

// ---------------------------------------------------------------- paletas
const PAL_A = {
  cielo: '#C9DED4', niebla: '#BCD6CE',
  pasto: '#86B867', pasto2: '#6FA35A', pastoSeco: '#A9B56E',
  tierra: '#B08257', tierraClara: '#C9A06F', ceniza: '#8E857B', arena: '#E9CFA3',
  baseLado: '#6B4A33', baseLado2: '#4E3524',
  pared: '#F1E6CF', pared2: '#E9CFA3', pared3: '#F3D9B1', pared4: '#E6D3C0', zocalo: '#C65A3A',
  teja: '#C65A3A', teja2: '#A94A30', palma: '#C8A25C', horcon: '#6E4A2E', madera: '#8A5A35',
  maderaOsc: '#4A3020', piso: '#C98F6B', patio: '#D8B98A', piedra: '#BCB3A6',
  esmeralda: '#10B981', esmeraldaClaro: '#7DE3BE', techoVerde: '#4FA36A',
  bosque: '#1F5E45', bosque2: '#2F7650', bosque3: '#3F8E5B', bosque4: '#56A05E',
  tajiboAm: '#F2C230', tajiboRo: '#E68AB8', toboTronco: '#9AAE73', toboFlor: '#F0A3C4',
  motacu: '#5B9142', motacuTronco: '#7D6A4F', tronco: '#6B4A33',
  rio: '#5FB7C9', rioOsc: '#3E8FA3', calle: '#7A746D', linea: '#E9E1CF', cantero: '#7FAF62',
  edificio: '#E8E1D4', edificio2: '#D9CCB7', vidrio: '#7FAFC0', ladrillo: '#B5654A',
  oscuro: '#2B2420', blanco: '#F7F4EC',
  piel1: '#C68A5E', piel2: '#A86D45', piel3: '#8A5536', piel4: '#D9A27A',
  pelo: '#2A1D16', pelo2: '#4A3020',
  ropaTaji: '#F2C230', ropaJochi: '#2F7650', azulUniforme: '#2E3A59', gris: '#6E6A66',
  rojo: '#D7372E', azul: '#2F6FB5', amarillo: '#F2C230', peta: '#7A5C34', petaClaro: '#C9A35A',
  tinta: '#0A0A0A'
};

// B: más saturada (terracota, ocre, crema, tinta) para el dibujo con contorno
const PAL_B = {
  ...PAL_A,
  cielo: '#F5ECD7', niebla: '#F1E4C8',
  pasto: '#62B556', pasto2: '#4A9E48', pastoSeco: '#B7C25E',
  tierra: '#D9A441', tierraClara: '#E3B65C', ceniza: '#9A8E80', arena: '#F5DDA8',
  baseLado: '#B8492F', baseLado2: '#7E2F1E',
  pared: '#F5ECD7', pared2: '#F0DDB5', pared3: '#F7E2BE', pared4: '#EDD9C6', zocalo: '#B8492F',
  teja: '#B8492F', teja2: '#93351F', palma: '#D9A441', horcon: '#5A3420', madera: '#7C4524',
  piso: '#C8643F', patio: '#E3B65C',
  bosque: '#17704A', bosque2: '#1F8A55', bosque3: '#2FA35E', bosque4: '#4DB862',
  tajiboAm: '#FFC21F', tajiboRo: '#F06CAE', toboTronco: '#8DB067', toboFlor: '#F58CC0',
  motacu: '#3E9A3A', rio: '#36B3D4', rioOsc: '#1E86A8', calle: '#5E5A57', cantero: '#62B556',
  ropaJochi: '#13865A', rojo: '#E03A2C', azul: '#2563C9'
};

// C: 32 colores. La luz horneada de A se "encaja" en la paleta más cercana.
const PALETA_C = [
  '#0B0B0F', '#2B2420', '#4E3524', '#6E4A2E', '#8A5A35', '#B08257', '#C9A06F', '#E9CFA3',
  '#F7F4EC', '#EFE2C8', '#A94A30', '#C65A3A', '#E68AB8', '#F2C230', '#D7372E', '#2F6FB5',
  '#5FB7C9', '#3E8FA3', '#1F5E45', '#2F7650', '#3F8E5B', '#6FA35A', '#86B867', '#B5CF7E',
  '#10B981', '#7DE3BE', '#7A746D', '#9E968C', '#BCB3A6', '#D9CCB7', '#BCD6CE', '#C68A5E'
];

// ---------------------------------------------------------------- utilidades
function azar(semilla) {
  return () => {
    semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0;
    let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function crearMundo(THREE, estilo = 'A', tipo = 'escena') {
  const E = String(estilo).toUpperCase();
  const P = E === 'B' ? PAL_B : PAL_A;
  const esB = E === 'B', esC = E === 'C';
  const rnd = azar(tipo === 'mapa' ? 77 : 2026);
  const R = (a, b) => a + (b - a) * rnd();

  // --- colores ya convertidos (espacio lineal de three)
  const cache = {};
  const col = c => cache[c] || (cache[c] = new THREE.Color(c));
  const paletaC = PALETA_C.map(h => new THREE.Color(h));
  const L = new THREE.Vector3(-0.55, 0.78, 0.32).normalize(); // sol de tarde, desde el oeste
  const tmpN = new THREE.Vector3(), tmpC = new THREE.Color();

  // Luz horneada por cara. y01 = altura relativa dentro de la pieza (oclusión falsa).
  function hornear(base, n, y01, op, salida) {
    salida.copy(base);
    if (op.brillo) return salida;
    if (esB) {
      const d = n.dot(L);
      const luz = d > 0.18 || n.y > 0.85;
      if (!luz) { salida.r *= 0.66; salida.g *= 0.69; salida.b *= 0.82; }
      const ao = op.ao === false ? 1 : 0.9 + 0.1 * y01;
      return salida.multiplyScalar(ao);
    }
    const d = Math.max(0, n.dot(L));
    const k = 0.56 + 0.52 * d + 0.1 * Math.max(0, n.y);
    const ao = op.ao === false ? 1 : 0.7 + 0.3 * y01;
    salida.r *= k * ao * (1 + 0.07 * d);
    salida.g *= k * ao;
    salida.b *= k * ao * (1 - 0.1 * d + 0.06 * (1 - d));
    if (esC) {
      // encajar en la paleta de 32 colores (comparando en sRGB, que es lo que ve el ojo)
      const s = salida.clone().convertLinearToSRGB();
      let mejor = paletaC[0], dm = 1e9;
      for (const p of paletaC) {
        const q = p.clone().convertLinearToSRGB();
        const dr = s.r - q.r, dg = s.g - q.g, db = s.b - q.b;
        const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
        if (dist < dm) { dm = dist; mejor = p; }
      }
      salida.copy(mejor);
    }
    return salida;
  }

  // Lote: junta muchas piezas en UNA malla (una llamada de dibujo).
  class Lote {
    constructor() { this.p = []; this.c = []; }
    add(geo, color, m, op = {}) {
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      g.applyMatrix4(m);
      g.computeVertexNormals();
      const pos = g.attributes.position.array, nor = g.attributes.normal.array;
      let y0 = Infinity, y1 = -Infinity;
      for (let i = 1; i < pos.length; i += 3) { y0 = Math.min(y0, pos[i]); y1 = Math.max(y1, pos[i]); }
      const base = col(color).clone();
      if (!esB && !op.brillo && op.variar !== false) base.multiplyScalar(0.95 + rnd() * 0.1);
      for (let i = 0; i < pos.length; i += 3) {
        tmpN.set(nor[i], nor[i + 1], nor[i + 2]);
        const y01 = y1 - y0 < 1e-4 ? 1 : (pos[i + 1] - y0) / (y1 - y0);
        hornear(base, tmpN, y01, op, tmpC);
        this.p.push(pos[i], pos[i + 1], pos[i + 2]);
        this.c.push(tmpC.r, tmpC.g, tmpC.b);
      }
      g.dispose();
    }
    geometria() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      g.computeBoundingSphere();
      return g;
    }
  }

  // Contorno de tinta (estilo B): la malla repetida, inflada por normales suaves y vista
  // de espaldas. Una llamada de dibujo más, sin posproceso.
  function contorno(geo, grosor) {
    const pos = geo.attributes.position.array;
    const flat = [];
    for (let i = 0; i < pos.length; i += 9) {
      const a = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);
      const b = new THREE.Vector3(pos[i + 3], pos[i + 4], pos[i + 5]);
      const c = new THREE.Vector3(pos[i + 6], pos[i + 7], pos[i + 8]);
      const n = new THREE.Vector3().subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b)).normalize();
      flat.push(n, n, n);
    }
    const mapa = new Map();
    const clave = i => `${Math.round(pos[i] * 200)},${Math.round(pos[i + 1] * 200)},${Math.round(pos[i + 2] * 200)}`;
    for (let v = 0; v < flat.length; v++) {
      const k = clave(v * 3);
      const s = mapa.get(k) || new THREE.Vector3();
      s.add(flat[v]); mapa.set(k, s);
    }
    const ns = new Float32Array(pos.length);
    for (let v = 0; v < flat.length; v++) {
      const s = mapa.get(clave(v * 3)).clone().normalize();
      ns[v * 3] = s.x; ns[v * 3 + 1] = s.y; ns[v * 3 + 2] = s.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', geo.attributes.position);
    g.setAttribute('ns', new THREE.BufferAttribute(ns, 3));
    const m = new THREE.MeshBasicMaterial({ color: P.tinta, side: THREE.BackSide });
    m.onBeforeCompile = sh => {
      sh.uniforms.grosor = { value: grosor };
      sh.vertexShader = 'attribute vec3 ns;\nuniform float grosor;\n' +
        sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + ns * grosor;');
    };
    return new THREE.Mesh(g, m);
  }

  // --- geometrías base (facetadas en A y C; algo más redondas en B)
  const seg = esB ? 10 : 7;
  const G = {
    caja: new THREE.BoxGeometry(1, 1, 1),
    cil: new THREE.CylinderGeometry(0.5, 0.5, 1, seg),
    cil4: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
    cono: new THREE.ConeGeometry(0.5, 1, seg),
    piramide: new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4),
    bola: esB ? new THREE.SphereGeometry(0.5, 10, 7) : new THREE.IcosahedronGeometry(0.5, 1),
    bolita: esB ? new THREE.SphereGeometry(0.5, 7, 5) : new THREE.IcosahedronGeometry(0.5, 0),
    disco: new THREE.CylinderGeometry(0.5, 0.5, 1, esB ? 28 : 20),
    prisma: prisma(),
    toborochi: new THREE.LatheGeometry([
      [0.30, 0], [0.42, 0.08], [0.52, 0.28], [0.54, 0.45], [0.46, 0.62], [0.30, 0.78], [0.2, 0.9], [0.18, 1]
    ].map(([x, y]) => new THREE.Vector2(x, y)), seg)
  };
  function prisma() {
    // sección triangular (-.5,0) (.5,0) (0,1), a lo largo de z
    const v = [[-0.5, 0, 0.5], [0.5, 0, 0.5], [0, 1, 0.5], [-0.5, 0, -0.5], [0.5, 0, -0.5], [0, 1, -0.5]];
    return convexo(v, [[0, 1, 2], [3, 5, 4], [0, 2, 5], [0, 5, 3], [1, 4, 5], [1, 5, 2], [0, 3, 4], [0, 4, 1]]);
  }
  // Arma triángulos orientándolos hacia afuera (sirve para cuerpos convexos).
  function convexo(v, caras) {
    const c = v.reduce((a, p) => [a[0] + p[0] / v.length, a[1] + p[1] / v.length, a[2] + p[2] / v.length], [0, 0, 0]);
    const out = [];
    const V = p => new THREE.Vector3(...p);
    for (const [a, b, d] of caras) {
      const A = V(v[a]), B = V(v[b]), D = V(v[d]);
      const n = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(D, A));
      const m = A.clone().add(B).add(D).divideScalar(3).sub(V(c));
      const t = n.dot(m) >= 0 ? [A, B, D] : [A, D, B];
      for (const p of t) out.push(p.x, p.y, p.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
    return g;
  }
  // Techo a cuatro aguas (w ancho en x, l largo en z, h alto)
  function techoHip(w, l, h) {
    const r = Math.max(0, (l - w) / 2);
    const v = [[-w / 2, 0, -l / 2], [w / 2, 0, -l / 2], [w / 2, 0, l / 2], [-w / 2, 0, l / 2], [0, h, -r], [0, h, r]];
    if (r === 0) return convexo([...v.slice(0, 4), [0, h, 0]], [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [0, 1, 2], [0, 2, 3]]);
    return convexo(v, [[0, 1, 4], [2, 3, 5], [1, 2, 5], [1, 5, 4], [3, 0, 4], [3, 4, 5], [0, 1, 2], [0, 2, 3]]);
  }

  // --- matrices
  const _q = new THREE.Quaternion(), _e = new THREE.Euler();
  function M(x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, ry = 0, rx = 0, rz = 0) {
    _e.set(rx, ry, rz, 'YXZ');
    return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), _q.setFromEuler(_e), new THREE.Vector3(sx, sy, sz));
  }
  // "pieza" con una base (posición/giro/escala de un objeto entero)
  function conBase(base) {
    return (lote, geo, color, x, y, z, sx, sy, sz, ry = 0, rx = 0, rz = 0, op) =>
      lote.add(geo, color, base.clone().multiply(M(x, y, z, sx, sy, sz, ry, rx, rz)), op);
  }

  // Solo el "kit" de piezas (lo usa la prueba de construcción)
  if (tipo === 'kit') return { P, G, Lote, M, conBase, techoHip, contorno, rnd, esB, esC };

  const solido = new Lote();   // con contorno en B
  const plano = new Lote();    // suelo, calles, agua: sin contorno
  const brillo = new Lote();   // esmeralda que "brilla" (conocimiento): sin luz
  const sombras = [];          // sombras falsas: [x, z, radio, fuerza]
  const fantasmas = [];        // piezas por construir (transparentes)
  const animados = [];         // cosas que se mueven
  const etiquetas = new THREE.Group(); etiquetas.name = 'etiquetas';
  const acentos = new THREE.Group();   // patrones (solo B)
  const escena = new THREE.Scene();

  // ============================================================ piezas del mundo
  // --- árboles
  function sombra(x, z, r, f = 0.35) { sombras.push([x, z, r, f]); }

  function arbolBosque(x, z, s = 1, tono) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.cil, P.tronco, 0, 0.9, 0, 0.32, 1.8, 0.32);
    const c = tono || [P.bosque, P.bosque2, P.bosque3][Math.floor(rnd() * 3)];
    b(solido, G.bola, c, 0, 2.4, 0, 2.2, 1.9, 2.2);
    b(solido, G.bola, c, R(-0.6, 0.6), 3.1, R(-0.5, 0.5), 1.5, 1.4, 1.5);
    sombra(x, z, 1.4 * s);
  }
  function tajibo(x, z, s = 1, color = P.tajiboAm) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.cil, P.tronco, 0, 1.5, 0, 0.3, 3, 0.3);
    b(solido, G.cil, P.tronco, 0.45, 3.0, 0, 0.16, 1.4, 0.16, 0, 0, -0.6);
    b(solido, G.cil, P.tronco, -0.4, 3.1, 0.2, 0.16, 1.4, 0.16, 0, 0.3, 0.6);
    b(solido, G.bola, color, 0, 3.7, 0, 2.6, 1.6, 2.6);
    b(solido, G.bola, color, 0.9, 3.4, 0.3, 1.5, 1.1, 1.5);
    b(solido, G.bola, color, -0.8, 3.5, -0.4, 1.6, 1.1, 1.6);
    b(solido, G.bolita, P.bosque3, 0.2, 3.1, 0.9, 0.8, 0.5, 0.8);
    sombra(x, z, 1.6 * s);
  }
  function toborochi(x, z, s = 1) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.toborochi, P.toboTronco, 0, 0, 0, 2.2, 3.2, 2.2);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      b(solido, G.cil, P.toboTronco, Math.cos(a) * 0.5, 3.6, Math.sin(a) * 0.5, 0.14, 1.4, 0.14, -a, 0, 0.7);
      b(solido, G.bola, i % 2 ? P.toboFlor : P.bosque3, Math.cos(a) * 1.1, 4.3, Math.sin(a) * 1.1, 1.3, 0.8, 1.3);
    }
    b(solido, G.bola, P.toboFlor, 0, 4.5, 0, 1.4, 0.8, 1.4);
    sombra(x, z, 1.5 * s);
  }
  function motacu(x, z, s = 1) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.cil, P.motacuTronco, 0, 1.0, 0, 0.55, 2, 0.55);
    b(solido, G.cono, P.motacuTronco, 0, 2.2, 0, 0.75, 0.6, 0.75, 0, Math.PI);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // pencas largas que se arquean hacia arriba y afuera
      b(solido, G.caja, P.motacu, Math.cos(a) * 1.0, 3.0, Math.sin(a) * 1.0, 0.5, 0.08, 2.6, -a + Math.PI / 2, -0.75, 0);
      b(solido, G.caja, P.motacu, Math.cos(a) * 2.1, 3.3, Math.sin(a) * 2.1, 0.45, 0.06, 1.2, -a + Math.PI / 2, 0.5, 0);
    }
    sombra(x, z, 1.8 * s);
  }
  function plantin(x, z, s = 1, marca = true) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.cil, P.tronco, 0, 0.35, 0, 0.1, 0.7, 0.1);
    b(solido, G.bolita, P.bosque4, 0, 0.85, 0, 0.7, 0.6, 0.7);
    plano.add(G.disco, P.tierra, M(x, 0.03, z, 0.75 * s, 0.02, 0.75 * s), { ao: false });
    if (marca) { // estaca con cinta esmeralda: "lo plantó un curso"
      b(solido, G.caja, P.madera, 0.35, 0.45, 0, 0.06, 0.9, 0.06);
      b(brillo, G.caja, P.esmeralda, 0.35, 0.8, 0, 0.1, 0.12, 0.1, 0, 0, 0, { brillo: true });
    }
  }
  function tocon(x, z) {
    solido.add(G.cil, P.tronco, M(x, 0.2, z, 0.5, 0.4, 0.5, R(0, 6)));
    plano.add(G.disco, P.ceniza, M(x, 0.025, z, R(2, 3.2), 0.02, R(2, 3.2)), { ao: false });
  }

  // --- animales
  function paraba(lote, base, roja = true) {
    const b = conBase(base);
    const c1 = roja ? P.rojo : P.azul, c2 = roja ? P.amarillo : P.amarillo, c3 = roja ? P.azul : P.amarillo;
    b(lote, G.bola, c1, 0, 0, 0, 0.32, 0.32, 0.55);
    b(lote, G.bola, roja ? P.rojo : P.azul, 0, 0.18, 0.28, 0.24, 0.24, 0.24);
    b(lote, G.cono, P.blanco, 0, 0.16, 0.44, 0.1, 0.16, 0.1, 0, Math.PI / 2);
    b(lote, G.caja, c2, 0.2, 0.02, -0.02, 0.08, 0.14, 0.42, 0, 0, -0.3);
    b(lote, G.caja, c2, -0.2, 0.02, -0.02, 0.08, 0.14, 0.42, 0, 0, 0.3);
    b(lote, G.caja, c3, 0, -0.04, -0.6, 0.12, 0.05, 0.75, 0, -0.25);
  }
  function peta(x, z, ry = 0) {
    const b = conBase(M(x, 0, z, 1, 1, 1, ry));
    b(solido, G.bola, P.peta, 0, 0.18, 0, 1.0, 0.7, 1.2);
    b(solido, G.bolita, P.petaClaro, 0, 0.42, 0, 0.32, 0.12, 0.32);
    b(solido, G.bolita, P.petaClaro, 0.25, 0.36, 0.25, 0.2, 0.1, 0.2);
    b(solido, G.bolita, P.petaClaro, -0.25, 0.36, -0.2, 0.2, 0.1, 0.2);
    b(solido, G.bola, P.piel2, 0, 0.2, 0.7, 0.28, 0.24, 0.3);
    for (const [px, pz] of [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]]) b(solido, G.cil, P.piel3, px, 0.06, pz, 0.16, 0.14, 0.16);
    sombra(x, z, 0.8, 0.3);
  }

  // --- personas (proporción en "cabezas": A/C más tiernas, B más juveniles)
  function persona(x, z, ry, o) {
    const cab = esB ? o.cabezasB : o.cabezasA;
    const H = o.altura, h = H / cab;
    const b = conBase(M(x, 0, z, 1, 1, 1, ry));
    const pierna = (H - h) * 0.46, torso = (H - h) * 0.54;
    const ancho = Math.max(h * 0.95, H * 0.2);
    for (const s of [-1, 1]) {
      b(solido, G.caja, o.pantalon, s * ancho * 0.22, pierna / 2, 0, ancho * 0.36, pierna, ancho * 0.4);
      b(solido, G.caja, P.oscuro, s * ancho * 0.22, 0.05, 0.03, ancho * 0.38, 0.1, ancho * 0.52);
    }
    if (o.guardapolvo) b(solido, G.caja, P.blanco, 0, pierna + torso / 2 - pierna * 0.3, 0, ancho * 1.04, torso + pierna * 0.6, ancho * 0.62);
    else b(solido, G.caja, o.ropa, 0, pierna + torso / 2, 0, ancho, torso, ancho * 0.58);
    for (const s of [-1, 1]) {
      b(solido, G.caja, o.guardapolvo ? P.blanco : o.ropa, s * ancho * 0.62, pierna + torso * 0.62, 0, ancho * 0.24, torso * 0.8, ancho * 0.28, 0, 0, s * 0.12);
      b(solido, G.bolita, o.piel, s * ancho * 0.68, pierna + torso * 0.2, 0, ancho * 0.22, ancho * 0.22, ancho * 0.22);
    }
    if (o.chaleco) b(solido, G.caja, o.chaleco, 0, pierna + torso * 0.6, 0, ancho * 1.06, torso * 0.7, ancho * 0.62);
    const cy = pierna + torso + h * 0.5;
    b(solido, G.bola, o.piel, 0, cy, 0, h * 0.92, h, h * 0.9);
    // pelo
    b(solido, G.bola, o.pelo, 0, cy + h * 0.14, -h * 0.06, h * 0.98, h * 0.8, h * 0.95);
    if (o.mono) b(solido, G.bola, o.pelo, 0, cy + h * 0.32, -h * 0.42, h * 0.42, h * 0.42, h * 0.42);
    if (o.flor) b(brillo, G.bolita, P.tajiboAm, h * 0.36, cy + h * 0.36, -h * 0.2, h * 0.22, h * 0.22, h * 0.22, 0, 0, 0, { brillo: true });
    if (o.colita) b(solido, G.bola, o.pelo, 0, cy - h * 0.05, -h * 0.5, h * 0.3, h * 0.5, h * 0.3);
    // cara: ojos y boca (calcomanía simple)
    for (const s of [-1, 1]) b(plano, G.caja, P.tinta, s * h * 0.2, cy + h * 0.02, h * 0.44, h * 0.11, h * (o.ojos || 0.16), 0.02, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.oscuro, 0, cy - h * 0.2, h * 0.44, h * 0.22, h * 0.05, 0.02, 0, 0, 0, { ao: false });
    if (o.anteojos) {
      for (const s of [-1, 1]) { b(plano, G.caja, P.oscuro, s * h * 0.2, cy + h * 0.02, h * 0.455, h * 0.32, h * 0.26, 0.012, 0, 0, 0, { ao: false }); b(plano, G.caja, P.vidrio, s * h * 0.2, cy + h * 0.02, h * 0.47, h * 0.24, h * 0.18, 0.012, 0, 0, 0, { ao: false, brillo: true }); b(plano, G.caja, P.tinta, s * h * 0.2, cy + h * 0.02, h * 0.48, h * 0.1, h * 0.14, 0.012, 0, 0, 0, { ao: false }); }
      b(plano, G.caja, P.oscuro, 0, cy + h * 0.06, h * 0.46, h * 0.16, h * 0.04, 0.015, 0, 0, 0, { ao: false });
    }
    if (o.mochila) b(solido, G.caja, o.mochila, 0, pierna + torso * 0.55, -ancho * 0.45, ancho * 0.75, torso * 0.75, ancho * 0.35);
    if (o.auriculares) {
      b(solido, G.caja, P.oscuro, 0, cy - h * 0.5, 0, h * 1.0, h * 0.1, h * 0.7);
      for (const s of [-1, 1]) b(solido, G.cil, P.esmeralda, s * h * 0.45, cy - h * 0.48, 0.05, h * 0.3, h * 0.12, h * 0.3, 0, 0, Math.PI / 2);
    }
    if (o.ia) {
      // aro esmeralda flotando: marca que es un profe IA (los dos iguales)
      const aro = new THREE.TorusGeometry(h * 0.55, h * 0.06, 4, 18);
      b(brillo, aro, P.esmeralda, 0, H + h * 0.32, 0, 1, 1, 1, 0, Math.PI / 2, 0, { brillo: true });
    }
    sombra(x, z, ancho * 1.1, 0.4);
    return pierna + torso + h;
  }

  // --- casona cruceña con galerías y horcones alrededor de un patio
  function casona(cx, cz, s = 1, ry = 0, op = {}) {
    const base = M(cx, 0, cz, s, s, s, ry);
    const b = conBase(base);
    const E = 7, D = 3.2, I = E - D, Hw = 2.6, Gal = 1.35;
    const techo = op.palma ? P.palma : P.teja;
    // alas: [cx, cz, ancho x, largo z]
    const alas = [[0, -(E - D / 2), 2 * E, D], [-(E - D / 2), 0, D, 2 * I], [E - D / 2, 0, D, 2 * I]];
    for (const [x, z, w, l] of alas) b(solido, G.caja, P.pared, x, Hw / 2, z, w, Hw, l);
    // ala sur con zaguán (entrada)
    b(solido, G.caja, P.pared, -(E + 1) / 2 - 0.0, Hw / 2, E - D / 2, E - 1, Hw, D);
    b(solido, G.caja, P.pared, (E + 1) / 2, Hw / 2, E - D / 2, E - 1, Hw, D);
    // zócalos de color en las paredes exteriores
    b(solido, G.caja, P.zocalo, 0, 0.22, -E - 0.02, 2 * E + 0.04, 0.44, 0.04, 0, 0, 0, { ao: false });
    b(solido, G.caja, P.zocalo, -E - 0.02, 0.22, 0, 0.04, 0.44, 2 * E, 0, 0, 0, { ao: false });
    b(solido, G.caja, P.zocalo, E + 0.02, 0.22, 0, 0.04, 0.44, 2 * E, 0, 0, 0, { ao: false });
    // pisos de galería (baldosa) hacia el patio y hacia la calle
    b(plano, G.caja, P.piso, 0, 0.08, -I + Gal / 2, 2 * I, 0.16, Gal, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.piso, 0, 0.08, I - Gal / 2, 2 * I, 0.16, Gal, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.piso, -I + Gal / 2, 0.08, 0, Gal, 0.16, 2 * I - 2 * Gal, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.piso, I - Gal / 2, 0.08, 0, Gal, 0.16, 2 * I - 2 * Gal, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.piso, 0, 0.08, E + Gal / 2, 2 * E, 0.16, Gal, 0, 0, 0, { ao: false });
    // patio: pasto con senderos en cruz
    b(plano, G.caja, P.pasto, 0, 0.05, 0, 2 * I - 2 * Gal, 0.1, 2 * I - 2 * Gal, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.patio, 0, 0.11, 0, 0.9, 0.02, 2 * I - 2 * Gal, 0, 0, 0, { ao: false });
    b(plano, G.caja, P.patio, 0, 0.11, 0, 2 * I - 2 * Gal, 0.02, 0.9, 0, 0, 0, { ao: false });
    // horcones y vigas de la galería interior (cuadrado) y de la exterior (calle)
    const hor = (x, z) => { b(solido, G.cil, P.horcon, x, Hw / 2, z, 0.24, Hw, 0.24); b(solido, G.caja, P.piedra, x, 0.12, z, 0.38, 0.24, 0.38); };
    const k = I - Gal;
    for (let i = -2; i <= 2; i++) { const t = i * k / 2; hor(t, -k); hor(t, k); if (Math.abs(i) < 2) { hor(-k, t); hor(k, t); } }
    for (const z of [-k, k]) b(solido, G.caja, P.madera, 0, Hw - 0.06, z, 2 * k + 0.3, 0.16, 0.2);
    for (const x of [-k, k]) b(solido, G.caja, P.madera, x, Hw - 0.06, 0, 0.2, 0.16, 2 * k + 0.3);
    for (let i = -3; i <= 3; i++) hor(i * (E - 0.4) / 3, E + Gal - 0.15);
    b(solido, G.caja, P.madera, 0, Hw - 0.06, E + Gal - 0.15, 2 * E, 0.16, 0.2);
    // techos a cuatro aguas que cubren alas y galerías
    const Ht = 1.7, y = Hw - 0.02;
    b(solido, techoHip(2 * E + 0.8, E - k + 0.6, Ht), techo, 0, y, -(E + k) / 2 - 0.1, 1, 1, 1, Math.PI / 2);
    b(solido, techoHip(E - k + Gal + 0.8, 2 * E + 0.8, Ht), techo, 0, y, (E + k + Gal) / 2, 1, 1, 1, Math.PI / 2);
    b(solido, techoHip(E - k + 0.6, 2 * k - 0.4, Ht * 0.92), techo, -(E + k) / 2 - 0.1, y, 0);
    b(solido, techoHip(E - k + 0.6, 2 * k - 0.4, Ht * 0.92), techo, (E + k) / 2 + 0.1, y, 0);
    if (!op.simple) {
      // puertas hacia la galería y ventanas de madera hacia afuera
      for (let i = -2; i <= 2; i++) {
        b(solido, G.caja, P.maderaOsc, i * 1.5, 0.95, -I - 0.02, 0.8, 1.6, 0.06);
        b(solido, G.caja, P.maderaOsc, -I - 0.02, 0.95, i * 1.1, 0.06, 1.6, 0.7);
        b(solido, G.caja, P.maderaOsc, I + 0.02, 0.95, i * 1.1, 0.06, 1.6, 0.7);
      }
      for (let i = -2; i <= 2; i++) {
        b(solido, G.caja, P.madera, i * 2.6, 1.4, -E - 0.04, 0.8, 1.0, 0.08);
        b(solido, G.caja, P.madera, -E - 0.04, 1.4, i * 2.6, 0.08, 1.0, 0.8);
        b(solido, G.caja, P.madera, E + 0.04, 1.4, i * 2.6, 0.08, 1.0, 0.8);
        if (i !== 0) b(solido, G.caja, P.madera, i * 2.6, 1.3, E + 0.04, 0.8, 1.2, 0.08);
      }
      b(solido, G.caja, P.maderaOsc, 0, 1.1, E + 0.02, 1.6, 2.1, 0.1); // portón del zaguán
      // aljibe en el centro del patio
      b(solido, G.cil, P.piedra, 0, 0.4, 0, 1.3, 0.6, 1.3);
      b(plano, G.disco, P.rioOsc, 0, 0.71, 0, 1.0, 0.02, 1.0, 0, 0, 0, { ao: false });
      for (const sx of [-0.55, 0.55]) b(solido, G.cil, P.horcon, sx, 1.1, 0, 0.1, 1.5, 0.1);
      b(solido, G.prisma, P.teja, 0, 1.8, 0, 1.6, 0.45, 0.8, Math.PI / 2);
      // toborochi y plantas del patio
      toborochiEn(base, -1.55, -1.55, 0.42);
      for (const [px, pz] of [[1.6, 1.6], [-1.6, 1.6], [1.6, -1.6]]) b(solido, G.bolita, P.bosque3, px, 0.4, pz, 0.8, 0.7, 0.8);
    }
    if (op.creciendo) {
      // el colegio crece: torre-mirador de dos pisos con techo verde y andamio
      b(solido, G.caja, P.pared3, 5.3, 2.4, -5.3, 3.0, 4.8, 3.0);
      b(solido, G.caja, P.techoVerde, 5.3, 4.88, -5.3, 3.3, 0.18, 3.3);
      for (const [px, pz] of [[4.5, -4.6], [6.0, -6.0], [5.6, -4.7], [4.6, -5.9]]) b(solido, G.bolita, P.bosque4, px, 5.15, pz, 0.6, 0.45, 0.6);
      for (const [px, pz] of [[3.8, -3.75], [6.8, -3.75]]) b(solido, G.cil, P.horcon, px, 4.2, pz, 0.16, 1.4, 0.16);
      b(solido, G.caja, P.madera, 5.3, 3.5, -3.7, 3.2, 0.12, 0.9);
      b(solido, G.caja, P.madera, 5.3, 4.0, -3.3, 3.2, 0.08, 0.06);
      for (let i = 0; i < 4; i++) b(solido, G.caja, P.vidrio, 4.1 + i * 0.8, 3.9, -3.78, 0.5, 0.7, 0.04);
      // andamio
      for (const [px, pz] of [[7.3, -7.2], [7.3, -3.8], [9.6, -7.2], [9.6, -3.8]]) b(solido, G.caja, P.madera, px, 1.6, pz, 0.08, 3.2, 0.08);
      for (const yy of [1.1, 2.2, 3.2]) { b(solido, G.caja, P.madera, 8.45, yy, -7.2, 2.4, 0.07, 0.07); b(solido, G.caja, P.madera, 8.45, yy, -3.8, 2.4, 0.07, 0.07); }
      b(solido, G.caja, P.madera, 8.45, 2.2, -5.5, 2.3, 0.06, 3.4);
      // la próxima pieza (aula de ciencias), en esmeralda translúcido
      fantasmas.push(base.clone().multiply(M(8.45, 1.3, -5.5, 2.3, 2.6, 3.4)));
      fantasmas.push(base.clone().multiply(M(8.45, 3.0, -5.5, 2.6, 0.8, 3.7)));
      // bandera de Santa Cruz y cartel
      b(solido, G.cil, P.blanco, -5.4, 3.0, E + 2.4, 0.1, 6, 0.1);
      b(solido, G.caja, P.bosque2, -4.65, 5.55, E + 2.4, 1.4, 0.3, 0.04, 0, 0, 0, { ao: false });
      b(solido, G.caja, P.blanco, -4.65, 5.25, E + 2.4, 1.4, 0.3, 0.04, 0, 0, 0, { ao: false });
      b(solido, G.caja, P.bosque2, -4.65, 4.95, E + 2.4, 1.4, 0.3, 0.04, 0, 0, 0, { ao: false });
    }
    sombras.push(...[[cx, cz, 10.5 * s, 0.25]]);
  }
  function toborochiEn(base, x, z, s) {
    const p = new THREE.Vector3(x, 0, z).applyMatrix4(base);
    const esc = new THREE.Vector3().setFromMatrixScale(base).x;
    toborochi(p.x, p.z, s * esc);
  }

  // --- portal de visita a otro colegio
  function portal(x, z, ry, s = 1, nombre) {
    const base = M(x, 0, z, s, s, s, ry);
    const b = conBase(base);
    b(solido, G.cil, P.piedra, 0, 0.15, 0, 4.6, 0.3, 2.4);
    b(solido, G.cil, P.piedra, 0, 0.36, 0, 3.6, 0.14, 1.8);
    if (esB) {
      for (const sx of [-1.75, 1.75]) b(solido, G.cil, P.horcon, sx, 1.6, 0, 0.32, 3.0, 0.32);
    } else {
      for (const sx of [-1.45, 1.45]) {
        b(solido, G.cil, P.horcon, sx, 1.9, 0, 0.36, 3.5, 0.36);
        b(solido, G.caja, P.piedra, sx, 0.5, 0, 0.6, 0.3, 0.6);
      }
      b(solido, G.caja, P.madera, 0, 3.75, 0, 3.8, 0.3, 0.5);
      b(solido, G.prisma, P.palma, 0, 3.9, 0, 4.4, 0.8, 1.2);
      // enredadera de tajibo que brilla
      for (let i = 0; i < 16; i++) {
        const t = i / 15;
        const px = i < 6 ? -1.45 : i < 11 ? -1.45 + (t - 0.375) / 0.3 * 2.9 : 1.45;
        const py = i < 6 ? 0.8 + i * 0.5 : i < 11 ? 3.6 : 3.4 - (i - 11) * 0.55;
        const c = i % 3 === 0 ? P.tajiboAm : P.esmeralda;
        b(brillo, G.bolita, c, Math.min(1.45, Math.max(-1.45, px)) + R(-0.15, 0.15), py, R(0.15, 0.3), 0.32, 0.32, 0.32, 0, 0, 0, { brillo: true });
      }
    }
    // superficie del portal: una "ventana" a otro colegio
    const tex = texturaPortal(THREE, P, esB);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(esB ? 1.55 : 1.3, esB ? 40 : 24),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide }));
    disco.applyMatrix4(base.clone().multiply(M(0, esB ? 1.9 : 1.75, 0, 1, esB ? 1 : 1.25, 1)));
    escena.add(disco);
    animados.push(t => { tex.offset.x = (t * 0.03) % 1; disco.material.opacity = 0.82 + 0.13 * Math.sin(t * 2); });
    if (esB) {
      // aro con guarda tejida que gira (patrón genérico, a co-diseñar)
      const guarda = texturaGuarda(THREE, P);
      guarda.repeat.set(10, 1);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.26, 8, 40), new THREE.MeshBasicMaterial({ map: guarda }));
      aro.applyMatrix4(base.clone().multiply(M(0, 1.9, 0)));
      acentos.add(aro);
      const aroC = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.31, 8, 40), new THREE.MeshBasicMaterial({ color: P.tinta, side: THREE.BackSide }));
      aroC.applyMatrix4(base.clone().multiply(M(0, 1.9, 0)));
      acentos.add(aroC);
      animados.push(t => { guarda.offset.x = (t * 0.08) % 1; });
    }
    // chispas que suben
    const chispas = new Lote();
    for (let i = 0; i < 14; i++) chispas.add(G.bolita, i % 4 ? P.esmeraldaClaro : P.tajiboAm, M(R(-1.3, 1.3), R(0.4, 3.4), R(-0.3, 0.3), 0.12, 0.12, 0.12), { brillo: true });
    const mChispas = new THREE.Mesh(chispas.geometria(), new THREE.MeshBasicMaterial({ vertexColors: true, fog: true }));
    mChispas.applyMatrix4(base);
    const y0 = mChispas.position.y;
    escena.add(mChispas);
    animados.push(t => { mChispas.position.y = y0 + ((t * 0.35) % 1) * 0.6; });
    sombra(x, z, 2.6 * s, 0.25);
    if (nombre) etiqueta(nombre, new THREE.Vector3(0, 4.9, 0).applyMatrix4(base), '#10B981', 45);
  }

  // --- ciudad por anillos
  function casita(x, z, ry, w, d, h, pared, conGaleria) {
    const b = conBase(M(x, 0, z, 1, 1, 1, ry));
    b(solido, G.caja, pared, 0, h / 2, 0, w, h, d);
    b(solido, techoHip(w + 0.4, d + 0.4, Math.min(w, d) * 0.45), rnd() < 0.85 ? P.teja : P.palma, 0, h, 0);
    b(solido, G.caja, P.maderaOsc, 0, 0.6, d / 2 + 0.01, 0.45, 1.0, 0.04);
    if (conGaleria) for (const sx of [-w / 2 + 0.15, w / 2 - 0.15]) b(solido, G.cil, P.horcon, sx, h / 2, d / 2 + 0.55, 0.14, h, 0.14);
    if (conGaleria) b(solido, G.caja, P.teja, 0, h - 0.05, d / 2 + 0.45, w + 0.3, 0.12, 1.0, 0, -0.25);
    sombra(x, z, Math.max(w, d) * 0.85, 0.3);
  }
  function edificio(x, z, ry, w, d, pisos) {
    const b = conBase(M(x, 0, z, 1, 1, 1, ry));
    const h = pisos * 0.9;
    b(solido, G.caja, rnd() < 0.5 ? P.edificio : P.edificio2, 0, h / 2, 0, w, h, d);
    for (let i = 1; i < pisos; i++) b(solido, G.caja, P.vidrio, 0, i * 0.9 - 0.05, 0, w + 0.04, 0.3, d + 0.04, 0, 0, 0, { ao: false });
    b(solido, G.caja, P.techoVerde, 0, h + 0.05, 0, w * 0.7, 0.1, d * 0.7);
    sombra(x, z, Math.max(w, d), 0.35);
  }
  function catedral(x, z, ry) {
    const b = conBase(M(x, 0, z, 1, 1, 1, ry));
    b(solido, G.caja, P.ladrillo, 0, 1.6, 0, 3.2, 3.2, 5.5);
    b(solido, G.prisma, P.teja2, 0, 3.2, 0, 3.6, 1.4, 5.7);
    for (const sx of [-1.3, 1.3]) {
      b(solido, G.caja, P.ladrillo, sx, 2.6, 2.6, 1.2, 5.2, 1.2);
      b(solido, G.piramide, P.teja2, sx, 5.2, 2.6, 1.3, 1.2, 1.3);
    }
    b(solido, G.caja, P.maderaOsc, 0, 0.9, 2.77, 0.9, 1.6, 0.06);
    sombra(x, z, 3.6, 0.35);
  }
  function arco(cx, cz, r, ancho, color, filtro, lote = plano, y = 0.04, alto = 0.06) {
    const n = Math.max(24, Math.round(2 * Math.PI * r / 1.1));
    for (let i = 0; i < n; i++) {
      const a = (i + 0.5) / n * Math.PI * 2;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
      if (filtro && !filtro(x, z)) continue;
      lote.add(G.caja, color, M(x, y, z, ancho, alto, 2 * Math.PI * r / n + 0.06, -a), { ao: false });
    }
  }
  function recta(x0, z0, x1, z1, ancho, color, filtro, y = 0.05) {
    const L2 = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L2 / 1.5));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      if (filtro && !filtro(x, z)) continue;
      plano.add(G.caja, color, M(x, y, z, ancho, 0.06, L2 / n + 0.05, Math.atan2(x1 - x0, z1 - z0)), { ao: false });
    }
  }

  function etiqueta(texto, pos, color = '#10B981', maxDist = Infinity) {
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    const fuente = '600 44px Inter, system-ui, sans-serif';
    g.font = fuente;
    const w = Math.ceil(g.measureText(texto).width) + 56;
    c.width = w; c.height = 84;
    g.font = fuente;
    g.fillStyle = 'rgba(10,10,10,.86)';
    g.beginPath(); g.roundRect(3, 3, w - 6, 78, 39); g.fill();
    g.lineWidth = 5; g.strokeStyle = color; g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, w / 2, 44);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    // tamaño fijo en pantalla (se lee igual de cerca o de lejos)
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, sizeAttenuation: false }));
    sp.renderOrder = 10;
    sp.userData.ancho = w / 84;
    sp.scale.set(w / 84 * 0.05, 0.05, 1);
    sp.position.copy(pos);
    sp.userData.maxDist = maxDist;
    etiquetas.add(sp);
    return sp;
  }

  // ============================================================ armar
  const RB = 44; // radio del tablero
  let vistas;
  if (tipo === 'mapa') vistas = armarMapa(); else vistas = armarEscena();

  function tablero(radio, pastoColor) {
    plano.add(G.disco, pastoColor, M(0, -0.15, 0, radio * 2, 0.3, radio * 2), { ao: false, variar: false });
    solido.add(G.disco, P.baseLado, M(0, -1.8, 0, radio * 2 + 0.3, 3.0, radio * 2 + 0.3), { variar: false });
    plano.add(G.disco, P.baseLado2, M(0, -3.4, 0, radio * 2 + 1.6, 0.4, radio * 2 + 1.6), { variar: false });
  }

  function armarEscena() {
    tablero(RB, P.pasto);
    const C = new THREE.Vector2(0, 32); // centro de la ciudad (plaza principal)
    const anillos = [5, 9.5, 14.5, 20];
    const dentro = (x, z, m = 1.5) => Math.hypot(x, z) < RB - m;
    const rioPts = [[-10, -44], [-17, -30], [-27, -17], [-31, -6], [-40, 6], [-46, 12]];
    const distRio = (x, z) => {
      let d = 1e9;
      for (let i = 0; i < rioPts.length - 1; i++) {
        const [ax, az] = rioPts[i], [bx, bz] = rioPts[i + 1];
        const vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
        d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
      }
      return d;
    };

    // --- río (como el Piraí) con playas de arena
    for (let i = 0; i < rioPts.length - 1; i++) {
      recta(...rioPts[i], ...rioPts[i + 1], 5.2, P.arena, (x, z) => dentro(x, z, 0.6), 0.02);
      recta(...rioPts[i], ...rioPts[i + 1], 3.0, P.rio, (x, z) => dentro(x, z, 0.6), 0.05);
    }

    // --- ciudad por anillos (al sur)
    const enCiudad = (x, z) => z > 11.6 && dentro(x, z);
    plano.add(G.caja, P.cantero, M(C.x, 0.04, C.y, 7, 0.06, 7), { ao: false });
    plano.add(G.caja, P.patio, M(C.x, 0.07, C.y, 7.2, 0.02, 0.8), { ao: false });
    plano.add(G.caja, P.patio, M(C.x, 0.07, C.y, 0.8, 0.02, 7.2), { ao: false });
    catedral(C.x, C.y + 5.6, Math.PI);
    for (const [px, pz] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) arbolBosque(C.x + px, C.y + pz, 0.5, P.bosque3);
    toborochi(C.x - 1.0, C.y - 0.6, 0.5);
    for (const r of anillos) {
      arco(C.x, C.y, r, 1.3, P.calle, enCiudad);
      if (r > 6) arco(C.x, C.y, r, 0.35, P.cantero, enCiudad, plano, 0.09, 0.04);
    }
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.42;
      recta(C.x + Math.cos(a) * 3.6, C.y + Math.sin(a) * 3.6, C.x + Math.cos(a) * 21, C.y + Math.sin(a) * 21, 0.9, P.calle, enCiudad, 0.06);
    }
    const ocupado = [];
    const libre = (x, z, r) => ocupado.every(([ox, oz, or]) => Math.hypot(x - ox, z - oz) > r + or);
    for (let k = 0; k < anillos.length - 1; k++) {
      const r0 = anillos[k] + 1.4, r1 = anillos[k + 1] - 1.4;
      for (let r = r0; r <= r1 + 0.01; r += Math.max(1.6, (r1 - r0) / 2)) {
        const paso = 2.1 / r;
        for (let a = 0; a < Math.PI * 2; a += paso) {
          const x = C.x + Math.cos(a) * r + R(-0.3, 0.3), z = C.y + Math.sin(a) * r + R(-0.3, 0.3);
          if (!enCiudad(x, z) || z < 13 || (Math.abs(x) < 7 && z < 18.5) || (Math.abs(x) < 4.5 && z < 23)) continue;
          // no tapar las avenidas radiales
          const ang = Math.atan2(z - C.y, x - C.x);
          let cerca = false;
          for (let i = 0; i < 8; i++) { const av = -Math.PI / 2 + (i - 3.5) * 0.42; if (Math.abs(Math.sin(ang - av)) * r < 1.0 && Math.cos(ang - av) > 0) cerca = true; }
          if (cerca || !libre(x, z, 0.9) || rnd() < 0.12) continue;
          ocupado.push([x, z, 0.9]);
          const ry = -a + Math.PI / 2;
          // casco viejo bajo, con galerías; los edificios altos, del 2do anillo hacia afuera
          if (k === 1 && rnd() < 0.3) edificio(x, z, ry, R(1.4, 1.8), R(1.4, 1.8), Math.floor(R(4, 9)));
          else if (k === 2 && rnd() < 0.12) edificio(x, z, ry, R(1.4, 1.7), R(1.3, 1.6), Math.floor(R(2, 5)));
          else if (k === 0) casita(x, z, ry, R(1.4, 1.8), R(1.2, 1.5), R(1.1, 1.4), [P.pared, P.pared2, P.pared3, P.pared4][Math.floor(rnd() * 4)], true);
          else if (rnd() < 0.18) arbolBosque(x, z, R(0.5, 0.7));
          else casita(x, z, ry, R(1.3, 1.8), R(1.2, 1.6), R(1.0, 1.4), [P.pared, P.pared2, P.pared3, P.pared4][Math.floor(rnd() * 4)], k > 0 && rnd() < 0.5);
        }
      }
    }

    // --- el colegio (centro de la escena)
    casona(0, 0, 1, 0, { creciendo: true });
    plano.add(G.caja, P.patio, M(0, 0.04, 9.8, 10, 0.04, 3.6), { ao: false }); // plazuela de entrada
    for (const sx of [-4, 4]) { solido.add(G.caja, P.madera, M(sx, 0.25, 10.8, 1.8, 0.12, 0.5)); solido.add(G.caja, P.madera, M(sx, 0.12, 10.8, 0.1, 0.24, 0.4)); }
    recta(-7, 0, -15.5, -1.2, 1.2, P.patio, null, 0.04); // sendero al portal
    etiqueta('Mi colegio · creciendo', new THREE.Vector3(0, 6.7, -2), '#10B981', 45);
    etiqueta('Próxima aula', new THREE.Vector3(8.5, 5.0, -5.5), '#7DE3BE', 26);

    // --- portal de visita
    portal(-17.5, -1.8, Math.PI / 2 - 0.2, 1, 'Portal → Colegio Los Tajibos');
    persona(-14.6, -0.4, -Math.PI / 2 - 0.35, { altura: 1.6, cabezasA: 4.2, cabezasB: 5.8, piel: P.piel1, pelo: P.pelo, ropa: P.esmeralda, pantalon: P.azulUniforme, mochila: P.oscuro, auriculares: true });

    // --- personajes en la plazuela: los dos profes (IA) y dos alumnos
    const yT = persona(-1.7, 10.1, 0.12, { altura: 1.75, cabezasA: 4.5, cabezasB: 6.3, piel: P.piel4, pelo: P.pelo, ropa: P.ropaTaji, pantalon: P.azulUniforme, mono: true, flor: true, ia: true });
    const yJ = persona(1.8, 10.1, -0.12, { altura: 1.82, cabezasA: 4.5, cabezasB: 6.3, piel: P.piel2, pelo: P.pelo2, ropa: P.blanco, chaleco: P.ropaJochi, pantalon: P.maderaOsc, anteojos: true, ia: true });
    const yP = persona(-0.55, 11.2, 0.05, { altura: 1.12, cabezasA: 3.4, cabezasB: 4.6, piel: P.piel1, pelo: P.pelo, ropa: P.blanco, pantalon: P.azulUniforme, guardapolvo: true, colita: true, mochila: P.tajiboRo, ojos: 0.2 });
    const yS = persona(0.65, 11.1, -0.05, { altura: 1.6, cabezasA: 4.2, cabezasB: 5.8, piel: P.piel3, pelo: P.pelo, ropa: P.esmeralda, pantalon: P.azulUniforme, mochila: P.oscuro, auriculares: true });
    etiqueta('Profe Taji (IA)', new THREE.Vector3(-1.95, yT + 0.75, 10.1), '#F2C230', 13);
    etiqueta('Profe Jochi (IA)', new THREE.Vector3(2.05, yJ + 0.75, 10.1), '#10B981', 13);
    etiqueta('Primaria', new THREE.Vector3(-0.75, yP + 0.25, 11.2), '#E68AB8', 13);
    etiqueta('Secundaria', new THREE.Vector3(0.95, yS + 0.42, 11.1), '#5FB7C9', 13);

    // --- bosque: lejos, maduro; cerca del colegio, en restauración (plantines con estaca)
    const especiales = [];
    const fijo = (f, x, z, ...a) => { f(x, z, ...a); especiales.push([x, z]); };
    fijo(toborochi, 5.5, -13.2, 1.05);
    fijo(tajibo, 13.5, -18.5, 1.15, P.tajiboAm);
    fijo(tajibo, 8.2, -22.5, 1.1, P.tajiboRo);
    fijo(tajibo, 19.5, -14.0, 1.0, P.tajiboAm);
    fijo(motacu, 16.8, -10.8, 0.95);
    fijo(motacu, 2.0, -18.5, 1.0);
    fijo(motacu, 22.0, -21.0, 1.05);
    peta(9.2, -11.6, -0.6); especiales.push([9.2, -11.6]);
    // parabas posadas y volando
    paraba(solido, M(13.5 + 0.9, 4.95, -18.5 + 0.3, 1.1, 1.1, 1.1, 0.8), true);
    paraba(solido, M(13.5 - 0.7, 5.15, -18.5 - 0.2, 1.1, 1.1, 1.1, -1.9), false);
    const vuelo = new Lote();
    paraba(vuelo, M(2.2, 0, 0, 1.3, 1.3, 1.3, 0, 0, -0.4), true);
    paraba(vuelo, M(-2.4, 0.6, 0.8, 1.3, 1.3, 1.3, Math.PI, 0, 0.4), false);
    const mVuelo = new THREE.Mesh(vuelo.geometria(), new THREE.MeshBasicMaterial({ vertexColors: true, fog: true }));
    mVuelo.position.set(11, 8.4, -15);
    escena.add(mVuelo);
    animados.push(t => { mVuelo.rotation.y = -t * 0.45; mVuelo.position.y = 8.4 + Math.sin(t * 1.3) * 0.3; });
    if (esB) mVuelo.add(contorno(mVuelo.geometry, 0.035));
    etiqueta('Bosque en restauración', new THREE.Vector3(9, 6.5, -11.5), '#10B981', 45);

    // frente de restauración al este: suelo quemado con tocones y primeros plantines
    for (let i = 0; i < 9; i++) {
      const x = R(26, 37), z = R(-9, 7);
      if (dentro(x, z, 3)) tocon(x, z);
    }
    for (let i = 0; i < 7; i++) {
      const x = R(25, 34), z = R(-8, 6);
      if (dentro(x, z, 3)) plantin(x, z, R(0.8, 1.1));
    }
    // grilla con temblor para el resto del bosque
    const paso = 2.9;
    for (let gx = -RB; gx <= RB; gx += paso) for (let gz = -RB; gz <= 12; gz += paso) {
      const x = gx + R(-1, 1), z = gz + R(-1, 1);
      if (!dentro(x, z, 2)) continue;
      if (z > 10.5) continue;                                         // ciudad
      if (Math.abs(x) < 11.3 && z > -9.5 && z < 12.5) continue;        // colegio y andamio
      if (Math.hypot(x + 17.5, z + 1.8) < 5.5) continue;                  // portal
      if (Math.abs(z + 0.8) < 2.6 && x < -6 && x > -17) continue;       // sendero
      if (distRio(x, z) < 3.4) continue;
      if (x > 24 && z > -10 && z < 8) continue;                         // frente quemado
      if (especiales.some(([ex, ez]) => Math.hypot(x - ex, z - ez) < 2.8)) continue;
      const d = Math.hypot(x, z);
      const restauracion = z < -8 && x > -4 && d < 19;                 // lo que ya plantó el colegio
      if (restauracion) { if (rnd() < 0.75) plantin(x, z, R(0.9, 1.5), rnd() < 0.6); continue; }
      if (d < 15 && rnd() < 0.55) continue;
      const tirada = rnd();
      if (tirada < 0.12) tajibo(x, z, R(0.8, 1.1), P.tajiboAm);
      else if (tirada < 0.19) tajibo(x, z, R(0.8, 1.05), P.tajiboRo);
      else if (tirada < 0.25) toborochi(x, z, R(0.7, 1));
      else if (tirada < 0.43) motacu(x, z, R(0.75, 1.05));
      else arbolBosque(x, z, R(0.85, 1.25));
    }

    // distancia de la cámara (horizontal) y alturas para cada vista
    return {
      general: { objetivo: [0, 0, 0], desde: [30, 58, 66] },
      colegio: { objetivo: [0.5, 1.4, 1.2], desde: [15, 13.5, 21] },
      bosque: { objetivo: [9, 2.0, -16], desde: [19, 13, 1] },
      portal: { objetivo: [-16.6, 1.9, -1.4], desde: [-9.2, 3.6, 2.6] },
      ciudad: { objetivo: [0, 1, 22], desde: [-20, 22, 5] },
      profes: { objetivo: [0.1, 1.15, 10.5], desde: [0.5, 2.5, 15.6] }
    };
  }

  function armarMapa() {
    const RM = 48;
    tablero(RM, P.pasto);
    const dentro = (x, z, m = 1.5) => Math.hypot(x, z) < RM - m;
    const anillos = [4.5, 9, 13.5, 18, 22.5, 27];
    // río al oeste
    const rioPts = [[-20, -48], [-26, -30], [-31, -12], [-30, 6], [-36, 24], [-34, 40]];
    for (let i = 0; i < rioPts.length - 1; i++) {
      recta(...rioPts[i], ...rioPts[i + 1], 6, P.arena, (x, z) => dentro(x, z, 0.6), 0.02);
      recta(...rioPts[i], ...rioPts[i + 1], 3.6, P.rio, (x, z) => dentro(x, z, 0.6), 0.05);
    }
    const distRio = (x, z) => Math.min(...rioPts.slice(0, -1).map(([ax, az], i) => {
      const [bx, bz] = rioPts[i + 1], vx = bx - ax, vz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
      return Math.hypot(x - ax - vx * t, z - az - vz * t);
    }));
    const enCiudad = (x, z) => Math.hypot(x, z) < 28.5 && distRio(x, z) > 3.4;
    plano.add(G.caja, P.cantero, M(0, 0.04, 0, 6, 0.06, 6), { ao: false });
    catedral(0, 1.8, 0);
    for (const r of anillos) { arco(0, 0, r, 1.4, P.calle, enCiudad); arco(0, 0, r, 0.35, P.cantero, enCiudad, plano, 0.09, 0.04); }
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + 0.2;
      recta(Math.cos(a) * 3.4, Math.sin(a) * 3.4, Math.cos(a) * 27.5, Math.sin(a) * 27.5, 1.0, P.calle, enCiudad, 0.06);
    }
    // colegios: [x, z, escala, giro] — de todos los anillos, públicos, de convenio y privados por igual
    const colegios = [[-6.8, -8.2, 0.4, 0.6], [11.5, -3.2, 0.38, -0.4], [2.5, 15.8, 0.4, 2.9], [-19.8, 6.8, 0.4, 1.9], [17.8, 16.2, 0.38, -2.3], [21.2, -17.2, 0.42, -0.8], [-9.5, -24, 0.42, 0.3]];
    const ocupado = colegios.map(([x, z, s]) => [x, z, 11.5 * s]);
    for (const [x, z, s, ry] of colegios) {
      casona(x, z, s, ry, { simple: true });
      // terreno del colegio marcado en esmeralda + bandera, para encontrarlo en el mapa
      plano.add(G.disco, P.esmeralda, M(x, 0.03, z, 21 * s, 0.03, 21 * s), { brillo: true });
      plano.add(G.disco, P.esmeraldaClaro, M(x, 0.02, z, 22.5 * s, 0.02, 22.5 * s), { brillo: true });
      solido.add(G.cil, P.blanco, M(x + 6.2 * s, 3.2, z + 6.2 * s, 0.14, 6.4, 0.14));
      brillo.add(G.caja, P.esmeralda, M(x + 6.2 * s + 0.8, 5.9, z + 6.2 * s, 1.5, 0.9, 0.06), { brillo: true });
      // cada colegio restaura un parche de bosque a su lado
      const ax = x + Math.cos(ry) * 4.6, az = z - Math.sin(ry) * 4.6;
      portal(x - Math.sin(ry) * 4.1, z - Math.cos(ry) * 4.1, ry, 0.55);
      for (let i = 0; i < 5; i++) plantin(ax + R(-1.4, 1.4), az + R(-1.4, 1.4), 0.9, true);
    }
    // puentes de visita entre portales: línea punteada esmeralda en el aire
    const pos = colegios.map(([x, z, s, ry]) => new THREE.Vector3(x - Math.sin(ry) * 4.1, 1.9, z - Math.cos(ry) * 4.1));
    for (const [a, b2] of [[0, 1], [0, 3], [1, 5], [2, 4], [2, 3], [0, 6], [1, 4]]) {
      const A = pos[a], B2 = pos[b2], medio = A.clone().add(B2).multiplyScalar(0.5); medio.y += A.distanceTo(B2) * 0.28;
      const curva = new THREE.QuadraticBezierCurve3(A, medio, B2);
      const n = Math.round(A.distanceTo(B2) / 0.9);
      for (let i = 1; i < n; i++) brillo.add(G.bolita, i % 2 ? P.esmeralda : P.esmeraldaClaro, M(...curva.getPoint(i / n).toArray(), 0.62, 0.62, 0.62), { brillo: true });
    }
    // ciudad
    for (let k = 0; k < anillos.length - 1; k++) {
      const r = (anillos[k] + anillos[k + 1]) / 2;
      for (let a = 0; a < Math.PI * 2; a += 1.9 / r) {
        const x = Math.cos(a) * r + R(-0.6, 0.6), z = Math.sin(a) * r + R(-0.6, 0.6);
        if (!enCiudad(x, z) || ocupado.some(([ox, oz, or]) => Math.hypot(x - ox, z - oz) < or + 1)) continue;
        let cerca = false;
        for (let i = 0; i < 8; i++) { const av = i * Math.PI / 4 + 0.2; if (Math.abs(Math.sin(a - av)) * r < 1.1 && Math.cos(a - av) > 0) cerca = true; }
        if (cerca || rnd() < 0.15) continue;
        if (k === 1 && rnd() < 0.35) edificio(x, z, -a, 1.5, 1.5, Math.floor(R(4, 9)));
        else if (rnd() < 0.15) arbolBosque(x, z, 0.6);
        else casita(x, z, -a + Math.PI / 2, R(1.3, 1.7), R(1.2, 1.5), R(1.0, 1.3), [P.pared, P.pared2, P.pared3, P.pared4][Math.floor(rnd() * 4)], false);
      }
    }
    // bosque alrededor de la ciudad (los colegios lo van haciendo crecer)
    for (let gx = -RM; gx <= RM; gx += 3.1) for (let gz = -RM; gz <= RM; gz += 3.1) {
      const x = gx + R(-1, 1), z = gz + R(-1, 1), d = Math.hypot(x, z);
      if (!dentro(x, z, 2) || d < 30 || distRio(x, z) < 4) continue;
      if (ocupado.some(([ox, oz, or]) => Math.hypot(x - ox, z - oz) < or + 2)) continue;
      // un sector todavía quemado, para restaurar
      if (x > 18 && z > 22) { if (rnd() < 0.35) tocon(x, z); else if (rnd() < 0.3) plantin(x, z, 1.1); continue; }
      const t = rnd();
      if (t < 0.13) tajibo(x, z, R(0.8, 1.1), P.tajiboAm);
      else if (t < 0.2) tajibo(x, z, R(0.8, 1.0), P.tajiboRo);
      else if (t < 0.26) toborochi(x, z, R(0.7, 1));
      else if (t < 0.42) motacu(x, z, R(0.75, 1));
      else arbolBosque(x, z, R(0.85, 1.2));
    }
    // un par de parabas sobre el bosque y una peta
    paraba(solido, M(-14, 9, -36, 1.8, 1.8, 1.8, 0.6), true);
    paraba(solido, M(-10, 9.6, -35, 1.8, 1.8, 1.8, 0.3), false);
    peta(30, -8, 2.2);
    return {
      general: { objetivo: [0, 0, 1], desde: [0, 78, 54] },
      lamina: { objetivo: [0, 0, 2.5], desde: [0, 74, 49] }
    };
  }

  // ============================================================ mallas
  const mBasic = () => new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
  const gSolido = solido.geometria();
  escena.add(new THREE.Mesh(gSolido, mBasic()));
  if (esB) escena.add(contorno(gSolido, 0.045));
  escena.add(new THREE.Mesh(plano.geometria(), mBasic()));
  if (brillo.p.length) escena.add(new THREE.Mesh(brillo.geometria(), mBasic()));
  // sombras falsas (un disco con degradé por objeto, todo en una malla)
  {
    const geo = new THREE.CircleGeometry(1, 16).rotateX(-Math.PI / 2);
    const pos = [], uv = [], colA = [];
    for (const [x, z, r, f] of sombras) {
      if (!r) continue;
      const g = geo.clone().applyMatrix4(M(x, 0.1 + rnd() * 0.01, z, r, 1, r)).toNonIndexed();
      pos.push(...g.attributes.position.array); uv.push(...g.attributes.uv.array);
      for (let i = 0; i < g.attributes.position.count; i++) colA.push(f, f, f);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colA, 3));
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    // el color por vértice se usa solo como "fuerza" de la sombra (no tiñe)
    const mat = new THREE.MeshBasicMaterial({ color: esB ? '#3a2410' : '#1d2a22', alphaMap: t, transparent: true, depthWrite: false, opacity: esB ? 0.5 : 0.75, vertexColors: true, fog: true });
    mat.onBeforeCompile = sh => {
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <color_fragment>', '')
        .replace('#include <alphamap_fragment>', 'diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g * vColor.r;');
    };
    const ms = new THREE.Mesh(g, mat); ms.renderOrder = 1;
    escena.add(ms);
  }
  // piezas por construir (fantasma esmeralda)
  if (fantasmas.length) {
    const g = new Lote();
    for (const m of fantasmas) g.add(G.caja, P.esmeralda, m, { brillo: true });
    const mf = new THREE.Mesh(g.geometria(), new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false }));
    escena.add(mf);
    animados.push(t => { mf.material.opacity = 0.22 + 0.14 * (0.5 + 0.5 * Math.sin(t * 2.4)); });
  }
  escena.add(acentos);
  if (esB) {
    // banderines con guarda en la entrada del colegio (patrón genérico de muestra)
    if (tipo !== 'mapa') {
      const gt = texturaGuarda(THREE, P); gt.repeat.set(3, 1);
      for (const sx of [-3.2, 3.2]) {
        const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.0), new THREE.MeshBasicMaterial({ map: gt, side: THREE.DoubleSide }));
        ban.scale.set(0.8, 0.55, 1); ban.position.set(sx, 1.95, 8.32); acentos.add(ban);
      }
    }
  }
  escena.add(etiquetas);

  if (esC) {
    // C: además de la paleta corta, el color final (con niebla) se reduce a pocos niveles
    escena.traverse(o => {
      if (!o.material || o.isSprite) return;
      const previo = o.material.onBeforeCompile;
      o.material.onBeforeCompile = (sh, r) => {
        if (previo) previo(sh, r);
        sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>',
          '#include <dithering_fragment>\n  gl_FragColor.rgb = floor(gl_FragColor.rgb * 6.0 + 0.5) / 6.0;');
      };
    });
  }
  const fondo = new THREE.Color(P.cielo);
  escena.background = fondo;
  escena.fog = new THREE.Fog(P.niebla, 40, 120);

  return {
    escena, vistas, etiquetas, estilo: E, paleta: P,
    // en C la imagen se dibuja a baja resolución y se amplía sin suavizar
    escalaResolucion: esC ? 0.45 : 1,
    animar(t, camara) {
      for (const f of animados) f(t);
      if (camara) for (const e of etiquetas.children) e.visible = e.position.distanceTo(camara.position) < e.userData.maxDist;
    },
    ajustarNiebla(dist) { escena.fog.near = dist * 0.85; escena.fog.far = dist * 2.6 + 20; }
  };
}

// Superficie del portal: degradé esmeralda con la silueta de otro colegio y su bosque.
function texturaPortal(THREE, P, esB) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  gr.addColorStop(0, '#E8FFF6'); gr.addColorStop(0.45, '#7DE3BE'); gr.addColorStop(0.85, '#10B981'); gr.addColorStop(1, 'rgba(16,185,129,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  // silueta: casona con techo y dos árboles (otro colegio, del otro lado)
  g.fillStyle = 'rgba(6,78,59,.55)';
  g.beginPath(); g.moveTo(70, 160); g.lineTo(128, 128); g.lineTo(186, 160); g.closePath(); g.fill();
  g.fillRect(80, 160, 96, 36);
  g.beginPath(); g.arc(52, 150, 22, 0, 7); g.fill(); g.fillRect(49, 160, 6, 36);
  g.beginPath(); g.arc(206, 146, 18, 0, 7); g.fill(); g.fillRect(203, 156, 6, 40);
  g.fillStyle = 'rgba(242,194,48,.75)';
  g.beginPath(); g.arc(206, 140, 9, 0, 7); g.fill();
  // remolino suave
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = esB ? 6 : 4;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(128, 128, 40 + i * 26, i, i + 2.4); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
  return t;
}

// Guarda geométrica GENÉRICA (zigzag + rombos) de muestra para el estilo B.
// No copia ningún diseño indígena real: el patrón final se co-diseña y acredita con
// Artecampo / las comunidades.
function texturaGuarda(THREE, P) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = P.pared; g.fillRect(0, 0, 128, 64);
  g.fillStyle = P.teja; g.fillRect(0, 0, 128, 10); g.fillRect(0, 54, 128, 10);
  g.fillStyle = P.tinta;
  g.beginPath();
  for (let i = 0; i <= 4; i++) { g.lineTo(i * 32, 16); g.lineTo(i * 32 + 16, 26); }
  g.lineTo(128, 16); g.lineTo(128, 20); g.lineTo(0, 20); g.fill();
  g.fillStyle = P.tierra;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(i * 32 + 16, 28); g.lineTo(i * 32 + 26, 38); g.lineTo(i * 32 + 16, 48); g.lineTo(i * 32 + 6, 38); g.fill(); }
  g.fillStyle = '#10B981';
  for (let i = 0; i < 4; i++) g.fillRect(i * 32 + 14, 36, 4, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
  return t;
}
