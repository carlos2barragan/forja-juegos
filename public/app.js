const $ = (s, r = document) => r.querySelector(s);
const main = $('#main');
const LEVELS = { 1: 'Fácil', 2: 'Medio', 3: 'Difícil', 4: 'Semi-senior', 5: 'Senior', 6: 'Staff' };
const lvl = (t, n) => (t.levels || LEVELS)[n];
let state = null;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const api = async (url, opts) => {
  const r = await fetch(url, opts);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || 'Error');
  return data;
};

// Texto con **negrita**, listas con "- " y párrafos
function prose(text) {
  const out = []; let list = [];
  const flush = () => { if (list.length) { out.push(`<ul>${list.map((l) => `<li>${l}</li>`).join('')}</ul>`); list = []; } };
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  for (const line of text.split('\n')) {
    if (line.startsWith('- ')) list.push(inline(line.slice(2)));
    else { flush(); if (line.trim()) out.push(`<p>${inline(line)}</p>`); }
  }
  flush();
  return out.join('');
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2800);
}

const lockIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';
const scoreClass = (n) => (n >= 7 ? 'ok' : n >= 4 ? 'mid' : 'low');
const track = (id) => state.tracks.find((t) => t.id === id);

function testsBlock(r) {
  if (r.runError) return `<div class="runlog bad"><h3>Tu código no pudo ejecutarse</h3><pre>${esc(r.runError)}</pre></div>`;
  if (r.runNote) return `<div class="runlog"><h3>No se ejecutó</h3><p>${esc(r.runNote)}</p></div>`;
  if (!r.tests) return '';
  const ok = r.tests.filter((t) => t.ok).length;
  return `<div class="runlog"><h3>Pruebas ejecutadas: ${ok} de ${r.tests.length} pasan</h3><ul>${r.tests.map((t) => `<li class="${t.ok ? 'pass' : 'fail'}"><span aria-hidden="true">${t.ok ? '✓' : '✗'}</span><span class="sr">${t.ok ? 'Pasa: ' : 'Falla: '}</span>${esc(t.name)}</li>`).join('')}</ul></div>`;
}

function renderRank() {
  const { xp, maxXp, rank } = state;
  const target = rank.next ? rank.next.xp : maxXp;
  $('#rank').innerHTML = `
    <strong>${esc(rank.name)}</strong>
    <div class="xpbar" role="progressbar" aria-label="Progreso de experiencia" aria-valuemin="0" aria-valuemax="${maxXp}" aria-valuenow="${xp}"><i style="transform:scaleX(${Math.min(1, xp / maxXp)})"></i></div>
    <small>${xp}/${maxXp} XP${rank.next ? ` · siguiente: ${esc(rank.next.name)} a los ${target}` : ''}</small>`;
}

async function refresh() {
  state = await api('/api/state');
  renderRank();
}

function nav(name) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

// ── Mapa ──────────────────────────────────────────────────
function trailHtml(t) {
  const solved = t.challenges.filter((c) => c.status === 'done').length;
  let lastLevel = 0;
  const items = t.challenges.map((c) => {
    const head = c.level !== lastLevel ? `<li class="lvl" aria-hidden="true">${lvl(t, c.level)}</li>` : '';
    lastLevel = c.level;
    const badge = c.best ? `<span class="badge ${scoreClass(c.best)}">${c.best}/10</span>` : '';
    const why = c.lock === 'part' ? 'Se abre al terminar la Parte 1' : 'Bloqueado: supera el reto anterior';
    const intentos = c.attempts ? `${c.attempts} intento${c.attempts > 1 ? 's' : ''}` : 'Disponible';
    const body = c.status === 'locked'
      ? `<div class="fog" aria-disabled="true"><div class="t">${esc(c.title)}</div><div class="m">${lockIcon}<span>${why}</span></div></div>`
      : `<a href="#/reto/${c.id}"><div class="t">${esc(c.title)}</div><div class="m">${badge}<span>${c.status === 'done' ? 'Superado' : intentos}</span></div></a>`;
    return `${head}<li class="node ${c.status}">${body}</li>`;
  }).join('');
  return `<section class="trail" style="--c:${t.color}" aria-labelledby="t-${t.id}">
    <h2 id="t-${t.id}"><i></i>${esc(t.name)}</h2>
    <p class="blurb">${esc(t.blurb)}</p>
    <span class="count">${solved}/${t.challenges.length} superados</span>
    <ol class="path">${items}</ol>
  </section>`;
}

