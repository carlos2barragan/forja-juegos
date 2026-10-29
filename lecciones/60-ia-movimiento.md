---
id: l-ia-movimiento
grupo: ia
min: 14
titulo: Moverse con inteligencia: patrullas, steering y A*
resumen: Recorrer puntos sin perder distancia, perseguir y frenar con fuerzas, y encontrar el camino más corto en un mapa.
practica: ia-1, ia-2, ia-3
clave:
- Mueve por distancia: si llegas a un punto con distancia sobrante, sigue hacia el siguiente.
- Steering: fuerza = velocidad deseada − velocidad actual.
- Arrival: dentro del radio de frenado, la rapidez deseada baja en proporción a la distancia.
- A* = coste recorrido + heurística; con Manhattan en 4 direcciones encuentra el camino óptimo.
---
## Patrullas por distancia
Un guardia avanza `velocidad × dt` metros cada fotograma. Si el siguiente punto está a 0,3 m y le tocan 1 m, el error habitual es pararse en el punto y perder los 0,7 m restantes. Con fotogramas lentos, el guardia "frena" en cada esquina.

La forma correcta es un bucle que gasta la distancia disponible:

~~~
float restante = velocidad * dt;
while (restante > 0f)
{
    Vector3 falta = puntos[destino] - posicion;
    float dist = falta.magnitude;
    if (dist > restante)
    {
        posicion += falta / dist * restante;
        break;
    }
    posicion = puntos[destino];
    restante -= dist;
    destino = SiguienteIndice();
}
~~~

Cuidado con un bucle infinito: si todos los puntos están en el mismo sitio, `dist` es 0 siempre y `restante` nunca baja. Protégete (con un solo punto, no te muevas).

Para **ida y vuelta** guarda un sentido (+1 o −1) y dale la vuelta al llegar a un extremo. Para **bucle**, `(destino + 1) % puntos.Count`.

En 3D con obstáculos, Unity tiene `NavMeshAgent`, que hace todo esto sobre una malla de navegación.

## Steering behaviors
Craig Reynolds propuso en 1999 mover agentes con **fuerzas** en lugar de fijar su velocidad. Cada comportamiento calcula una velocidad deseada y devuelve la diferencia:

~~~
Vector3 deseada = (objetivo - pos).normalized * maxVel;
Vector3 fuerza = deseada - vel;          // "buscar" (seek)
~~~

- **Huir** (flee): igual, con la dirección invertida.
- **Llegar** (arrival): igual que buscar, pero dentro de un radio de frenado la rapidez deseada es `maxVel × distancia / radio`. Así llega a 0 justo en el objetivo, sin pasarse y oscilar.

El agente aplica la fuerza a su velocidad (limitándola a un máximo), y la velocidad a su posición, como en la lección de física.

~~~
Vector3 Limitar(Vector3 v, float max)
{
    float m = v.magnitude;
    return m > max ? v / m * max : v;
}
~~~

Lo potente es **sumar** comportamientos con pesos: separación + alineación + cohesión dan un **flocking** de pájaros o peces.

## Búsqueda de caminos con A*
En un mapa de casillas, A* encuentra el camino más corto explorando primero las casillas más prometedoras. Para cada casilla `n`:

- `g(n)`: coste real desde el inicio.
- `h(n)`: estimación de lo que falta (la **heurística**).
- `f(n) = g(n) + h(n)`: prioridad en la lista abierta.

~~~
abierta ← { inicio }
mientras abierta no esté vacía:
    actual ← la de menor f
    si actual == fin: reconstruir el camino y terminar
    para cada vecino libre:
        g_nuevo = g[actual] + 1
        si g_nuevo < g[vecino]:
            g[vecino] = g_nuevo
            vinoDe[vecino] = actual
            añadir vecino a abierta con prioridad g_nuevo + h(vecino)
~~~

- Para reconstruir el camino, sigue `vinoDe` desde el final hasta el inicio y dale la vuelta.
- Con movimiento en 4 direcciones y coste 1, la **distancia Manhattan** `|dx| + |dy|` nunca sobreestima, así que A* devuelve el camino óptimo.

## La cola de prioridad
Buscar "la de menor f" recorriendo una lista es lento en mapas grandes: en 200×200 hay 40 000 casillas. .NET trae `PriorityQueue<TElemento, TPrioridad>`:

~~~
var abierta = new PriorityQueue<Vector2Int, int>();
abierta.Enqueue(inicio, 0);
while (abierta.TryDequeue(out var actual, out _)) { /* ... */ }
~~~

No permite cambiar la prioridad de algo ya dentro. El truco: vuelve a encolarlo con la nueva prioridad, y al sacar uno que ya cerraste, sáltalo.

| Algoritmo | Usa heurística | Cuándo |
| --- | --- | --- |
| BFS | No | Todos los pasos cuestan lo mismo |
| Dijkstra | No | Costes distintos, varios destinos |
| A* | Sí | Un destino concreto, rápido |

## Antes de los retos
- **ia-1:** las pruebas usan un dt grande que cruza varios puntos de golpe.
- **ia-2:** comprueba el caso de estar ya en el objetivo (dirección cero) en `Llegar`.
- **ia-3:** valida límites y casillas bloqueadas antes de empezar; null si no hay camino.
