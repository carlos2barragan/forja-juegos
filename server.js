// Servidor sin dependencias: API de retos, lecciones, progreso y calificación.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { TRACKS, CHALLENGES } = require('./retos');
const GUIDE = require('./guia');
const LESSONS = require('./lecciones');
// Una lección "practica" los retos que lista: así cada reto sabe a qué lección pertenece.
for (const l of LESSONS.lecciones) for (const id of l.practica) {
  const c = CHALLENGES.find((x) => x.id === id);
  if (c && !c.lesson) c.lesson = l.id;
}
const { runTests, hasTests } = require('./runner');

const PORT = process.env.PORT || 3001;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'progreso.json');
const PASS = 7; // nota mínima para completar el reto y abrir el siguiente

loadEnv();
const API_KEY = process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* sin .env */ }
}

// ── Progreso ──────────────────────────────────────────────
function readDb() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return { attempts: {} }; }
}
function writeDb(db) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

const byTrack = (t) => CHALLENGES.filter((c) => c.track === t);
const best = (db, id) => db.attempts[id]?.best || 0;

const partOf = (trackId) => TRACKS.find((t) => t.id === trackId)?.part || 1;

function part2State(db) {
  const p1 = CHALLENGES.filter((c) => partOf(c.track) === 1);
  const done = p1.filter((c) => best(db, c.id) >= PASS).length;
  return { unlocked: done === p1.length, done, total: p1.length };
}

function statusOf(db, c) {
  if (best(db, c.id) >= PASS) return 'done';
  if (partOf(c.track) === 2 && !part2State(db).unlocked) return 'locked';
  const list = byTrack(c.track);
  const i = list.indexOf(c);
  return i === 0 || best(db, list[i - 1].id) >= PASS ? 'open' : 'locked';
}

function lockReason(db, c) {
  if (statusOf(db, c) !== 'locked') return null;
  return partOf(c.track) === 2 && !part2State(db).unlocked ? 'part' : 'prev';
}

// El inglés (parte 3) no suma al rango de programación.
const CODE_CHALLENGES = CHALLENGES.filter((c) => partOf(c.track) < 3);

function totalXp(db) {
  return CODE_CHALLENGES.reduce((sum, c) => sum + best(db, c.id), 0);
}

function rankOf(xp) {
  let idx = 0;
  GUIDE.stages.forEach((s, i) => { if (xp >= s.xp) idx = i; });
  const next = GUIDE.stages[idx + 1] || null;
  return { name: GUIDE.stages[idx].name, index: idx, next: next && { name: next.name, xp: next.xp } };
}

function stateView(db) {
  const xp = totalXp(db);
  return {
    xp, maxXp: CODE_CHALLENGES.length * 10, pass: PASS, rank: rankOf(xp), part2: part2State(db), grader: API_KEY ? 'claude' : 'local',
    tracks: TRACKS.map((t) => ({
      ...t,
      challenges: byTrack(t.id).map((c) => ({
        id: c.id, title: c.title, level: c.level,
        status: statusOf(db, c), lock: lockReason(db, c), best: best(db, c.id), attempts: db.attempts[c.id]?.count || 0,
      })),
    })),
  };
}

// ── Calificación ──────────────────────────────────────────
const norm = (s) => s.replace(/\s+/g, '');

function gradeLocal(c, code, run) {
  const checks = c.checks.map(([re, label, tip, w = 1, modo]) => ({ ok: modo === 'no' ? !re.test(code) : re.test(code), label, tip, w }));
  const total = checks.reduce((s, k) => s + k.w, 0);
  const got = checks.filter((k) => k.ok).reduce((s, k) => s + k.w, 0);
  const rubric = got / total;
  const tests = run?.tests;
  let frac = rubric;
  if (tests?.length) frac = 0.75 * (tests.filter((t) => t.ok).length / tests.length) + 0.25 * rubric;
  else if (run?.error) frac = Math.min(rubric, 0.25);
  let score = Math.round(1 + frac * 9);
  if (frac < 1 && score === 10) score = 9;
  const bien = checks.filter((k) => k.ok).map((k) => k.label);
  const mejorar = checks.filter((k) => !k.ok).map((k) => k.tip);
  if (tests) for (const t of tests) if (!t.ok) mejorar.unshift('Falla la prueba: ' + t.name);
  return { score, bien, mejorar, source: 'local' };
}