function home() {
  nav('home');
  document.title = 'Forja Juegos';
  const all = state.tracks.filter((t) => (t.part || 1) < 3).flatMap((t) => t.challenges.map((c) => ({ ...c, track: t })));
  const p3 = state.tracks.filter((t) => t.part === 3);
  const p3all = p3.flatMap((t) => t.challenges);
  const p3done = p3all.filter((c) => c.status === 'done').length;
  const next = all.find((c) => c.status === 'open') || null;
  const done = all.filter((c) => c.status === 'done').length;
  const p1 = state.tracks.filter((t) => (t.part || 1) === 1);
  const p2 = state.tracks.filter((t) => t.part === 2);
  const p2s = state.part2;

  const titulo = done === 0 ? 'Empieza por el primer reto de cualquier ruta' : `${done} de ${all.length} retos superados`;
  const cta = next
    ? `<a class="btn primary" href="#/reto/${next.id}">Continuar: ${esc(next.title)}</a><small>${esc(next.track.name)} · ${lvl(next.track, next.level)}</small>`
    : '<strong>Completaste todos los retos. Ahora toca terminar un juego.</strong>';
  const grader = state.grader === 'claude' ? 'pruebas reales y Claude, con comentarios detallados' : 'pruebas reales y rúbrica local (añade una API key para que también corrija Claude)';
  const p2text = p2.length
    ? (p2s.unlocked ? 'Abierta: rendimiento, multijugador, XR y producción.' : `Se abre al superar los ${p2s.total} retos de la Parte 1. Llevas ${p2s.done}.`)
    : 'En preparación: rendimiento, multijugador, XR y herramientas de producción. Mientras tanto, la Guía de experto te propone un proyecto por ruta.';

  main.innerHTML = `
    <section class="hero">
      <div>
        <h1>${titulo}</h1>
        <p>Tu C# se compila y se ejecuta contra pruebas reales, con un Unity simulado: no hace falta tener Unity instalado. Cada reto se califica del 1 al 10; con 7 o más abres el siguiente. Tu primer intento real desbloquea la solución de referencia.</p>
      </div>
      <div class="cta">
        ${cta}
        <small>Calificación: ${grader}</small>
      </div>
    </section>
    <header class="part-head">
      <h2>Parte 1: Fundamentos de programación de juegos</h2>
      <p>Seis rutas, de fácil a difícil. Cada una tiene sus <a href="#/aprender">lecciones</a>, también enlazadas dentro de cada reto. Si es tu primera vez, lee <a href="#/leccion/l-empezar-forja">Cómo usar Forja Juegos</a> y empieza por C# y Matemáticas.</p>
    </header>
    <div class="map">${p1.map(trailHtml).join('')}</div>
    <header class="part-head part2 ${p2s.unlocked && p2.length ? 'open' : 'closed'}">
      <h2>Parte 2: Especialización</h2>
      <p>${p2text}</p>
    </header>
    ${p2.length ? `<div class="map">${p2.map(trailHtml).join('')}</div>` : ''}
    <header class="part-head part2 ingles">
      <h2>Parte 3: Inglés</h2>
      <p>Aparte de la programación: no bloquea nada y no suma a tu rango, pero la documentación de Unity, las charlas de la GDC y muchas ofertas están en inglés. Llevas ${p3done} de ${p3all.length} retos. Empieza por <a href="#/leccion/l-en-metodo">el método</a>, haz los retos en orden y no te saltes <a href="#/leccion/l-en-juegos">Inglés para desarrollar videojuegos</a>. Pulsa los ejemplos en inglés de cada lección para oírlos.</p>
    </header>
    <div class="map">${p3.map(trailHtml).join('')}</div>`;
}

