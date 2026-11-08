// ÑANDÉ · EDU.06a — Las evoluciones en el juego del alumno.
// Puente entre los estilos de la vitrina (mundo.js) y el mundo jugable del alumno
// (educacion/maqueta/alumno.html): el alumno conserva su mapa, colisiones, puertas y
// controles; de acá saca CÓMO se dibuja cada pieza según la evolución de su curso.
//
//   P1–P2 → 1 Bloques · P3–P4 → 2 Piezas · P5–P6 → 3 Mundo real
//   S1–S2 → 4 Horizonte · S3–S5 → 5 Mundo vivo · S6 → 6 Promo

export const EVOLUCIONES = ['BLOQUES', 'PIEZAS', 'REAL', 'HORIZONTE', 'VIVO', 'PROMO'];
export const NOMBRES = ['Bloques', 'Piezas', 'Mundo real', 'Horizonte', 'Mundo vivo', 'Promo'];
export const CURSOS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

// 'P4' → 2 ; 'S6' → 6
export function evolucionDeCurso(curso) {
  const m = /^([PS])([1-6])$/.exec(String(curso || '').toUpperCase());
  if (!m) return 1;
  const g = +m[2];
  if (m[1] === 'P') return g <= 2 ? 1 : g <= 4 ? 2 : 3;
  return g <= 2 ? 4 : g <= 5 ? 5 : 6;
}
// "4to de primaria A" → 'P4' ; "2do de secundaria B" → 'S2'
export function cursoDeNombre(nombre) {
  const t = String(nombre || '').toLowerCase();
  const g = parseInt(t, 10);
  if (!(g >= 1 && g <= 6)) return null;
  return (t.includes('secundaria') ? 'S' : 'P') + g;
}
export function nombreCurso(curso) {
  const c = String(curso).toUpperCase();
  return `${c.slice(1)}.º ${c[0] === 'P' ? 'de primaria' : 'de secundaria'}`;
}

