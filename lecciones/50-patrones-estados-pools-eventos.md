---
id: l-patrones-flujo
grupo: patrones
min: 13
titulo: Máquinas de estados, pools y bus de eventos
resumen: Tres patrones que aparecen en casi todos los juegos: controlar comportamientos, reutilizar objetos y comunicar sistemas lejanos.
practica: p-1, p-2, p-3
clave:
- Una máquina de estados tiene un estado activo; cambiar llama a Salir del viejo y a Entrar del nuevo.
- Las transiciones globales (morir, aturdido) se comprueban antes que las del estado actual.
- Un pool evita crear y destruir: sacas, usas y devuelves; menos basura, menos tirones.
- Al publicar un evento, recorre una copia de la lista de suscriptores.
---
## Máquina de estados finita
Un personaje con banderas sueltas (`saltando`, `atacando`, `agachado`, `muerto`) acaba con combinaciones imposibles: ¿atacar mientras está muerto? Una **máquina de estados** garantiza que solo hay **un** estado activo.

~~~
public interface IEstado
{
    void Entrar();
    void Actualizar(float dt);
    void Salir();
}
~~~

Cada estado sabe qué hacer mientras está activo. La máquina decide **cuándo** cambiar mediante **transiciones**: pares (destino, condición).

~~~
class Transicion
{
    public IEstado Hacia;
    public Func<bool> Condicion;
}

// Una lista de transiciones por estado de origen:
Dictionary<IEstado, List<Transicion>> transiciones = new();
~~~

En cada actualización:

1. Mira las transiciones **globales** (válidas desde cualquier estado).
2. Si ninguna se cumple, mira las del estado actual.
3. Aplica **la primera** que se cumpla y para.
4. Ejecuta el estado activo.

Detalles que conviene cuidar:

- Cambiar al mismo estado no debe llamar a `Salir` y `Entrar` (reiniciaría animaciones).
- Una transición global hacia "muerto" estando ya muerto cumpliría su condición cada fotograma; el punto anterior te protege.
- El `Animator` de Unity es una máquina de estados visual con la misma idea.

`Func<bool>` es un delegado que no recibe nada y devuelve `bool`: `() => vida <= 0`.

## Object pooling
`Instantiate` y `Destroy` asignan y liberan memoria. Con cientos de balas por segundo, el recolector de basura salta en mitad de la partida y el juego da un tirón. Un **pool** guarda objetos inactivos para reutilizarlos.

~~~
public class PoolDeBalas
{
    readonly Stack<Bala> libres = new();
    readonly HashSet<Bala> enUso = new();

    public Bala Sacar()
    {
        Bala b = libres.Count > 0 ? libres.Pop() : new Bala();
        enUso.Add(b);
        b.Activar();
        return b;
    }

    public void Devolver(Bala b)
    {
        if (!enUso.Remove(b)) throw new InvalidOperationException("Esa bala no salió de este pool");
        b.Desactivar();
        libres.Push(b);
    }
}
~~~

- El `HashSet` de objetos en uso detecta devoluciones dobles, que son bugs silenciosos: el mismo objeto saldría dos veces a la vez.
- Un máximo de inactivos evita que el pool crezca sin fin tras un pico.
- **Precalentar** crea objetos al cargar el nivel, cuando un tirón no se nota.

Para que una clase genérica acepte solo tipos referencia: `class Pool<T> where T : class`. Unity trae su propio `UnityEngine.Pool.ObjectPool<T>` con una API parecida.

## Bus de eventos
Con eventos normales (`vida.AlMorir += ...`) quien escucha necesita una referencia al que emite. Un **bus** desacopla del todo: cualquiera publica un mensaje de un tipo, y cualquiera se suscribe a ese tipo.

~~~
public struct EnemigoMuerto { public int puntos; }

bus.Suscribir<EnemigoMuerto>(e => marcador += e.puntos);
bus.Publicar(new EnemigoMuerto { puntos = 50 });
~~~

Por dentro es un diccionario de **tipo → lista de manejadores**:

~~~
Dictionary<Type, List<Delegate>> manejadores = new();
// typeof(T) da la clave; un Delegate se convierte con (Action<T>)d
~~~

Tres trampas:

- **Modificar mientras recorres.** Si un manejador se desuscribe durante `Publicar`, la lista cambia mientras la recorres y `foreach` lanza una excepción. Recorre una **copia**: `lista.ToArray()`.
- **Un manejador que falla** no debe impedir que los demás reciban el evento. Captura la excepción de cada uno con `try/catch` y regístrala.
- **Duplicados.** Si te suscribes dos veces sin querer, recibirías el evento dos veces. Comprueba con `Contains` antes de añadir.

El precio del bus es que cuesta seguir quién reacciona a qué. Úsalo para sistemas que de verdad no deben conocerse (UI, audio, logros, analíticas), no para todo.

## Antes de los retos
- **p-1:** globales primero, una sola transición por llamada, y nada si el destino es el estado actual.
- **p-2:** cuenta `Creados`, `Activos` e `Inactivos` y lanza `InvalidOperationException` en devoluciones inválidas.
- **p-3:** clave por tipo exacto, copia antes de recorrer y `Debug.LogError` si un manejador lanza.
