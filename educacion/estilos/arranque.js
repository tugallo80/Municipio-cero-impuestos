// Arranque común de las páginas 3D de estilos (escena, transición, construir):
//  · carga three.js (versión exacta, con CDN de respaldo) y mundo.js con rompecachés (?v=…);
//  · si algo falla, muestra un mensaje claro con "Reintentar" (nunca pantalla negra);
//  · en celular vertical sugiere girar la pantalla (los chicos juegan en horizontal).

const FUENTES = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js'
];

function capa(html) {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.92);color:#fff;text-align:center;font:15px/1.45 Inter,system-ui,sans-serif';
  d.innerHTML = `<div style="max-width:360px">${html}</div>`;
  document.body.appendChild(d);
  return d;
}

export function mostrarError(texto) {
  window.__listo = 'error';
  const d = capa(`<div style="font:700 22px 'Space Grotesk',Inter,sans-serif;margin-bottom:8px">No se pudo cargar</div>
    <p style="color:#D4D4D4">${texto}</p>
    <button style="margin-top:16px;min-height:48px;padding:0 22px;border-radius:14px;border:0;background:#10B981;color:#00140D;font:600 16px Inter,sans-serif">Tocá para reintentar</button>`);
  d.querySelector('button').onclick = () => {
    const u = new URL(location.href); u.searchParams.set('r', Date.now()); location.replace(u);
  };
}

export async function cargar(version, exportsNecesarios = ['crearMundo']) {
  let THREE = null;
  for (const url of FUENTES) { try { THREE = await import(url); break; } catch (e) { /* siguiente */ } }
  if (!THREE) { mostrarError('Falta conexión para bajar el motor 3D. Revisá el internet.'); throw new Error('sin three'); }
  let mod;
  try { mod = await import(`./mundo.js?v=${version}`); } catch (e) {
    mostrarError('No se pudo bajar el mundo. Revisá el internet.'); throw e;
  }
  const faltan = exportsNecesarios.filter(k => !(k in mod));
  if (faltan.length) {
    mostrarError('Tenés guardada una versión vieja del mundo.'); throw new Error('mundo.js viejo: falta ' + faltan.join(', '));
  }
  return { THREE, ...mod };
}

export function avisoGiro() {
  if (new URLSearchParams(location.search).has('captura')) return;
  const celular = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 820;
  if (!celular) return;
  const vertical = matchMedia('(orientation: portrait)');
  let d = null, cerrado = false;
  const revisar = () => {
    if (vertical.matches && !cerrado && !d) {
      d = capa(`<div style="font-size:54px;line-height:1;display:inline-block;animation:girar 2s ease-in-out infinite">📱</div>
        <style>@keyframes girar { 0%,30% { transform: rotate(0) } 60%,100% { transform: rotate(-90deg) } }</style>
        <div style="font:700 22px 'Space Grotesk',Inter,sans-serif;margin:14px 0 6px">Girá tu pantalla</div>
        <p style="color:#D4D4D4">El mundo se ve y se juega mejor en horizontal.</p>
        <button style="margin-top:16px;min-height:46px;padding:0 18px;border-radius:14px;border:1px solid #333;background:#111;color:#fff;font:600 15px Inter,sans-serif">Seguir así</button>`);
      d.querySelector('button').onclick = () => { cerrado = true; d.remove(); d = null; };
    } else if (!vertical.matches && d) { d.remove(); d = null; }
  };
  vertical.addEventListener('change', revisar);
  revisar();
}
