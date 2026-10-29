# Forja Juegos

Plataforma para aprender a **programar videojuegos** con C# y Unity, paso a paso, con lecciones y retos que se califican ejecutando tu código contra pruebas reales.

- **Parte 1, Fundamentos:** 34 retos en 6 rutas: C#, matemáticas, Unity, física, patrones de arquitectura e IA de juegos.
- **Parte 2, Especialización:** en preparación (rendimiento, multijugador, XR y producción).
- **Parte 3, Inglés:** 31 retos en 5 rutas, con uno dedicado al inglés de la industria del videojuego.
- **32 lecciones**, enlazadas a los retos que practican.
- **Guía de experto:** plan de 12 meses, un juego que construir por ruta y cómo conseguir el primer empleo.

No necesitas tener Unity instalado: la plataforma trae un **Unity simulado** (`motor/UnityEngine.cs`) que imita la API de Unity lo justo para ejecutar tu código fuera del editor.

---

## 1. Requisitos

Instala estas dos cosas (solo una vez):

| Herramienta | Versión | Para qué | Descarga |
| --- | --- | --- | --- |
| **Node.js** | 20 o superior | Ejecuta el servidor y la web | https://nodejs.org |
| **SDK de .NET** | 7 o superior (recomendado 8 o más reciente) | Compila y ejecuta tu C# | https://dot.net |

Comprueba que están bien instaladas abriendo una terminal (PowerShell, CMD o Git Bash):

```
node -v
dotnet --list-sdks
```

El primer comando debe mostrar algo como `v20.x.x` o mayor. El segundo debe listar al menos un SDK `7.x`, `8.x` o superior. Si alguno da error, reinstálalo y **cierra y vuelve a abrir la terminal**.

> Hace falta el **SDK**, no solo el *runtime*. Si `dotnet --list-sdks` no muestra nada, instala el SDK.

El proyecto **no tiene dependencias de npm**: no hace falta `npm install`.

---

## 2. Descargar el proyecto

```
git clone https://github.com/carlos2barragan/forja-juegos.git
cd forja-juegos
```

Si no usas Git, en GitHub pulsa **Code → Download ZIP**, descomprímelo y abre una terminal dentro de la carpeta.

---

## 3. Arrancar la plataforma

Elige **una** de estas formas:

**Opción A: doble clic (Windows).** Haz doble clic en `iniciar.bat`. Se abre una ventana con el servidor y el navegador en la plataforma.

**Opción B: desde la terminal.**

```
npm start
```

Verás:

```
Forja Juegos en http://localhost:3001
Calificación: pruebas reales + rúbrica local (...)
```

Abre **http://localhost:3001** en el navegador.

Para **detener** el servidor, cierra la ventana o pulsa `Ctrl + C` en la terminal. Tu progreso queda guardado.

> ¿El puerto 3001 está ocupado? Arranca con otro: en PowerShell `$env:PORT=3005; npm start`, en Git Bash `PORT=3005 npm start`.

---

## 4. (Opcional) Que también corrija Claude

Sin configurar nada, tu código se califica con **pruebas reales y una rúbrica local**. Si además quieres comentarios detallados de un mentor (Claude):

1. Consigue una clave de API en https://console.anthropic.com.
2. Copia el archivo de ejemplo:
   ```
   copy .env.example .env
   ```
   (en Git Bash: `cp .env.example .env`)
3. Abre `.env` y pega tu clave:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Reinicia el servidor. Ahora dirá `Calificación: Claude (...) + pruebas reales`.

`.env` está en `.gitignore`: tu clave nunca se sube al repositorio. Las pruebas siguen mandando: aunque Claude te ponga buena nota, si una prueba falla no apruebas. Los retos de inglés se corrigen siempre sin Claude, porque sus pruebas son exactas.

---

## 5. Cómo usarla, paso a paso

