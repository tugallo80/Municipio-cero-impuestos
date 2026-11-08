// Cloud Functions de Educación (codebase "educacion" en el proyecto municipio-ia).
// El webhook de WhatsApp y el procesador de PDF del backend viejo NO se publican
// todavía: ver README.md de esta carpeta.
const { eduKayToken, eduKayUso, eduProfes } = require('./src/kay');

exports.eduKayToken = eduKayToken;
exports.eduKayUso = eduKayUso;
exports.eduProfes = eduProfes;