async function gradeClaude(c, code) {
  const system = `Eres un programador de gameplay sénior que hace de mentor. Califica la respuesta de un estudiante a un reto de C# para videojuegos (Unity).
Devuelve SOLO un JSON válido, sin texto extra ni bloques de código:
{"score": entero de 1 a 10, "bien": [strings], "mejorar": [strings], "aprender": [strings], "buscar": [strings]}
Criterios: corrección (50%), claridad e idioma de C#/Unity (25%), casos borde y rendimiento en el bucle de juego (25%).
Fíjate en lo que importa en juegos: independencia de los FPS, asignaciones de memoria por fotograma, el null de Unity, eventos sin desuscribir.
10 = nivel profesional. 7 = correcto con detalles por mejorar. 4 = parcial. 1 = vacío o sin relación.
Aceptas soluciones distintas a la de referencia si son correctas. Sé específico y breve (máximo 4 elementos por lista).
Escribe en español. NO reveles ni copies la solución de referencia en tu respuesta.`;
  const user = `RETO: ${c.title}\n${c.brief}\n\nSOLUCIÓN DE REFERENCIA (confidencial):\n${c.solution}\n\nRESPUESTA DEL ESTUDIANTE:\n${code}`;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 900, system, messages: [{ role: 'user', content: user }] }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = data.content?.find((b) => b.type === 'text')?.text || '';
  const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  const score = Math.max(1, Math.min(10, Math.round(Number(json.score))));
  if (!Number.isFinite(score)) throw new Error('nota inválida');
  const arr = (x) => (Array.isArray(x) ? x.map(String).slice(0, 5) : []);
  return { score, bien: arr(json.bien), mejorar: arr(json.mejorar), aprender: arr(json.aprender), buscar: arr(json.buscar), source: 'claude' };
}

async function grade(c, code) {
  if (norm(code) === norm(c.starter) || norm(code).length < 15) {
    return { score: 1, bien: [], mejorar: ['Aún no hay una solución. Escribe tu intento y vuelve a calificar.'], source: 'local', empty: true };
  }
  const run = hasTests(c) ? await runTests(c, code) : null;
  const usable = run && !run.unavailable ? run : null;
  let result;
  if (API_KEY && c.materia !== 'ingles') { // el inglés se corrige solo con las pruebas, que son exactas
    try {
      result = await gradeClaude(c, code);
      if (usable?.tests?.length) { // las pruebas reales pesan más que la opinión
        const f = usable.tests.filter((t) => t.ok).length / usable.tests.length;
        result.score = Math.max(1, Math.min(10, Math.round(0.6 * result.score + 0.4 * (1 + f * 9))));
      } else if (usable?.error) result.score = Math.min(result.score, 3);
    } catch (e) { console.warn('Claude falló, uso calificador local:', e.message); }
  }
  result = result || gradeLocal(c, code, usable);
  if (usable?.tests) {
    result.tests = usable.tests;
    // Con pruebas reales, solo se aprueba cuando pasan todas.
    if (usable.tests.some((t) => !t.ok) && result.score >= PASS) {
      result.score = PASS - 1;
      result.mejorar = [...(result.mejorar || []), 'Para superar el reto deben pasar todas las pruebas.'];
    }
  }
  if (usable?.error) { result.runError = usable.error; if (!result.mejorar.length || !result.mejorar[0].startsWith('Corrige')) result.mejorar.unshift('Corrige primero el error de compilación o ejecución que se muestra arriba.'); }
  if (run?.unavailable) result.runNote = run.unavailable;
  result.executed = Boolean(usable);
  result.aprender = result.aprender?.length ? result.aprender : c.learn;
  result.buscar = result.buscar?.length ? result.buscar : c.search;
  return result;
}

// ── HTTP ──────────────────────────────────────────────────
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (d) => { size += d.length; if (size > 60_000) { reject(new Error('Demasiado grande')); req.destroy(); } else chunks.push(d); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch { reject(new Error('JSON inválido')); } });
  });
}

const lessonById = (id) => LESSONS.lecciones.find((l) => l.id === id);
const lessonRead = (db, id) => Boolean(db.lessons?.[id]);
const retoBrief = (db, id) => { const c = CHALLENGES.find((x) => x.id === id); return { id, title: c.title, status: statusOf(db, c), best: best(db, id) }; };

function lessonsView(db) {
  return {
    grupos: LESSONS.grupos.filter((g) => LESSONS.lecciones.some((l) => l.grupo === g.id)),
    pendientes: LESSONS.grupos.filter((g) => !LESSONS.lecciones.some((l) => l.grupo === g.id)).map((g) => g.nombre),
    lecciones: LESSONS.lecciones.map((l) => ({
      id: l.id, grupo: l.grupo, min: l.min, titulo: l.titulo, resumen: l.resumen, leida: lessonRead(db, l.id),
      retos: l.practica.map((id) => retoBrief(db, id)),
    })),
  };
}

