---
id: l-mates-tiempo
grupo: mates
min: 14
titulo: Tiempo, ángulos y superficies
resumen: Movimiento independiente de los FPS, suavizado exponencial, Atan2, giros por el camino corto, rebotes y deslizamiento.
practica: m-4, m-5, m-6
clave:
- Multiplica por dt todo lo que sea "por segundo"; nunca muevas una cantidad fija por fotograma.
- Lerp(a, b, k * dt) depende de los FPS; usa 1 − e^(−k·dt) como fracción.
- Atan2(y, x) da el ángulo correcto en los cuatro cuadrantes; Atan(y / x) no.
- Descompón la velocidad en componente normal (v·n)n y tangencial v − (v·n)n.
---
## Delta time
Un juego a 30 FPS llama a `Update` 30 veces por segundo; a 144 FPS, 144 veces. Si mueves 0,1 unidades por fotograma, el jugador con mejor PC corre casi cinco veces más.

~~~
// Mal: depende de los FPS
transform.position += Vector3.forward * 0.1f;

// Bien: 6 unidades por segundo, en cualquier PC
transform.position += Vector3.forward * 6f * Time.deltaTime;
~~~

`Time.deltaTime` son los segundos que duró el último fotograma.

## Avanzar sin pasarse
Para ir hacia un punto a velocidad constante: calcula cuánto falta y avanza lo que toque, salvo que lo que falte sea menos.

~~~
Vector3 falta = objetivo - actual;
float paso = velocidad * dt;
if (falta.magnitude <= paso) return objetivo;      // llegas este fotograma
return actual + falta.normalized * paso;
~~~

## El problema del Lerp con dt
Es muy común ver esto para seguir a algo con suavidad:

~~~
camara = Mathf.Lerp(camara, objetivo, 5f * Time.deltaTime);
~~~

Parece correcto, pero no lo es. Cada fotograma recorre la fracción `k·dt` de lo que falta, así que queda `(1 − k·dt)` del camino. Con un paso de 0,1 queda `1 − 0,1k`; con dos pasos de 0,05 queda `(1 − 0,05k)²`, que es distinto. Además, si `k·dt` pasa de 1, se pasa del objetivo.

La versión correcta usa una exponencial, porque `e^(−k·0,1) = e^(−k·0,05) · e^(−k·0,05)`:

~~~
float fraccion = 1f - Mathf.Exp(-rapidez * dt);
actual = Mathf.Lerp(actual, objetivo, fraccion);
~~~

Ahora el resultado es idéntico a cualquier framerate.

## Ángulos en 2D
Para saber hacia dónde apunta un vector usa `Atan2`, que mira el signo de `x` y de `y` y acierta el cuadrante:

~~~
float grados = Mathf.Atan2(v.y, v.x) * Mathf.Rad2Deg;   // de −180 a 180
~~~

Rotar un vector un ángulo θ en sentido antihorario:

~~~
float c = Mathf.Cos(rad), s = Mathf.Sin(rad);
Vector2 r = new Vector2(v.x * c - v.y * s, v.x * s + v.y * c);
~~~

## El giro más corto
De 350° a 10° hay 20°, no −340°. Hay que **envolver** la diferencia al rango [−180, 180]:

~~~
float d = (hacia - desde) % 360f;     // en C#, % conserva el signo
if (d > 180f) d -= 360f;
if (d < -180f) d += 360f;
~~~

Prueba tu fórmula con casos incómodos: de 10 a 350, de −170 a 170, de 0 a 720.

Para girar como mucho `max` grados por fotograma, limita esa diferencia a [−max, max] y súmala al ángulo actual. Si la diferencia ya es menor, llegas exacto.

## Proyección: normal y tangente
Toda velocidad que choca contra una superficie con normal `n` (unitaria) se separa en dos partes:

~~~
Vector3 normal = Vector3.Dot(v, n) * n;    // la que entra o sale de la pared
Vector3 tangente = v - normal;              // la que va a lo largo
~~~

- **Rebotar:** conserva la tangente e invierte la normal, escalada por el coeficiente de rebote.
- **Deslizar:** conserva solo la tangente. Si `Dot(v, n) >= 0`, la velocidad ya se aleja de la pared: no la toques.

Esto es la base del **collide-and-slide** de los controladores de personaje: chocas, quitas la parte que entra en la pared y sigues con el resto.

Recuerda normalizar `n` primero; si no, `Dot(v, n) * n` sale escalado dos veces.

## Antes de los retos
- **m-4:** las pruebas comparan un paso de 0,1 con dos de 0,05. Solo la exponencial pasa.
- **m-5:** el rango de `AnguloHacia` es (−180, 180]; revisa qué devuelve exactamente para la dirección (−1, 0).
- **m-6:** no uses `Vector3.Reflect` ni `ProjectOnPlane`; constrúyelo con `Dot`.