export async function crearEvolucion(THREE, n) {
  n = Math.min(6, Math.max(1, n | 0));
  const v = new URL(import.meta.url).search; // mismo rompecachés que este archivo
  const { crearMundo, crearBloom } = await import(`./mundo.js${v}`);
  const clave = EVOLUCIONES[n - 1];
  const kit = crearMundo(THREE, clave, 'kit');
  const P = kit.P, G = kit.G;

  // ---- formas
  const caja = n === 2 ? (G.cajaRedonda || G.caja) : n >= 5 ? (G.cajaRedonda || G.caja) : new THREE.BoxGeometry(1, 1, 1);
  const bola = n === 1 ? new THREE.BoxGeometry(1, 1, 1) : G.bola;
  const cil = n === 1 ? new THREE.BoxGeometry(1, 1, 1) : G.cil;
  const capsula = n >= 3 ? (n >= 4 ? G.capsula : new THREE.CapsuleGeometry(0.5, 1, 4, 10)) : caja;
  const torso = n >= 4 ? G.torso : caja;

  // ---- materiales (uno por color, compartidos)
  const tonos = (arr) => {
    const t = new THREE.DataTexture(new Uint8Array(arr), arr.length, 1, THREE.RedFormat);
    t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
  };
  const gradiente = n === 3 ? tonos([150, 255]) : tonos([95, 175, 255]);
  const cache = new Map();
  function material(color, op = {}) {
    const k = color + JSON.stringify(op);
    if (cache.has(k) && !op.nuevo) return cache.get(k);
    let m;
    if (n === 1) m = new THREE.MeshLambertMaterial({ color, flatShading: true });
    else if (n === 2) m = new THREE.MeshPhongMaterial({ color, shininess: 55, specular: '#4a4a4a' });
    else if (n <= 5) m = new THREE.MeshToonMaterial({ color, gradientMap: gradiente });
    else m = new THREE.MeshStandardMaterial({ color, roughness: op.rough ?? 0.72, metalness: 0, envMapIntensity: 0.6 });
    if (op.transparent) Object.assign(m, { transparent: true, opacity: op.opacity ?? 0.5, depthWrite: false });
    if (op.emissive && m.emissive) { m.emissive.set(op.emissive); m.emissiveIntensity = op.emissiveIntensity ?? 0.3; }
    if (!op.nuevo) cache.set(k, m);
    return m;
  }
  const tinta = new THREE.MeshBasicMaterial({ color: P.tinta || '#1C1712', side: THREE.BackSide });
  const grosor = { 3: 0.05, 4: 0.04, 5: 0.03 }[n] || 0;

  // ---- luz, cielo, niebla y sombras
  let sol = null, cieloMalla = null;
  const sombras = n >= 5;
  function montar(escena) {
    escena.background = new THREE.Color(n >= 4 ? P.cielo : n === 3 ? '#9fd0ee' : n === 2 ? P.cielo : '#7cc8f5');
    escena.fog = new THREE.Fog(n >= 4 ? P.cielo : n === 2 ? P.niebla : '#a9dcf8', n >= 5 ? 45 : 34, n >= 5 ? 110 : 70);
    if (n <= 2) {
      escena.add(new THREE.HemisphereLight('#ffffff', '#5b7a3a', n === 2 ? 1.35 : 1.6));
      sol = new THREE.DirectionalLight('#fff4d6', n === 2 ? 1.9 : 1.6);
    } else {
      escena.add(new THREE.HemisphereLight(P.cieloArriba || '#bfe3ff', P.suelo || '#6f8f4a', n === 6 ? 0.85 : 1.2));
      escena.add(new THREE.AmbientLight('#ffffff', n === 6 ? 0.35 : 0.55));
      sol = new THREE.DirectionalLight('#FFF0D2', n === 6 ? 2.6 : 1.9);
    }
    sol.position.set(-14, 22, 9);
    escena.add(sol, sol.target);
    if (sombras) {
      sol.castShadow = true;
      const t = n === 6 ? 2048 : 1024;
      sol.shadow.mapSize.set(t, t);
      Object.assign(sol.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 2, far: 70 });
      sol.shadow.camera.updateProjectionMatrix();
      sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.04;
    }
    if (n >= 5) {
      const col = c => new THREE.Color(c);
      cieloMalla = new THREE.Mesh(new THREE.SphereGeometry(160, 32, 16), new THREE.ShaderMaterial({
        side: THREE.BackSide, depthWrite: false, fog: false,
        uniforms: { arriba: { value: col(P.cieloArriba) }, abajo: { value: col(P.cielo) }, dirSol: { value: sol.position.clone().normalize() } },
        vertexShader: 'varying vec3 vD; void main() { vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform vec3 arriba; uniform vec3 abajo; uniform vec3 dirSol; varying vec3 vD;
          void main() {
            vec3 c = mix(abajo, arriba, smoothstep(-0.02, 0.55, vD.y));
            float s = max(dot(vD, dirSol), 0.0);
            c += vec3(1.0, 0.85, 0.6) * (pow(s, 600.0) * ${n === 6 ? '6.0' : '1.5'} + pow(s, 12.0) * 0.18);
            gl_FragColor = vec4(c, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`
      }));
      cieloMalla.renderOrder = -1;
      escena.add(cieloMalla);
    }
  }

  // ---- contorno de tinta para una malla suelta (personajes, piezas que se mueven)
  function contornear(malla) {
    if (!grosor || !malla.isMesh || malla.userData.esContorno || malla.material.transparent) return;
    const c = new THREE.Mesh(malla.geometry, tinta);
    const s = malla.scale;
    c.scale.set(1 + grosor * 2 / Math.max(0.05, s.x), 1 + grosor * 2 / Math.max(0.05, s.y), 1 + grosor * 2 / Math.max(0.05, s.z));
    c.userData.esContorno = true;
    malla.add(c);
  }

  // ---- juntar lo que no se mueve en pocas mallas (una por material): menos llamadas de dibujo.
  // Las mallas originales salen de la escena pero siguen sirviendo para "tocar" (raycast).
  function fusionar(escena, esDinamico) {
    escena.updateMatrixWorld(true);
    const grupos = new Map(), quitar = [];
    escena.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.userData.esContorno || o === cieloMalla) return;
      for (let p = o; p; p = p.parent) if (p.userData.dinamico || esDinamico(p)) return;
      const m = o.material;
      if (Array.isArray(m) || m.transparent || !(m.isMeshLambertMaterial || m.isMeshPhongMaterial || m.isMeshToonMaterial || m.isMeshStandardMaterial)) return;
      if (!grupos.has(m)) grupos.set(m, []);
      grupos.get(m).push(o); quitar.push(o);
    });
    const juntas = [];
    for (const [m, lista] of grupos) {
      let total = 0;
      const geos = lista.map(o => {
        const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
        if (!g.attributes.normal) g.computeVertexNormals();
        total += g.attributes.position.count; return g;
      });
      const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
      let k = 0;
      for (const g of geos) { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); k += g.attributes.position.count; g.dispose(); }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      geo.computeBoundingSphere();
      const malla = new THREE.Mesh(geo, m);
      if (sombras) { malla.castShadow = true; malla.receiveShadow = true; }
      escena.add(malla); juntas.push(malla);
    }
    for (const o of quitar) { o.parent.remove(o); o.userData.fusionada = true; }
    // contorno de todo lo fijo en una sola malla más
    if (grosor && juntas.length) {
      let total = 0; juntas.forEach(j => { total += j.geometry.attributes.position.count; });
      const pos = new Float32Array(total * 3); let k = 0;
      juntas.forEach(j => { pos.set(j.geometry.attributes.position.array, k * 3); k += j.geometry.attributes.position.count; });
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const c = kit.contorno(g, grosor); c.userData.esContorno = true; escena.add(c);
    }
    return { mallas: juntas.length, quitadas: quitar.length };
  }

  // ---- render, calidad automática
  let bloom = null;
  const estado = { calidad: n >= 5 ? 3 : 0, sinBrillo: false, sinSombras: false, minimo: false };
  function prepararRender(renderer) {
    renderer.shadowMap.enabled = sombras && !estado.sinSombras;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = n === 6 ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
  }
  let envListo = false;
  function render(renderer, escena, camara) {
    prepararRender(renderer);
    if (n === 6 && !envListo && cieloMalla) {
      envListo = true;
      const pm = new THREE.PMREMGenerator(renderer), sc = new THREE.Scene();
      sc.add(cieloMalla.clone());
      sc.add(new THREE.Mesh(new THREE.CircleGeometry(150, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: P.pasto })));
      escena.environment = pm.fromScene(sc, 0.04).texture; pm.dispose();
    }
    if (n === 6 && !estado.sinBrillo) { if (!bloom) bloom = crearBloom(THREE, renderer); bloom.render(escena, camara); }
    else renderer.render(escena, camara);
  }
  // un paso hacia abajo: resolución → brillo → sombras → resolución mínima (devuelve qué hizo)
  function bajarCalidad(escena) {
    if (n < 5) return null;
    if (estado.calidad === 3) { estado.calidad = 2; return { texto: 'menos resolución', resolucion: 1 }; }
    if (estado.calidad === 2 && n === 6) { estado.calidad = 1; estado.sinBrillo = true; return { texto: 'sin brillo' }; }
    if (estado.calidad >= 1) {
      estado.calidad = 0; estado.sinSombras = true; if (sol) sol.castShadow = false;
      escena.traverse(o => { if (o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; });
      return { texto: 'sin sombras' };
    }
    if (!estado.minimo) { estado.minimo = true; return { texto: 'resolución mínima', resolucion: 0.75 }; }
    return null;
  }

  return {
    n, clave, nombre: NOMBRES[n - 1], P, G, techoHip: kit.techoHip,
    caja, bola, cil, capsula, torso, material, contornear, montar, fusionar,
    render, bajarCalidad, sombras, estado,
    maxPixelRatio: n === 6 ? 1.75 : 1.5
  };
}