function challengeView(db, c) {
  const a = db.attempts[c.id];
  const unlocked = !!a?.unlocked;
  const lesson = c.lesson && lessonById(c.lesson);
  return {
    lesson: lesson ? { id: lesson.id, titulo: lesson.titulo, leida: lessonRead(db, lesson.id) } : null,
    id: c.id, track: c.track, level: c.level, title: c.title, brief: c.brief, starter: c.starter, hints: c.hints,
    lang: c.lang || TRACKS.find((t) => t.id === c.track).lang,
    status: statusOf(db, c), best: best(db, c.id), attempts: a?.count || 0, runnable: hasTests(c),
    code: a?.code || c.starter, last: a?.last || null,
    solution: unlocked ? c.solution : null, solutionUnlocked: unlocked,
    next: byTrack(c.track)[byTrack(c.track).indexOf(c) + 1]?.id || null,
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (url.pathname === '/api/state') return send(res, 200, stateView(readDb()));
    if (url.pathname === '/api/guide') return send(res, 200, GUIDE);
    if (url.pathname === '/api/lessons') return send(res, 200, lessonsView(readDb()));

    const lm = url.pathname.match(/^\/api\/lesson\/([\w-]+)$/);
    if (lm) {
      const l = lessonById(lm[1]);
      if (!l) return send(res, 404, { error: 'Lección no encontrada' });
      const db = readDb();
      const i = LESSONS.lecciones.indexOf(l);
      const brief = (x) => x && { id: x.id, titulo: x.titulo };
      return send(res, 200, {
        ...l, leida: lessonRead(db, l.id),
        retos: l.practica.map((id) => retoBrief(db, id)),
        anterior: brief(LESSONS.lecciones[i - 1]), siguiente: brief(LESSONS.lecciones[i + 1]),
      });
    }

    if (url.pathname === '/api/lesson-read' && req.method === 'POST') {
      const { id, leida } = await readBody(req);
      if (!lessonById(id)) return send(res, 400, { error: 'Datos inválidos' });
      const db = readDb();
      db.lessons = db.lessons || {};
      if (leida === false) delete db.lessons[id]; else db.lessons[id] = new Date().toISOString();
      writeDb(db);
      return send(res, 200, { ok: true, leida: lessonRead(db, id) });
    }

    const m = url.pathname.match(/^\/api\/challenge\/([\w-]+)$/);
    if (m) {
      const c = CHALLENGES.find((x) => x.id === m[1]);
      if (!c) return send(res, 404, { error: 'Reto no encontrado' });
      const db = readDb();
      if (statusOf(db, c) === 'locked') return send(res, 403, { error: lockReason(db, c) === 'part' ? 'La Parte 2 se abre al superar todos los retos de la Parte 1.' : 'Completa el reto anterior para abrir este.' });
      return send(res, 200, challengeView(db, c));
    }

    if (url.pathname === '/api/submit' && req.method === 'POST') {
      const { id, code } = await readBody(req);
      const c = CHALLENGES.find((x) => x.id === id);
      if (!c || typeof code !== 'string') return send(res, 400, { error: 'Datos inválidos' });
      const db = readDb();
      if (statusOf(db, c) === 'locked') return send(res, 403, { error: 'Reto bloqueado' });
      const result = await grade(c, code.slice(0, 20000));
      const a = db.attempts[c.id] || { best: 0, count: 0, unlocked: false };
      a.count += 1;
      a.best = Math.max(a.best, result.score);
      a.code = code;
      a.last = { ...result, at: new Date().toISOString() };
      if (!result.empty && result.score >= 3) a.unlocked = true; // un intento real desbloquea la solución
      db.attempts[c.id] = a;
      writeDb(db);
      return send(res, 200, { result: a.last, challenge: challengeView(db, c), state: stateView(db) });
    }

    if (url.pathname === '/api/reset' && req.method === 'POST') { writeDb({ attempts: {}, lessons: {} }); return send(res, 200, { ok: true }); }

    // Archivos estáticos
    const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, 'No encontrado', 'text/plain; charset=utf-8');
    return send(res, 200, fs.readFileSync(file), MIME[path.extname(file)] || 'application/octet-stream');
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Forja Juegos en http://localhost:${PORT}`);
  console.log(API_KEY ? `Calificación: Claude (${MODEL}) + pruebas reales` : 'Calificación: pruebas reales + rúbrica local (pon ANTHROPIC_API_KEY en .env para que también corrija Claude)');
});
