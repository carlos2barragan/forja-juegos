// Patrones de programación de juegos: lo que mantiene un proyecto grande bajo control.
const track = { id: 'patrones', name: 'Patrones y arquitectura', lang: 'csharp', color: '#FF9F43', blurb: 'Máquinas de estados, object pooling, eventos, comandos, estadísticas y guardado.' };

const challenges = [
  {
    id: 'p-1', level: 1, title: 'Máquina de estados',
    brief: `Los personajes cambian de comportamiento según su estado (quieto, corriendo, saltando...). Te damos la interfaz **IEstado**. Escribe **MaquinaEstados**:
- **IEstado Actual** (solo lectura desde fuera).
- **void Cambiar(IEstado nuevo)**: llama a **Salir()** del actual y a **Entrar()** del nuevo. Cambiar al mismo estado no hace nada.
- **void AgregarTransicion(IEstado desde, IEstado hacia, Func<bool> condicion)**.
- **void AgregarTransicionGlobal(IEstado hacia, Func<bool> condicion)**: válida desde cualquier estado (p. ej., morir). Tiene **prioridad** sobre las normales.
- **void Actualizar(float dt)**: comprueba primero las globales y luego las del estado actual, en el orden en que se agregaron; aplica **la primera** que se cumpla (una sola por llamada). Después llama a **Actual.Actualizar(dt)**.`,
    starter: `using System;
using System.Collections.Generic;

public interface IEstado
{
    void Entrar();
    void Actualizar(float dt);
    void Salir();
}

public class MaquinaEstados
{
    // tu código aquí
}
`,
    solution: `using System;
using System.Collections.Generic;

public interface IEstado
{
    void Entrar();
    void Actualizar(float dt);
    void Salir();
}

public class MaquinaEstados
{
    readonly Dictionary<IEstado, List<(IEstado hacia, Func<bool> cond)>> transiciones = new();
    readonly List<(IEstado hacia, Func<bool> cond)> globales = new();

    public IEstado Actual { get; private set; }

    public void Cambiar(IEstado nuevo)
    {
        if (nuevo == Actual) return;
        Actual?.Salir();
        Actual = nuevo;
        Actual?.Entrar();
    }

    public void AgregarTransicion(IEstado desde, IEstado hacia, Func<bool> condicion)
    {
        if (!transiciones.TryGetValue(desde, out var lista))
            transiciones[desde] = lista = new List<(IEstado, Func<bool>)>();
        lista.Add((hacia, condicion));
    }

    public void AgregarTransicionGlobal(IEstado hacia, Func<bool> condicion)
    {
        globales.Add((hacia, condicion));
    }

    public void Actualizar(float dt)
    {
        var siguiente = Buscar(globales);
        if (siguiente == null && Actual != null && transiciones.TryGetValue(Actual, out var lista))
            siguiente = Buscar(lista);
        if (siguiente != null) Cambiar(siguiente);
        Actual?.Actualizar(dt);
    }

    IEstado Buscar(List<(IEstado hacia, Func<bool> cond)> lista)
    {
        foreach (var t in lista)
            if (t.hacia != Actual && t.cond()) return t.hacia;
        return null;
    }
}
`,
    checks: [
      [/Dictionary\s*<\s*IEstado/, 'Transiciones por estado en un diccionario', 'Dictionary<IEstado, List<...>> te da las transiciones del estado actual sin recorrerlas todas.', 2],
      [/Salir\s*\(\s*\)[\s\S]*Entrar\s*\(\s*\)/, 'Salir antes de Entrar', 'Actual.Salir(); Actual = nuevo; Actual.Entrar();', 2],
      [/globales|Global/, 'Transiciones globales', 'Guarda aparte las que valen desde cualquier estado.'],
      [/Func\s*<\s*bool\s*>/, 'Condiciones como Func<bool>', 'Un Func<bool> es una condición que se evalúa cada vez.'],
    ],
    hints: ['Evalúa las globales primero: "morir" debe ganar a "empezar a correr".', 'Ignora la transición global que lleva al estado en el que ya estás, o morirías cada fotograma.'],
    learn: ['Máquinas de estados finitos (FSM)', 'Patrón State', 'Animator de Unity como máquina de estados', 'Cuándo pasar a árboles de comportamiento'],
    search: ['gameprogrammingpatterns.com/state.html', '"unity state machine pattern"', '"finite state machine game ai"'],
    testExtra: `public class EstadoLog : IEstado {
    public readonly string n; public readonly List<string> log; public float tiempo;
    public EstadoLog(string n, List<string> log) { this.n = n; this.log = log; }
    public void Entrar() { log.Add("+" + n); tiempo = 0; }
    public void Actualizar(float dt) { tiempo += dt; }
    public void Salir() { log.Add("-" + n); }
}`,
    test: `
var log = new List<string>();
var quieto = new EstadoLog("quieto", log); var corre = new EstadoLog("corre", log); var muerto = new EstadoLog("muerto", log);
bool moviendo = false, vivo = true;
var m = new MaquinaEstados();
m.AgregarTransicion(quieto, corre, () => moviendo);
m.AgregarTransicion(corre, quieto, () => !moviendo);
m.AgregarTransicionGlobal(muerto, () => !vivo);
m.Cambiar(quieto);
Check("Cambiar inicial llama a Entrar", () => m.Actual == quieto && string.Join(",", log) == "+quieto");
m.Actualizar(0.1f);
Check("sin condición no cambia y actualiza el estado", () => m.Actual == quieto && Math.Abs(quieto.tiempo - 0.1f) < 1e-5);
moviendo = true; m.Actualizar(0.1f);
Check("transición normal: Salir y luego Entrar", () => m.Actual == corre && string.Join(",", log) == "+quieto,-quieto,+corre");
Check("el nuevo estado recibe el Actualizar", () => Math.Abs(corre.tiempo - 0.1f) < 1e-5);
m.Cambiar(corre);
Check("cambiar al mismo estado no hace nada", () => log.Count == 3);
vivo = false; moviendo = false; m.Actualizar(0.1f);
Check("la global tiene prioridad", () => m.Actual == muerto);
int antes = log.Count; m.Actualizar(0.1f);
Check("la global no reentra en su propio estado", () => log.Count == antes && m.Actual == muerto);
var m2 = new MaquinaEstados(); var a = new EstadoLog("a", log); var b = new EstadoLog("b", log); var c = new EstadoLog("c", log);
m2.AgregarTransicion(a, b, () => true); m2.AgregarTransicion(b, c, () => true);
m2.Cambiar(a); m2.Actualizar(0);
Check("solo una transición por Actualizar", () => m2.Actual == b);
`,
  },
  {
    id: 'p-2', level: 1, title: 'Object pool genérico',
    brief: `Instanciar y destruir balas cada fotograma genera basura y tirones. Escribe **Pool<T> where T : class**:
- Constructor **Pool(Func<T> crear, Action<T> alSacar = null, Action<T> alDevolver = null, int maxInactivos = 100)**.
- **T Sacar()**: reutiliza uno inactivo si hay; si no, crea uno nuevo. Llama a *alSacar*.
- **void Devolver(T obj)**: llama a *alDevolver* y lo guarda para reutilizarlo. Si ya hay *maxInactivos* guardados, lo descarta.
  Devolver un objeto que **no está fuera** del pool (o devolverlo dos veces) lanza **InvalidOperationException**.
- **void Precalentar(int n)**: crea n objetos inactivos por adelantado.
- Propiedades **Activos**, **Inactivos** y **Creados** (total creados desde el principio).`,
    starter: `using System;
using System.Collections.Generic;

public class Pool<T> where T : class
{
    // tu código aquí
}
`,
    solution: `using System;
using System.Collections.Generic;

public class Pool<T> where T : class
{
    readonly Func<T> crear;
    readonly Action<T> alSacar, alDevolver;
    readonly int maxInactivos;
    readonly Stack<T> inactivos = new();
    readonly HashSet<T> activos = new();

    public Pool(Func<T> crear, Action<T> alSacar = null, Action<T> alDevolver = null, int maxInactivos = 100)
    {
        this.crear = crear ?? throw new ArgumentNullException(nameof(crear));
        this.alSacar = alSacar;
        this.alDevolver = alDevolver;
        this.maxInactivos = maxInactivos;
    }

    public int Activos => activos.Count;
    public int Inactivos => inactivos.Count;
    public int Creados { get; private set; }

    public void Precalentar(int n)
    {
        for (int i = 0; i < n && inactivos.Count < maxInactivos; i++)
        {
            inactivos.Push(crear());
            Creados++;
        }
    }

    public T Sacar()
    {
        T obj;
        if (inactivos.Count > 0) obj = inactivos.Pop();
        else { obj = crear(); Creados++; }
        activos.Add(obj);
        alSacar?.Invoke(obj);
        return obj;
    }

    public void Devolver(T obj)
    {
        if (!activos.Remove(obj))
            throw new InvalidOperationException("Ese objeto no está fuera del pool (¿lo devolviste dos veces?).");
        alDevolver?.Invoke(obj);
        if (inactivos.Count < maxInactivos) inactivos.Push(obj);
    }
}
`,
    checks: [
      [/Stack\s*<\s*T\s*>|Queue\s*<\s*T\s*>|List\s*<\s*T\s*>/, 'Guardas los inactivos', 'Una Stack<T> es perfecta: el último devuelto está "caliente" en la caché.', 2],
      [/HashSet\s*<\s*T\s*>/, 'Llevas los activos en un HashSet', 'Un HashSet<T> detecta en O(1) si un objeto está fuera.', 2],
      [/InvalidOperationException/, 'Detectas devoluciones dobles', 'Una devolución doble haría que dos balas compartieran objeto: lanza InvalidOperationException.', 2],
      [/maxInactivos/, 'Limitas los inactivos', 'Sin límite, un pico de balas deja memoria ocupada para siempre.'],
    ],
    hints: ['Unity 2021+ trae UnityEngine.Pool.ObjectPool<T>: este reto es para que entiendas cómo funciona.', 'Con GameObjects, alSacar haría SetActive(true) y alDevolver SetActive(false).'],
    learn: ['Object pooling', 'Genéricos con restricciones (where T : class)', 'UnityEngine.Pool.ObjectPool<T>'],
    search: ['gameprogrammingpatterns.com/object-pool.html', '"unity ObjectPool<T>"', '"unity object pooling bullets"'],
    testExtra: `public class Bala { public bool activa; public int usos; }`,
    test: `
var p = new Pool<Bala>(() => new Bala(), b => { b.activa = true; b.usos++; }, b => b.activa = false, 2);
var a = p.Sacar();
Check("Sacar crea y llama a alSacar", () => a.activa && p.Creados == 1 && p.Activos == 1);
p.Devolver(a);
Check("Devolver llama a alDevolver y lo guarda", () => !a.activa && p.Inactivos == 1 && p.Activos == 0);
var b = p.Sacar();
Check("reutiliza en vez de crear", () => ReferenceEquals(a, b) && p.Creados == 1 && b.usos == 2);
Check("devolver dos veces lanza InvalidOperationException", () => { p.Devolver(b); return Lanza<InvalidOperationException>(() => p.Devolver(b)); });
Check("devolver algo ajeno lanza InvalidOperationException", () => Lanza<InvalidOperationException>(() => p.Devolver(new Bala())));
var x = p.Sacar(); var y = p.Sacar(); var z = p.Sacar();
p.Devolver(x); p.Devolver(y); p.Devolver(z);
Check("respeta maxInactivos", () => p.Inactivos == 2 && p.Activos == 0);
var q = new Pool<Bala>(() => new Bala());
q.Precalentar(5);
Check("Precalentar crea inactivos", () => q.Inactivos == 5 && q.Creados == 5 && q.Activos == 0);
for (int i = 0; i < 5; i++) q.Sacar();
Check("tras precalentar no crea más", () => q.Creados == 5 && q.Activos == 5);
`,
  },
  {
    id: 'p-3', level: 2, title: 'Bus de eventos tipado',
    brief: `Para que sistemas lejanos (UI, audio, logros) se comuniquen sin referencias directas, escribe **BusEventos**:
- **void Suscribir<T>(Action<T> manejador)**
- **void Desuscribir<T>(Action<T> manejador)**
- **void Publicar<T>(T evento)**: llama a todos los suscritos a **ese tipo exacto** de evento, en orden de suscripción.
- Un manejador puede **desuscribirse (o suscribir a otro) mientras se publica** sin romper la publicación en curso. Los cambios cuentan desde la siguiente publicación.
- Si un manejador lanza una excepción, regístrala con **Debug.LogError** y **sigue** con los demás.
- Suscribir el mismo manejador dos veces no lo duplica.`,
    starter: `using System;
using System.Collections.Generic;
using UnityEngine;

public class BusEventos
{
    // tu código aquí
}
`,
    solution: `using System;
using System.Collections.Generic;
using UnityEngine;

public class BusEventos
{
    readonly Dictionary<Type, List<Delegate>> manejadores = new();

    public void Suscribir<T>(Action<T> manejador)
    {
        if (!manejadores.TryGetValue(typeof(T), out var lista))
            manejadores[typeof(T)] = lista = new List<Delegate>();
        if (!lista.Contains(manejador)) lista.Add(manejador);
    }

    public void Desuscribir<T>(Action<T> manejador)
    {
        if (manejadores.TryGetValue(typeof(T), out var lista)) lista.Remove(manejador);
    }

    public void Publicar<T>(T evento)
    {
        if (!manejadores.TryGetValue(typeof(T), out var lista)) return;
        foreach (var d in lista.ToArray())
        {
            try { ((Action<T>)d)(evento); }
            catch (Exception e) { Debug.LogError(e); }
        }
    }
}
`,
    checks: [
      [/Dictionary\s*<\s*Type/, 'Indexas por tipo de evento', 'Dictionary<Type, List<Delegate>> separa a los suscriptores de cada evento.', 2],
      [/ToArray\s*\(\s*\)|new\s+List\s*<\s*Delegate\s*>\s*\(\s*lista|\.ToList\s*\(\s*\)/, 'Recorres una copia', 'Itera sobre lista.ToArray(): así desuscribirse durante la publicación no rompe el foreach.', 3],
      [/catch[\s\S]*LogError/, 'Aíslas los errores', 'try/catch alrededor de cada manejador y Debug.LogError.', 2],
      [/Contains/, 'Evitas duplicados', 'if (!lista.Contains(manejador)) lista.Add(manejador);'],
    ],
    hints: ['Modificar una List mientras la recorres con foreach lanza InvalidOperationException.', 'typeof(T) es la clave natural del diccionario.'],
    learn: ['Patrón Event Bus / Event Aggregator', 'Delegados genéricos y Delegate', 'Ventajas e inconvenientes del desacoplamiento total (difícil de depurar)'],
    search: ['"unity event bus pattern"', 'gameprogrammingpatterns.com/event-queue.html', '"C# modify list while iterating"'],
    testExtra: `public struct EnemigoMuerto { public int puntos; }
public struct NivelCompletado { public int nivel; }`,
    test: `
var bus = new BusEventos();
int total = 0, niveles = 0; var orden = new List<string>();
Action<EnemigoMuerto> sumar = e => { total += e.puntos; orden.Add("sumar"); };
Action<EnemigoMuerto> log = e => orden.Add("log");
bus.Suscribir(sumar); bus.Suscribir(log); bus.Suscribir<NivelCompletado>(e => niveles++);
bus.Publicar(new EnemigoMuerto { puntos = 10 });
Check("llama a los suscritos en orden", () => total == 10 && string.Join(",", orden) == "sumar,log");
Check("solo a los del mismo tipo", () => niveles == 0);
bus.Suscribir(sumar);
bus.Publicar(new EnemigoMuerto { puntos = 5 });
Check("no duplica suscripciones", () => total == 15);
bus.Desuscribir(sumar);
bus.Publicar(new EnemigoMuerto { puntos = 100 });
Check("Desuscribir", () => total == 15);
Action<NivelCompletado> unaVez = null; int veces = 0;
unaVez = e => { veces++; bus.Desuscribir(unaVez); };
bus.Suscribir(unaVez);
Check("desuscribirse durante la publicación no rompe", () => { bus.Publicar(new NivelCompletado { nivel = 1 }); return veces == 1 && niveles == 1; });
bus.Publicar(new NivelCompletado { nivel = 2 });
Check("y cuenta desde la siguiente", () => veces == 1 && niveles == 2);
Debug.Registro.Clear(); int despues = 0;
bus.Suscribir<NivelCompletado>(e => throw new Exception("roto"));
bus.Suscribir<NivelCompletado>(e => despues++);
bus.Publicar(new NivelCompletado());
Check("una excepción no detiene a los demás y se registra", () => despues == 1 && Debug.Registro.Any(l => l.StartsWith("[error]")));
Check("publicar sin suscriptores no falla", () => { new BusEventos().Publicar(42); return true; });
`,
  },
  {
    id: 'p-4', level: 2, title: 'Deshacer y rehacer con comandos',
    brief: `En un juego de puzles por turnos el jugador puede deshacer movimientos. Te damos **Ficha** e **IComando**. Escribe:
- **MoverComando : IComando** con constructor **MoverComando(Ficha ficha, Vector2Int delta)**.
- **Historial** con constructor **Historial(int maxPasos)**:
  - **void Ejecutar(IComando c)**: lo ejecuta y lo guarda. **Borra** lo que se podía rehacer.
  - **bool Deshacer()** / **bool Rehacer()**: false si no hay nada.
  - Si se superan *maxPasos*, se olvida el más antiguo.
  - **int PuedeDeshacer** y **int PuedeRehacer** (cuántos hay).`,
    starter: `using System.Collections.Generic;
using UnityEngine;

public class Ficha { public Vector2Int Posicion; }

public interface IComando
{
    void Ejecutar();
    void Deshacer();
}

// tu código aquí
`,
    solution: `using System.Collections.Generic;
using UnityEngine;

public class Ficha { public Vector2Int Posicion; }

public interface IComando
{
    void Ejecutar();
    void Deshacer();
}

public class MoverComando : IComando
{
    readonly Ficha ficha;
    readonly Vector2Int delta;

    public MoverComando(Ficha ficha, Vector2Int delta)
    {
        this.ficha = ficha;
        this.delta = delta;
    }

    public void Ejecutar() => ficha.Posicion += delta;
    public void Deshacer() => ficha.Posicion -= delta;
}

public class Historial
{
    readonly LinkedList<IComando> hechos = new();
    readonly Stack<IComando> deshechos = new();
    readonly int maxPasos;

    public Historial(int maxPasos)
    {
        this.maxPasos = maxPasos;
    }

    public int PuedeDeshacer => hechos.Count;
    public int PuedeRehacer => deshechos.Count;

    public void Ejecutar(IComando c)
    {
        c.Ejecutar();
        hechos.AddLast(c);
        if (hechos.Count > maxPasos) hechos.RemoveFirst();
        deshechos.Clear();
    }

    public bool Deshacer()
    {
        if (hechos.Count == 0) return false;
        var c = hechos.Last.Value;
        hechos.RemoveLast();
        c.Deshacer();
        deshechos.Push(c);
        return true;
    }

    public bool Rehacer()
    {
        if (deshechos.Count == 0) return false;
        var c = deshechos.Pop();
        c.Ejecutar();
        hechos.AddLast(c);
        return true;
    }
}
`,
    checks: [
      [/class\s+MoverComando\s*:\s*IComando/, 'MoverComando implementa IComando', 'class MoverComando : IComando'],
      [/Deshacer\s*\(\s*\)\s*=>\s*\w+\.Posicion\s*-=|Posicion\s*-=\s*delta/, 'Deshacer invierte el movimiento', 'Deshacer resta el mismo delta que sumó Ejecutar.', 2],
      [/\.Clear\s*\(\s*\)/, 'Ejecutar borra lo rehacible', 'Una acción nueva crea otra "línea temporal": vacía la pila de rehacer.', 2],
      [/RemoveFirst|RemoveAt\s*\(\s*0\s*\)|Dequeue/, 'Olvidas el paso más antiguo', 'Con LinkedList, RemoveFirst() quita el más viejo en O(1).', 2],
    ],
    hints: ['Dos pilas: hechos y deshechos. Deshacer pasa de una a otra; Rehacer, al revés.', 'Una Stack no permite quitar el fondo: para el límite usa LinkedList.'],
    learn: ['Patrón Command', 'Deshacer/rehacer', 'Repeticiones (replays) y redes deterministas a partir de comandos'],
    search: ['gameprogrammingpatterns.com/command.html', '"undo redo command pattern C#"', '"unity command pattern"'],
    test: `
var f = new Ficha(); var h = new Historial(3);
h.Ejecutar(new MoverComando(f, Vector2Int.right));
h.Ejecutar(new MoverComando(f, Vector2Int.up));
Check("Ejecutar mueve", () => f.Posicion == new Vector2Int(1, 1) && h.PuedeDeshacer == 2);
Check("Deshacer", () => h.Deshacer() && f.Posicion == new Vector2Int(1, 0));
Check("Rehacer", () => h.Rehacer() && f.Posicion == new Vector2Int(1, 1));
Check("Rehacer sin nada devuelve false", () => !h.Rehacer());
h.Deshacer(); h.Deshacer();
Check("deshacer hasta el principio", () => f.Posicion == Vector2Int.zero && h.PuedeRehacer == 2);
h.Ejecutar(new MoverComando(f, Vector2Int.left));
Check("una acción nueva borra lo rehacible", () => h.PuedeRehacer == 0 && !h.Rehacer() && f.Posicion == Vector2Int.left);
Check("Deshacer sin nada devuelve false", () => { var v = new Historial(2); return !v.Deshacer(); });
var g = new Ficha(); var lim = new Historial(3);
for (int i = 0; i < 5; i++) lim.Ejecutar(new MoverComando(g, Vector2Int.up));
int n = 0; while (lim.Deshacer()) n++;
Check("respeta maxPasos (olvida los más antiguos)", () => n == 3 && g.Posicion == new Vector2Int(0, 2));
`,
  },
  {
    id: 'p-5', level: 3, title: 'Estadísticas con modificadores',
    brief: `En un RPG, la fuerza de un personaje sale de su base más bonificaciones de equipo, pociones y talentos. Te damos **TipoMod** y **Modificador**. Escribe **Estadistica**:
- Constructor **Estadistica(float valorBase)** y propiedad **Base** (lectura y escritura).
- **void Agregar(Modificador m)**, **bool Quitar(Modificador m)** y **int QuitarDeFuente(object fuente)** (quita todos los de esa fuente y devuelve cuántos quitó).
- **float Valor** = (Base + Σ planos) × (1 + Σ porcentajes que se suman) × Π (1 + cada porcentaje que multiplica).
  Ejemplo: base 10, +5 plano, +10% y +20% sumados, ×50% multiplicativo → (15) × 1,3 × 1,5 = 29,25.
- **Cachea** Valor: recalcula solo cuando algo cambió (Base o la lista de modificadores). Expón **int Recalculos** para que podamos comprobarlo.`,
    starter: `using System.Collections.Generic;

public enum TipoMod { Plano, PorcentajeSuma, PorcentajeMultiplica }

public class Modificador
{
    public readonly float Valor;
    public readonly TipoMod Tipo;
    public readonly object Fuente;
    public Modificador(float valor, TipoMod tipo, object fuente = null) { Valor = valor; Tipo = tipo; Fuente = fuente; }
}

public class Estadistica
{
    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;

public enum TipoMod { Plano, PorcentajeSuma, PorcentajeMultiplica }

public class Modificador
{
    public readonly float Valor;
    public readonly TipoMod Tipo;
    public readonly object Fuente;
    public Modificador(float valor, TipoMod tipo, object fuente = null) { Valor = valor; Tipo = tipo; Fuente = fuente; }
}

public class Estadistica
{
    readonly List<Modificador> mods = new();
    float valorBase;
    float cache;
    bool sucio = true;

    public Estadistica(float valorBase)
    {
        this.valorBase = valorBase;
    }

    public int Recalculos { get; private set; }

    public float Base
    {
        get => valorBase;
        set { valorBase = value; sucio = true; }
    }

    public float Valor
    {
        get
        {
            if (sucio) { cache = Calcular(); sucio = false; Recalculos++; }
            return cache;
        }
    }

    public void Agregar(Modificador m) { mods.Add(m); sucio = true; }

    public bool Quitar(Modificador m)
    {
        if (!mods.Remove(m)) return false;
        sucio = true;
        return true;
    }

    public int QuitarDeFuente(object fuente)
    {
        int n = mods.RemoveAll(m => Equals(m.Fuente, fuente));
        if (n > 0) sucio = true;
        return n;
    }

    float Calcular()
    {
        float plano = 0, suma = 0, mult = 1;
        foreach (var m in mods)
        {
            switch (m.Tipo)
            {
                case TipoMod.Plano: plano += m.Valor; break;
                case TipoMod.PorcentajeSuma: suma += m.Valor; break;
                case TipoMod.PorcentajeMultiplica: mult *= 1 + m.Valor; break;
            }
        }
        return (valorBase + plano) * (1 + suma) * mult;
    }
}
`,
    checks: [
      [/sucio|dirty|cambio|invalid/i, 'Marcas la caché como sucia', 'Un bool "sucio" que se pone a true al cambiar algo y a false al recalcular.', 3],
      [/switch\s*\(\s*\w+\.Tipo|case\s+TipoMod/, 'Tratas cada tipo por separado', 'Un switch sobre m.Tipo acumula planos, sumas y multiplicadores.'],
      [/\*=\s*\(?\s*1f?\s*\+/, 'Los multiplicativos se multiplican', 'mult *= 1 + m.Valor;', 2],
      [/RemoveAll/, 'QuitarDeFuente con RemoveAll', 'mods.RemoveAll(m => Equals(m.Fuente, fuente)) devuelve cuántos quitó.'],
    ],
    hints: ['El orden importa: primero planos, luego porcentajes sumados, luego multiplicativos.', 'Valor se lee muchísimas veces (UI, combate) y cambia poco: por eso se cachea.'],
    learn: ['Sistemas de estadísticas y modificadores', 'Caché con bandera de sucio (dirty flag)', 'Por qué el orden de los modificadores cambia el balance'],
    search: ['gameprogrammingpatterns.com/dirty-flag.html', '"unity character stats modifiers"', '"RPG stat modifier stacking"'],
    test: `
var s = new Estadistica(10);
Check("sin modificadores = base", () => Math.Abs(s.Valor - 10) < 1e-4);
var espada = new object();
s.Agregar(new Modificador(5, TipoMod.Plano, espada));
s.Agregar(new Modificador(0.1f, TipoMod.PorcentajeSuma));
s.Agregar(new Modificador(0.2f, TipoMod.PorcentajeSuma, espada));
var furia = new Modificador(0.5f, TipoMod.PorcentajeMultiplica);
s.Agregar(furia);
Check("ejemplo del enunciado = 29,25", () => Math.Abs(s.Valor - 29.25f) < 1e-3);
int r = s.Recalculos; float v = 0; for (int i = 0; i < 100; i++) v = s.Valor;
Check("leer 100 veces no recalcula", () => s.Recalculos == r);
Check("Quitar", () => s.Quitar(furia) && Math.Abs(s.Valor - 19.5f) < 1e-3);
Check("Quitar uno que no está devuelve false", () => !s.Quitar(furia));
Check("QuitarDeFuente quita los de la espada", () => s.QuitarDeFuente(espada) == 2 && Math.Abs(s.Valor - 11) < 1e-3);
s.Base = 20;
Check("cambiar Base recalcula", () => Math.Abs(s.Valor - 22) < 1e-3);
var d = new Estadistica(100);
d.Agregar(new Modificador(0.5f, TipoMod.PorcentajeMultiplica)); d.Agregar(new Modificador(0.5f, TipoMod.PorcentajeMultiplica));
Check("dos multiplicativos se componen (×2,25)", () => Math.Abs(d.Valor - 225) < 1e-2);
`,
  },
  {
    id: 'p-6', level: 3, title: 'Guardar partida con versiones',
    brief: `El juego ya salió con la versión 1 del guardado, que tenía el dinero en un campo **oro**. La versión 2 lo renombró a **monedas** y añadió **logros**. Con **JsonUtility**, escribe **static class Guardado**:
- **string Guardar(Partida p)**.
- **Partida Cargar(string json)**:
  - Si es versión 2, la devuelve tal cual.
  - Si es versión 1, la **migra**: monedas = oro, logros vacío, versión 2.
  - Si el texto es null, vacío o JSON inválido, devuelve una **partida nueva** (no lances excepciones: un guardado corrupto no puede cerrar el juego).
- Pista: JsonUtility ignora campos que no existen en la clase. Lee primero solo la versión.`,
    starter: `using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class Partida
{
    public int version = 2;
    public string jugador = "";
    public int nivel = 1;
    public int monedas;
    public List<string> logros = new List<string>();
}

public static class Guardado
{
    // tu código aquí
}
`,
    solution: `using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class Partida
{
    public int version = 2;
    public string jugador = "";
    public int nivel = 1;
    public int monedas;
    public List<string> logros = new List<string>();
}

public static class Guardado
{
    [Serializable] class SoloVersion { public int version; }

    [Serializable]
    class PartidaV1
    {
        public int version;
        public string jugador;
        public int nivel;
        public int oro;
    }

    public static string Guardar(Partida p) => JsonUtility.ToJson(p);

    public static Partida Cargar(string json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new Partida();
        try
        {
            var v = JsonUtility.FromJson<SoloVersion>(json);
            if (v == null) return new Partida();
            if (v.version <= 1)
            {
                var vieja = JsonUtility.FromJson<PartidaV1>(json);
                return new Partida { version = 2, jugador = vieja.jugador ?? "", nivel = vieja.nivel, monedas = vieja.oro };
            }
            var p = JsonUtility.FromJson<Partida>(json) ?? new Partida();
            p.logros ??= new List<string>();
            return p;
        }
        catch (Exception e)
        {
            Debug.LogWarning("Guardado corrupto, empiezo de cero: " + e.Message);
            return new Partida();
        }
    }
}
`,
    checks: [
      [/JsonUtility\.ToJson/, 'Guardas con JsonUtility.ToJson', 'JsonUtility.ToJson(p).'],
      [/FromJson\s*<\s*\w*Version\w*\s*>|SoloVersion|Cabecera/, 'Lees la versión primero', 'Una clase mínima con solo "version" te dice cómo leer el resto.', 2],
      [/oro/, 'Migras el campo oro', 'Una clase PartidaV1 con "oro" lee el formato viejo.', 2],
      [/catch/, 'Un guardado corrupto no rompe el juego', 'try/catch y devuelve una partida nueva.', 2],
      [/IsNullOrWhiteSpace|IsNullOrEmpty/, 'Cubres el texto vacío', 'string.IsNullOrWhiteSpace(json).'],
    ],
    hints: ['JsonUtility solo serializa campos públicos de clases [Serializable] (no propiedades).', 'Nunca borres el código de migración: siempre habrá alguien con un guardado de hace dos años.'],
    learn: ['JsonUtility y sus límites', 'Versionado y migración de datos guardados', 'Application.persistentDataPath', 'Guardado atómico (escribir a un temporal y renombrar)'],
    search: ['"unity JsonUtility"', '"unity save system versioning migration"', '"unity persistentDataPath save file"'],
    test: `
var p = new Partida { jugador = "Ana", nivel = 7, monedas = 120 }; p.logros.Add("primer-jefe");
var json = Guardado.Guardar(p);
var c = Guardado.Cargar(json);
Check("ida y vuelta conserva todo", () => c.jugador == "Ana" && c.nivel == 7 && c.monedas == 120 && c.logros.SequenceEqual(new[] { "primer-jefe" }) && c.version == 2);
var v1 = Guardado.Cargar("{\\"version\\":1,\\"jugador\\":\\"Luis\\",\\"nivel\\":3,\\"oro\\":50}");
Check("migra la versión 1 (oro → monedas)", () => v1.jugador == "Luis" && v1.nivel == 3 && v1.monedas == 50);
Check("la migrada queda en versión 2 con logros vacío", () => v1.version == 2 && v1.logros != null && v1.logros.Count == 0);
Check("JSON roto da una partida nueva", () => { var x = Guardado.Cargar("{ esto no es json"); return x != null && x.nivel == 1 && x.monedas == 0; });
Check("texto vacío o null da una partida nueva", () => Guardado.Cargar("").nivel == 1 && Guardado.Cargar(null).nivel == 1);
Check("el JSON usa los nombres de campo", () => json.Contains("\\"monedas\\":120"));
`,
  },
];

module.exports = { track, challenges };
