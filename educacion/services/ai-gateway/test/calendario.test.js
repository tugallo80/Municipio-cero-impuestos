// Calendario por capas y reparto del plan (EDU.04b). Vive en la maqueta (sin build) y se prueba acá.
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../../../maqueta/calendario.js');

test('2026 nacional: 66 / 76 / 66 días (el 2.º da 66 al restar los 10 de descanso, no 68 como dice la RM)', () => {
  const cal = C.diasDelAnio({ anio: 2026, distrito: '__ninguno__' });
  // Sin capa departamental el distrito por defecto es Santa Cruz capital: se usa la nacional pura.
  const nac = C.diasDelAnio({ anio: 2026, distrito: 'scz_capital' });
  assert.ok(nac.dias.length > 0 && cal.dias.length > 0);
  const soloNacional = C.CAPAS.nacional[2026];
  const dias = [];
  // Recalcular solo con la capa nacional
  const sin = new Set(soloNacional.sinClase.map((x) => x.fecha));
  for (const [a, b] of soloNacional.trimestres) {
    let n = 0;
    for (let f = a; f <= b; f = C.sumarDias(f, 1)) { const d = C.diaSemana(f); if (d !== 'sab' && d !== 'dom' && !sin.has(f)) n++; }
    dias.push(n);
  }
  assert.deepEqual(dias, [66, 76, 66]);
  assert.equal(dias[1] - 10, 66);
});

test('Santa Cruz 2026: el descanso ampliado y el 24–25 sep restan días; el cierre pasa al 4 dic', () => {
  const cal = C.diasDelAnio({ anio: 2026, distrito: 'scz_capital' });
  assert.equal(cal.fin, '2026-12-04');
  const d = (f) => cal.dias.find((x) => x.fecha === f);
  assert.equal(d('2026-07-15').clase, false);
  assert.match(d('2026-07-15').motivo, /Descanso/);
  assert.equal(d('2026-09-24').clase, false);
  assert.equal(d('2026-09-25').clase, false);
  assert.equal(d('2026-12-03').clase, true);
  assert.equal(d('2026-10-12').menosHoras, true);
  // T2 Santa Cruz: 76 días − 15 de descanso ampliado (6–24 jul)
  assert.equal(C.contarHabiles(cal.dias, '2026-05-11', '2026-08-31'), 76 - 15);
});

test('capas de distrito, escuela y profe suman días propios; una capa puede devolver la clase', () => {
  const base = C.diasDelAnio({ anio: 2027, distrito: 'scz_rural_demo' });
  assert.equal(base.provisional, true);
  const con = C.diasDelAnio({
    anio: 2027, distrito: 'scz_rural_demo',
    escuela: { sinClase: [{ fecha: '2027-04-20', motivo: 'Fiesta patronal' }] },
    profe: { sinClase: [{ desde: '2027-05-03', hasta: '2027-05-04', motivo: 'Siembra' }], conClase: [{ fecha: '2027-10-15' }] },
  });
  const d = (c, f) => c.dias.find((x) => x.fecha === f);
  assert.equal(d(base, '2027-10-15').clase, false);
  assert.equal(d(con, '2027-10-15').clase, true);
  assert.equal(d(con, '2027-04-20').motivo, 'Fiesta patronal');
  assert.equal(d(con, '2027-04-20').capa, 'escuela');
  assert.equal(C.contarHabiles(base.dias) - C.contarHabiles(con.dias), 3 - 1);
});

const HORARIO = { lun: ['mat', 'mat', 'len', 'len', 'cnat', ''], mar: ['len', 'mat', 'mat', 'csoc', '', ''], mie: ['mat', 'cnat', 'len', '', '', ''], jue: ['len', 'mat', 'csoc', '', '', ''], vie: ['mat', 'len', 'cnat', '', '', ''] };
const PLAN = {
  areas: [
    { id: 'mat', nombre: 'Matemática', temas: Array.from({ length: 12 }, (_, i) => ({ id: `m${i}`, titulo: `Tema ${i}`, peso: i % 3 + 1, trimestre: 0 })) },
    { id: 'cnat', nombre: 'Ciencias Naturales', temas: [{ id: 'c1', titulo: 'Agua', peso: 2, trimestre: 3 }, { id: 'c2', titulo: 'Plantas', peso: 2, trimestre: 1 }] },
  ],
};

test('repartir: todos los temas entran, en orden, con colchón y semana de evaluación', () => {
  const cal = C.diasDelAnio({ anio: 2027, distrito: 'scz_capital' });
  const r = C.repartir(PLAN, HORARIO, cal, { colchon: 0.1 });
  const items = Object.entries(r.porFecha).flatMap(([f, xs]) => xs.map((x) => ({ f, ...x })));
  const temasMat = [...new Set(items.filter((x) => x.area === 'mat' && x.tipo === 'tema').map((x) => x.temaId))];
  assert.deepEqual(temasMat, PLAN.areas[0].temas.map((t) => t.id)); // todos y en orden
  assert.ok(items.some((x) => x.tipo === 'evaluacion'));
  assert.ok(items.some((x) => x.tipo === 'colchon'));
  // Los temas con trimestre fijo caen en su trimestre.
  const fechaDe = (id) => items.find((x) => x.temaId === id).f;
  assert.ok(fechaDe('c1') >= cal.trimestres[2][0]);
  assert.ok(fechaDe('c2') <= cal.trimestres[0][1]);
  assert.equal(r.avisos.length, 0);
  // Ningún periodo se usa dos veces.
  const claves = items.map((x) => `${x.f}/${x.periodo}`);
  assert.equal(new Set(claves).size, claves.length);
});

test('replanificar: con días perdidos y desde una fecha, los temas hechos no se vuelven a dar', () => {
  const cal = C.diasDelAnio({ anio: 2027, distrito: 'scz_capital' });
  const r = C.repartir(PLAN, HORARIO, cal, { desde: '2027-11-15', hechos: Object.fromEntries(PLAN.areas[0].temas.slice(0, 8).map((t) => [t.id, '2027-10-01'])) });
  const ids = Object.values(r.porFecha).flat().map((x) => x.temaId).filter(Boolean);
  assert.ok(!ids.includes('m0'));
  assert.ok(ids.includes('m11'));
  assert.ok(Object.keys(r.porFecha).every((f) => f >= '2027-11-15'));
  // Si se pierden muchos días al final, aparece el aviso.
  const perdidos = cal.dias.filter((d) => d.fecha >= '2027-11-15').map((d) => d.fecha).slice(0, 10);
  const r2 = C.repartir(PLAN, HORARIO, cal, { desde: '2027-11-15', perdidos, hechos: {} });
  assert.ok(r2.avisos.some((a) => a.area === 'mat'), JSON.stringify(r2.avisos));
});
