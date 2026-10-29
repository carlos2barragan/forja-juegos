// Páginas de lecciones. Se carga antes de app.js y usa sus helpers ($, main, esc, api, nav, toast) en tiempo de ejecución.

const inlineMd = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

// Markdown mínimo: ## títulos, listas con "- " o "1. ", tablas con |, bloques ~~~ y **negrita**
function lessonBody(text) {
  const out = [];
  let list = [], table = [], code = null, ordered = false;
  const flushList = () => {
    if (list.length) {
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>` + list.map((l) => '<li>' + inlineMd(l) + '</li>').join('') + `</${tag}>`);
      list = [];
    }
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table
      .filter((r) => !/^\|[\s|:-]+\|$/.test(r))
      .map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
    out.push('<div class="tablewrap"><table><thead><tr>' + rows[0].map((c) => '<th>' + inlineMd(c) + '</th>').join('') + '</tr></thead><tbody>'
      + rows.slice(1).map((r) => '<tr>' + r.map((c) => '<td>' + inlineMd(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>');
    table = [];
  };
  for (const line of text.split('\n')) {
    if (line.startsWith('~~~')) {
      if (code) { out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); code = null; }
      else { flushList(); flushTable(); code = []; }
    } else if (code) code.push(line);
    else if (line.startsWith('|')) { flushList(); table.push(line.trim()); }
    else if (line.startsWith('- ')) { flushTable(); if (ordered) flushList(); ordered = false; list.push(line.slice(2)); }
    else if (/^\d+\. /.test(line)) { flushTable(); if (!ordered) flushList(); ordered = true; list.push(line.replace(/^\d+\. /, '')); }
    else {
      flushList(); flushTable();
      if (line.startsWith('## ')) out.push('<h2>' + inlineMd(line.slice(3)) + '</h2>');
      else if (line.trim()) out.push('<p>' + inlineMd(line) + '</p>');
    }
  }
  flushList(); flushTable();
  return out.join('');
}

const retoLink = (r) => `<a class="retolink ${r.status}" href="#/reto/${r.id}"><span>${esc(r.title)}</span><em>${r.best ? r.best + '/10' : r.status === 'done' ? 'Superado' : r.status === 'locked' ? 'Bloqueado' : 'Hacer'}</em></a>`;

// En las lecciones de inglés, los ejemplos (código en línea y líneas de bloques) se oyen al pulsarlos.
function speak(text) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no puede leer en voz alta'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = 0.9;
  speechSynthesis.speak(u);
}

function makeSpeakable(root) {
  if (!root) return;
  root.querySelectorAll('pre code').forEach((el) => {
    el.innerHTML = el.textContent.split('\n').map((line) => {
      const m = line.match(/^(.*?)(\s{3,}.*)?$/);
      return `<span class="say">${esc(m[1])}</span>${esc(m[2] || '')}`;
    }).join('\n');
  });
  root.querySelectorAll(':not(pre) > code').forEach((el) => el.classList.add('say'));
  root.querySelectorAll('.say').forEach((el) => {
    el.tabIndex = 0; el.setAttribute('role', 'button'); el.title = 'Pulsa para oírlo';
  });
  root.addEventListener('click', (e) => { const s = e.target.closest('.say'); if (s) speak(s.textContent); });
  root.addEventListener('keydown', (e) => {
    const s = e.target.closest?.('.say');
    if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); speak(s.textContent); }
  });
}

async function lessonsPage() {
  nav('aprender');
  document.title = 'Aprender · Forja Juegos';
  const data = await api('/api/lessons');
  const leidas = data.lecciones.filter((l) => l.leida).length;
  main.innerHTML = `<div class="guide">
    <h1>Lo que necesitas saber, antes de cada reto</h1>
    <p class="lead">Una o dos lecciones por ruta: C#, matemáticas, Unity, física, arquitectura e IA de juegos, y al final las de inglés. Léelas en orden o consúltalas cuando un reto se atasque, haz los retos que enlazan y marca cada lección como leída. Llevas ${leidas} de ${data.lecciones.length}.</p>
    ${data.grupos.map((g) => `<section>
      <h2>${esc(g.nombre)}</h2>
      <p>${esc(g.texto)}</p>
      <ol class="lessons">${data.lecciones.filter((l) => l.grupo === g.id).map((l, i) => `
        <li class="${l.leida ? 'read' : ''}">
          <a class="ltitle" href="#/leccion/${l.id}"><span class="num">${l.leida ? '✓' : i + 1}</span><span><b>${esc(l.titulo)}</b><small>${esc(l.resumen)}</small></span><em>${l.leida ? 'Leída' : l.min + ' min'}</em></a>
        </li>`).join('')}</ol>
    </section>`).join('')}
    ${data.pendientes.length ? `<section><h2>En preparación</h2><p>${data.pendientes.map(esc).join(' · ')}</p></section>` : ''}
  </div>`;
}

async function lessonPage(id) {
  nav('aprender');
  let l;
  try { l = await api('/api/lesson/' + id); } catch (e) { toast(e.message); location.hash = '#/aprender'; return; }
  document.title = l.titulo + ' · Forja Juegos';
  const nb = (x, txt) => (x ? `<a class="btn" href="#/leccion/${x.id}">${txt} ${esc(x.titulo)}</a>` : '');
  main.innerHTML = `<article class="lesson">
    <nav class="crumbs" aria-label="Ruta"><a href="#/aprender">Aprender</a><span aria-hidden="true">/</span><span>${l.min} min de lectura</span></nav>
    <h1>${esc(l.titulo)}</h1>
    <p class="lead">${esc(l.resumen)}</p>
    <div class="lbody">${lessonBody(l.cuerpo)}</div>
    <aside class="keybox"><h2>Para recordar</h2><ul>${l.clave.map((k) => `<li>${esc(k)}</li>`).join('')}</ul></aside>
    ${l.retos.length ? `<aside class="practice"><h2>Ahora practícalo</h2><div class="retolinks">${l.retos.map(retoLink).join('')}</div></aside>` : ''}
    <div class="actions lesson-actions">
      <button class="btn" id="readBtn" type="button" aria-pressed="${l.leida}">${l.leida ? 'Marcada como leída ✓' : 'Marcar como leída'}</button>
    </div>
    <div class="actions">${nb(l.anterior, '←')}${nb(l.siguiente, 'Siguiente:')}</div>
  </article>`;
  if (l.grupo.startsWith('en-')) makeSpeakable($('.lbody'));
  $('#readBtn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const next = btn.getAttribute('aria-pressed') !== 'true';
    await api('/api/lesson-read', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: l.id, leida: next }) });
    btn.setAttribute('aria-pressed', String(next));
    btn.textContent = next ? 'Marcada como leída ✓' : 'Marcar como leída';
    if (next) toast('Lección marcada como leída');
  });
}
