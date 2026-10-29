---
id: l-fisica-colisiones
grupo: fisica
min: 14
titulo: Detectar colisiones: cajas, círculos y rayos
resumen: Lo que hace un motor de física para saber si dos cosas chocan, cuánto se meten una en otra y dónde golpea un rayo.
practica: f-1, f-2, f-3
clave:
- Dos cajas alineadas se solapan si se solapan en X y también en Y.
- Para separar, empuja por el eje con menor penetración: es el movimiento más corto.
- Dos círculos se solapan si la distancia al cuadrado es menor que (ra + rb)².
- Un rayo es origen + dirección × t; sustituirlo en la ecuación de la forma da t.
---
Unity te da `Rigidbody`, colisionadores y `Physics.Raycast`. Pero cuando necesitas algo a medida (física de un juego de plataformas, colisiones de miles de balas, un juego en red determinista) tienes que saber qué pasa por dentro.

## AABB: cajas alineadas con los ejes
Una **AABB** (axis-aligned bounding box) es un rectángulo sin rotar. Se describe con su centro y su tamaño, o con su esquina mínima y máxima.

Dos AABB se solapan si **en cada eje** sus intervalos se solapan:

~~~
// En X: el intervalo [a.Min.x, a.Max.x] se solapa con [b.Min.x, b.Max.x]
bool enX = a.Min.x < b.Max.x && b.Min.x < a.Max.x;
~~~

Con `<` estricto, dos cajas que solo se tocan por el borde **no** se solapan. Con `<=`, sí. Decide qué quieres y sé coherente: para "¿este punto está dentro?" normalmente el borde cuenta.

## Cuánto se meten: el vector de separación
Saber que chocan no basta: hay que sacarlas. La **penetración** en cada eje es lo que se meten:

~~~
float dx = b.centro.x - a.centro.x;
float px = (a.tamaño.x + b.tamaño.x) / 2f - Mathf.Abs(dx);   // > 0 si se solapan en X
~~~

Si se solapan en los dos ejes, empuja por el eje de **menor** penetración y en el sentido que **aleja** a `a` de `b`. Por eso un personaje que cae sobre una plataforma acaba encima y no en un lado: se metió poco en Y y mucho en X.

## Círculos
Dos círculos se solapan si la distancia entre centros es menor que la suma de los radios. Sin raíz:

~~~
float r = ra + rb;
bool solapan = (b - a).sqrMagnitude < r * r;
~~~

Para resolver el choque, se mueve a cada uno la **mitad** de la penetración por la línea que une sus centros:

~~~
Vector2 d = b - a;
float dist = d.magnitude;
float penetracion = r - dist;
Vector2 n = d / dist;            // ¡cuidado si dist es 0!
~~~

Si los centros coinciden, `n` sería `NaN`. Elige una dirección fija para ese caso.

Para pasar un valor por referencia y modificarlo dentro del método, C# usa `ref`:

~~~
static void Empujar(ref Vector2 p, Vector2 d) { p += d; }
Empujar(ref posicion, Vector2.right);
~~~

## Rayos
Un rayo es una semirrecta: `P(t) = origen + direccion × t`, con `t ≥ 0`. Si `direccion` está normalizada, `t` es la distancia en metros.

**Contra un plano** con punto `q` y normal `n`, un punto está en el plano si `Dot(P − q, n) = 0`. Despejando:

~~~
float den = Vector3.Dot(direccion, n);
// den ≈ 0 → el rayo es paralelo al plano
float t = Vector3.Dot(q - origen, n) / den;
// t < 0 → el plano está detrás
~~~

**Contra una esfera** de centro `c` y radio `r`, sustituyes el rayo en `|P − c|² = r²` y sale una ecuación de segundo grado. Con `d` normalizada y `m = origen − c`:

~~~
float b = Vector3.Dot(m, d);
float cc = Vector3.Dot(m, m) - r * r;
float disc = b * b - cc;          // < 0 → no hay impacto
float t = -b - Mathf.Sqrt(disc);  // la raíz más cercana
~~~

- `cc > 0` significa que el origen está **fuera** de la esfera.
- `cc > 0 && b > 0` significa que está fuera y apuntando en dirección contraria: no hay impacto.
- Unity no detecta impacto si el rayo **empieza dentro** del colisionador. Imítalo.

## Antes de los retos
- **f-1:** `Solapan` con `<`, `Contiene` con `<=`, y el signo de la separación según dónde esté `a`.
- **f-2:** cada uno se mueve la mitad, en sentidos opuestos, y el caso de centros iguales.
- **f-3:** normaliza la dirección antes de calcular, comprueba `maxDistancia` y deja `distancia = 0` si no hay impacto.