1. **Lee "Cómo usar Forja Juegos"** en *Aprender*: explica cómo se califica y cómo estudiar.
2. **Elige una ruta en el Mapa.** Empieza por *C# para juegos* y *Matemáticas para juegos*; todo lo demás se apoya en ellas.
3. **Lee la lección de la ruta** (enlazada arriba de cada reto). Cada lección termina con un resumen *Para recordar* y los retos que practica.
4. **Abre el primer reto.** A la izquierda está el enunciado y a la derecha un editor con el código inicial.
5. **Escribe tu solución** y pulsa **Calificar mi solución** (o `Ctrl + Enter`).
6. **Lee el resultado:**
   - Una nota del **1 al 10**.
   - Qué **pruebas** pasan y cuáles fallan, con su nombre.
   - Si no compila, el **error del compilador** con línea y motivo.
   - Qué hiciste bien, qué mejorar, qué aprender y dónde buscar.
7. **Con 7 o más superas el reto** y se abre el siguiente de esa ruta. Para aprobar deben pasar **todas** las pruebas.
8. **Compara con la solución de referencia**: se desbloquea con tu primer intento real.
9. Si sacaste menos de 9, **repite el reto desde cero al día siguiente**.

**Pistas:** cada reto tiene botón *Ver una pista*, que las muestra de una en una.

**Rango:** la suma de tus mejores notas en programación te da un rango (de *Aprendiz* a *Junior sólido*), visible arriba a la derecha. El inglés no suma al rango ni bloquea nada.

**Parte 3, Inglés:** en las lecciones de inglés, pulsa cualquier ejemplo en inglés para oírlo. En los retos, escribe tu respuesta después de `=>` en cada línea; dan igual las mayúsculas, el punto final y las contracciones (`don't` = `do not`).

---

## 6. Cómo funciona por dentro

```
Navegador (public/)  ──HTTP──▶  server.js  ──▶  runner.js  ──▶  csc (SDK .NET) + dotnet exec
                                    │                │
                                    │                └── motor/UnityEngine.cs (Unity simulado)
                                    ├── retos/       (enunciados, soluciones y pruebas)
                                    ├── lecciones/   (lecciones en Markdown)
                                    ├── guia.js      (guía de experto)
                                    └── data/progreso.json (tu progreso)
```

Cuando pulsas *Calificar*:

1. El navegador envía tu código a `server.js` (`POST /api/submit`).
2. `runner.js` busca el SDK de .NET instalado y compila **una sola vez** el Unity simulado como `UnityEngine.dll` (se guarda en la carpeta temporal del sistema, `forja-juegos-cache`).
3. Compila tu código junto con las pruebas del reto, en una carpeta temporal, y lo ejecuta con `dotnet exec`, con un límite de 15 segundos.
4. Las pruebas crean tus componentes, avanzan fotogramas, pulsan teclas virtuales y comprueban resultados.
5. El servidor combina las pruebas (75 %) con la rúbrica (25 %), o con la nota de Claude si hay clave, y guarda el resultado en `data/progreso.json`.

Los retos de inglés no usan .NET: los corrige `runner_ingles.js`, que normaliza el texto y lo compara con las respuestas aceptadas.

### Qué simula el motor y qué no

| Sí | No |
| --- | --- |
| `Vector2`, `Vector3`, `Vector2Int`, `Quaternion`, `Mathf`, `Color` | Render, cámaras y shaders |
| `MonoBehaviour`, `GameObject`, `Transform` y el ciclo de vida | Escenas y el editor |
| Corrutinas, `Time`, `Input`, `Random`, `Debug` | `Rigidbody` y colisionadores |
| `Instantiate`, `Destroy` y el "null falso" de Unity | Animator, audio y UI |
| `ScriptableObject`, `JsonUtility`, `PlayerPrefs` | |

Lo que no simula lo programas tú en las rutas de física e IA, para entender qué hace Unity por dentro.

---

## 7. Estructura del proyecto

| Ruta | Qué es |
| --- | --- |
| `server.js` | Servidor HTTP sin dependencias: API, progreso y calificación |
| `runner.js` | Compila y ejecuta el C# contra las pruebas |
| `runner_ingles.js` | Corrige los retos de inglés |
| `motor/UnityEngine.cs` | El Unity simulado |
| `retos/01-csharp.js` … `06-ia.js` | Retos de la Parte 1, uno por ruta |
| `retos/ingles.js` | Retos de inglés (Parte 3) |
| `retos/index.js` | Junta todas las rutas en orden |
| `lecciones/*.md` | Lecciones de programación, una por archivo |
| `lecciones/ingles.js` | Lecciones de inglés |
| `lecciones/index.js` | Carga las lecciones y define los grupos |
| `guia.js` | Contenido de la Guía de experto |
| `public/` | La interfaz web (HTML, CSS y JS) |
| `scripts/verificar.js` | Comprueba todo el banco de retos (`npm test`) |
| `scripts/humo.js` | Prueba rápida del motor simulado (`npm run humo`) |
| `data/progreso.json` | Tu progreso (se crea solo; no se sube a Git) |

