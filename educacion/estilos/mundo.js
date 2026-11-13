// ÑANDÉ · EDU.01c — Propuestas de estilo visual.
// La MISMA escena (colegio cruceño, terreno vacío de la ciudad con un hito y una obra pública
// en construcción, portal, ciudad por anillos, los profes y alumnos) dibujada en varios estilos.
//
// Escalera por tramo de grados (el mundo "evoluciona" al pasar de curso):
//   BLOQUES    1.º a 3.º de primaria — cúbico, simple y colorido.
//   PIEZAS     4.º a 6.º de primaria — piezas redondeadas y encastrables (base: A).
//   REAL       secundaria — "Mundo real": estilizado maduro, dos-tres tonos + contorno fino (base: B).
// Exploración inicial:
//   A "Maqueta Viva"  — low poly facetado, diorama, luz de tarde horneada.
//   B "Tierra Pintada" — dos tonos + contorno de tinta, paleta más saturada.
//   C "Pixel Camba"   — la geometría de A a ~45% de resolución y 32 colores (modo liviano).
//
// Pensado para tablet de gama baja: TODO es MeshBasicMaterial con colores por vértice
// (la luz y la oclusión se calculan una sola vez al armar la escena), sin sombras en
// tiempo real (sombras falsas bajo los objetos), pocas llamadas de dibujo (la escena
// entera se fusiona en unas pocas mallas) y niebla.
//
// Uso:  const mundo = crearMundo(THREE, 'PIEZAS')        // escena completa
//       const mapa  = crearMundo(THREE, 'A', 'mapa')     // lámina E: Santa Cruz por anillos

// Escalera de la presentación: 6 escalones (la visión final son 12 evoluciones, una por año).
export const TRAMOS = {
  BLOQUES: {
    letra: '1', nombre: 'Bloques', grados: '1.º y 2.º de primaria', color: '#F2C230', evolucion: 1,
    corto: 'Cúbico, simple y colorido: todo se arma con bloques.', costo: 'bajo', equipo: 'cualquier tablet'
  },
  PIEZAS: {
    letra: '2', nombre: 'Piezas', grados: '3.º y 4.º de primaria', color: '#10B981', evolucion: 2,
    corto: 'Piezas redondeadas que encastran, como un juguete de construcción propio.', costo: 'bajo', equipo: 'tablet de gama baja'
  },
  REAL: {
    letra: '3', nombre: 'Mundo real', grados: '5.º y 6.º de primaria', color: '#5FB7C9', evolucion: 3,
    corto: 'La línea de B: tres tonos, contorno fino, proporciones reales.', costo: 'medio', equipo: 'tablet de gama baja/media'
  },
  HORIZONTE: {
    letra: '4', nombre: 'Horizonte', grados: '1.º y 2.º de secundaria', color: '#A78BFA', evolucion: 4,
    corto: 'Luz en tiempo real (dibujo en tonos), personajes animados, más detalle.', costo: 'medio', equipo: 'tablet media'
  },
  VIVO: {
    letra: '5', nombre: 'Mundo vivo', grados: '3.º a 5.º de secundaria', color: '#F472B6', evolucion: 5,
    corto: 'Sombras reales, viento en los árboles, agua que se mueve, nubes.', costo: 'medio-alto', equipo: 'tablet/celular medio-alto'
  },
  PROMO: {
    letra: '6', nombre: 'Promo', grados: 'Promoción (6.º de secundaria)', color: '#F59E0B', evolucion: 6,
    corto: 'El tope: materiales de juego comercial, luz de cielo, brillo, pétalos y luciérnagas.', costo: 'alto', equipo: 'celular/tablet buena (con GPU)'
  }
};

