// Junta todas las rutas en orden. Cada archivo NN-*.js exporta { track, challenges }.
// Parte 1 (fundamentos) usa niveles 1–3; Parte 2 (especialización) usa niveles 4–6 y se abre al terminar la Parte 1.
// Parte 3 (inglés, retos/ingles.js) va aparte: no bloquea nada ni suma al rango.
const fs = require('node:fs');
const path = require('node:path');

const PARTE2 = new Set(['rendimiento', 'red', 'xr', 'produccion']);

const TRACKS = [];
const CHALLENGES = [];
for (const f of fs.readdirSync(__dirname).filter((x) => /^\d+-.*\.js$/.test(x)).sort()) {
  const { track, challenges } = require(path.join(__dirname, f));
  TRACKS.push({ ...track, part: PARTE2.has(track.id) ? 2 : 1 });
  for (const c of challenges) CHALLENGES.push({ ...c, track: track.id, lang: c.lang || track.lang });
}

const INGLES = require('./ingles');
TRACKS.push(...INGLES.tracks);
for (const c of INGLES.challenges) CHALLENGES.push({ ...c, lang: 'inglés', pruebasIngles: INGLES.tests[c.id] });

module.exports = { TRACKS, CHALLENGES };
