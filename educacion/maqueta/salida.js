// EDU.17b — Salidas de la maqueta: que nadie termine en el selector de perfiles sin querer.
// - App del alumno (Hoy, Agenda, Mis textos, Mis tareas, Mi tutor): recuerda la última página
//   (sessionStorage 'nande-volver-alumno') para que el ✕ del mundo vuelva ahí.
// - Mundo (alumno.html): vuelve al selector SOLO si se entró con "🌎 Ir directo al mundo" (?desde=selector)
//   y no está dentro de la presentación; si no, a la app del alumno.
// - Dentro de la presentación (iframe) o en modo demo: no se muestra ningún enlace al selector ni al Hub.
(function () {
  let enMarco = true;
  try { enMarco = window.top !== window.self; } catch (e) {}
  let demo = false;
  try { demo = /(^|[?&#])demo=/.test(location.search + location.hash) || !!localStorage.getItem('nande-demo'); } catch (e) {}
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  const APP = /^\/maqueta\/(hoy|agenda|textos|tareas|mi-tutor)(\/|\.html|$)/;
  const volverAlumno = () => ss.get('nande-volver-alumno') || '/maqueta/hoy/';

  // Mundo: ¿de dónde vino?
  if (/^\/maqueta\/alumno(\/|\.html|$)/.test(location.pathname)) {
    const q = new URLSearchParams(location.search).get('desde');
    let ref = ''; try { ref = document.referrer ? new URL(document.referrer).pathname : ''; } catch (e) {}
    if (q === 'selector' || q === 'app') ss.set('nande-mundo-desde', q);
    else if (APP.test(ref)) ss.set('nande-mundo-desde', 'app');
    else if (/^\/maqueta\/(index\.html)?$/.test(ref)) ss.set('nande-mundo-desde', 'selector');
  } else if (APP.test(location.pathname)) {
    const guardar = () => ss.set('nande-volver-alumno', location.pathname + location.hash);
    guardar(); addEventListener('hashchange', guardar);
  }

  // ¿A dónde lleva "salir" del mundo?
  const salidaMundo = () => (ss.get('nande-mundo-desde') === 'selector' && !enMarco ? '/maqueta/' : volverAlumno());

  window.NandeSalida = { enMarco, demo, volverAlumno, salidaMundo };

  function arreglar() {
    const enApp = APP.test(location.pathname) || document.body.classList.contains('est-app');
    const enMundo = /^\/maqueta\/alumno(\/|\.html|$)/.test(location.pathname);
    document.querySelectorAll('a[href="index.html"], a[href="/maqueta/"], a[href="./"]').forEach(a => {
      if (a.dataset.salidaLista) return; a.dataset.salidaLista = '1';
      if (enMundo) { a.href = salidaMundo(); return; }
      if (enApp) {   // "Cambiar de perfil": en la presentación o en demo, se queda en la app del alumno
        if (enMarco || demo) { if (/^\/maqueta\/hoy(\/|\.html|$)/.test(location.pathname)) a.style.visibility = 'hidden'; else a.href = '/maqueta/hoy/'; }
        return;
      }
      if (enMarco) a.style.display = 'none';   // panel del profe, dirección, padres: sin "cambiar de perfil" en la presentación
    });
    if (enMarco || demo) document.querySelectorAll('[data-hub]').forEach(a => { a.style.display = 'none'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arreglar); else arreglar();
  // el mundo pinta botones de "Salir" más tarde (fin de misión): se arreglan cuando aparecen
  if (/^\/maqueta\/alumno(\/|\.html|$)/.test(location.pathname)) {
    let pend = false;
    new MutationObserver(() => { if (!pend) { pend = true; requestAnimationFrame(() => { pend = false; arreglar(); }); } }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
