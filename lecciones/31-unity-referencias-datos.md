---
id: l-unity-referencias
grupo: unity
min: 13
titulo: GetComponent, ScriptableObjects y prefabs
resumen: Cómo se encuentran los componentes entre sí, cómo separar datos de diseño del código y cómo crear y destruir objetos sin fugas.
practica: u-4, u-5, u-6
clave:
- Llama a GetComponent una vez en Awake y guarda el resultado; no lo hagas en cada Update.
- Lo que te suscribes en OnEnable, lo desuscribes en OnDisable.
- Un ScriptableObject es un asset compartido: léelo, pero no lo cambies durante la partida.
- Tras Destroy, una referencia de Unity compara igual a null aunque el objeto C# siga existiendo.
---
## Encontrar otros componentes
Los componentes de un mismo GameObject colaboran. Para hablar con otro, pide una referencia:

~~~
[RequireComponent(typeof(Animator))]
public class Pasos : MonoBehaviour
{
    Animator animator;

    void Awake()
    {
        animator = GetComponent<Animator>();   // una vez
    }
}
~~~

- `GetComponent` busca entre los componentes: es barato, pero no gratis. **Cachéalo.**
- `[RequireComponent]` hace que Unity añada el componente si falta y no te deje quitarlo.
- Para buscar en hijos: `GetComponentInChildren<T>()`. Entre objetos distintos, mejor arrastrar la referencia en el inspector.

## Suscribirse bien
Cuando un componente escucha un evento de otro, el evento guarda una referencia a él. Si el que escucha se destruye sin desuscribirse, el evento seguirá llamándolo: errores de "objeto destruido" y memoria que no se libera.

~~~
void OnEnable()
{
    puntuacion.AlCambiar += Mostrar;
    Mostrar(puntuacion.Actual);       // pinta el valor de ahora, sin esperar al primer cambio
}

void OnDisable()
{
    puntuacion.AlCambiar -= Mostrar;
}
~~~

`OnEnable`/`OnDisable` son pareja: un objeto que se desactiva y reactiva se suscribe una sola vez cada vez.

Recuerda la división entera: `actual / maxima` con dos `int` da 0. Usa `(float)actual / maxima`.

## ScriptableObjects: datos de diseño
Un `ScriptableObject` es una clase cuyas instancias se guardan como **assets** en el proyecto. Sirven para datos que comparten muchos objetos: estadísticas de armas, enemigos, objetos de tienda.

~~~
[CreateAssetMenu(fileName = "NuevoEnemigo", menuName = "Juego/Enemigo")]
public class DatosEnemigo : ScriptableObject
{
    public string nombre;
    [Min(1)] public int vida = 50;
    [Range(0.1f, 10f)] public float velocidad = 3f;

    public float TiempoParaCruzar(float metros) => metros / velocidad;

    void OnValidate()                       // se llama al cambiar valores en el inspector
    {
        if (vida < 1) vida = 1;
        velocidad = Mathf.Clamp(velocidad, 0.1f, 10f);
    }
}
~~~

Ventajas: el diseñador crea "Orco", "Goblin" y "Troll" desde el menú **Assets → Create**, ajusta números sin tocar código, y cien enemigos comparten un solo asset en memoria.

La regla de oro: **el estado que cambia vive en el MonoBehaviour**, no en el ScriptableObject.

~~~
public class Enemigo : MonoBehaviour
{
    public DatosEnemigo datos;
    int vida;                              // copia propia

    void Start() { vida = datos.vida; }
    public void Golpe(int d) { vida -= d; } // nunca datos.vida -= d
}
~~~

Si restas a `datos.vida`, **todos** los orcos pierden vida a la vez y, en el editor, el cambio se queda guardado en el asset al salir del modo Play.

## Prefabs, Instantiate y Destroy
Un **prefab** es un GameObject guardado como plantilla. `Instantiate` crea una copia en la escena:

~~~
public Moneda prefabMoneda;

void Soltar()
{
    Moneda m = Instantiate(prefabMoneda, transform.position, Quaternion.identity);
}
~~~

`Destroy(obj)` no destruye en el acto: lo marca y Unity lo elimina **al final del fotograma**.

## El "null falso"
Los objetos de Unity tienen dos mitades: el objeto C# que tú ves y el objeto nativo del motor. Tras `Destroy`, el nativo desaparece pero tu variable C# sigue apuntando al objeto C#. Unity sobrescribe `==` para que esa referencia **compare igual a null**:

~~~
Destroy(moneda.gameObject);
// al siguiente fotograma:
moneda == null      // true
moneda is null      // false: el objeto C# sigue ahí
moneda?.Recoger()   // ¡no protege! ?. no usa el == de Unity
~~~

Por eso, para limpiar una lista de objetos que pueden haber sido destruidos, compara con `==`:

~~~
monedas.RemoveAll(m => m == null);
~~~

## Antes de los retos
- **u-4:** `GetComponent` en `Awake`, suscripción en `OnEnable`, baja en `OnDisable`, división con float.
- **u-5:** el arma copia las balas del asset en `Start` y nunca escribe en `datos`.
- **u-6:** limpia la lista antes de decidir si crear otro, y mide el intervalo desde el último clon.
