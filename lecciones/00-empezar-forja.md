---
id: l-empezar-forja
grupo: empezar
min: 6
titulo: Cómo usar Forja Juegos
resumen: Qué hay en la plataforma, cómo se califica tu código y cómo estudiar para que se te quede.
clave:
- Lee la lección de cada ruta antes de su primer reto; vuelve a ella cuando te atasques.
- Tu código se compila y se ejecuta de verdad contra pruebas, con un Unity simulado.
- Con 7 o más superas un reto; con todas las pruebas en verde puedes llegar al 10.
- Intenta sin pistas, mira la solución solo después y reescribe desde cero lo que saques con menos de 9.
---
Forja Juegos te entrena en lo que usa a diario un programador de gameplay: **C#**, **matemáticas de vectores**, **Unity**, **física**, **arquitectura** e **IA de juegos**. Cada ruta va de fácil a difícil, y cada reto abre el siguiente.

## Cómo se califica
Cuando pulsas **Calificar**, el servidor hace esto:

1. Compila tu C# junto con un **Unity simulado** (`motor/UnityEngine.cs`). No necesitas tener Unity instalado, solo el SDK de .NET.
2. Ejecuta pruebas reales: crea tus componentes, avanza fotogramas, pulsa teclas virtuales y comprueba el resultado.
3. Combina las pruebas con una rúbrica de buenas prácticas y te da una nota del 1 al 10.

Si pones una clave de API en `.env`, además te corrige **Claude** con comentarios más detallados. Las pruebas siguen mandando: si alguna falla, no apruebas.

## Qué simula el motor y qué no
| Sí | No |
| --- | --- |
| `Vector2`, `Vector3`, `Quaternion`, `Mathf` | Render, cámaras y shaders |
| `MonoBehaviour` y su ciclo de vida | Escenas y el editor |
| Corrutinas, `Time`, `Input` | `Rigidbody` y colisionadores |
| `Instantiate`, `Destroy` y el "null falso" | Animator, audio y UI |
| `ScriptableObject` y `JsonUtility` | |

Lo que el motor no simula lo programas tú en las rutas de física e IA. Así entiendes qué hace Unity por dentro.

## Cómo estudiar
- **Escribe antes de mirar.** Intenta el reto sin pistas durante al menos 15 minutos. El esfuerzo de recordar es lo que fija lo aprendido.
- **Lee el error entero.** El compilador te dice línea y motivo. "Las pruebas no encuentran lo que piden" significa que un nombre o una firma no coincide con el enunciado.
- **Compara con la solución.** Se desbloquea con tu primer intento real. Busca una diferencia que te enseñe algo.
- **Repite al día siguiente** los retos con menos de 9, desde cero.
- **Llévalo a Unity.** Cuando termines una ruta, mete esas piezas en un juego pequeño de verdad. La **Guía de experto** (arriba en el menú) te propone uno por ruta.

## Orden recomendado
Empieza por **C# para juegos** y **Matemáticas para juegos** a la vez: todo lo demás se apoya en ellas. Luego sigue con Unity, física, patrones e IA.
