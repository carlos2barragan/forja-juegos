// Corrige los retos de inglés: compara cada respuesta con las aceptadas, sin depender de Python ni de Java.
// Formato del editor: una línea por ejercicio, "N) enunciado  => tu respuesta".

function normEn(s) {
  const WHO = '(?:he|she|it|that|there|here|what|who|where|how|when|why|everyone|everybody|nobody|somebody|someone|this)';
  let t = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’‘`´]/g, "'");
  t = t
    .replace(/\b(can't|cannot|cant)\b/g, 'can not')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bain't\b/g, 'is not')
    .replace(/\b(do|does|did|is|are|was|were|has|have|had|could|would|should|must)nt\b/g, '$1 not')
    .replace(/n't\b/g, ' not')
    .replace(/\blet's\b/g, 'let us')
    .replace(new RegExp(`\\b(${WHO})'s\\s+(been|got|gone|done|had|made|taken|become|come|seen|finished|already|just|never|ever)\\b`, 'g'), '$1 has $2')
    .replace(new RegExp(`\\b(${WHO})'s\\b`, 'g'), '$1 is')
    .replace(/\b(\w+)'d\s+(better|been|had|already|never|just)\b/g, '$1 had $2')
    .replace(/'d\b/g, ' would')
    .replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will')
    .replace(/(\d):00/g, '$1')
    .replace(/\./g, '')
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .replace(/(^|\s)'+|'+(?=\s|$)/g, '$1');
  return t.replace(/\s+/g, ' ').trim();
}

function accepts(alt, got) {
  if (alt.startsWith('~')) return new RegExp(alt.slice(1), 'i').test(got);
  return normEn(alt) === got;
}

function runEnglish(code, t) {
  const answers = new Map();
  for (const line of code.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d+)\s*[.)]\s*(.*)$/);
    if (!m) continue;
    const i = m[2].lastIndexOf('=>');
    answers.set(Number(m[1]), (i >= 0 ? m[2].slice(i + 2) : m[2]).trim());
  }
  return {
    tests: t.items.map((it) => {
      const got = normEn(answers.get(it.n) || '');
      return { name: it.name, ok: Boolean(got) && it.ok.some((alt) => accepts(alt, got)) };
    }),
  };
}

module.exports = { runEnglish, normEn };
