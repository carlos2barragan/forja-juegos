---
id: l-csharp-clases
grupo: csharp
min: 10
titulo: Clases, propiedades y colecciones en C#
resumen: Encapsular el estado de un personaje con propiedades y guardar un inventario en un Dictionary.
practica: cs-1, cs-2
clave:
- Un campo privado con una propiedad pública protege las reglas de tu objeto.
- "{ get; private set; }" se lee desde fuera pero solo se cambia desde dentro.
- Valida todo antes de cambiar nada: una operación que falla no debe dejar el objeto a medias.
- TryGetValue busca en un Dictionary una sola vez y no lanza excepciones.
---
C# es el lenguaje de Unity. Es **tipado** (cada variable tiene un tipo fijo) y **orientado a objetos**: agrupas datos y comportamiento en clases.

## Una clase con reglas
Una clase no es solo un saco de variables. Su trabajo es **no quedar nunca en un estado imposible**. Una vida de −30 o de 500 sobre 100 es un bug esperando a pasar.

~~~
public class Mana
{
    public int Maximo { get; }                 // solo se fija en el constructor
    public int Actual { get; private set; }    // se lee fuera, se escribe dentro

    public Mana(int maximo)
    {
        Maximo = maximo;
        Actual = maximo;
    }

    public bool Gastar(int coste)
    {
        if (coste <= 0 || coste > Actual) return false;
        Actual -= coste;
        return true;
    }
}
~~~

- `{ get; }` sin setter: la propiedad solo puede asignarse en el constructor.
- `{ get; private set; }`: cualquiera puede leer `mana.Actual`, pero solo la clase lo cambia.
- Si `Actual` fuera un campo público, cualquier script podría escribir `mana.Actual = 9999`.

## Propiedades calculadas
Algunas propiedades no guardan nada: se calculan al leerlas.

~~~
public bool Vacio => Actual == 0;
public float Porcentaje => (float)Actual / Maximo;
~~~

Fíjate en el `(float)`: `Actual / Maximo` entre enteros da **0** casi siempre. La división entera es uno de los bugs más comunes en barras de vida.

## Limitar valores
| Herramienta | Qué hace |
| --- | --- |
| `Math.Max(0, x)` | Nunca baja de 0 |
| `Math.Min(max, x)` | Nunca pasa de max |
| `Math.Clamp(x, 0, max)` | Las dos cosas a la vez |
| `Mathf.Clamp(x, 0, max)` | Lo mismo en Unity, con float |

## Dictionary: buscar por clave
Un inventario apilable es un mapa de nombre a cantidad. `Dictionary<TKey, TValue>` busca en tiempo constante.

~~~
var precios = new Dictionary<string, int>();
precios["espada"] = 100;                         // añade o sobrescribe
precios.ContainsKey("escudo");                   // false
if (precios.TryGetValue("espada", out int p))    // una sola búsqueda
    Debug.Log(p);
precios.Remove("espada");
int tipos = precios.Count;
~~~

- Leer `precios["escudo"]` si no existe lanza `KeyNotFoundException`. Usa `TryGetValue` o `GetValueOrDefault`.
- `Count` dice cuántas **claves** hay, no la suma de los valores.

## Validar antes de cambiar
Cuando una operación puede fallar, comprueba todas las condiciones primero y solo después modifica el estado. Si quitar 5 pociones falla porque tienes 3, el inventario debe seguir con 3, no con −2 ni con 0.

~~~
public bool Pagar(int precio)
{
    if (precio <= 0 || precio > oro) return false;   // 1. validar
    oro -= precio;                                    // 2. cambiar
    return true;
}
~~~

Devolver `bool` le dice a quien llama si funcionó, sin lanzar excepciones en el bucle del juego.

## Antes del reto
- **cs-1** es encapsulación pura: propiedades, límites y valores negativos.
- **cs-2** añade el Dictionary y la regla de huecos: un tipo nuevo ocupa hueco y uno que llega a 0 lo libera.
