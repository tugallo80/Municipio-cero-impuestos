// ══════════════════════════════════════════════════
//  Configuración del tutor Kay (voz, modelo, límites).
//  Los límites se pueden cambiar sin tocar código con variables de entorno
//  en services/ai-gateway/.env (ver educacion/.env.example).
// ══════════════════════════════════════════════════

function numeroEnv(nombre, porDefecto) {
  const v = Number(process.env[nombre]);
  return Number.isFinite(v) && v > 0 ? v : porDefecto;
}

// Modelo de la Live API (voz nativa, audio adentro y afuera). Google da de baja
// generaciones seguido: si deja de conectar (cierre 1008 "not found"), cambiar acá.
const MODELO_KAY = process.env.EDU_MODELO_KAY || 'gemini-3.1-flash-live-preview';

// Voces predefinidas de Gemini permitidas en la página de prueba. La primera es la
// elegida por defecto. Descripciones según la documentación de voces de Google.
const VOCES = [
  { id: 'Sulafat', descripcion: 'cálida' },
  { id: 'Achird', descripcion: 'amigable' },
  { id: 'Umbriel', descripcion: 'tranquila' },
  { id: 'Vindemiatrix', descripcion: 'suave' },
  { id: 'Puck', descripcion: 'alegre' },
  { id: 'Sadaltager', descripcion: 'sabionda' },
];
const VOZ_POR_DEFECTO = VOCES[0].id;

const LIMITES = {
  // Duración máxima de una charla (el token de Gemini vence a los N minutos).
  minutosPorSesion: numeroEnv('EDU_MAX_MINUTOS_SESION', 10),
  // Charlas por alumno por día (hora de Bolivia).
  sesionesPorAlumnoDia: numeroEnv('EDU_MAX_SESIONES_ALUMNO_DIA', 8),
  // Tope de tokens por alumno por día (requisito MAX_TOKENS_PER_STUDENT_DAY de la visión).
  tokensPorAlumnoDia: numeroEnv('MAX_TOKENS_PER_STUDENT_DAY', 600000),
  // Freno de mano de todo el sistema: costo estimado máximo por día, en USD.
  costoGlobalDiaUsd: numeroEnv('EDU_TOPE_COSTO_GLOBAL_DIA_USD', 5),
};

module.exports = { MODELO_KAY, VOCES, VOZ_POR_DEFECTO, LIMITES };
