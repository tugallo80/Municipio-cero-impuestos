// GENERADO por tools/datos/armar-demo.mjs desde tools/datos/demo-piloto.json. No editar a mano.
// Curso REAL del profe del piloto; alumnos ficticios. El nombre REAL del profe NO va acá:
// llega por el link y queda en el equipo (localStorage 'nande-profe'; 'nande-profe-apodo' = cómo lo llaman sus alumnos).
window.DEMO_PILOTO = {
 "colegio": {
  "nombre": "U.E. Nuevo Horizonte",
  "lugar": "rural, Santa Cruz"
 },
 "curso": {
  "id": "2do_secundaria",
  "nombre": "2.º de secundaria",
  "maqueta": "S2"
 },
 "gestion": 2026,
 "trimestre": 3,
 "profe": {
  "nombre": "Profe"
 },
 "materiasProfe": [
  "ing",
  "fil",
  "art",
  "mus",
  "val"
 ],
 "temasHoy": {
  "ing": {
   "unidad": 9,
   "temaId": "ing-9",
   "titulo": "Musical instruments and sports",
   "contenidos": [
    "Present continuous tense: interrogative form",
    "Writing and speaking about my favorite music",
    "Pronunciation tips"
   ],
   "pagina": 57,
   "enCurso": "Present continuous tense: interrogative form",
   "siguiente": "Writing and speaking about my favorite music"
  },
  "fil": {
   "unidad": 9,
   "temaId": "fil-9",
   "titulo": "Autoconocimiento y proyecto de vida",
   "contenidos": [
    "¿Qué es el autoconocimiento?",
    "¿Qué es un proyecto de vida?"
   ],
   "pagina": 48,
   "enCurso": "¿Qué es un proyecto de vida?",
   "siguiente": null
  },
  "art": {
   "unidad": 9,
   "temaId": "art-9",
   "titulo": "La escultura: bajo, medio y alto relieve en materiales blandos",
   "contenidos": [
    "La escultura: bajo, medio y alto relieve",
    "Tallado en materiales blandos relacionado a las expresiones de nuestros pueblos"
   ],
   "pagina": 38,
   "enCurso": "La escultura: bajo, medio y alto relieve",
   "siguiente": "Tallado en materiales blandos"
  },
  "mus": {
   "unidad": 13,
   "temaId": "mus-13",
   "titulo": "Ensambles instrumentales de acuerdo al contexto",
   "contenidos": [
    "Ensamble instrumental",
    "Instrumentos autóctonos",
    "Instrumentos folclóricos, tradicionales o populares",
    "Notación de un ensamble instrumental"
   ],
   "pagina": 49,
   "enCurso": "Instrumentos autóctonos",
   "siguiente": "Repertorio de canciones del contexto a dos voces"
  },
  "val": {
   "unidad": 10,
   "temaId": "val-10",
   "titulo": "Conociendo vidas ejemplares de nuestro contexto, para construir intereses vocacionales",
   "contenidos": [
    "Personajes destacados en su vocación",
    "Superando adversidades para realizar su vocación",
    "Mi vocación y mi misión",
    "Desarrollo de la autoestima y autoconocimiento"
   ],
   "pagina": 38,
   "enCurso": "Mi vocación y mi misión",
   "siguiente": null
  }
 }
};
// Las pantallas de la maqueta (selector, profe, padres, dirección) muestran el colegio del piloto.
(function () {
  const P = window.DEMO_PILOTO, D = window.DEMO;
  if (!D || !D.colegio) return;
  let profe = ''; try { profe = localStorage.getItem('nande-profe') || ''; } catch {}
  const hoy = new Date(Date.now() - 4 * 3600e3).toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  D.colegio.nombre = P.colegio.nombre;
  D.colegio.nota = P.curso.nombre + ' · curso del piloto (alumnos ficticios)';
  D.colegio.gestion = P.gestion;
  D.colegio.trimestre = P.trimestre;
  D.colegio.hoy = hoy.charAt(0).toUpperCase() + hoy.slice(1);
  if (D.tutor) D.tutor.nombre = profe || P.profe.nombre;
})();
