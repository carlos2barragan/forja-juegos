// Unity: MonoBehaviour, ciclo de vida, Input, Time, corrutinas, componentes, ScriptableObjects y prefabs.
// Las pruebas usan UnityEngine.Simulacion.Motor, que llama a Awake/Start/Update como Unity.
const track = { id: 'unity', name: 'Unity: componentes y ciclo de vida', lang: 'csharp', color: '#FFB45E', blurb: 'MonoBehaviour, Update y deltaTime, corrutinas, GetComponent, ScriptableObjects y prefabs.' };

const challenges = [
  {
    id: 'u-1', level: 1, title: 'Mover al jugador con Input',
    brief: `Escribe un componente **MovimientoJugador : MonoBehaviour** para un juego visto desde arriba.
- Campo público **velocidad** (float, por defecto 5) en unidades por segundo.
- En **Update**, lee **Input.GetAxisRaw("Horizontal")** (eje X) y **Input.GetAxisRaw("Vertical")** (eje Z).
- Mueve **transform.position** en el plano XZ.
- En diagonal **no** debe ir más rápido que en recto.
- Debe recorrer la misma distancia a 30 FPS que a 144 FPS.`,
    starter: `using UnityEngine;

public class MovimientoJugador : MonoBehaviour
{
    public float velocidad = 5f;

    void Update()
    {
        // tu código aquí
    }
}
`,
    solution: `using UnityEngine;

public class MovimientoJugador : MonoBehaviour
{
    public float velocidad = 5f;

    void Update()
    {
        var entrada = new Vector3(Input.GetAxisRaw("Horizontal"), 0f, Input.GetAxisRaw("Vertical"));
        entrada = Vector3.ClampMagnitude(entrada, 1f);
        transform.position += entrada * velocidad * Time.deltaTime;
    }
}
`,
    checks: [
      [/class\s+MovimientoJugador\s*:\s*MonoBehaviour/, 'Es un MonoBehaviour', 'Hereda de MonoBehaviour para poder añadirlo a un GameObject.'],
      [/GetAxis(Raw)?\s*\(\s*"Horizontal"\s*\)/, 'Lees el eje horizontal', 'Input.GetAxisRaw("Horizontal").'],
      [/GetAxis(Raw)?\s*\(\s*"Vertical"\s*\)/, 'Lees el eje vertical', 'Input.GetAxisRaw("Vertical").'],
      [/Time\.deltaTime/, 'Multiplicas por Time.deltaTime', 'Sin deltaTime, el jugador va más rápido en ordenadores más potentes.', 3],
      [/ClampMagnitude|normalized|Normalize/, 'Corriges la diagonal', 'Vector3.ClampMagnitude(entrada, 1f) evita que la diagonal sea √2 veces más rápida.', 2],
    ],
    hints: ['(1, 0, 1) mide 1,41: por eso las diagonales "corren más".', 'ClampMagnitude es mejor que normalized con mandos analógicos: respeta los valores pequeños del stick.'],
    learn: ['Update y Time.deltaTime', 'Input Manager vs nuevo Input System', 'Por qué normalizar o limitar la entrada'],
    search: ['"unity Time.deltaTime"', '"unity diagonal movement faster fix"', 'docs.unity3d.com Input.GetAxisRaw'],
    test: `
var j = Motor.Crear<MovimientoJugador>();
Motor.Eje("Horizontal", 1);
Motor.Avanzar(1f);
Check("1 s a la derecha recorre 5 unidades", () => Cerca(j.transform.position, new Vector3(5, 0, 0), 0.01f));
Motor.Eje("Horizontal", 0); Motor.Eje("Vertical", -1);
Motor.Avanzar(0.5f);
Check("el eje vertical mueve en Z", () => Cerca(j.transform.position, new Vector3(5, 0, -2.5f), 0.01f));
var d = Motor.Crear<MovimientoJugador>();
Motor.Eje("Horizontal", 1); Motor.Eje("Vertical", 1);
Motor.Avanzar(1f);
Check("en diagonal recorre 5, no 7,07", () => Cerca(d.transform.position.magnitude, 5, 0.02f));
Motor.Eje("Horizontal", 0); Motor.Eje("Vertical", 0);
var a = Motor.Crear<MovimientoJugador>(); Motor.Eje("Horizontal", 1); Motor.Avanzar(1f, 30);
var b = Motor.Crear<MovimientoJugador>(); Motor.Avanzar(1f, 144);
Check("independiente de los FPS (30 vs 144)", () => Cerca(a.transform.position.x - 5, b.transform.position.x, 0.05f));
var r = Motor.Crear<MovimientoJugador>(); r.velocidad = 2; Motor.Avanzar(1f);
Check("respeta el campo velocidad", () => Cerca(r.transform.position.x, 2, 0.01f));
`,
  },
  {
    id: 'u-2', level: 1, title: 'Cadencia de disparo',
    brief: `Un arma automática dispara mientras se mantiene **Fire1**, pero como mucho una vez cada **cadencia** segundos.
Escribe **Arma : MonoBehaviour**:
- Campo público **cadencia** (float, 0.25 por defecto).
- Propiedad **Disparos** (int) que cuenta los disparos, de solo lectura desde fuera.
- El primer disparo sale **en el mismo fotograma** en que se pulsa.
- La cadencia no puede depender de los FPS: usa **Time.time** o un temporizador con Time.deltaTime.`,
    starter: `using UnityEngine;

public class Arma : MonoBehaviour
{
    public float cadencia = 0.25f;

    void Update()
    {
        // tu código aquí
    }
}
`,
    solution: `using UnityEngine;

public class Arma : MonoBehaviour
{
    public float cadencia = 0.25f;
    public int Disparos { get; private set; }

    float proximoDisparo;

    void Update()
    {
        if (Input.GetButton("Fire1") && Time.time >= proximoDisparo)
        {
            Disparar();
            proximoDisparo = Time.time + cadencia;
        }
    }

    void Disparar()
    {
        Disparos++;
    }
}
`,
    checks: [
      [/GetButton\s*\(\s*"Fire1"\s*\)/, 'Mantener Fire1 dispara', 'Input.GetButton("Fire1") es true mientras se mantiene pulsado.'],
      [/Time\.time|Time\.deltaTime/, 'Usas el tiempo de Unity', 'Guarda el momento del próximo disparo con Time.time.', 2],
      [/Disparos\s*\{\s*get;\s*private\s+set;/, 'Disparos es de solo lectura', 'public int Disparos { get; private set; }'],
      [/>=\s*proximo|proximo\w*\s*<=|>=\s*cadencia|<=\s*0/, 'Comparas con el próximo momento permitido', 'if (Time.time >= proximoDisparo) { ... }', 2],
    ],
    hints: ['Guarda "cuándo podré volver a disparar" en vez de "cuánto falta".', 'GetButtonDown solo es true un fotograma: para un arma automática usa GetButton.'],
    learn: ['Time.time vs Time.deltaTime', 'GetButton, GetButtonDown y GetButtonUp', 'Temporizadores en Update'],
    search: ['"unity fire rate cooldown"', '"unity GetButton vs GetButtonDown"', 'docs.unity3d.com Time.time'],
    test: `
var a = Motor.Crear<Arma>();
Motor.Fotograma();
Check("sin pulsar no dispara", () => a.Disparos == 0);
Motor.Pulsar(KeyCode.Mouse0);
Motor.Fotograma();
Check("dispara en el fotograma en que se pulsa", () => a.Disparos == 1);
Motor.Avanzar(59f / 60f);
Check("4 disparos en 1 s con cadencia 0.25", () => a.Disparos == 4);
Motor.Soltar(KeyCode.Mouse0);
Motor.Avanzar(1f);
Check("al soltar deja de disparar", () => a.Disparos == 4);
var b = Motor.Crear<Arma>(); Motor.Fotograma();
Motor.Pulsar(KeyCode.Mouse0); Motor.Avanzar(1f, 240);
Check("a 240 FPS dispara lo mismo", () => b.Disparos == 4);
Motor.Soltar(KeyCode.Mouse0);
var c = Motor.Crear<Arma>(); c.cadencia = 0.5f; Motor.Fotograma();
Motor.Pulsar(KeyCode.Mouse0); Motor.Avanzar(1f, 20);
Check("respeta el campo cadencia", () => c.Disparos == 2);
Motor.Soltar(KeyCode.Mouse0);
Check("Disparos no tiene setter público", () => typeof(Arma).GetProperty("Disparos")?.GetSetMethod() == null);
`,
  },
  {
    id: 'u-3', level: 2, title: 'Puerta animada con corrutina',
    brief: `Una puerta sube **altura** unidades en **duracion** segundos cuando alguien llama a **Abrir()**.
Escribe **Puerta : MonoBehaviour**:
- Campos públicos **altura** (3) y **duracion** (1).
- Guarda la posición inicial en **Awake**.
- **public void Abrir()** inicia una **corrutina** que interpola la posición de forma suave fotograma a fotograma.
- Propiedades **Animando** y **Abierta** (bool).
- Llamar a Abrir() mientras se anima o si ya está abierta **no** hace nada.
- Al terminar, la posición debe ser **exactamente** la final.`,
    starter: `using System.Collections;
using UnityEngine;

public class Puerta : MonoBehaviour
{
    public float altura = 3f;
    public float duracion = 1f;

    // tu código aquí
}
`,
    solution: `using System.Collections;
using UnityEngine;

public class Puerta : MonoBehaviour
{
    public float altura = 3f;
    public float duracion = 1f;

    public bool Animando { get; private set; }
    public bool Abierta { get; private set; }

    Vector3 inicio;

    void Awake()
    {
        inicio = transform.position;
    }

    public void Abrir()
    {
        if (Animando || Abierta) return;
        StartCoroutine(Subir());
    }

    IEnumerator Subir()
    {
        Animando = true;
        Vector3 fin = inicio + Vector3.up * altura;
        float t = 0f;
        while (t < duracion)
        {
            t += Time.deltaTime;
            transform.position = Vector3.Lerp(inicio, fin, t / duracion);
            yield return null;
        }
        transform.position = fin;
        Animando = false;
        Abierta = true;
    }
}
`,
    checks: [
      [/IEnumerator\s+\w+\s*\(/, 'Declaras una corrutina', 'Una corrutina es un método que devuelve IEnumerator.', 2],
      [/StartCoroutine\s*\(/, 'La inicias con StartCoroutine', 'StartCoroutine(Subir());', 2],
      [/yield\s+return\s+null/, 'Esperas un fotograma con yield return null', 'yield return null continúa en el siguiente fotograma.', 2],
      [/void\s+Awake\s*\(/, 'Guardas la posición en Awake', 'Awake se ejecuta al crear el componente, antes de cualquier Start.'],
      [/if\s*\(\s*Animando|Animando\s*\|\||Abierta\s*\|\|/, 'Evitas iniciar dos animaciones', 'if (Animando || Abierta) return;'],
    ],
    hints: ['El bucle de la corrutina: suma Time.deltaTime, interpola, yield return null.', 'Después del bucle, fija la posición final: el último t casi nunca cae justo en duracion.'],
    learn: ['Corrutinas: IEnumerator, yield return null, WaitForSeconds', 'Corrutinas vs Update vs async', 'Qué pasa con una corrutina si desactivas el GameObject'],
    search: ['"unity coroutines tutorial"', 'docs.unity3d.com Coroutines', '"unity lerp position over time coroutine"'],
    test: `
var p = Motor.Crear<Puerta>();
Motor.Fotograma();
Check("cerrada al empezar", () => !p.Animando && !p.Abierta && p.transform.position == Vector3.zero);
p.Abrir();
Check("Animando tras Abrir()", () => p.Animando);
Motor.Avanzar(0.5f);
Check("a mitad de camino tras 0,5 s", () => Cerca(p.transform.position.y, 1.5f, 0.15f));
float y = p.transform.position.y;
p.Abrir();
Motor.Fotograma();
Check("Abrir() durante la animación no reinicia", () => p.transform.position.y > y);
Motor.Avanzar(0.6f);
Check("termina exactamente arriba", () => p.transform.position == new Vector3(0, 3, 0));
Check("Abierta y sin animar", () => p.Abierta && !p.Animando);
p.Abrir(); Motor.Avanzar(0.2f);
Check("abierta no se vuelve a mover", () => p.transform.position == new Vector3(0, 3, 0));
var go = new GameObject("puerta2"); go.transform.position = new Vector3(5, 1, 0);
var q = go.AddComponent<Puerta>(); q.duracion = 0.5f; q.altura = 2;
q.Abrir(); Motor.Avanzar(0.6f);
Check("respeta posición inicial, altura y duración", () => q.transform.position == new Vector3(5, 3, 0) && q.Abierta);
`,
  },
  {
    id: 'u-4', level: 2, title: 'GetComponent y suscribirse bien',
    brief: `El componente **Salud** (ya escrito en el código inicial, no lo cambies) lanza **AlCambiar(actual, maxima)**. Escribe **BarraDeVida : MonoBehaviour**, que vive en el mismo GameObject:
- En **Awake**, guarda la referencia a Salud con **GetComponent** (una sola vez, no en cada Update).
- En **OnEnable**, suscríbete a AlCambiar y actualiza la barra con el valor actual.
- En **OnDisable**, desuscríbete (si no, una barra destruida seguiría recibiendo eventos: fuga de memoria y errores).
- Propiedad **Relleno** (float 0–1) = actual / maxima. Cuidado con la división entera.
- Marca la clase con **[RequireComponent(typeof(Salud))]**.`,
    starter: `using UnityEngine;

public class Salud : MonoBehaviour
{
    public int maxima = 100;
    public int Actual { get; private set; }
    public event System.Action<int, int> AlCambiar;

    void Awake() { Actual = maxima; }

    public void Dañar(int d)
    {
        Actual = Mathf.Max(0, Actual - d);
        AlCambiar?.Invoke(Actual, maxima);
    }
}

public class BarraDeVida : MonoBehaviour
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public class Salud : MonoBehaviour
{
    public int maxima = 100;
    public int Actual { get; private set; }
    public event System.Action<int, int> AlCambiar;

    void Awake() { Actual = maxima; }

    public void Dañar(int d)
    {
        Actual = Mathf.Max(0, Actual - d);
        AlCambiar?.Invoke(Actual, maxima);
    }
}

[RequireComponent(typeof(Salud))]
public class BarraDeVida : MonoBehaviour
{
    public float Relleno { get; private set; } = 1f;

    Salud salud;

    void Awake()
    {
        salud = GetComponent<Salud>();
    }

    void OnEnable()
    {
        salud.AlCambiar += Actualizar;
        Actualizar(salud.Actual, salud.maxima);
    }

    void OnDisable()
    {
        salud.AlCambiar -= Actualizar;
    }

    void Actualizar(int actual, int maxima)
    {
        Relleno = maxima > 0 ? (float)actual / maxima : 0f;
    }
}
`,
    checks: [
      [/void\s+Awake\s*\(\s*\)\s*\{[^}]*GetComponent\s*<\s*Salud\s*>/, 'Cacheas GetComponent en Awake', 'Llama a GetComponent<Salud>() una vez en Awake y guárdalo en un campo.', 2],
      [/void\s+Update\s*\([^)]*\)\s*\{[^}]*GetComponent/, 'GetComponent en cada Update', 'No llames GetComponent en Update: cachea la referencia.', 1, 'no'],
      [/AlCambiar\s*\+=/, 'Te suscribes con +=', 'salud.AlCambiar += Actualizar; en OnEnable.'],
      [/AlCambiar\s*-=/, 'Te desuscribes con -=', 'salud.AlCambiar -= Actualizar; en OnDisable.', 2],
      [/\(float\)|\/\s*\(float\)|f\s*\*|\*\s*1f/, 'Evitas la división entera', '(float)actual / maxima; si no, 75 / 100 da 0.', 2],
      [/RequireComponent\s*\(\s*typeof\s*\(\s*Salud\s*\)\s*\)/, 'Usas RequireComponent', '[RequireComponent(typeof(Salud))] encima de la clase.'],
    ],
    hints: ['OnEnable/OnDisable van en pareja: lo que suscribes en uno lo desuscribes en el otro.', 'Si divides dos int, C# hace división entera.'],
    learn: ['GetComponent y por qué cachearlo', 'Awake vs OnEnable vs Start', 'Fugas por eventos sin desuscribir', 'RequireComponent'],
    search: ['"unity OnEnable OnDisable subscribe event"', '"unity cache GetComponent"', 'docs.unity3d.com Execution Order of Event Functions'],
    test: `
var go = new GameObject("heroe");
var s = go.AddComponent<Salud>();
var b = go.AddComponent<BarraDeVida>();
Motor.Fotograma();
Check("empieza llena", () => Cerca(b.Relleno, 1));
s.Dañar(25);
Check("Relleno = 0,75 tras 25 de daño (sin división entera)", () => Cerca(b.Relleno, 0.75f));
b.enabled = false;
var campo = typeof(Salud).GetField("AlCambiar", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
Check("al desactivarse se desuscribe", () => campo.GetValue(s) == null);
s.Dañar(25);
Check("desactivada no se actualiza", () => Cerca(b.Relleno, 0.75f));
b.enabled = true;
Check("al reactivarse se pone al día", () => Cerca(b.Relleno, 0.5f));
s.Dañar(10);
Check("vuelve a recibir eventos", () => Cerca(b.Relleno, 0.4f));
Object.Destroy(b); Motor.Fotograma();
Check("destruida no deja suscripciones", () => campo.GetValue(s) == null);
Check("tiene [RequireComponent(typeof(Salud))]", () => typeof(BarraDeVida).GetCustomAttributes(typeof(RequireComponent), true).Length == 1);
`,
  },
  {
    id: 'u-5', level: 3, title: 'Datos de arma en un ScriptableObject',
    brief: `Separa los **datos** del **comportamiento**:
1. **DatosArma : ScriptableObject** con **[CreateAssetMenu]** y campos públicos: **nombre** (string), **daño** (float, 10), **segundosEntreDisparos** (float, 0.5), **balasPorCargador** (int, 12).
   - Propiedad **DañoPorSegundo** = daño / segundosEntreDisparos.
   - **OnValidate()** corrige valores absurdos que alguien ponga en el inspector: daño ≥ 0, segundosEntreDisparos en [0.05, 5], balasPorCargador ≥ 1.
2. **ArmaJugador : MonoBehaviour** con campo público **datos** (DatosArma):
   - **Balas** (int, solo lectura desde fuera): en **Start** se llena con datos.balasPorCargador.
   - **bool Disparar()**: gasta una bala; false si no quedan.
   - **void Recargar()**.
   - **Nunca modifiques el ScriptableObject** en tiempo de juego: es compartido por todas las armas que lo usan.`,
    starter: `using UnityEngine;

public class DatosArma : ScriptableObject
{
    // tu código aquí
}

public class ArmaJugador : MonoBehaviour
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

[CreateAssetMenu(fileName = "NuevaArma", menuName = "Juego/Datos de arma")]
public class DatosArma : ScriptableObject
{
    public string nombre = "Pistola";
    [Min(0)] public float daño = 10f;
    [Range(0.05f, 5f)] public float segundosEntreDisparos = 0.5f;
    [Min(1)] public int balasPorCargador = 12;

    public float DañoPorSegundo => daño / segundosEntreDisparos;

    void OnValidate()
    {
        daño = Mathf.Max(0f, daño);
        segundosEntreDisparos = Mathf.Clamp(segundosEntreDisparos, 0.05f, 5f);
        balasPorCargador = Mathf.Max(1, balasPorCargador);
    }
}

public class ArmaJugador : MonoBehaviour
{
    public DatosArma datos;
    public int Balas { get; private set; }

    void Start()
    {
        Recargar();
    }

    public bool Disparar()
    {
        if (Balas <= 0) return false;
        Balas--;
        return true;
    }

    public void Recargar()
    {
        Balas = datos.balasPorCargador;
    }
}
`,
    checks: [
      [/class\s+DatosArma\s*:\s*ScriptableObject/, 'DatosArma es un ScriptableObject', 'class DatosArma : ScriptableObject'],
      [/\[\s*CreateAssetMenu/, 'Añades CreateAssetMenu', '[CreateAssetMenu(fileName = "NuevaArma", menuName = "Juego/Datos de arma")]', 2],
      [/void\s+OnValidate\s*\(/, 'Validas en OnValidate', 'OnValidate se llama al cambiar un valor en el inspector.', 2],
      [/DañoPorSegundo\s*=>/, 'Propiedad calculada DañoPorSegundo', 'public float DañoPorSegundo => daño / segundosEntreDisparos;'],
      [/datos\.balasPorCargador\s*(--|-=|\+\+|\+=|=[^=])/, 'Modificas el ScriptableObject en juego', 'Copia los valores al componente: no cambies el asset compartido.', 2, 'no'],
    ],
    hints: ['El estado de la partida (balas actuales) va en el MonoBehaviour; la configuración (balas por cargador), en el ScriptableObject.', 'En el editor, los cambios a un ScriptableObject durante Play se quedan guardados en el asset.'],
    learn: ['ScriptableObjects como datos de diseño', 'OnValidate y atributos del inspector (Range, Min, Header)', 'Por qué no mutar assets compartidos'],
    search: ['"unity ScriptableObject tutorial"', '"unity OnValidate"', 'Ryan Hipple "Game Architecture with Scriptable Objects"'],
    test: `
var d = ScriptableObject.CreateInstance<DatosArma>();
Check("valores por defecto", () => Cerca(d.daño, 10) && Cerca(d.segundosEntreDisparos, 0.5f) && d.balasPorCargador == 12);
d.daño = 20;
Check("DañoPorSegundo = 40", () => Cerca(d.DañoPorSegundo, 40));
d.daño = -5; d.segundosEntreDisparos = 0; d.balasPorCargador = -3; Motor.Validar(d);
Check("OnValidate corrige valores absurdos", () => d.daño == 0 && Cerca(d.segundosEntreDisparos, 0.05f) && d.balasPorCargador == 1);
d.segundosEntreDisparos = 99; Motor.Validar(d);
Check("OnValidate limita el máximo", () => Cerca(d.segundosEntreDisparos, 5));
Check("tiene [CreateAssetMenu]", () => typeof(DatosArma).GetCustomAttributes(typeof(CreateAssetMenuAttribute), false).Length == 1);
var datos = ScriptableObject.CreateInstance<DatosArma>(); datos.balasPorCargador = 3;
var a1 = Motor.Crear<ArmaJugador>(); a1.datos = datos;
var a2 = Motor.Crear<ArmaJugador>(); a2.datos = datos;
Motor.Fotograma();
Check("Start llena el cargador", () => a1.Balas == 3 && a2.Balas == 3);
a1.Disparar(); a1.Disparar(); a1.Disparar();
Check("sin balas no dispara", () => a1.Balas == 0 && !a1.Disparar());
Check("las armas no se afectan entre sí ni al asset", () => a2.Balas == 3 && datos.balasPorCargador == 3);
a1.Recargar();
Check("Recargar", () => a1.Balas == 3);
`,
  },
  {
    id: 'u-6', level: 3, title: 'Spawner con prefabs y el null de Unity',
    brief: `Escribe **Spawner : MonoBehaviour**, que crea enemigos de un prefab. El tipo **Bicho : MonoBehaviour** ya existe en el proyecto (no lo declares).
- Campos públicos: **prefab** (Bicho), **intervalo** (float, 1), **maxVivos** (int, 3).
- Crea un clon con **Instantiate(prefab, transform.position, Quaternion.identity)** en el primer fotograma y luego cada *intervalo* segundos, **solo si** hay menos de maxVivos vivos.
- Lleva una lista de los que creaste. Cuando otro código destruye un Bicho con **Destroy**, la referencia en tu lista pasa a valer **== null** (el "null falso" de Unity): límpiala.
- Propiedad **Vivos** (int) con los que siguen vivos.
- El intervalo cuenta desde el último clon creado.`,
    starter: `using System.Collections.Generic;
using UnityEngine;

public class Spawner : MonoBehaviour
{
    public Bicho prefab;
    public float intervalo = 1f;
    public int maxVivos = 3;

    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;
using UnityEngine;

public class Spawner : MonoBehaviour
{
    public Bicho prefab;
    public float intervalo = 1f;
    public int maxVivos = 3;

    readonly List<Bicho> vivos = new List<Bicho>();
    float siguiente;

    public int Vivos
    {
        get
        {
            vivos.RemoveAll(b => b == null);
            return vivos.Count;
        }
    }

    void Update()
    {
        if (Time.time < siguiente || Vivos >= maxVivos) return;
        vivos.Add(Instantiate(prefab, transform.position, Quaternion.identity));
        siguiente = Time.time + intervalo;
    }
}
`,
    checks: [
      [/Instantiate\s*\(\s*prefab/, 'Instancias el prefab', 'Instantiate(prefab, transform.position, Quaternion.identity).', 2],
      [/RemoveAll\s*\([^)]*==\s*null|==\s*null|!\s*\w+\s*\)/, 'Limpias los destruidos comparando con null', 'vivos.RemoveAll(b => b == null) quita los que Unity ya destruyó.', 2],
      [/maxVivos/, 'Respetas el máximo', 'Antes de crear, comprueba Vivos < maxVivos.'],
      [/Time\.time|Time\.deltaTime/, 'Usas el tiempo', 'Guarda el momento del siguiente spawn.'],
      [/\?\.|\?\?/, 'Usas ?. o ?? con objetos de Unity', '?. y ?? no respetan el null falso de Unity: usa == null.', 1, 'no'],
    ],
    hints: ['Un objeto destruido sigue existiendo para C#, pero Unity sobrecarga == para que valga null.', 'Por eso ?. y ?? (que no usan ==) pueden fallar con objetos destruidos.'],
    learn: ['Prefabs e Instantiate', 'Destroy y el "fake null" de Unity', 'Object pooling como siguiente paso (ruta Patrones)'],
    search: ['"unity fake null"', '"unity null check destroyed object"', 'blog.unity.com "Custom == operator, should we keep it"'],
    testExtra: `public class Bicho : MonoBehaviour { public int vida = 1; }`,
    test: `
var prefab = Motor.Prefab<Bicho>("Bicho", b => b.vida = 7);
var s = Motor.Crear<Spawner>();
s.prefab = prefab; s.transform.position = new Vector3(2, 0, 3);
Motor.Fotograma();
Check("crea uno en el primer fotograma", () => s.Vivos == 1);
Motor.Avanzar(0.5f);
Check("espera el intervalo", () => s.Vivos == 1);
Motor.Avanzar(0.55f);
Check("crea otro al cumplirse el intervalo", () => s.Vivos == 2);
Motor.Avanzar(5f);
var bichos = Object.FindObjectsOfType<Bicho>();
Check("no supera maxVivos", () => s.Vivos == 3 && bichos.Length == 3);
Check("los clones salen en la posición del spawner y copian el prefab", () => bichos.All(b => b.transform.position == new Vector3(2, 0, 3) && b.vida == 7));
Object.Destroy(bichos[0].gameObject); Object.Destroy(bichos[1].gameObject);
Motor.Fotograma();
Check("detecta los destruidos (null falso)", () => s.Vivos <= 2);
Motor.Avanzar(1.1f);
Check("repone hasta el máximo", () => s.Vivos == 3 && Object.FindObjectsOfType<Bicho>().Length == 3);
Check("el prefab no se toca", () => prefab != null && prefab.vida == 7);
`,
  },
];

module.exports = { track, challenges };
