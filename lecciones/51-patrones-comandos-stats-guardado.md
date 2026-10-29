---
id: l-patrones-datos
grupo: patrones
min: 13
titulo: Comandos, estadísticas y guardado de partida
resumen: Deshacer acciones, calcular estadísticas con bonificaciones sin recalcular de más y guardar partidas que sobrevivan a una actualización del juego.
practica: p-4, p-5, p-6
clave:
- Un comando es una acción convertida en objeto: se puede guardar, deshacer, repetir y enviar.
- Ejecutar algo nuevo borra el historial de rehacer.
- Una bandera de "sucio" recalcula un valor solo cuando cambia algo de lo que depende.
- Todo guardado lleva un número de versión; al cargar uno viejo, mígralo.
---
## Patrón Command
En lugar de mover la ficha directamente, crea un objeto que **sabe** moverla y **sabe** deshacerlo:

~~~
public class Rotar : IComando
{
    readonly Torre torre;
    readonly int grados;
    public Rotar(Torre torre, int grados) { this.torre = torre; this.grados = grados; }

    public void Ejecutar() => torre.Angulo += grados;
    public void Deshacer() => torre.Angulo -= grados;
}
~~~

Con las acciones convertidas en objetos puedes:

- **Deshacer y rehacer** en puzles, editores de niveles y juegos por turnos.
- **Grabar repeticiones**: guardas la lista de comandos, no el vídeo.
- **Jugar en red de forma determinista**: envías comandos, no posiciones (así funcionan muchos juegos de estrategia).
- **Reasignar controles**: una tecla ejecuta un comando, no una función concreta.

## Historial con dos pilas
~~~
Stack<IComando> deshacer = new();
Stack<IComando> rehacer = new();
~~~

| Acción | Qué pasa |
| --- | --- |
| Ejecutar | Ejecuta, apila en deshacer, **vacía** rehacer |
| Deshacer | Saca de deshacer, llama a Deshacer, apila en rehacer |
| Rehacer | Saca de rehacer, llama a Ejecutar, apila en deshacer |

¿Por qué vaciar rehacer? Si deshaces tres pasos y luego haces algo nuevo, aquellos tres pasos partían de un estado que ya no existe.

Para limitar el historial a N pasos y olvidar el **más antiguo**, una `Stack` no sirve: el más antiguo está al fondo. Usa una `LinkedList<IComando>` (`AddLast`, `RemoveLast`, `RemoveFirst`) o una lista.

## Estadísticas con modificadores
La fuerza final de un personaje sale de su base más el equipo, las pociones y los talentos. Hay varias clases de bonificación, y el **orden** en que se aplican cambia el balance:

~~~
final = (base + Σ planos) × (1 + Σ porcentajes sumados) × Π (1 + porcentajes multiplicativos)
~~~

- Dos anillos de +10 % **sumados** dan +20 %.
- Dos anillos de +10 % **multiplicativos** dan +21 %. Con muchos, crecen sin control: por eso los diseñadores reservan los multiplicativos para pocas fuentes.

Cada modificador recuerda su **fuente** (la espada, la poción). Al quitarte la espada, quitas todos los modificadores de esa fuente de una vez:

~~~
int quitados = lista.RemoveAll(m => m.Fuente == espada);
~~~

## La bandera de sucio
Si `Valor` recorre todos los modificadores cada vez que la UI, el combate y la IA lo leen, el coste se multiplica. Guarda el resultado y recalcula solo cuando cambie algo:

~~~
float cache;
bool sucio = true;

public float Valor
{
    get
    {
        if (sucio) { cache = Calcular(); sucio = false; }
        return cache;
    }
}

public void Agregar(Modificador m) { lista.Add(m); sucio = true; }
~~~

Marca `sucio = true` en **todo** lo que cambie el resultado, incluido el setter de `Base`. Y si `Quitar` no encontró nada, no hace falta marcarlo.

## Guardar partida
`JsonUtility` convierte un objeto `[Serializable]` en JSON y de vuelta:

~~~
string json = JsonUtility.ToJson(partida);
Partida p = JsonUtility.FromJson<Partida>(json);
~~~

Sus reglas: solo serializa **campos públicos** o con `[SerializeField]`; ignora propiedades, diccionarios y campos que no existan en la clase.

## Versionar los guardados
Tu juego sale, la gente guarda, y en la versión 1.1 cambias un campo de nombre. Si no lo planeas, todos pierden su partida. La solución:

1. Todo guardado tiene un campo `version`.
2. Al cargar, lee **primero solo la versión** con una clase pequeña que tenga ese campo.
3. Según la versión, deserializa con la clase que corresponda y **migra** al formato actual.

~~~
[Serializable] class SoloVersion { public int version; }

var v = JsonUtility.FromJson<SoloVersion>(json).version;
~~~

Y una regla de oro: **un guardado corrupto nunca debe cerrar el juego**. Envuelve la carga en `try/catch` y, si falla, empieza una partida nueva (y avisa al jugador). En disco, escribe primero a un archivo temporal y renómbralo: si el juego se cierra a mitad, el guardado anterior sigue intacto.

## Antes de los retos
- **p-4:** el comando guarda el delta para poder restarlo; el historial descarta el más antiguo.
- **p-5:** las pruebas leen `Recalculos`: si lees `Valor` dos veces sin cambios, debe calcular una sola.
- **p-6:** null, vacío y JSON roto devuelven una partida nueva sin lanzar excepciones.
