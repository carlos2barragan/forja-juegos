// Comprueba el banco de retos: las soluciones pasan sus pruebas y su rúbrica, y el código inicial no aprueba solo.
// Uso: npm test            (todos)
//      npm test -- u-3 m-1 (solo esos)
const { CHALLENGES, TRACKS } = require('../retos');
const LESSONS = require('../lecciones');
const { runTests, hasTests } = require('../runner');

const solo = process.argv.slice(2);
const lista = solo.length ? CHALLENGES.filter((c) => solo.includes(c.id)) : CHALLENGES;
const fallos = [];
const mal = (id, msg) => fallos.push(`${id}: ${msg}`);

// Estructura
const ids = new Set();
for (const c of CHALLENGES) {
  if (ids.has(c.id)) mal(c.id, 'id repetido');
  ids.add(c.id);
  for (const k of ['title', 'brief', 'starter', 'solution', 'checks', 'hints', 'learn', 'search']) if (!c[k] || !c[k].length) mal(c.id, `falta ${k}`);
  if (!TRACKS.find((t) => t.id === c.track)) mal(c.id, 'ruta desconocida');
  for (const [re, label, , , modo] of c.checks) {
    const ok = re.test(c.solution);
    if (modo === 'no' ? ok : !ok) mal(c.id, `la solución no cumple la rúbrica "${label}"`);
  }
  if (!LESSONS.lecciones.some((l) => l.practica.includes(c.id))) mal(c.id, 'ninguna lección lo practica');
}
for (const l of LESSONS.lecciones) for (const id of l.practica) if (!ids.has(id)) mal(l.id, `practica un reto que no existe: ${id}`);

(async () => {
  const conPruebas = lista.filter(hasTests);
  let hechos = 0;
  const cola = [...conPruebas];
  const trabajador = async () => {
    for (let c = cola.shift(); c; c = cola.shift()) {
      const r = await runTests(c, c.solution);
      if (r.unavailable) { console.error(r.unavailable); process.exit(2); }
      if (r.error) mal(c.id, 'la solución no se ejecuta:\n    ' + r.error.replace(/\n/g, '\n    '));
      else for (const t of r.tests.filter((x) => !x.ok)) mal(c.id, `la solución falla "${t.name}"`);
      const s = await runTests(c, c.starter);
      if (s.tests && s.tests.every((x) => x.ok)) mal(c.id, 'el código inicial ya pasa todas las pruebas');
      hechos++;
      process.stdout.write(`\r${hechos}/${conPruebas.length} retos ejecutados`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, trabajador));
  console.log(`\n${CHALLENGES.length} retos, ${CHALLENGES.filter(hasTests).length} con pruebas reales, ${LESSONS.lecciones.length} lecciones.`);
  if (fallos.length) { console.log(`\n${fallos.length} problemas:`); for (const f of fallos) console.log(' - ' + f); process.exit(1); }
  console.log('Todo correcto.');
})();
