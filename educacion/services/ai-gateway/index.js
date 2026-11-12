// Cloud Functions de Educación (codebase "educacion" en el proyecto municipio-ia).
// El webhook de WhatsApp y el procesador de PDF del backend viejo NO se publican
// todavía: ver README.md de esta carpeta.
const { eduKayToken, eduKayUso, eduProfes } = require('./src/kay');
const { eduClase, eduClases } = require('./src/clase');

exports.eduKayToken = eduKayToken;
exports.eduKayUso = eduKayUso;
exports.eduProfes = eduProfes;
exports.eduClase = eduClase;
exports.eduClases = eduClases;
const { eduPlan, eduMentora } = require('./src/plan');
exports.eduPlan = eduPlan;
exports.eduMentora = eduMentora;
const { eduTareas, eduMapa } = require('./src/tareas');
exports.eduTareas = eduTareas;
exports.eduMapa = eduMapa;
const { eduDemo } = require('./src/demo');
exports.eduDemo = eduDemo;
// EDU.16: tutor 24/7 del alumno (texto con streaming; la voz usa eduKayToken con `tutor`)
const { eduTutor } = require('./src/tutor');
exports.eduTutor = eduTutor;
