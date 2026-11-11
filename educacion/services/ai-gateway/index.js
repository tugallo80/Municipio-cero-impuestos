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