// ── Reto ──────────────────────────────────────────────────
async function challengePage(id) {
  nav('home');
  let c;
  try { c = await api(`/api/challenge/${id}`); } catch (e) { toast(e.message); location.hash = '#/'; return; }
  const t = track(c.track);
  document.title = `${c.title} · Forja Juegos`;
  let shownHints = 0;

  main.innerHTML = `
    <nav class="crumbs" aria-label="Ruta" style="--c:${t.color}"><a href="#/">Mapa</a><span aria-hidden="true">/</span><span>${esc(t.name)}</span><span aria-hidden="true">/</span><span>${lvl(t, c.level)}</span></nav>
    <div class="challenge" style="--c:${t.color}">
      <div class="brief">
        <h1>${esc(c.title)}</h1>
        <div class="chips">
          <span class="chip track">${esc(t.name)}</span><span class="chip">${lvl(t, c.level)}</span>
          <span class="chip">${c.runnable ? 'Se ejecuta con pruebas reales' : 'Se evalúa por rúbrica'}</span>
          ${c.lesson ? `<a class="chip lesson-chip" href="#/leccion/${c.lesson.id}">Lección: ${esc(c.lesson.titulo)}${c.lesson.leida ? ' ✓' : ''}</a>` : ''}
          <span class="chip" id="best">${c.best ? `Mejor nota: ${c.best}/10` : 'Sin calificar'}</span>
        </div>
        <div class="prose">${prose(c.brief)}</div>
        <div class="hints">
          <h2>Pistas</h2>
          <div id="hints"></div>
          <button class="btn" id="hintBtn" type="button">Ver una pista</button>
        </div>
      </div>
      <div>
        <div class="editor">
          <div class="bar"><span>${c.lang === 'csharp' ? 'C#' : esc(c.lang)}</span><span><kbd>Ctrl</kbd> + <kbd>Enter</kbd> para calificar</span></div>
          <div class="code">
            <div class="gutter" id="gutter" aria-hidden="true"></div>
            <textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Tu solución" aria-describedby="tabhelp"></textarea>
          </div>
        </div>
        <p id="tabhelp" class="actions"><small>Tab inserta sangría. Pulsa Esc y luego Tab para salir del editor con el teclado.</small></p>
        <div class="actions">
          <button class="btn primary" id="grade" type="button">Calificar mi solución</button>
          <button class="btn" id="reset" type="button">Volver al código inicial</button>
          <a class="btn" id="nextBtn" href="#/reto/${c.next || ''}" hidden>Siguiente reto</a>
        </div>
        <div id="out" aria-live="polite"></div>
        <div id="sol"></div>
      </div>
    </div>`;

  const ta = $('#code'), gutter = $('#gutter');
  ta.value = c.code;
  const lines = () => { gutter.textContent = Array.from({ length: ta.value.split('\n').length }, (_, i) => i + 1).join('\n'); };
  lines();
  ta.addEventListener('input', lines);
  ta.addEventListener('scroll', () => { gutter.scrollTop = ta.scrollTop; });
  let escaped = false;
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { escaped = true; return; }
    if (e.key === 'Tab' && !escaped) {
      e.preventDefault();
      const pad = c.lang === 'yaml' ? '  ' : '    ';
      ta.setRangeText(pad, ta.selectionStart, ta.selectionEnd, 'end'); lines();
    } else if (e.key !== 'Tab') escaped = false;
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(); }
  });
  ta.addEventListener('blur', () => { escaped = false; });

  $('#hintBtn').addEventListener('click', () => {
    if (shownHints < c.hints.length) {
      $('#hints').insertAdjacentHTML('beforeend', `<div class="hint">${esc(c.hints[shownHints++])}</div>`);
    }
    if (shownHints >= c.hints.length) $('#hintBtn').hidden = true;
  });
  $('#reset').addEventListener('click', () => { ta.value = c.starter; lines(); ta.focus(); });

  function renderSolution(ch, fresh) {
    $('#sol').innerHTML = ch.solutionUnlocked
      ? `<div class="panel solution"><h2>Solución de referencia</h2><pre class="${fresh ? 'reveal' : ''}"><code>${esc(ch.solution)}</code></pre></div>`
      : `<div class="panel solution locked">${lockIcon.replace('16', '28').replace('16', '28')}<p>La solución se desbloquea cuando envíes tu primer intento.</p></div>`;
  }
  function renderNext(ch) {
    const btn = $('#nextBtn');
    btn.hidden = !(ch.best >= state.pass && ch.next);
    if (ch.next) btn.href = `#/reto/${ch.next}`;
    $('#best').textContent = ch.best ? `Mejor nota: ${ch.best}/10` : 'Sin calificar';
  }
  renderSolution(c, false);
  renderNext(c);
  if (c.last) renderResult(c.last, false);

  function renderResult(r, animate) {
    const col = r.score >= 7 ? 'var(--ok)' : r.score >= 4 ? 'var(--warn)' : 'var(--bad)';
    const verdict = r.score >= 9 ? 'Nivel profesional' : r.score >= 7 ? 'Reto superado' : r.score >= 4 ? 'Vas bien, falta pulir' : 'Aún no está';
    const sub = r.score >= 7 ? 'Abriste el siguiente reto. Compara con la solución de referencia y busca qué harías distinto.' : 'Con 7 o más superas el reto. Corrige lo que falta y vuelve a calificar.';
    const list = (arr, empty) => (arr && arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="none">${empty}</p>`);
    $('#out').innerHTML = `
      <div class="panel">
        <div class="result">
          <div class="ring" style="--rc:${col}">
            <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true"><circle class="bg" cx="56" cy="56" r="44"/><circle class="fg" cx="56" cy="56" r="44" style="stroke-dashoffset:${animate ? 276.46 : 276.46 * (1 - r.score / 10)}"/></svg>
            <b>${r.score}<small>de 10</small></b>
          </div>
          <div class="verdict"><h2>${verdict}</h2><p>${sub}</p><p>${(r.source === 'claude' ? 'Calificado por Claude' : 'Calificación local') + (r.executed ? ', con tu código ejecutado.' : ' por rúbrica.')}</p></div>
        </div>
        ${testsBlock(r)}
        <div class="feedback">
          <div><h3>Lo que hiciste bien</h3>${list(r.bien, 'Todavía nada. Empieza por lo básico del enunciado.')}</div>
          <div><h3>Qué mejorar</h3>${list(r.mejorar, 'Nada pendiente en esta rúbrica.')}</div>
          <div><h3>Qué aprender</h3>${list(r.aprender, 'Sigue con el siguiente reto.')}</div>
          <div><h3>Dónde buscar</h3>${list(r.buscar, 'Prueba la documentación oficial.')}</div>
        </div>
      </div>`;
    if (animate) requestAnimationFrame(() => requestAnimationFrame(() => {
      const fg = $('.ring .fg'); if (fg) fg.style.strokeDashoffset = 276.46 * (1 - r.score / 10);
    }));
  }

  async function submit() {
    const btn = $('#grade');
    btn.disabled = true; btn.textContent = 'Calificando…';
    try {
      const { result, challenge, state: st } = await api('/api/submit', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: c.id, code: ta.value }),
      });
      const wasUnlocked = c.solutionUnlocked;
      c = { ...c, ...challenge };
      state = st; renderRank();
      renderResult(result, true);
      renderSolution(challenge, !wasUnlocked && challenge.solutionUnlocked);
      renderNext(challenge);
      if (result.score >= st.pass) toast(`Reto superado con ${result.score}/10`);
      $('#out').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    } catch (e) { toast(e.message); }
    btn.disabled = false; btn.textContent = 'Calificar mi solución';
  }
  $('#grade').addEventListener('click', submit);
}

// ── Guía ──────────────────────────────────────────────────
async function guidePage() {
  nav('guia');
  document.title = 'Guía de experto · Forja Juegos';
  const g = await api('/api/guide');
  const cur = state.rank.index;
  const card = (t, d, tag) => `<div class="card"><h3>${esc(t)}</h3><p>${esc(d)}</p>${tag ? `<p class="tag">${esc(tag)}</p>` : ''}</div>`;
  main.innerHTML = `<div class="guide">
    <h1>Cómo llegar a programar videojuegos de forma profesional</h1>
    <p class="lead">Los retos te dan la práctica. Esta guía te dice en qué orden avanzar, qué juegos construir y cómo convertirlo en tu primer empleo.</p>

    <section class="verdict-box">
      <h2>${esc(g.veredicto.titulo)}</h2>
      ${g.veredicto.texto.map((p) => `<p>${esc(p)}</p>`).join('')}
    </section>

    <section>
      <h2>Tu plan de 12 meses</h2>
      <p>Un orden realista si practicas a diario. Ajusta los tiempos a tu ritmo, pero no te saltes los juegos.</p>
      <ol class="steps plan">${g.plan.map((p) => `<li><b>${esc(p.t)}</b><span>${esc(p.d)}</span></li>`).join('')}</ol>
    </section>

    <section>
      <h2>Tu camino por rangos</h2>
      <p>Tu rango sube con la suma de tus mejores notas. Hay ${state.maxXp} puntos en juego.</p>
      <ol class="steps">${g.stages.map((s, i) => `<li class="${i === cur ? 'on' : ''}"><b>${esc(s.name)}</b><span>${esc(s.text)}</span><em>${s.xp} XP${i === cur ? ' · estás aquí' : ''}</em></li>`).join('')}</ol>
    </section>

    <section>
      <h2>Hábitos que te vuelven bueno</h2>
      <div class="grid">${g.habits.map((h) => card(h.t, h.d)).join('')}</div>
    </section>

    <section>
      <h2>Un juego por ruta</h2>
      <p>Los retos entrenan piezas sueltas. Estos juegos pequeños las juntan y son lo que enseñas en tu portafolio.</p>
      <div class="grid">${g.proyectos.map((p) => card(p.t, p.d, p.ruta)).join('')}</div>
    </section>

    <section>
      <h2>Lo que la plataforma no cubre</h2>
      <p>${esc(g.huecos.intro)}</p>
      <div class="grid">${g.huecos.items.map((h) => card(h.t, h.d, h.r)).join('')}</div>
    </section>

    <section>
      <h2>Para conseguir tu primer empleo</h2>
      <ol class="rules">${g.empleo.pasos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
      <h3 style="margin:28px 0 10px;font-size:1.15rem">Certificaciones</h3>
      <div class="grid">${g.empleo.certs.map((c) => card(c.n, c.d)).join('')}</div>
      <p class="note">${esc(g.empleo.nota)}</p>
    </section>

    <section class="res">
      <h2>Dónde buscar</h2>
      <p>Verifica los enlaces al usarlos: los sitios cambian de dirección con el tiempo.</p>
      ${g.buscar.map((gr) => `<h3>${esc(gr.grupo)}</h3><ul>${gr.items.map(([n, u, d]) => `<li><b>${esc(n)}</b>${u ? `<code>${esc(u)}</code>` : '<span></span>'}<p>${esc(d)}</p></li>`).join('')}</ul>`).join('')}
    </section>
  </div>`;
}

// ── Router ────────────────────────────────────────────────
async function route() {
  try {
    await refresh();
    const h = location.hash.replace(/^#\/?/, '');
    if (h.startsWith('reto/')) await challengePage(h.slice(5));
    else if (h === 'guia') await guidePage();
    else if (h === 'aprender') await lessonsPage();
    else if (h.startsWith('leccion/')) await lessonPage(h.slice(8));
    else home();
  } catch (e) {
    main.innerHTML = `<div class="panel"><h2>No se pudo cargar</h2><p>${esc(e.message)}. Comprueba que el servidor esté corriendo (npm start).</p></div>`;
  }
  window.scrollTo(0, 0);
}
addEventListener('hashchange', route);
route();
