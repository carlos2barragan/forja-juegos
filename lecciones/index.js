// Carga las lecciones escritas en lecciones/*.md (un archivo por lección, ordenados por nombre).
// Formato de cada archivo:
//   ---
//   id: l-ejemplo
//   grupo: csharp
//   min: 9
//   titulo: Título de la lección
//   resumen: Una frase que aparece en el índice.
//   practica: cs-1, cs-2
//   clave:
//   - Idea para recordar uno.
//   - Idea para recordar dos.
//   ---
//   Cuerpo con ## títulos, listas "- ", tablas con |, bloques ~~~ y `código`.
const fs = require('node:fs');
const path = require('node:path');

const grupos = [
  { id: 'empezar', nombre: 'Empieza aquí', texto: 'Cómo funciona Forja Juegos y cómo estudiar para que se te quede.' },
  { id: 'csharp', nombre: 'C# para juegos', texto: 'El lenguaje de Unity: tipos, clases, interfaces, eventos y LINQ.' },
  { id: 'mates', nombre: 'Matemáticas para juegos', texto: 'Vectores, producto punto, interpolación y ángulos.' },
  { id: 'unity', nombre: 'Unity por dentro', texto: 'GameObjects, componentes, ciclo de vida, corrutinas, prefabs y ScriptableObjects.' },
  { id: 'fisica', nombre: 'Física y colisiones', texto: 'Lo que hace un motor de física, explicado para que puedas hacerlo tú.' },
  { id: 'patrones', nombre: 'Arquitectura de juegos', texto: 'Máquinas de estados, pools, eventos, comandos y guardado.' },
  { id: 'ia', nombre: 'IA de juegos', texto: 'Patrullas, steering, A*, árboles de comportamiento y utility AI.' },
  { id: 'feel', nombre: 'Game feel', texto: 'Lo que hace que un juego "se sienta bien": salto, sacudidas, feedback y controles.' },
  { id: 'graficos', nombre: 'Gráficos y shaders', texto: 'Color, pipeline de render y shaders en HLSL para URP.' },
  { id: 'rendimiento', nombre: 'Parte 2: Rendimiento', texto: 'Medir antes de optimizar, memoria, estructuras espaciales y LOD.' },
  { id: 'red', nombre: 'Parte 2: Multijugador', texto: 'Autoridad, predicción, interpolación y ancho de banda.' },
  { id: 'xr', nombre: 'Parte 2: XR y entornos interactivos', texto: 'Interacción en realidad virtual y aumentada, comodidad e instalaciones interactivas.' },
  { id: 'produccion', nombre: 'Parte 2: Herramientas y producción', texto: 'Herramientas de editor, control de versiones, economía de juego y diseño.' },
];

function parse(raw, file) {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: falta el bloque --- inicial`);
  const meta = { clave: [] };
  let inClave = false;
  for (const line of m[1].split('\n')) {
    if (inClave && line.startsWith('- ')) { meta.clave.push(line.slice(2).trim()); continue; }
    const i = line.indexOf(':');
    if (i < 1) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    inClave = k === 'clave';
    if (!inClave) meta[k] = v;
  }
  for (const k of ['id', 'grupo', 'min', 'titulo', 'resumen']) if (!meta[k]) throw new Error(`${file}: falta "${k}"`);
  if (!grupos.some((g) => g.id === meta.grupo)) throw new Error(`${file}: grupo desconocido "${meta.grupo}"`);
  return {
    id: meta.id, grupo: meta.grupo, min: Number(meta.min), titulo: meta.titulo, resumen: meta.resumen,
    cuerpo: m[2].trim() + '\n', clave: meta.clave,
    practica: meta.practica ? meta.practica.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
}

const lecciones = fs.readdirSync(__dirname).filter((f) => f.endsWith('.md')).sort()
  .map((f) => parse(fs.readFileSync(path.join(__dirname, f), 'utf8'), f));

// Inglés: al final, después de las lecciones de programación.
const INGLES = require('./ingles');
grupos.push(...INGLES.grupos);
lecciones.push(...INGLES.lecciones);

module.exports = { grupos, lecciones };
