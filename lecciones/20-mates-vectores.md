---
id: l-mates-vectores
grupo: mates
min: 12
titulo: Vectores, interpolación y producto punto
resumen: Distancias, direcciones, Lerp y el producto punto: las cuatro operaciones que usas en casi todo el gameplay.
practica: m-1, m-2, m-3
clave:
- B − A es la flecha que va de A hacia B; su longitud es la distancia.
- Normalizar deja la dirección y pone la longitud a 1; un vector cero no se puede normalizar.
- Compara sqrMagnitude con radio × radio para evitar la raíz cuadrada.
- El producto punto de dos vectores unitarios es el coseno del ángulo entre ellos.
---
Un **vector** es una flecha: tiene dirección y longitud. En Unity, `Vector3` sirve tanto para posiciones (un punto) como para desplazamientos y velocidades (una flecha).

## Restar: de A hacia B
~~~
Vector3 jugador = new Vector3(4, 0, 3);
Vector3 enemigo = Vector3.zero;

Vector3 haciaJugador = jugador - enemigo;   // (4, 0, 3)
float distancia = haciaJugador.magnitude;   // 5
~~~

Regla para no confundirte: **destino − origen**.

## Longitud y dirección
| Propiedad | Qué da | Coste |
| --- | --- | --- |
| `v.magnitude` | Longitud: √(x² + y² + z²) | Una raíz cuadrada |
| `v.sqrMagnitude` | Longitud al cuadrado: x² + y² + z² | Barato |
| `v.normalized` | Misma dirección, longitud 1 | Una raíz y una división |

Para saber si algo está **a menos de 10 metros** no necesitas la raíz:

~~~
bool cerca = (b - a).sqrMagnitude <= 10f * 10f;
~~~

Para obtener la dirección dividimos por la longitud. Si la longitud es 0 (los dos puntos coinciden), dividir daría `NaN`, que contamina todo lo que toca. Protégete:

~~~
Vector3 d = b - a;
float len = d.magnitude;
Vector3 dir = len > 0.00001f ? d / len : Vector3.zero;
~~~

## Interpolación lineal (Lerp)
`Lerp(a, b, t)` devuelve el punto que está a una fracción `t` del camino entre `a` y `b`:

~~~
a + (b - a) * t       // t = 0 → a,  t = 1 → b,  t = 0.5 → la mitad
~~~

**InverseLerp** hace la pregunta contraria: ¿en qué fracción del camino está este valor?

~~~
t = (valor - a) / (b - a)     // cuidado si a == b: división por cero
~~~

Con las dos juntas haces un **remap**, pasar de un rango a otro: primero InverseLerp en el rango de origen, luego Lerp en el de destino. Se usa en todas partes:

- Vida 0–100 → barra 0–1.
- Distancia 0–30 m → volumen 1–0.
- Nivel 1–50 → enemigos por oleada 3–40.

Para limitar `t` entre 0 y 1 sin `Mathf.Clamp01`: `t < 0 ? 0 : t > 1 ? 1 : t`.

## Producto punto
~~~
float d = Vector3.Dot(a, b);    // a.x*b.x + a.y*b.y + a.z*b.z
~~~

Si `a` y `b` miden 1, el resultado es el **coseno del ángulo** entre ellos:

| Dot | Ángulo | Significado |
| --- | --- | --- |
| 1 | 0° | Misma dirección |
| 0,7 | 45° | Bastante de frente |
| 0 | 90° | Perpendicular |
| −1 | 180° | Opuestos |

Así se responde "¿está delante de mí?" sin calcular ángulos:

~~~
Vector3 alObjetivo = (objetivo - yo).normalized;
bool delante = Vector3.Dot(miForward.normalized, alObjetivo) > 0f;
~~~

Para un **cono de visión** de apertura total `A` grados, el objetivo está dentro si el punto es mayor o igual que `cos(A / 2)`. Recuerda que `Mathf.Cos` trabaja en **radianes**: multiplica por `Mathf.Deg2Rad`. Calcula el coseno una vez; es mucho más barato que llamar a `Vector3.Angle`, que internamente usa `Acos`.

## Antes de los retos
- **m-1:** `Direccion` debe devolver `Vector3.zero` cuando los puntos coinciden. `EnAlcance` sin raíz.
- **m-2:** implementa las fórmulas a mano y piensa qué pasa si `a == b`.
- **m-3:** normaliza la dirección del guardia, comprueba primero la distancia y cuida el caso del objetivo en la misma posición.