---

## 8. Comandos

| Comando | Qué hace |
| --- | --- |
| `npm start` | Arranca la plataforma en http://localhost:3001 |
| `npm test` | Verifica todos los retos: cada solución pasa sus pruebas y su rúbrica, ningún código inicial aprueba solo y cada reto tiene su lección |
| `npm test -- u-3 m-1` | Verifica solo esos retos |
| `npm run humo` | Prueba rápida del motor simulado (ciclo de vida, corrutinas, Destroy, cuaterniones, JSON) |

`npm test` tarda un par de minutos la primera vez, porque compila cada reto dos veces.

---

## 9. Empezar de cero

Tu progreso vive en `data/progreso.json`. Para borrarlo, detén el servidor y elimina la carpeta `data`:

```
rmdir /s /q data
```

(en Git Bash o PowerShell: `rm -r data`)

---

## 10. Añadir contenido

### Un reto nuevo
Añádelo al array `challenges` del archivo de su ruta en `retos/`. Campos:

```js
{
  id: 'cs-7', level: 3, title: 'Título corto',
  brief: `Enunciado. Admite **negrita** y listas con "- ".`,
  starter: `public class Algo\n{\n    // tu código aquí\n}\n`,
  solution: `...la solución de referencia...`,
  checks: [
    // [expresión regular, lo que hizo bien, consejo si falta, peso opcional, 'no' si NO debe aparecer]
    [/class\s+Algo/, 'Declaras la clase', 'Declara "public class Algo".'],
  ],
  hints: ['Primera pista', 'Segunda pista'],
  learn: ['Concepto para estudiar'],
  search: ['"qué buscar en Google"'],
  test: `
var a = new Algo();
Check("nombre de la prueba", () => a.Valor == 3);
`,
  testExtra: `// tipos auxiliares opcionales que necesiten las pruebas`,
}
```

Dentro de `test` tienes:
- `Check(nombre, () => condición)`, `Lanza<TExcepcion>(() => ...)` y `Cerca(a, b)` para floats y vectores.
- `Motor.Crear<T>()` crea un GameObject con tu componente; `Motor.Fotograma()` avanza un fotograma y `Motor.Avanzar(segundos)` avanza varios.
- `Motor.Eje("Horizontal", 1)`, `Motor.Pulsar(KeyCode.Space)` y `Motor.Soltar(...)` simulan la entrada.

Después, **enlázalo desde una lección** (campo `practica`) y ejecuta `npm test -- cs-7`.

### Una lección nueva
Crea `lecciones/NN-nombre.md`. El número ordena las lecciones:

```markdown
---
id: l-mi-leccion
grupo: csharp
min: 10
titulo: Título de la lección
resumen: Una frase para el índice.
practica: cs-7
clave:
- Idea para recordar.
---
Cuerpo con ## títulos, listas "- " o "1. ", tablas con |, bloques ~~~ y `código`.
```

`grupo` debe ser uno de los definidos en `lecciones/index.js`.

---

## 11. Problemas frecuentes

| Síntoma | Solución |
| --- | --- |
| *"No encuentro el SDK de .NET (7 o superior)"* | Instala el **SDK** de .NET desde https://dot.net, cierra la terminal y vuelve a arrancar |
| `node` no se reconoce | Instala Node.js y abre una terminal nueva |
| *"EADDRINUSE"* al arrancar | El puerto 3001 está ocupado: cierra el otro servidor o usa `PORT` (ver paso 3) |
| *"Las pruebas no encuentran lo que piden"* | Un nombre de clase, método o firma no coincide con el enunciado: revísalo letra por letra |
| *"Tu código tardó más de 15 segundos"* | Hay un bucle infinito o una corrutina que nunca termina |
| La primera calificación tarda varios segundos | Es normal: se compila el motor simulado una vez y se reutiliza |
| La página dice *"No se pudo cargar"* | El servidor no está corriendo: arráncalo con `npm start` |