export const ESTILOS = {
  ...TRAMOS,
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
    // fuera de la vitrina por decisión del dueño (se ve mal); el código queda
    oculto: true,
    letra: 'C', nombre: 'Pixel Camba', color: '#5FB7C9',
    corto: 'La maqueta dibujada con pocos píxeles y 32 colores (modo liviano).',
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

// Tramo 1 "Bloques": colores vivos y simples, cielo claro
const PAL_BLOQUES = {
  ...PAL_A,
  cielo: '#BFE3FA', niebla: '#CBE9FB',
  pasto: '#7CCB5B', pasto2: '#63B24A', tierra: '#C98F55', arena: '#F4DCA6',
  baseLado: '#9A6B43', baseLado2: '#6E4A2E',
  pared: '#FFF3D6', pared2: '#FFE2A8', pared3: '#FFE9C2', pared4: '#F7D9C4', zocalo: '#2F9BD6',
  teja: '#E8573A', teja2: '#C9432A', palma: '#E7B54A', horcon: '#8A5A35', madera: '#B5773E', maderaOsc: '#6B4426',
  piso: '#E08A5E', patio: '#F0CF8E', techoVerde: '#4CC06A',
  bosque: '#2E9E55', bosque2: '#3DB563', bosque3: '#55C46F', bosque4: '#7BD67F',
  tajiboAm: '#FFD23F', tajiboRo: '#FF8CC6', toboTronco: '#A7C46E', toboFlor: '#FF9FCF', motacu: '#4DB548',
  rio: '#4CC3E8', rioOsc: '#2A9FCB', calle: '#8C8C96', cantero: '#7CCB5B', ladrillo: '#D1603F'
};
// Tramo 2 "Piezas": plástico de juguete limpio, colores saturados y claros
const PAL_PIEZAS = {
  ...PAL_A,
  cielo: '#D3ECF5', niebla: '#DCEFF5',
  pasto: '#71C268', pasto2: '#5DAF57', tierra: '#D29A62', arena: '#F2DDAF',
  baseLado: '#3E9C6B', baseLado2: '#2B7A52',
  pared: '#FFF8EC', pared2: '#FCE7C2', pared3: '#FDEFD6', pared4: '#F6DED0', zocalo: '#10B981',
  teja: '#E4572E', teja2: '#C2441F', palma: '#F0B847', horcon: '#B06F38', madera: '#C98B4B', maderaOsc: '#7A4A26',
  piso: '#F08C5A', patio: '#F4D79B', techoVerde: '#4FC17A',
  bosque: '#2F9A5E', bosque2: '#3FB26C', bosque3: '#5BC47C', bosque4: '#86D88E',
  tajiboAm: '#FFC93C', tajiboRo: '#FF87BE', toboTronco: '#9CC27A', toboFlor: '#FF9CC9', motacu: '#46B058',
  rio: '#48BEDF', rioOsc: '#2D9CC0', calle: '#7E8794', cantero: '#71C268'
};
// Escalones 3–6: la línea de B (el estilo que eligió el dueño), cada vez más rica
const PAL_REAL = { ...PAL_B, cielo: '#EFE3C8', niebla: '#EADCC0', tinta: '#1C1712' };
const PAL_EVO = {
  ...PAL_B,
  cielo: '#9FCBE8', niebla: '#BFD8E2', cieloArriba: '#4D8FD1', suelo: '#6F8F4A',
  pasto: '#78A856', pasto2: '#64954A', tierra: '#C9954A', arena: '#F0D7A1', cantero: '#78A856',
  pared: '#F4EAD6', pared2: '#EBD5AE', pared3: '#F2E0C0', zocalo: '#B8492F', tinta: '#1C1712',
  ropaPromo: '#0E7A55'
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
  const P = { B: PAL_B, BLOQUES: PAL_BLOQUES, PIEZAS: PAL_PIEZAS, REAL: PAL_REAL, HORIZONTE: PAL_EVO, VIVO: PAL_EVO, PROMO: PAL_EVO }[E] || PAL_A;
  // evoluciones 4–6: luz calculada en tiempo real (4), + sombras, viento y agua (5), + PBR, brillo y partículas (6)
  const nivel = { HORIZONTE: 4, VIVO: 5, PROMO: 6 }[E] || 0;
  const luzReal = nivel >= 4;
  const esC = E === 'C';
  const voxel = E === 'BLOQUES', redondo = E === 'PIEZAS', real = E === 'REAL';
  const esB = E === 'B' || real || nivel === 4 || nivel === 5; // familia "dibujo con contorno"
  const patrones = E === 'B';              // guardas genéricas (solo B)
  const grosorContorno = { 4: 0.026, 5: 0.02 }[nivel] || (real ? 0.03 : 0.045);
  // proporción en "cabezas" según edad del personaje
  const CABEZAS = {
    A: { nino: 3.4, teen: 4.2, adulto: 4.5 }, C: { nino: 3.4, teen: 4.2, adulto: 4.5 },
    B: { nino: 4.6, teen: 5.8, adulto: 6.3 },
    BLOQUES: { nino: 2.7, teen: 3.1, adulto: 3.3 },
    PIEZAS: { nino: 3.5, teen: 4.0, adulto: 4.4 },
    REAL: { nino: 5.0, teen: 6.4, adulto: 6.8 },
    HORIZONTE: { nino: 5.3, teen: 6.8, adulto: 7.1 },
    VIVO: { nino: 5.5, teen: 7.0, adulto: 7.4 },
    PROMO: { nino: 5.7, teen: 7.3, adulto: 7.6 }
  }[E] || { nino: 3.4, teen: 4.2, adulto: 4.5 };
  const rnd = azar(tipo === 'mapa' ? 77 : 2026);
  const R = (a, b) => a + (b - a) * rnd();

  // --- colores ya convertidos (espacio lineal de three)
  const cache = {};
  const col = c => cache[c] || (cache[c] = new THREE.Color(c));
  const paletaC = PALETA_C.map(h => new THREE.Color(h));
  const L = new THREE.Vector3(-0.55, 0.78, 0.32).normalize(); // sol de tarde, desde el oeste
  const tmpN = new THREE.Vector3(), tmpC = new THREE.Color();
  const MEDIO = L.clone().add(new THREE.Vector3(0.35, 0.6, 0.72).normalize()).normalize(); // luz + vista típica

  // Luz horneada por cara. y01 = altura relativa dentro de la pieza (oclusión falsa).
  function hornear(base, n, y01, op, salida) {
    salida.copy(base);
    if (op.brillo) return nivel === 6 ? salida.multiplyScalar(2.0) : salida; // en la 6, lo que brilla es "HDR" (bloom)
    if (luzReal) return salida.multiplyScalar(op.ao === false ? 1 : 0.74 + 0.26 * y01);
    if (voxel) {
      // caras de cubo: arriba clara, laterales en dos tonos, abajo oscura
      const k = n.y > 0.6 ? 1.0 : n.y < -0.6 ? 0.55 : (n.x * L.x + n.z * L.z > 0 ? 0.86 : 0.7);
      const ao = op.ao === false ? 1 : 0.84 + 0.16 * y01;
      return salida.multiplyScalar(k * ao);
    }
    if (redondo) {
      // plástico: sombreado suave + brillo especular horneado
      const d = Math.max(0, n.dot(L));
      const k = 0.6 + 0.44 * d + 0.08 * Math.max(0, n.y);
      const ao = op.ao === false ? 1 : 0.8 + 0.2 * y01;
      const sp = 0.3 * Math.pow(Math.max(0, n.dot(MEDIO)), 30);
      salida.multiplyScalar(k * ao);
      salida.r += sp; salida.g += sp; salida.b += sp;
      return salida;
    }
    if (real) {
      // tres tonos, sombra fría
      const d = n.dot(L);
      const k = d > 0.45 || n.y > 0.85 ? 1.0 : d > 0.02 ? 0.84 : 0.68;
      if (k < 1) { salida.r *= 0.96; salida.b *= 1.04; }
      const ao = op.ao === false ? 1 : 0.86 + 0.14 * y01;
      return salida.multiplyScalar(k * ao);
    }
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
    constructor() { this.p = []; this.c = []; this.n = []; }
    add(geo, color, m, op = {}) {
      if (geo === G.caja && G.cajaRedonda && m.getMaxScaleOnAxis() < (redondo ? 3.2 : 1.2)) geo = G.cajaRedonda;
      const g = geo.index ? geo.toNonIndexed() : geo.clone();
      g.applyMatrix4(m);
      if (!((redondo || luzReal) && g.attributes.normal && geo.userData.suave)) g.computeVertexNormals();
      const pos = g.attributes.position.array, nor = g.attributes.normal.array;
      let y0 = Infinity, y1 = -Infinity;
      for (let i = 1; i < pos.length; i += 3) { y0 = Math.min(y0, pos[i]); y1 = Math.max(y1, pos[i]); }
      const base = col(color).clone();
      if (!esB && !voxel && !op.brillo && op.variar !== false) base.multiplyScalar(0.95 + rnd() * 0.1);
      for (let i = 0; i < pos.length; i += 3) {
        tmpN.set(nor[i], nor[i + 1], nor[i + 2]);
        const y01 = y1 - y0 < 1e-4 ? 1 : (pos[i + 1] - y0) / (y1 - y0);
        hornear(base, tmpN, y01, op, tmpC);
        this.p.push(pos[i], pos[i + 1], pos[i + 2]);
        this.c.push(tmpC.r, tmpC.g, tmpC.b);
        if (luzReal) this.n.push(nor[i], nor[i + 1], nor[i + 2]);
      }
      g.dispose();
    }
    geometria() {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
      if (this.n.length) g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
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

  // --- geometrías base (facetadas en A y C; redondas en B, PIEZAS y REAL; cubos en BLOQUES)
  const seg = nivel >= 5 ? 16 : nivel === 4 ? 12 : redondo ? 12 : esB ? 10 : 7;
  const suave = g => { g.userData.suave = true; return g; };
  const G = {
    caja: new THREE.BoxGeometry(1, 1, 1),
    cil: suave(new THREE.CylinderGeometry(0.5, 0.5, 1, seg)),
    cil4: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
    cono: suave(new THREE.ConeGeometry(0.5, 1, seg)),
    piramide: new THREE.ConeGeometry(0.7071, 1, 4).rotateY(Math.PI / 4),
    bola: luzReal ? suave(new THREE.SphereGeometry(0.5, nivel >= 5 ? 18 : 14, nivel >= 5 ? 12 : 10)) : redondo ? suave(new THREE.SphereGeometry(0.5, 12, 8)) : esB ? new THREE.SphereGeometry(0.5, 10, 7) : new THREE.IcosahedronGeometry(0.5, 1),
    bolita: luzReal ? suave(new THREE.SphereGeometry(0.5, 10, 8)) : redondo ? suave(new THREE.SphereGeometry(0.5, 8, 6)) : esB ? new THREE.SphereGeometry(0.5, 7, 5) : new THREE.IcosahedronGeometry(0.5, 0),
    disco: suave(new THREE.CylinderGeometry(0.5, 0.5, 1, redondo ? 32 : esB ? 28 : 20)),
    prisma: prisma(),
    toborochi: suave(new THREE.LatheGeometry([
      [0.30, 0], [0.42, 0.08], [0.52, 0.28], [0.54, 0.45], [0.46, 0.62], [0.30, 0.78], [0.2, 0.9], [0.18, 1]
    ].map(([x, y]) => new THREE.Vector2(x, y)), seg))
  };
  if (redondo) G.cajaRedonda = cajaRedonda(0.14);
  if (nivel >= 5) G.cajaRedonda = cajaRedonda(0.08);
  // cuerpos redondeados para los personajes de 4–6 (alto total 2 con escala 1)
  G.capsula = luzReal ? suave(new THREE.CapsuleGeometry(0.5, 1, 6, nivel >= 5 ? 14 : 10)) : G.caja;
  // torso con forma (hombros, cintura, cadera) para 4–6; alto 1 centrado
  G.torso = luzReal ? suave(new THREE.LatheGeometry([[0, 0], [0.42, 0], [0.47, 0.12], [0.42, 0.42], [0.47, 0.74], [0.5, 0.88], [0.36, 1], [0, 1]]
    .map(([x, y]) => new THREE.Vector2(x, y)), nivel >= 5 ? 18 : 12).translate(0, -0.5, 0)) : G.caja;
  if (voxel) {
    // todo se arma con cubos: bolas, cilindros y conos se vuelven bloques o escalones
    G.cil = G.caja; G.bola = G.caja; G.bolita = G.caja; G.disco = new THREE.CylinderGeometry(0.5, 0.5, 1, 8).rotateY(Math.PI / 8);
    G.cono = escalones([[1, 0.34], [0.66, 0.33], [0.33, 0.33]]);
    G.piramide = G.cono;
    G.prisma = escalonesZ([[1, 0.34], [0.64, 0.33], [0.28, 0.33]]);
    G.toborochi = escalones([[0.62, 0.2], [1.0, 0.45], [0.6, 0.2], [0.36, 0.15]]);
  }
  // pila de cajas centradas (ancho relativo, alto relativo), de abajo hacia arriba
  function escalones(capas) {
    const partes = []; let y = 0;
    for (const [w, h] of capas) { partes.push(new THREE.BoxGeometry(w, h, w).translate(0, y + h / 2, 0)); y += h; }
    return unir(partes);
  }
  function escalonesZ(capas) { // igual pero solo se angosta en x (techo a dos aguas en bloques)
    const partes = []; let y = 0;
    for (const [w, h] of capas) { partes.push(new THREE.BoxGeometry(w, h, 1).translate(0, y + h / 2, 0)); y += h; }
    return unir(partes);
  }
  function unir(partes) {
    const pos = [];
    for (const p of partes) pos.push(...p.toNonIndexed().attributes.position.array);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }
  // caja de cantos redondeados (1×1×1), para el estilo PIEZAS
  function cajaRedonda(r) {
    const a = 0.5 - r, f = new THREE.Shape();
    f.moveTo(-a, -a); f.lineTo(a, -a); f.lineTo(a, a); f.lineTo(-a, a); f.lineTo(-a, -a);
    const g = new THREE.ExtrudeGeometry(f, { depth: 1 - 2 * r, bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 2, curveSegments: 1 });
    g.translate(0, 0, -(1 - 2 * r) / 2);
    g.deleteAttribute('uv');
    return g;
  }
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
    if (voxel) {
      const partes = [], n = 3;
      for (let i = 0; i < n; i++) {
        const k = 1 - i / n;
        partes.push(new THREE.BoxGeometry(w * k, h / n, Math.max(l - w * (1 - k), l * 0.2)).translate(0, (i + 0.5) * h / n, 0));
      }
      return unir(partes);
    }
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
  if (tipo === 'kit') return { P, G, Lote, M, conBase, techoHip, contorno, rnd, esB, esC, voxel, redondo, real, grosorContorno };

  const solido = new Lote();   // con contorno en B
  const plano = new Lote();    // suelo, calles, agua: sin contorno
  const brillo = new Lote();   // esmeralda que "brilla" (conocimiento): sin luz
  const follaje = nivel >= 5 ? new Lote() : null; // copas que se mueven con el viento
  const agua = nivel >= 5 ? new Lote() : null;    // río animado
  const copa = follaje || solido;
  const personajes = [];       // en 4–6: personajes por partes, animados
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
    b(copa, G.bola, c, 0, 2.4, 0, 2.2, 1.9, 2.2);
    b(copa, G.bola, c, R(-0.6, 0.6), 3.1, R(-0.5, 0.5), 1.5, 1.4, 1.5);
    sombra(x, z, 1.4 * s);
  }
  function tajibo(x, z, s = 1, color = P.tajiboAm) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.cil, P.tronco, 0, 1.5, 0, 0.3, 3, 0.3);
    b(solido, G.cil, P.tronco, 0.45, 3.0, 0, 0.16, 1.4, 0.16, 0, 0, -0.6);
    b(solido, G.cil, P.tronco, -0.4, 3.1, 0.2, 0.16, 1.4, 0.16, 0, 0.3, 0.6);
    b(copa, G.bola, color, 0, 3.7, 0, 2.6, 1.6, 2.6);
    b(copa, G.bola, color, 0.9, 3.4, 0.3, 1.5, 1.1, 1.5);
    b(copa, G.bola, color, -0.8, 3.5, -0.4, 1.6, 1.1, 1.6);
    b(copa, G.bolita, P.bosque3, 0.2, 3.1, 0.9, 0.8, 0.5, 0.8);
    sombra(x, z, 1.6 * s);
  }
  function toborochi(x, z, s = 1) {
    const b = conBase(M(x, 0, z, s, s, s, R(0, 6)));
    b(solido, G.toborochi, P.toboTronco, 0, 0, 0, 2.2, 3.2, 2.2);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + 0.4;
      b(solido, G.cil, P.toboTronco, Math.cos(a) * 0.5, 3.6, Math.sin(a) * 0.5, 0.14, 1.4, 0.14, -a, 0, 0.7);
      b(copa, G.bola, i % 2 ? P.toboFlor : P.bosque3, Math.cos(a) * 1.1, 4.3, Math.sin(a) * 1.1, 1.3, 0.8, 1.3);
    }
    b(copa, G.bola, P.toboFlor, 0, 4.5, 0, 1.4, 0.8, 1.4);
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
      b(copa, G.caja, P.motacu, Math.cos(a) * 1.0, 3.0, Math.sin(a) * 1.0, 0.5, 0.08, 2.6, -a + Math.PI / 2, -0.75, 0);
      b(copa, G.caja, P.motacu, Math.cos(a) * 2.1, 3.3, Math.sin(a) * 2.1, 0.45, 0.06, 1.2, -a + Math.PI / 2, 0.5, 0);
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
    const cab = CABEZAS[o.edad] || 4;
    const H = o.altura, h = H / cab;
    // en 4–6 cada parte es su propia malla para poder animarla (piernas, brazos, cuerpo)
    const anim = luzReal && tipo !== 'mapa';
    const b = conBase(anim ? new THREE.Matrix4() : M(x, 0, z, 1, 1, 1, ry));
    const Lc = anim ? new Lote() : solido, Lf = anim ? Lc : plano, Lb = anim ? new Lote() : brillo;
    const Lp = anim ? [new Lote(), new Lote()] : [solido, solido], La = anim ? [new Lote(), new Lote()] : [solido, solido];
    const pierna = (H - h) * 0.46, torso = (H - h) * 0.54;
    const ancho = Math.max(h * 0.95, H * 0.2);
    for (const s of [-1, 1]) {
      const L = Lp[s > 0 ? 1 : 0];
      b(L, luzReal ? G.capsula : G.caja, o.pantalon, s * ancho * 0.22, pierna / 2 + (luzReal ? 0.04 : 0), 0, ancho * 0.36, luzReal ? pierna * 0.55 : pierna, ancho * 0.4);
      b(L, G.caja, P.oscuro, s * ancho * 0.22, 0.05, 0.03, ancho * 0.38, 0.1, ancho * 0.52);
    }
    if (o.guardapolvo) b(Lc, G.torso, P.blanco, 0, pierna + torso / 2 - pierna * 0.3, 0, ancho * 1.04, torso + pierna * 0.6, ancho * 0.62);
    else b(Lc, G.torso, o.ropa, 0, pierna + torso / 2, 0, ancho, torso, ancho * 0.58);
    if (luzReal) b(Lc, G.cil, o.piel, 0, pierna + torso + h * 0.05, 0, h * 0.34, h * 0.3, h * 0.34); // cuello
    for (const s of [-1, 1]) {
      const L = La[s > 0 ? 1 : 0];
      b(L, luzReal ? G.capsula : G.caja, o.guardapolvo ? P.blanco : o.ropa, s * ancho * 0.62, pierna + torso * 0.6, 0, ancho * 0.24, luzReal ? torso * 0.46 : torso * 0.8, ancho * 0.28, 0, 0, s * 0.12);
      b(L, G.bolita, o.piel, s * ancho * 0.68, pierna + torso * 0.2, 0, ancho * 0.22, ancho * 0.22, ancho * 0.22);
    }
    if (o.chaleco) b(Lc, G.torso, o.chaleco, 0, pierna + torso * 0.6, 0, ancho * 1.06, torso * 0.7, ancho * 0.64);
    const cy = pierna + torso + h * 0.5;
    b(Lc, G.bola, o.piel, 0, cy, 0, h * 0.92, h, h * 0.9);
    // pelo
    b(Lc, G.bola, o.pelo, 0, cy + h * 0.14, -h * 0.06, h * 0.98, h * 0.8, h * 0.95);
    if (o.mono) b(Lc, G.bola, o.pelo, 0, cy + h * 0.32, -h * 0.42, h * 0.42, h * 0.42, h * 0.42);
    if (o.flor) b(Lb, G.bolita, P.tajiboAm, h * 0.36, cy + h * 0.36, -h * 0.2, h * 0.22, h * 0.22, h * 0.22, 0, 0, 0, { brillo: true });
    if (o.colita) b(Lc, G.bola, o.pelo, 0, cy - h * 0.05, -h * 0.5, h * 0.3, h * 0.5, h * 0.3);
    // cara: ojos y boca (calcomanía simple)
    for (const s of [-1, 1]) b(Lf, G.caja, P.tinta, s * h * 0.2, cy + h * 0.02, h * 0.44, h * 0.11, h * (o.ojos || 0.16), 0.02, 0, 0, 0, { ao: false });
    b(Lf, G.caja, P.oscuro, 0, cy - h * 0.2, h * 0.44, h * 0.22, h * 0.05, 0.02, 0, 0, 0, { ao: false });
    if (o.anteojos) {
      for (const s of [-1, 1]) { b(Lf, G.caja, P.oscuro, s * h * 0.2, cy + h * 0.02, h * 0.455, h * 0.32, h * 0.26, 0.012, 0, 0, 0, { ao: false }); b(Lf, G.caja, P.vidrio, s * h * 0.2, cy + h * 0.02, h * 0.47, h * 0.24, h * 0.18, 0.012, 0, 0, 0, { ao: false, brillo: true }); b(Lf, G.caja, P.tinta, s * h * 0.2, cy + h * 0.02, h * 0.48, h * 0.1, h * 0.14, 0.012, 0, 0, 0, { ao: false }); }
      b(Lf, G.caja, P.oscuro, 0, cy + h * 0.06, h * 0.46, h * 0.16, h * 0.04, 0.015, 0, 0, 0, { ao: false });
    }
    if (nivel >= 5) {
      // más detalle de cara: nariz, cejas y orejas
      b(Lc, G.bolita, o.piel, 0, cy - h * 0.06, h * 0.46, h * 0.14, h * 0.16, h * 0.14);
      for (const s of [-1, 1]) {
        b(Lf, G.caja, o.pelo, s * h * 0.2, cy + h * 0.16, h * 0.44, h * 0.2, h * 0.04, 0.02, 0, 0, s * -0.12, { ao: false });
        b(Lc, G.bolita, o.piel, s * h * 0.47, cy, 0, h * 0.12, h * 0.22, h * 0.14);
      }
    }
    if (o.mochila) b(Lc, G.caja, o.mochila, 0, pierna + torso * 0.55, -ancho * 0.45, ancho * 0.75, torso * 0.75, ancho * 0.35);
    if (o.auriculares) {
      b(Lc, G.caja, P.oscuro, 0, cy - h * 0.5, 0, h * 1.0, h * 0.1, h * 0.7);
      for (const s of [-1, 1]) b(Lc, G.cil, P.esmeralda, s * h * 0.45, cy - h * 0.48, 0.05, h * 0.3, h * 0.12, h * 0.3, 0, 0, Math.PI / 2);
    }
    if (o.ia) {
      // aro esmeralda flotando: marca que es un profe IA (los dos iguales)
      const aro = new THREE.TorusGeometry(h * 0.55, h * 0.06, 4, 18);
      b(Lb, aro, P.esmeralda, 0, H + h * 0.32, 0, 1, 1, 1, 0, Math.PI / 2, 0, { brillo: true });
    }
    sombra(x, z, ancho * 1.1, 0.4);
    if (anim) {
      // armar el muñeco: grupo en (x, z) con piernas y brazos que giran en cadera y hombro
      const grupo = new THREE.Group(); grupo.position.set(x, 0, z); grupo.rotation.y = ry;
      const malla = (L, px, py) => {
        const g = L.geometria(); g.translate(-px, -py, 0);
        const m = new THREE.Mesh(g, materialPersonaje()); m.position.set(px, py, 0);
        m.castShadow = true; grupo.add(m); return m;
      };
      const cuerpo = malla(Lc, 0, 0);
      const piernas = [-1, 1].map((s, i) => malla(Lp[i], s * ancho * 0.22, pierna));
      const brazos = [-1, 1].map((s, i) => malla(La[i], s * ancho * 0.62, pierna + torso * 0.98));
      if (Lb.p.length) { const mb = new THREE.Mesh(Lb.geometria(), materialBrillo()); grupo.add(mb); }
      escena.add(grupo);
      personajes.push({ grupo, cuerpo, piernas, brazos, o, x, z, ry, fase: rnd() * 6 });
    }
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
    if (redondo) {
      // PIEZAS: las paredes se ven armadas con piezas que encastran (ranuras horizontales)
      for (const yy of [0.85, 1.7]) {
        b(solido, G.caja, P.pared2, 0, yy, -E - 0.03, 2 * E + 0.06, 0.07, 0.05, 0, 0, 0, { ao: false });
        b(solido, G.caja, P.pared2, -E - 0.03, yy, 0, 0.05, 0.07, 2 * E + 0.06, 0, 0, 0, { ao: false });
        b(solido, G.caja, P.pared2, E + 0.03, yy, 0, 0.05, 0.07, 2 * E + 0.06, 0, 0, 0, { ao: false });
        b(solido, G.caja, P.pared2, 0, yy, E + 0.03, 2 * E + 0.06, 0.07, 0.05, 0, 0, 0, { ao: false });
      }
    }
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
    if (patrones) {
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
    const tex = texturaPortal(THREE, P, patrones);
    const disco = new THREE.Mesh(new THREE.CircleGeometry(patrones ? 1.55 : 1.3, voxel ? 8 : patrones ? 40 : 24),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide }));
    disco.applyMatrix4(base.clone().multiply(M(0, patrones ? 1.9 : 1.75, 0, 1, patrones ? 1 : 1.25, 1)));
    escena.add(disco);
    animados.push(t => { tex.offset.x = (t * 0.03) % 1; disco.material.opacity = 0.82 + 0.13 * Math.sin(t * 2); });
    if (patrones) {
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
  function recta(x0, z0, x1, z1, ancho, color, filtro, y = 0.05, lote = plano) {
    const L2 = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L2 / 1.5));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      if (filtro && !filtro(x, z)) continue;
      lote.add(G.caja, color, M(x, y, z, ancho, 0.06, L2 / n + 0.05, Math.atan2(x1 - x0, z1 - z0)), { ao: false });
    }
  }

  function etiqueta(texto, pos, color = '#10B981', maxDist = Infinity, radioObjetivo = Infinity) {
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
    sp.userData.maxDist = maxDist; sp.userData.radioObjetivo = radioObjetivo;
    etiquetas.add(sp);
    return sp;
  }

  // ============================================================ armar
  const RB = 44; // radio del tablero

  function tablero(radio, pastoColor) {
    plano.add(G.disco, pastoColor, M(0, -0.15, 0, radio * 2, 0.3, radio * 2), { ao: false, variar: false });
    if (redondo) {
      // PIEZAS: el suelo es una base de placas que encastran (juntas suaves, sin pernos)
      for (let k = -radio + 4; k < radio; k += 4) {
        const c = Math.sqrt(Math.max(0, radio * radio - k * k)) * 2 - 0.6;
        plano.add(G.caja, P.pasto2, M(k, 0.012, 0, 0.1, 0.02, c), { ao: false, variar: false });
        plano.add(G.caja, P.pasto2, M(0, 0.012, k, c, 0.02, 0.1), { ao: false, variar: false });
      }
    }
    solido.add(G.disco, P.baseLado, M(0, -1.8, 0, radio * 2 + 0.3, 3.0, radio * 2 + 0.3), { variar: false });
    plano.add(G.disco, P.baseLado2, M(0, -3.4, 0, radio * 2 + 1.6, 0.4, radio * 2 + 1.6), { variar: false });
  }

  // --- hitos y obras públicas (la ciudad la construyen los colegios)
  function cristo(x, z, s = 1) {
    // monumento con brazos abiertos sobre una rotonda (forma genérica)
    const b = conBase(M(x, 0, z, s, s, s, 0.3));
    plano.add(G.disco, P.calle, M(x, 0.03, z, 8 * s, 0.05, 8 * s), { ao: false });
    plano.add(G.disco, P.cantero, M(x, 0.06, z, 6 * s, 0.05, 6 * s), { ao: false });
    b(solido, G.cil, P.piedra, 0, 0.5, 0, 2.6, 1.0, 2.6);
    b(solido, G.caja, P.piedra, 0, 2.6, 0, 1.4, 3.4, 1.4);
    b(solido, G.caja, P.blanco, 0, 4.5, 0, 1.6, 0.4, 1.6);
    b(solido, G.cono, P.blanco, 0, 4.7, 0, 1.4, 2.6, 1.0);
    b(solido, G.caja, P.blanco, 0, 6.85, 0, 0.62, 1.5, 0.5);
    b(solido, G.caja, P.blanco, 0, 7.25, 0, 3.6, 0.36, 0.36);
    b(solido, G.bolita, P.blanco, 0, 8.0, 0, 0.6, 0.7, 0.6);
    sombra(x, z, 2.2 * s, 0.35);
  }
  function grua(x, z, ry) {
    const b = conBase(M(x, 0, z, 1, 1, 1, ry));
    b(solido, G.caja, P.piedra, 0, 0.3, 0, 1.6, 0.6, 1.6);
    for (let i = 0; i < 7; i++) b(solido, G.caja, P.amarillo, 0, 0.9 + i * 1.2, 0, 0.55, 1.1, 0.55);
    b(solido, G.caja, P.amarillo, 2.4, 9.2, 0, 7.5, 0.4, 0.45);
    b(solido, G.caja, P.oscuro, -1.8, 9.0, 0, 1.2, 0.9, 0.9);
    b(solido, G.caja, P.gris, 4.6, 7.2, 0, 0.04, 3.6, 0.04, 0, 0, 0, { ao: false });
    b(brillo, G.caja, P.esmeralda, 4.6, 5.2, 0, 0.9, 0.5, 0.9, 0, 0, 0, { brillo: true }); // carga: material de conocimiento
    sombra(x, z, 1.4, 0.3);
  }
  function cartel(x, z, ry, lineas, progreso) {
    const base = M(x, 0, z, 1, 1, 1, ry);
    const b = conBase(base);
    for (const sx of [-1.7, 1.7]) b(solido, G.cil, P.madera, sx, 1.1, 0, 0.16, 2.2, 0.16);
    b(solido, G.caja, P.madera, 0, 2.3, -0.04, 3.9, 1.95, 0.1);
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = '#FFF8EC'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#10B981'; g.fillRect(0, 0, 512, 56);
    g.fillStyle = '#00140D'; g.font = '700 34px "Space Grotesk", Inter, sans-serif'; g.textBaseline = 'middle';
    g.fillText(lineas[0], 18, 30);
    g.fillStyle = '#1F2937'; g.font = '600 24px Inter, sans-serif';
    lineas.slice(1).forEach((t, i) => g.fillText(t, 18, 86 + i * 32));
    if (progreso != null) {
      g.fillStyle = '#E5E7EB'; g.fillRect(18, 214, 476, 24);
      g.fillStyle = '#10B981'; g.fillRect(18, 214, 476 * progreso, 24);
      g.fillStyle = '#00140D'; g.font = '700 18px Inter, sans-serif'; g.fillText(Math.round(progreso * 100) + '%', 26, 227);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 1.85), new THREE.MeshBasicMaterial({ map: t }));
    pl.applyMatrix4(base.clone().multiply(M(0, 2.3, 0.02)));
    acentos.add(pl);
  }
  function cerco(x0, z0, x1, z1) {
    const L2 = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L2 / 1.2)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) { const t = i / n; solido.add(G.caja, P.madera, M(x0 + (x1 - x0) * t, 0.5, z0 + (z1 - z0) * t, 0.14, 1.0, 0.14)); }
    for (const y of [0.45, 0.85]) solido.add(G.caja, P.madera, M((x0 + x1) / 2, y, (z0 + z1) / 2, 0.06, 0.08, L2, ry));
  }
  // Zoológico de la ciudad, en construcción: la obra que eligieron los cursos
  function zoologico(cx, cz, s = 1, conCartel = true) {
    const b = (lote, geo, c, x, y, z, ...r) => lote.add(geo, c, M(cx + x * s, y * s, cz + z * s, ...r.slice(0, 3).map(v => v * s), ...r.slice(3)), r[6]);
    b(plano, G.caja, P.tierraClara, 0, 0.03, 0, 17, 0.04, 13, 0, 0, 0, { ao: false });
    // recinto 1 (terminado): laguna con isla, motacú y cerco
    b(plano, G.caja, P.pasto2, -4.5, 0.06, -3, 7, 0.04, 5.5, 0, 0, 0, { ao: false });
    b(plano, G.disco, P.rio, -5, 0.09, -3.2, 4.2, 0.04, 3.0, 0, 0, 0, { ao: false });
    b(plano, G.disco, P.pasto, -5.3, 0.12, -3.3, 1.4, 0.05, 1.1, 0, 0, 0, { ao: false });
    if (s > 0.8) { motacu(cx + (-2.2) * s, cz + (-4.6) * s, 0.7 * s); tajibo(cx + (-7.0) * s, cz + (-1.4) * s, 0.7 * s, P.tajiboAm); }
    if (s > 0.8) { cerco(cx - 8 * s, cz - 5.75 * s, cx - 1 * s, cz - 5.75 * s); cerco(cx - 1 * s, cz - 5.75 * s, cx - 1 * s, cz - 0.25 * s); cerco(cx - 8 * s, cz - 0.25 * s, cx - 1 * s, cz - 0.25 * s); }
    // recinto 2 (a medias): postes y material apilado
    b(plano, G.caja, P.pasto2, 4.2, 0.06, -3, 6.5, 0.04, 5.5, 0, 0, 0, { ao: false });
    if (s > 0.8) { cerco(cx + 1 * s, cz - 5.75 * s, cx + 7.5 * s, cz - 5.75 * s); }
    for (let i = 0; i < 3; i++) for (let k = 0; k < 3 - i; k++) b(brillo, G.caja, k % 2 ? P.esmeraldaClaro : P.esmeralda, 3 + k * 0.75 + i * 0.37, 0.3 + i * 0.55, 0.2, 0.7, 0.5, 0.7, 0, 0, 0, { brillo: true });
    // portal de entrada a medio construir (la parte que falta, en fantasma)
    for (const sx of [-2, 2]) { b(solido, G.caja, P.ladrillo, sx, 1.5, 5.6, 0.8, 3.0, 0.8); b(solido, G.caja, P.piedra, sx, 3.1, 5.6, 1.0, 0.2, 1.0); }
    fantasmas.push(M(cx, 3.6 * s, cz + 5.6 * s, 5.2 * s, 0.8 * s, 1.0 * s));
    fantasmas.push(M(cx + 4.2 * s, 1.0 * s, cz - 3 * s, 6.3 * s, 2.0 * s, 5.3 * s));
    // andamio + grúa
    for (const [px, pz] of [[2.6, 4.6], [2.6, 6.6], [3.8, 4.6], [3.8, 6.6]]) b(solido, G.caja, P.madera, px, 1.8, pz, 0.08, 3.6, 0.08);
    for (const yy of [1.2, 2.4, 3.4]) b(solido, G.caja, P.madera, 3.2, yy, 5.6, 1.3, 0.08, 2.2);
    if (s > 0.8) grua(cx + 6.5 * s, cz + 3.5 * s, -0.6);
    if (conCartel) cartel(cx - 5.6 * s, cz + 6.8 * s, 0.35, ['ZOOLÓGICO DE LA CIUDAD', 'Lo construyen: Mi colegio · Col. Los Tajibos', 'U.E. El Motacú · Col. Toborochi', 'Obra elegida por los cursos'], 0.62);
    sombra(cx, cz, 0, 0);
  }
  function parque(cx, cz, s = 1) {
    plano.add(G.disco, P.pasto2, M(cx, 0.04, cz, 11 * s, 0.04, 11 * s), { ao: false });
    plano.add(G.disco, P.patio, M(cx, 0.06, cz, 7.4 * s, 0.04, 7.4 * s), { ao: false });
    plano.add(G.disco, P.pasto2, M(cx, 0.08, cz, 5.6 * s, 0.04, 5.6 * s), { ao: false });
    solido.add(G.cil, P.piedra, M(cx, 0.35, cz, 2.2 * s, 0.5 * s, 2.2 * s));
    plano.add(G.disco, P.rio, M(cx, 0.62 * s, cz, 1.8 * s, 0.03, 1.8 * s), { ao: false });
    brillo.add(G.cil, P.esmeraldaClaro, M(cx, 1.0 * s, cz, 0.25 * s, 0.9 * s, 0.25 * s), { brillo: true });
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + 0.3;
      if (i % 2) tajibo(cx + Math.cos(a) * 6 * s, cz + Math.sin(a) * 6 * s, 0.75 * s, i % 4 === 1 ? P.tajiboAm : P.tajiboRo);
      else toborochi(cx + Math.cos(a) * 6 * s, cz + Math.sin(a) * 6 * s, 0.6 * s);
      solido.add(G.caja, P.madera, M(cx + Math.cos(a + 0.5) * 3.2 * s, 0.3, cz + Math.sin(a + 0.5) * 3.2 * s, 1.2 * s, 0.12, 0.4 * s, -a));
    }
  }
  // un árbol cualquiera de la flora cruceña (para áreas verdes libres)
  function arbolSuelto(x, z) {
    const t = rnd();
    if (t < 0.22) tajibo(x, z, R(0.75, 1.0), P.tajiboAm);
    else if (t < 0.34) tajibo(x, z, R(0.75, 0.95), P.tajiboRo);
    else if (t < 0.46) toborochi(x, z, R(0.7, 0.95));
    else if (t < 0.66) motacu(x, z, R(0.7, 1.0));
    else arbolBosque(x, z, R(0.8, 1.15));
  }

  // personajes según el estilo: profes siempre; alumnos del tramo (o los dos en A/B/C)
  const PERSONAS = {
    taji: { saluda: true, edad: 'adulto', altura: 1.75, piel: P.piel4, pelo: P.pelo, ropa: P.ropaTaji, pantalon: P.azulUniforme, mono: true, flor: true, ia: true },
    jochi: { edad: 'adulto', altura: 1.82, piel: P.piel2, pelo: P.pelo2, ropa: P.blanco, chaleco: P.ropaJochi, pantalon: P.maderaOsc, anteojos: true, ia: true },
    chico: { edad: 'nino', altura: 1.05, piel: P.piel1, pelo: P.pelo, ropa: P.blanco, pantalon: P.azulUniforme, guardapolvo: true, colita: true, mochila: P.tajiboRo, ojos: 0.2 },
    medio: { edad: 'nino', altura: 1.3, piel: P.piel3, pelo: P.pelo2, ropa: P.blanco, pantalon: P.azulUniforme, guardapolvo: true, mochila: P.azul, ojos: 0.18 },
    mayor: { edad: 'nino', altura: 1.42, piel: P.piel4, pelo: P.pelo, ropa: P.blanco, pantalon: P.azulUniforme, guardapolvo: true, colita: true, mochila: P.tajiboAm, ojos: 0.17 },
    secu: { edad: 'teen', altura: 1.58, piel: P.piel2, pelo: P.pelo2, ropa: P.azul, pantalon: P.azulUniforme, mochila: P.rojo },
    promo: { edad: 'teen', altura: 1.7, piel: P.piel1, pelo: P.pelo, ropa: P.ropaPromo || P.esmeralda, chaleco: P.tajiboAm, pantalon: P.oscuro, mochila: P.oscuro, auriculares: true },
    grande: { edad: 'teen', altura: 1.62, piel: P.piel1, pelo: P.pelo, ropa: P.esmeralda, pantalon: P.azulUniforme, mochila: P.oscuro, auriculares: true }
  };
  const ALUMNOS = {
    BLOQUES: [['chico', 'Alumna de 2.º', '#F2C230']],
    PIEZAS: [['medio', 'Alumno de 5.º', '#10B981']],
    REAL: [['mayor', 'Alumna de 6.º de primaria', '#5FB7C9']],
    HORIZONTE: [['secu', 'Alumno de 2.º de secundaria', '#A78BFA']],
    VIVO: [['grande', 'Alumna de 4.º de secundaria', '#F472B6']],
    PROMO: [['promo', 'Promo (chamarra de promoción)', '#F59E0B']]
  }[E] || [['chico', 'Primaria', '#E68AB8'], ['grande', 'Secundaria', '#5FB7C9']];

  function armarEscena() {
    tablero(RB, P.pasto);
    const C = new THREE.Vector2(0, 32); // centro de la ciudad (plaza 24 de Septiembre)
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
      recta(...rioPts[i], ...rioPts[i + 1], 3.0, P.rio, (x, z) => dentro(x, z, 0.6), 0.05, agua || plano);
    }

    // --- la ciudad empieza VACÍA: anillos, avenidas y solo los hitos
    const enCiudad = (x, z) => z > 11.6 && dentro(x, z);
    plano.add(G.caja, P.cantero, M(C.x, 0.04, C.y, 7, 0.06, 7), { ao: false });
    plano.add(G.caja, P.patio, M(C.x, 0.07, C.y, 7.2, 0.02, 0.8), { ao: false });
    plano.add(G.caja, P.patio, M(C.x, 0.07, C.y, 0.8, 0.02, 7.2), { ao: false });
    catedral(C.x, C.y + 5.6, Math.PI);
    for (const [px, pz] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) arbolBosque(C.x + px, C.y + pz, 0.5, P.bosque3);
    toborochi(C.x - 1.0, C.y - 0.6, 0.5);
    etiqueta('Plaza 24 de Septiembre', new THREE.Vector3(C.x, 6, C.y + 2), '#F2C230', 60, 26);
    for (const r of anillos) {
      arco(C.x, C.y, r, 1.3, P.calle, enCiudad);
      if (r > 6) arco(C.x, C.y, r, 0.35, P.cantero, enCiudad, plano, 0.09, 0.04);
    }
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.42;
      recta(C.x + Math.cos(a) * 3.6, C.y + Math.sin(a) * 3.6, C.x + Math.cos(a) * 21, C.y + Math.sin(a) * 21, 0.9, P.calle, enCiudad, 0.06);
    }
    // avenida al norte con el Cristo en su rotonda
    recta(-3.5, -9.5, -3.5, -42, 1.2, P.calle, (x, z) => dentro(x, z, 1) && Math.abs(z + 16) > 4.2, 0.06);
    recta(-9.2, 0.6, -3.5, -9.5, 1.0, P.patio, null, 0.05);
    cristo(-3.5, -16, 1);
    etiqueta('Cristo Redentor', new THREE.Vector3(-3.5, 9.6, -16), '#F2C230', 60, 26);

    // --- el colegio (centro de la escena)
    casona(0, 0, 1, 0, { creciendo: true });
    plano.add(G.caja, P.patio, M(0, 0.04, 9.8, 10, 0.04, 3.6), { ao: false }); // plazuela de entrada
    for (const sx of [-4, 4]) { solido.add(G.caja, P.madera, M(sx, 0.25, 10.8, 1.8, 0.12, 0.5)); solido.add(G.caja, P.madera, M(sx, 0.12, 10.8, 0.1, 0.24, 0.4)); }
    recta(-7, 0, -15.5, -1.2, 1.2, P.patio, null, 0.04); // sendero al portal
    etiqueta('Mi colegio · creciendo', new THREE.Vector3(0, 6.7, -2), '#10B981', 45, 26);
    etiqueta('Próxima aula', new THREE.Vector3(8.5, 5.0, -5.5), '#7DE3BE', 26, 14);

    // --- obra pública en construcción: el zoológico que eligieron los cursos
    zoologico(13, -15, 1);
    etiqueta('Zoológico de la ciudad · en obra', new THREE.Vector3(12, 7.5, -15), '#10B981', 50, 26);
    // --- obra ya terminada: un parque
    parque(-15, -25, 1);
    etiqueta('Parque · terminado', new THREE.Vector3(-15, 6, -25), '#7DE3BE', 50, 26);
    // --- otros colegios (se visitan por portales)
    for (const [x, z, ry] of [[27, 6, -0.9], [8, -34, 0.3]]) {
      plano.add(G.disco, P.esmeralda, M(x, 0.03, z, 14, 0.03, 14), { brillo: true });
      casona(x, z, 0.6, ry, { simple: true });
    }

    // --- portal de visita
    portal(-17.5, -1.8, Math.PI / 2 - 0.2, 1, 'Portal → Colegio Los Tajibos');
    persona(-14.6, -0.4, -Math.PI / 2 - 0.35, { ...PERSONAS[ALUMNOS[ALUMNOS.length - 1][0]], camina: [[-9.6, -0.9], [-15.2, -1.3]] });

    // --- personajes en la plazuela: los dos profes (IA) y los alumnos del tramo
    const yT = persona(-1.7, 10.1, 0.12, PERSONAS.taji);
    const yJ = persona(1.8, 10.1, -0.12, PERSONAS.jochi);
    // EDU.16b: nombres configurables (maqueta/nombres-ia.js); fuera de la app, genéricos.
    const IA = window.NandeIA;
    etiqueta(IA ? `Profe ${IA.mujer} (IA)` : 'La profe (IA)', new THREE.Vector3(-1.95, yT + 0.75, 10.1), '#F2C230', 13);
    etiqueta(IA ? `Profe ${IA.varon} (IA)` : 'El profe (IA)', new THREE.Vector3(2.05, yJ + 0.75, 10.1), '#10B981', 13);
    ALUMNOS.forEach(([k, nombre, color], i) => {
      const x = ALUMNOS.length === 1 ? 0.05 : i ? 0.65 : -0.55, z = ALUMNOS.length === 1 ? 11.0 : 11.15;
      const y = persona(x, z, i ? -0.05 : 0.05, PERSONAS[k]);
      etiqueta(nombre, new THREE.Vector3(x + (ALUMNOS.length === 1 ? 0 : i ? 0.3 : -0.2), y + 0.3, z), color, 13);
    });

    // parabas volando sobre la ciudad y una peta junto al río
    const vuelo = new Lote();
    paraba(vuelo, M(2.2, 0, 0, 1.3, 1.3, 1.3, 0, 0, -0.4), true);
    paraba(vuelo, M(-2.4, 0.6, 0.8, 1.3, 1.3, 1.3, Math.PI, 0, 0.4), false);
    const mVuelo = new THREE.Mesh(vuelo.geometria(), new THREE.MeshBasicMaterial({ vertexColors: true, fog: true }));
    mVuelo.position.set(9, 9.5, -12);
    escena.add(mVuelo);
    animados.push(t => { mVuelo.rotation.y = -t * 0.45; mVuelo.position.y = 9.5 + Math.sin(t * 1.3) * 0.3; });
    if (esB) mVuelo.add(contorno(mVuelo.geometry, 0.035));
    peta(-21, -12, 0.6);

    // --- áreas verdes libres: pocos árboles sueltos (la ciudad todavía está por construirse)
    const libres = [[25, -5, 7], [0, 1, 11.6], [13, -15, 10.5], [-15, -25, 6.5], [-17.5, -1.8, 5], [-3.5, -16, 4.5], [27, 6, 7], [8, -34, 7], [9.5, 0, 3]];
    for (let gx = -RB; gx <= RB; gx += 6.2) for (let gz = -RB; gz <= 12; gz += 6.2) {
      const x = gx + R(-2, 2), z = gz + R(-2, 2);
      if (!dentro(x, z, 2) || z > 11 || rnd() < 0.35) continue;
      if (libres.some(([lx, lz, r]) => Math.hypot(x - lx, z - lz) < r)) continue;
      if (Math.abs(x + 3.5) < 2.5 || Math.abs(z + 0.8) < 2.6 && x < -6 && x > -17) continue;
      if (distRio(x, z) < 3.6) continue;
      arbolSuelto(x, z);
    }

    return {
      general: { objetivo: [0, 0, 0], desde: [30, 58, 66] },
      colegio: { objetivo: [0.5, 1.4, 1.2], desde: [15, 13.5, 21] },
      obra: { objetivo: [12, 2.0, -14.5], desde: [28, 12, -4] },
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
    cristo(-4.2, -20.2, 1.2);
    // colegios: [x, z, escala, giro] — públicos, de convenio y privados por igual
    const colegios = [[-6.8, -8.2, 0.4, 0.6], [11.5, -3.2, 0.38, -0.4], [2.5, 15.8, 0.4, 2.9], [-19.8, 6.8, 0.4, 1.9], [17.8, 16.2, 0.38, -2.3], [21.2, -17.2, 0.42, -0.8], [-12.5, -27, 0.42, 0.3]];
    const ocupado = colegios.map(([x, z, s]) => [x, z, 11.5 * s]);
    for (const [x, z, s, ry] of colegios) {
      casona(x, z, s, ry, { simple: true });
      plano.add(G.disco, P.esmeralda, M(x, 0.03, z, 21 * s, 0.03, 21 * s), { brillo: true });
      plano.add(G.disco, P.esmeraldaClaro, M(x, 0.02, z, 22.5 * s, 0.02, 22.5 * s), { brillo: true });
      solido.add(G.cil, P.blanco, M(x + 6.2 * s, 3.2, z + 6.2 * s, 0.14, 6.4, 0.14));
      brillo.add(G.caja, P.esmeralda, M(x + 6.2 * s + 0.8, 5.9, z + 6.2 * s, 1.5, 0.9, 0.06), { brillo: true });
      portal(x - Math.sin(ry) * 4.1, z - Math.cos(ry) * 4.1, ry, 0.55);
    }
    // obras de la ciudad que hacen los colegios
    zoologico(30, -6, 0.75, false); ocupado.push([30, -6, 8]);
    parque(-6, 30, 0.8); ocupado.push([-6, 30, 6]);
    // puentes de visita entre portales: línea punteada esmeralda en el aire
    const pos = colegios.map(([x, z, s, ry]) => new THREE.Vector3(x - Math.sin(ry) * 4.1, 1.9, z - Math.cos(ry) * 4.1));
    for (const [a, b2] of [[0, 1], [0, 3], [1, 5], [2, 4], [2, 3], [0, 6], [1, 4]]) {
      const A = pos[a], B2 = pos[b2], medio = A.clone().add(B2).multiplyScalar(0.5); medio.y += A.distanceTo(B2) * 0.28;
      const curva = new THREE.QuadraticBezierCurve3(A, medio, B2);
      const n = Math.round(A.distanceTo(B2) / 0.9);
      for (let i = 1; i < n; i++) brillo.add(G.bolita, i % 2 ? P.esmeralda : P.esmeraldaClaro, M(...curva.getPoint(i / n).toArray(), 0.62, 0.62, 0.62), { brillo: true });
    }
    // áreas verdes libres con árboles sueltos (la ciudad está por construirse)
    for (let gx = -RM; gx <= RM; gx += 5.2) for (let gz = -RM; gz <= RM; gz += 5.2) {
      const x = gx + R(-1.8, 1.8), z = gz + R(-1.8, 1.8);
      if (!dentro(x, z, 2) || distRio(x, z) < 4 || rnd() < 0.4) continue;
      if (Math.hypot(x, z) < 4 || Math.hypot(x + 4.2, z + 20.2) < 4) continue;
      if (ocupado.some(([ox, oz, or]) => Math.hypot(x - ox, z - oz) < or + 2)) continue;
      // no tapar calles
      const r = Math.hypot(x, z);
      if (r < 28.5 && anillos.some(a => Math.abs(r - a) < 1.6)) continue;
      arbolSuelto(x, z);
    }
    paraba(solido, M(-14, 9, -36, 1.8, 1.8, 1.8, 0.6), true);
    paraba(solido, M(-10, 9.6, -35, 1.8, 1.8, 1.8, 0.3), false);
    return {
      general: { objetivo: [0, 0, 1], desde: [0, 78, 54] },
      lamina: { objetivo: [0, 0, 2.5], desde: [0, 74, 49] }
    };
  }

  // ============================================================ materiales (4–6: luz en tiempo real)
  const uTiempo = { value: 0 };
  let _gradiente = null, _mPers = null, _mBrillo = null;
  function gradiente() { // dibujo en 3 tonos para la luz "toon"
    if (!_gradiente) {
      _gradiente = new THREE.DataTexture(new Uint8Array([95, 175, 255]), 3, 1, THREE.RedFormat);
      _gradiente.minFilter = _gradiente.magFilter = THREE.NearestFilter; _gradiente.needsUpdate = true;
    }
    return _gradiente;
  }
  function materialLuz(op = {}) {
    let m;
    if (nivel === 6) m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: op.rough ?? 0.8, metalness: 0, envMapIntensity: op.env ?? 0.6 });
    else if (luzReal) m = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradiente() });
    else m = new THREE.MeshBasicMaterial({ vertexColors: true });
    if (op.detalle && nivel >= 5) m.onBeforeCompile = sh => {
      // detalle sin texturas: hileras de tejas en lo rojizo, revoque en paredes claras, manchas en el pasto
      sh.vertexShader = 'varying vec3 vPosMundo;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vPosMundo = transformed;');
      sh.fragmentShader = 'varying vec3 vPosMundo;\nfloat ruido(vec2 p) { return sin(p.x * 1.7 + sin(p.y * 1.3)) * sin(p.y * 1.9 + sin(p.x * 0.7)); }\n' +
        sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        vec3 vc = diffuseColor.rgb;
        float esTeja = step(vc.g * 1.7, vc.r) * step(vc.b * 1.8, vc.r) * step(0.08, vc.r);
        float hilera = smoothstep(0.0, 0.18, fract(vPosMundo.y * 4.0)) * (0.82 + 0.18 * step(0.5, fract(vPosMundo.x * 2.0 + floor(vPosMundo.y * 4.0) * 0.5)));
        diffuseColor.rgb *= mix(1.0, 0.8 + 0.2 * hilera, esTeja);
        float esPasto = step(vc.r * 1.15, vc.g) * step(vc.b * 1.4, vc.g);
        diffuseColor.rgb *= mix(1.0, 0.9 + 0.1 * ruido(vPosMundo.xz * 0.35) + 0.05 * ruido(vPosMundo.xz * 1.7), esPasto);
        float esPared = step(0.55, min(vc.r, min(vc.g, vc.b)));
        diffuseColor.rgb *= mix(1.0, 0.97 + 0.03 * ruido(vPosMundo.xy * 3.1 + vPosMundo.zz), esPared);`);
    };
    if (op.viento) m.onBeforeCompile = sh => {
      // las copas se mecen con el viento (más arriba, más movimiento)
      sh.uniforms.uTiempo = uTiempo;
      sh.vertexShader = 'uniform float uTiempo;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float k = max(0.0, transformed.y - 1.6);
        transformed.x += sin(uTiempo * 1.7 + transformed.x * 0.35 + transformed.z * 0.2) * 0.045 * k;
        transformed.z += cos(uTiempo * 1.3 + transformed.x * 0.2) * 0.03 * k;`);
    };
    if (op.agua) m.onBeforeCompile = sh => {
      // ondas que corren sobre el río
      sh.uniforms.uTiempo = uTiempo;
      sh.vertexShader = 'varying vec3 vPosMundo;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vPosMundo = transformed;');
      sh.fragmentShader = 'uniform float uTiempo;\nvarying vec3 vPosMundo;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
        float o = sin(vPosMundo.x * 1.3 + uTiempo * 1.6) * sin(vPosMundo.z * 1.1 - uTiempo * 1.2);
        diffuseColor.rgb *= 0.9 + 0.14 * o;
        diffuseColor.rgb += vec3(0.25) * smoothstep(0.82, 1.0, o);`);
    };
    return m;
  }
  function materialPersonaje() { return _mPers || (_mPers = materialLuz({ rough: 0.62 })); }
  function materialBrillo() { return _mBrillo || (_mBrillo = new THREE.MeshBasicMaterial({ vertexColors: true })); }

  const vistas = tipo === 'mapa' ? armarMapa() : armarEscena();

  // ============================================================ mallas
  const mBasic = () => new THREE.MeshBasicMaterial({ vertexColors: true, fog: true });
  const sombrasReales = nivel >= 5 && tipo !== 'mapa';
  function malla(lote, mat, proyecta, recibe) {
    const m = new THREE.Mesh(lote.geometria(), mat);
    if (sombrasReales) { m.castShadow = proyecta; m.receiveShadow = recibe; }
    escena.add(m); return m;
  }
  const mSolido = malla(solido, luzReal ? materialLuz({ detalle: true }) : mBasic(), true, true);
  if (esB) escena.add(contorno(mSolido.geometry, grosorContorno));
  malla(plano, luzReal ? materialLuz({ rough: 0.95, detalle: true }) : mBasic(), false, true);
  if (brillo.p.length) malla(brillo, mBasic(), false, false);
  if (follaje && follaje.p.length) malla(follaje, materialLuz({ viento: true, rough: 0.7 }), true, true);
  if (agua && agua.p.length) malla(agua, materialLuz({ agua: true, rough: 0.12, env: 1.0 }), false, true);
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
    const mat = new THREE.MeshBasicMaterial({ color: esB ? '#3a2410' : '#1d2a22', alphaMap: t, transparent: true, depthWrite: false, opacity: sombrasReales ? 0.28 : esB ? 0.5 : 0.75, vertexColors: true, fog: true });
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
  if (patrones) {
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
  escena.fog = new THREE.Fog(nivel >= 5 ? P.cielo : P.niebla, 40, 120);

  // ---------------------------------------------------------- 4–6: luces, cielo, nubes, partículas
  let cieloMalla = null, sol = null;
  const nubes = [], particulas = [];
  if (luzReal) {
    const hemi = new THREE.HemisphereLight(P.cieloArriba, P.suelo, nivel === 6 ? 0.85 : 1.25);
    sol = new THREE.DirectionalLight('#FFF0D2', nivel === 6 ? 2.7 : 1.9);
    sol.position.copy(L).multiplyScalar(80);
    escena.add(hemi, sol, sol.target, new THREE.AmbientLight('#FFFFFF', nivel === 6 ? 0.35 : 0.55));
    if (sombrasReales) {
      sol.castShadow = true;
      const t = nivel === 6 ? 2048 : 1024;
      sol.shadow.mapSize.set(t, t);
      Object.assign(sol.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, near: 20, far: 180 });
      sol.shadow.camera.updateProjectionMatrix();
      sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.05;
    }
  }
  if (nivel >= 5) {
    // cielo con degradé y sol
    cieloMalla = new THREE.Mesh(new THREE.SphereGeometry(330, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { arriba: { value: col(P.cieloArriba) }, abajo: { value: col(P.cielo) }, dirSol: { value: L } },
      vertexShader: 'varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 arriba; uniform vec3 abajo; uniform vec3 dirSol; varying vec3 vD;
        void main() {
          vec3 c = mix(abajo, arriba, smoothstep(-0.02, 0.55, vD.y));
          float s = max(dot(vD, dirSol), 0.0);
          c += vec3(1.0, 0.85, 0.6) * (pow(s, 600.0) * ${nivel === 6 ? '6.0' : '1.5'} + pow(s, 12.0) * 0.18);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    }));
    cieloMalla.renderOrder = -1;
    escena.add(cieloMalla);
    // nubes que pasan (y en la 6 proyectan sombra)
    const ln = new Lote();
    for (let i = 0; i < 9; i++) {
      const cx = R(-60, 60), cz = R(-70, 30), y = R(26, 34), k = R(0.8, 1.5);
      for (let j = 0; j < 5; j++) ln.add(G.bola, P.blanco, M(cx + (j - 2) * 3.2 * k, y + (j % 2) * 1.2, cz + R(-1.5, 1.5), 5 * k, 3.2 * k, 4 * k), { ao: false });
    }
    const mn = new THREE.Mesh(ln.geometria(), materialLuz({ rough: 1 }));
    mn.castShadow = nivel === 6;
    escena.add(mn); nubes.push(mn);
  }
  if (nivel === 6 && tipo !== 'mapa') {
    // pétalos de tajibo que vuelan y luciérnagas en el parque y el zoológico
    const crear = (n, centro, radio, alto, colores, tam, mult) => {
      const pos = new Float32Array(n * 3), cols = new Float32Array(n * 3), base = [];
      for (let i = 0; i < n; i++) {
        const a = rnd() * 6.283, r = Math.sqrt(rnd()) * radio;
        base.push([centro[0] + Math.cos(a) * r, R(0.4, alto), centro[1] + Math.sin(a) * r, rnd() * 6.283]);
        const c = col(colores[i % colores.length]).clone().multiplyScalar(mult);
        cols.set([c.r, c.g, c.b], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: tam, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.95, depthWrite: false }));
      escena.add(pts); particulas.push({ pts, base });
    };
    crear(320, [2, -4], 30, 9, [P.tajiboRo, P.tajiboAm, P.toboFlor], 0.16, 1);
    crear(70, [-15, -25], 9, 3, [P.esmeraldaClaro, P.tajiboAm], 0.22, 3.2);
    crear(50, [13, -15], 9, 3, [P.esmeraldaClaro], 0.2, 3.2);
  }

  return {
    escena, vistas, etiquetas, estilo: E, paleta: P,
    // en C la imagen se dibuja a baja resolución y se amplía sin suavizar
    escalaResolucion: esC ? 0.45 : 1, conContorno: esB, nivel,
    antialias: nivel >= 5, maxPixelRatio: nivel === 6 ? 2 : 1.5,
    // deja el renderer listo para esta escena (sombras, tono de color, luz de cielo)
    // calidad automática (5 y 6): si los fps caen de 30, se baja por pasos para que la demo no se trabe
    calidad: nivel >= 5 ? 3 : 0, sinBrillo: false, sinSombras: false,
    bajarCalidad() {
      if (this.calidad <= 0) {
        if (nivel >= 5 && !this.minimo) { this.minimo = true; return { texto: 'resolución mínima', resolucion: 0.75 }; }
        return null;
      }
      this.calidad--;
      if (this.calidad === 2) { for (const p of particulas) p.pts.visible = false; return { texto: 'menos resolución', resolucion: 1 }; }
      if (this.calidad === 1 && nivel === 6) { this.sinBrillo = true; return { texto: 'sin brillo' }; }
      // último paso: sin sombras en tiempo real (vuelven las sombras falsas)
      this.calidad = 0; this.sinSombras = true;
      if (sol) sol.castShadow = false;
      escena.traverse(o => {
        if (o.material) { o.material.needsUpdate = true; if (o.renderOrder === 1 && o.material.opacity < 0.5) o.material.opacity = 0.6; }
      });
      return { texto: 'sin sombras' + (nivel === 6 ? ' ni brillo' : ''), sinBrillo: (this.sinBrillo = true) };
    },
    prepararRender(renderer) {
      renderer.shadowMap.enabled = sombrasReales && !this.sinSombras;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = nivel === 6 ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
      renderer.toneMappingExposure = 1.0;
      if (nivel === 6 && cieloMalla && !escena.environment) {
        const pm = new THREE.PMREMGenerator(renderer), sc = new THREE.Scene();
        sc.add(cieloMalla.clone());
        sc.add(new THREE.Mesh(new THREE.CircleGeometry(300, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: P.pasto })));
        escena.environment = pm.fromScene(sc, 0.04).texture;
        pm.dispose();
      }
    },
    // dibuja: en la 6 con brillo (bloom) y corrección de color propia
    render(renderer, camara) {
      this.prepararRender(renderer);
      if (nivel === 6 && !this.sinBrillo) { if (!this._bloom) this._bloom = crearBloom(THREE, renderer); this._bloom.render(escena, camara); }
      else renderer.render(escena, camara);
    },
    animar(t, camara, objetivo) {
      for (const f of animados) f(t);
      uTiempo.value = t;
      for (const n of nubes) n.position.x = Math.sin(t * 0.02) * 12;
      for (const { pts, base } of particulas) {
        const a = pts.geometry.attributes.position;
        for (let i = 0; i < base.length; i++) {
          const [x, y, z, f] = base[i];
          a.setXYZ(i, x + Math.sin(t * 0.6 + f) * 1.2, y + Math.sin(t * 0.9 + f * 2) * 0.5, z + Math.cos(t * 0.5 + f) * 1.2);
        }
        a.needsUpdate = true;
      }
      for (const p of personajes) {
        const u = t + p.fase;
        p.cuerpo.scale.y = 1 + 0.012 * Math.sin(u * 2.2);
        if (p.o.camina) {
          // camina hacia el portal y vuelve
          const [x0, z0] = p.o.camina[0], [x1, z1] = p.o.camina[1];
          const ciclo = (t * 0.12) % 2, k = ciclo < 1 ? ciclo : 2 - ciclo;
          p.grupo.position.set(x0 + (x1 - x0) * k, 0, z0 + (z1 - z0) * k);
          p.grupo.rotation.y = Math.atan2((x1 - x0) * (ciclo < 1 ? 1 : -1), (z1 - z0) * (ciclo < 1 ? 1 : -1));
          const paso = Math.sin(t * 7);
          p.piernas[0].rotation.x = paso * 0.55; p.piernas[1].rotation.x = -paso * 0.55;
          p.brazos[0].rotation.x = -paso * 0.45; p.brazos[1].rotation.x = paso * 0.45;
          p.cuerpo.position.y = Math.abs(paso) * 0.03;
        } else {
          p.brazos[0].rotation.x = 0.07 * Math.sin(u * 1.4);
          p.brazos[1].rotation.x = -0.07 * Math.sin(u * 1.4);
          if (p.o.saluda) { p.brazos[1].rotation.z = 2.55 + 0.3 * Math.sin(t * 6); p.brazos[1].rotation.x = 0; }
          p.grupo.rotation.y = p.ry + 0.12 * Math.sin(u * 0.5);
        }
      }
      if (camara) for (const e of etiquetas.children) {
        e.visible = e.position.distanceTo(camara.position) < e.userData.maxDist &&
          (!objetivo || e.position.distanceTo(objetivo) < e.userData.radioObjetivo);
      }
    },
    ajustarNiebla(dist) {
      if (nivel >= 5) { escena.fog.near = dist * 1.6 + 10; escena.fog.far = dist * 4.5 + 60; return; }
      escena.fog.near = dist * 0.85; escena.fog.far = dist * 2.6 + 20;
    }
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

// Brillo (bloom) y corrección de color de la evolución 6, sin librerías extra:
// escena → textura HDR → partes muy claras → desenfoque en 2 tamaños → suma + ACES + sRGB.
export function crearBloom(THREE, renderer) {
  const tam = new THREE.Vector2();
  const op = { type: THREE.HalfFloatType };
  const rt = new THREE.WebGLRenderTarget(1, 1, { ...op, samples: 4 });
  const [a0, a1, b0, b1] = [0, 1, 2, 3].map(() => new THREE.WebGLRenderTarget(1, 1, op));
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), esc = new THREE.Scene();
  quad.frustumCulled = false; esc.add(quad);
  const vs = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const claro = new THREE.ShaderMaterial({ uniforms: { t: { value: null } }, vertexShader: vs,
    fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main() { vec3 c = texture2D(t, vUv).rgb; float l = max(max(c.r, c.g), c.b); gl_FragColor = vec4(c * smoothstep(1.05, 1.9, l), 1.0); }' });
  const blur = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, d: { value: new THREE.Vector2() } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main() {
      vec3 c = texture2D(t, vUv).rgb * 0.227;
      c += (texture2D(t, vUv + d * 1.385).rgb + texture2D(t, vUv - d * 1.385).rgb) * 0.316;
      c += (texture2D(t, vUv + d * 3.231).rgb + texture2D(t, vUv - d * 3.231).rgb) * 0.070;
      gl_FragColor = vec4(c, 1.0); }` });
  const final = new THREE.ShaderMaterial({ uniforms: { t: { value: null }, b1: { value: null }, b2: { value: null } }, vertexShader: vs,
    fragmentShader: `uniform sampler2D t; uniform sampler2D b1; uniform sampler2D b2; varying vec2 vUv;
      vec3 aces(vec3 x) { x *= 0.85; return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      vec3 srgb(vec3 c) { return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      void main() {
        vec3 c = texture2D(t, vUv).rgb + texture2D(b1, vUv).rgb * 0.8 + texture2D(b2, vUv).rgb * 0.7;
        c *= mix(0.84, 1.0, smoothstep(0.95, 0.3, length(vUv - 0.5) * 1.45)); // viñeta suave
        gl_FragColor = vec4(srgb(aces(c)), 1.0);
      }` });
  const pasar = (mat, destino) => { quad.material = mat; renderer.setRenderTarget(destino); renderer.render(esc, cam); };
  return {
    render(escena, camara) {
      renderer.getDrawingBufferSize(tam);
      if (rt.width !== tam.x || rt.height !== tam.y) {
        rt.setSize(tam.x, tam.y);
        a0.setSize(tam.x >> 1, tam.y >> 1); a1.setSize(tam.x >> 1, tam.y >> 1);
        b0.setSize(tam.x >> 2, tam.y >> 2); b1.setSize(tam.x >> 2, tam.y >> 2);
      }
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(escena, camara);
      claro.uniforms.t.value = rt.texture; pasar(claro, a0);
      blur.uniforms.t.value = a0.texture; blur.uniforms.d.value.set(1 / a0.width, 0); pasar(blur, a1);
      blur.uniforms.t.value = a1.texture; blur.uniforms.d.value.set(0, 1 / a0.height); pasar(blur, a0);
      blur.uniforms.t.value = a0.texture; blur.uniforms.d.value.set(2 / b0.width, 0); pasar(blur, b0);
      blur.uniforms.t.value = b0.texture; blur.uniforms.d.value.set(0, 2 / b0.height); pasar(blur, b1);
      final.uniforms.t.value = rt.texture; final.uniforms.b1.value = a0.texture; final.uniforms.b2.value = b1.texture;
      pasar(final, null);
    }
  };
}
