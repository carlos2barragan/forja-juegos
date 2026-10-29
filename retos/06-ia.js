// IA de juegos: no es aprendizaje automático, es diseño de comportamientos creíbles y baratos.
const track = { id: 'ia', name: 'IA de juegos', lang: 'csharp', color: '#FF6B8B', blurb: 'Patrullas, steering, A*, árboles de comportamiento y utility AI.' };

const challenges = [
  {
    id: 'ia-1', level: 1, title: 'Patrulla por puntos',
    brief: `Un guardia recorre una lista de puntos a velocidad constante. Escribe **Patrulla**:
- Constructor **Patrulla(List<Vector3> puntos, float velocidad, bool idaYVuelta)**. Empieza en el primer punto, yendo hacia el segundo.
- **Vector3 Posicion** y **int Destino** (índice del punto al que va).
- **void Avanzar(float dt)**: recorre *velocidad × dt* unidades. Si en un mismo dt llega a un punto y le sobra distancia, **sigue** hacia el siguiente con lo que le sobra (puede pasar varios puntos en un dt grande).
  - *idaYVuelta = false*: del último vuelve al primero (en bucle).
  - *idaYVuelta = true*: del último da la vuelta: …, n−2, n−1, n−2, …, 0, 1, …
- Con un solo punto, no se mueve.`,
    starter: `using System.Collections.Generic;
using UnityEngine;

public class Patrulla
{
    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;
using UnityEngine;

public class Patrulla
{
    readonly List<Vector3> puntos;
    readonly float velocidad;
    readonly bool idaYVuelta;
    int sentido = 1;

    public Vector3 Posicion { get; private set; }
    public int Destino { get; private set; }

    public Patrulla(List<Vector3> puntos, float velocidad, bool idaYVuelta)
    {
        this.puntos = puntos;
        this.velocidad = velocidad;
        this.idaYVuelta = idaYVuelta;
        Posicion = puntos[0];
        Destino = puntos.Count > 1 ? 1 : 0;
    }

    public void Avanzar(float dt)
    {
        if (puntos.Count < 2) return;
        float resto = velocidad * dt;
        while (resto > 0f)
        {
            Vector3 objetivo = puntos[Destino];
            float dist = Vector3.Distance(Posicion, objetivo);
            if (dist > resto)
            {
                Posicion = Vector3.MoveTowards(Posicion, objetivo, resto);
                return;
            }
            Posicion = objetivo;
            resto -= dist;
            Siguiente();
        }
    }

    void Siguiente()
    {
        if (!idaYVuelta) { Destino = (Destino + 1) % puntos.Count; return; }
        if (Destino + sentido >= puntos.Count || Destino + sentido < 0) sentido = -sentido;
        Destino += sentido;
    }
}
`,
    checks: [
      [/while\s*\(/, 'Consumes la distancia en un bucle', 'while (resto > 0): así un dt grande puede pasar varios puntos.', 3],
      [/resto\s*-=|sobra\w*\s*-=|-=\s*dist/, 'Restas lo recorrido', 'resto -= distancia al punto alcanzado.', 2],
      [/%\s*puntos\.Count/, 'Bucle con módulo', '(Destino + 1) % puntos.Count vuelve al principio.'],
      [/sentido|direccion|-\s*1/, 'Ida y vuelta invierte el sentido', 'Guarda +1 / −1 y cámbialo en los extremos.'],
    ],
    hints: ['Si la distancia al destino es menor que lo que te queda por recorrer, llega, réstala y cambia de destino.', 'Si en un dt cae justo un frame largo (0,5 s), no debe "quedarse corto".'],
    learn: ['Waypoints y patrullas', 'Movimiento basado en distancia, no en fotogramas', 'NavMeshAgent como alternativa en 3D'],
    search: ['"unity waypoint patrol"', '"unity NavMeshAgent patrol"', '"ping pong waypoints"'],
    test: `
var pts = new List<Vector3> { Vector3.zero, new Vector3(10, 0, 0), new Vector3(10, 0, 10) };
var p = new Patrulla(pts, 5, false);
Check("empieza en el primer punto yendo al segundo", () => p.Posicion == Vector3.zero && p.Destino == 1);
p.Avanzar(1);
Check("avanza velocidad × dt", () => Cerca(p.Posicion, new Vector3(5, 0, 0)));
p.Avanzar(3);
Check("pasa un punto y sigue con lo que sobra", () => Cerca(p.Posicion, new Vector3(10, 0, 10)) && p.Destino == 0);
p.Avanzar(Mathf.Sqrt(200) / 5 + 1);
Check("en bucle vuelve al primero y continúa", () => Cerca(p.Posicion, new Vector3(5, 0, 0)) && p.Destino == 1);
var q = new Patrulla(pts, 5, true);
q.Avanzar(4 + 1);
Check("ida y vuelta: da la vuelta en el último", () => Cerca(q.Posicion, new Vector3(10, 0, 5)) && q.Destino == 1);
q.Avanzar(1 + 1);
Check("ida y vuelta: regresa hacia el primero", () => Cerca(q.Posicion, new Vector3(5, 0, 0)) && q.Destino == 0);
q.Avanzar(1 + 0.4f);
Check("y vuelve a avanzar desde el primero", () => Cerca(q.Posicion, new Vector3(2, 0, 0)) && q.Destino == 1);
var r = new Patrulla(new List<Vector3> { Vector3.one }, 5, false); r.Avanzar(10);
Check("con un solo punto no se mueve", () => r.Posicion == Vector3.one);
var s = new Patrulla(pts, 5, false); s.Avanzar(100);
Check("dt enorme no se cuelga", () => s.Posicion.y == 0);
`,
  },
  {
    id: 'ia-2', level: 2, title: 'Steering: buscar, huir y llegar',
    brief: `Los *steering behaviors* de Craig Reynolds producen una **fuerza** que corrige la velocidad actual hacia la deseada. En **static class Steering**:
- **Vector3 Buscar(Vector3 pos, Vector3 vel, Vector3 objetivo, float maxVel)**: velocidad deseada = dirección al objetivo × maxVel; fuerza = deseada − vel.
- **Vector3 Huir(...)**: igual, pero alejándose.
- **Vector3 Llegar(Vector3 pos, Vector3 vel, Vector3 objetivo, float maxVel, float radioFrenado)**: como Buscar, pero dentro del radio la rapidez deseada baja **proporcionalmente** a la distancia (0 en el objetivo).
- **Vector3 Limitar(Vector3 v, float max)**: recorta la longitud a *max*.

Las pruebas simulan un agente con estas fuerzas y comprueban que llega al objetivo y se detiene.`,
    starter: `using UnityEngine;

public static class Steering
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Steering
{
    public static Vector3 Buscar(Vector3 pos, Vector3 vel, Vector3 objetivo, float maxVel)
    {
        Vector3 deseada = (objetivo - pos).normalized * maxVel;
        return deseada - vel;
    }

    public static Vector3 Huir(Vector3 pos, Vector3 vel, Vector3 objetivo, float maxVel)
    {
        Vector3 deseada = (pos - objetivo).normalized * maxVel;
        return deseada - vel;
    }

    public static Vector3 Llegar(Vector3 pos, Vector3 vel, Vector3 objetivo, float maxVel, float radioFrenado)
    {
        Vector3 aObjetivo = objetivo - pos;
        float dist = aObjetivo.magnitude;
        if (dist < 1e-5f) return -vel;
        float rapidez = dist < radioFrenado ? maxVel * dist / radioFrenado : maxVel;
        Vector3 deseada = aObjetivo / dist * rapidez;
        return deseada - vel;
    }

    public static Vector3 Limitar(Vector3 v, float max)
    {
        return v.sqrMagnitude > max * max ? v.normalized * max : v;
    }
}
`,
    checks: [
      [/-\s*vel\b/, 'Fuerza = deseada − velocidad actual', 'La fuerza corrige la diferencia entre lo que quieres y lo que llevas.', 3],
      [/radioFrenado/, 'Frenas dentro del radio', 'rapidez = maxVel × distancia / radioFrenado.', 2],
      [/pos\s*-\s*objetivo/, 'Huir invierte la dirección', 'Para huir, la dirección es pos − objetivo.'],
      [/normalized\s*\*\s*max|ClampMagnitude/, 'Limitas la longitud', 'v.normalized * max cuando v es más largo que max.'],
    ],
    hints: ['Si devuelves la velocidad deseada en vez de la diferencia, el agente gira de golpe y no hay inercia.', 'En el objetivo, la deseada es 0: la fuerza (−vel) frena.'],
    learn: ['Steering behaviors (Reynolds)', 'Integración de fuerzas', 'Combinar comportamientos: flocking (separación, alineación, cohesión)'],
    search: ['"Craig Reynolds steering behaviors"', '"steering behaviors arrive seek"', 'red3d.com/cwr/steer'],
    test: `
Check("Buscar desde quieto apunta al objetivo a maxVel", () => Cerca(Steering.Buscar(Vector3.zero, Vector3.zero, new Vector3(10, 0, 0), 3), new Vector3(3, 0, 0)));
Check("Buscar resta la velocidad actual", () => Cerca(Steering.Buscar(Vector3.zero, new Vector3(0, 0, 3), new Vector3(10, 0, 0), 3), new Vector3(3, 0, -3)));
Check("Huir va al revés", () => Cerca(Steering.Huir(Vector3.zero, Vector3.zero, new Vector3(10, 0, 0), 3), new Vector3(-3, 0, 0)));
Check("Llegar fuera del radio = Buscar", () => Cerca(Steering.Llegar(Vector3.zero, Vector3.zero, new Vector3(10, 0, 0), 4, 5), new Vector3(4, 0, 0)));
Check("Llegar dentro del radio frena proporcionalmente", () => Cerca(Steering.Llegar(Vector3.zero, Vector3.zero, new Vector3(2, 0, 0), 4, 5), new Vector3(1.6f, 0, 0)));
Check("Limitar", () => Cerca(Steering.Limitar(new Vector3(30, 40, 0), 5), new Vector3(3, 4, 0)) && Steering.Limitar(Vector3.one, 5) == Vector3.one);
Vector3 pos = Vector3.zero, vel = Vector3.zero, meta = new Vector3(20, 0, 5); float maxRapidez = 0;
for (int i = 0; i < 1000; i++) { vel += Steering.Limitar(Steering.Llegar(pos, vel, meta, 5, 4), 10) * 0.02f; pos += vel * 0.02f; maxRapidez = Mathf.Max(maxRapidez, vel.magnitude); }
Check("el agente llega al objetivo", () => Vector3.Distance(pos, meta) < 0.1f);
Check("y se detiene", () => vel.magnitude < 0.1f);
Check("sin pasar de la rapidez máxima (con margen)", () => maxRapidez <= 5.3f);
`,
  },
  {
    id: 'ia-3', level: 2, title: 'A* en una cuadrícula',
    brief: `Escribe **static class Rutas** con **List<Vector2Int> AEstrella(bool[,] bloqueado, Vector2Int inicio, Vector2Int fin)**:
- *bloqueado[x, y]* = true si no se puede pasar.
- Movimiento en **4 direcciones**, coste 1 por paso. Heurística: distancia **Manhattan**.
- Devuelve el camino **más corto**, incluyendo inicio y fin. Si inicio == fin, una lista con ese punto.
- Devuelve **null** si no hay camino, o si inicio o fin están fuera del mapa o bloqueados.
- Debe resolver un mapa de 200×200 rápido: usa **PriorityQueue** para la lista abierta.`,
    starter: `using System.Collections.Generic;
using UnityEngine;

public static class Rutas
{
    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;
using UnityEngine;

public static class Rutas
{
    static readonly Vector2Int[] Vecinos = { Vector2Int.up, Vector2Int.down, Vector2Int.left, Vector2Int.right };

    public static List<Vector2Int> AEstrella(bool[,] bloqueado, Vector2Int inicio, Vector2Int fin)
    {
        int w = bloqueado.GetLength(0), h = bloqueado.GetLength(1);
        bool Libre(Vector2Int p) => p.x >= 0 && p.y >= 0 && p.x < w && p.y < h && !bloqueado[p.x, p.y];
        if (!Libre(inicio) || !Libre(fin)) return null;

        int H(Vector2Int p) => Mathf.Abs(p.x - fin.x) + Mathf.Abs(p.y - fin.y);
        var g = new Dictionary<Vector2Int, int> { [inicio] = 0 };
        var padre = new Dictionary<Vector2Int, Vector2Int>();
        var cerrados = new HashSet<Vector2Int>();
        var abiertos = new PriorityQueue<Vector2Int, int>();
        abiertos.Enqueue(inicio, H(inicio));

        while (abiertos.TryDequeue(out var actual, out _))
        {
            if (actual == fin) return Reconstruir(padre, fin);
            if (!cerrados.Add(actual)) continue;
            foreach (var d in Vecinos)
            {
                var v = actual + d;
                if (!Libre(v) || cerrados.Contains(v)) continue;
                int coste = g[actual] + 1;
                if (g.TryGetValue(v, out int previo) && previo <= coste) continue;
                g[v] = coste;
                padre[v] = actual;
                abiertos.Enqueue(v, coste + H(v));
            }
        }
        return null;
    }

    static List<Vector2Int> Reconstruir(Dictionary<Vector2Int, Vector2Int> padre, Vector2Int fin)
    {
        var camino = new List<Vector2Int> { fin };
        while (padre.TryGetValue(camino[camino.Count - 1], out var p)) camino.Add(p);
        camino.Reverse();
        return camino;
    }
}
`,
    checks: [
      [/PriorityQueue/, 'Usas una cola de prioridad', 'PriorityQueue<Vector2Int, int> saca siempre el nodo con menor f = g + h.', 3],
      [/Mathf\.Abs\s*\([^)]*\)\s*\+\s*Mathf\.Abs|Math\.Abs\s*\([^)]*\)\s*\+\s*Math\.Abs/, 'Heurística Manhattan', 'h = |dx| + |dy| es admisible en 4 direcciones.', 2],
      [/HashSet|cerrad/, 'Lista cerrada', 'Un HashSet con los nodos ya expandidos evita repetir trabajo.'],
      [/padre|vieneDe|cameFrom/i, 'Guardas de dónde vienes', 'Un diccionario hijo → padre permite reconstruir el camino.', 2],
    ],
    hints: ['f = g (coste real desde el inicio) + h (estimación hasta el fin).', 'PriorityQueue no permite cambiar prioridades: encola de nuevo y salta los ya cerrados al sacarlos.'],
    learn: ['A* y heurísticas admisibles', 'Dijkstra vs A* vs BFS', 'NavMesh: A* sobre polígonos en lugar de celdas'],
    search: ['redblobgames.com/pathfinding/a-star', '"A* pathfinding grid C#"', '"unity navmesh how it works"'],
    test: `
bool[,] Mapa(params string[] filas) { var m = new bool[filas[0].Length, filas.Length]; for (int y = 0; y < filas.Length; y++) for (int x = 0; x < filas[0].Length; x++) m[x, y] = filas[y][x] == '#'; return m; }
bool Valido(bool[,] m, List<Vector2Int> c) { for (int i = 1; i < c.Count; i++) if (Mathf.Abs(c[i].x - c[i - 1].x) + Mathf.Abs(c[i].y - c[i - 1].y) != 1 || m[c[i].x, c[i].y]) return false; return true; }
var m1 = Mapa("....", "....", "....");
var c1 = Rutas.AEstrella(m1, new Vector2Int(0, 0), new Vector2Int(3, 2));
Check("mapa vacío: 5 pasos (6 celdas)", () => c1 != null && c1.Count == 6);
Check("empieza en el inicio y acaba en el fin", () => c1[0] == new Vector2Int(0, 0) && c1[c1.Count - 1] == new Vector2Int(3, 2));
var m2 = Mapa(".#....", ".#.##.", ".#..#.", "...#..");
var c2 = Rutas.AEstrella(m2, new Vector2Int(0, 0), new Vector2Int(5, 0));
Check("rodea los muros por el camino más corto", () => c2 != null && c2.Count == 12 && Valido(m2, c2));
Check("sin camino → null", () => Rutas.AEstrella(Mapa("..#..", "..#..", "..#.."), new Vector2Int(0, 0), new Vector2Int(4, 0)) == null);
Check("destino bloqueado o fuera → null", () => Rutas.AEstrella(m2, Vector2Int.zero, new Vector2Int(1, 0)) == null && Rutas.AEstrella(m2, Vector2Int.zero, new Vector2Int(9, 9)) == null);
Check("inicio == fin", () => Rutas.AEstrella(m1, new Vector2Int(2, 1), new Vector2Int(2, 1))?.Count == 1);
var g = new bool[200, 200];
for (int x = 0; x < 200; x += 4) for (int y = 0; y < 200; y++) if (x > 0) g[x, y] = (x / 4) % 2 == 1 ? y != 199 : y != 0;
var sw = System.Diagnostics.Stopwatch.StartNew();
var c3 = Rutas.AEstrella(g, new Vector2Int(0, 0), new Vector2Int(199, 199));
sw.Stop();
Check("laberinto de 200×200 resuelto", () => c3 != null && Valido(g, c3));
Check("en menos de 2 segundos", () => sw.ElapsedMilliseconds < 2000);
`,
  },
  {
    id: 'ia-4', level: 3, title: 'Árbol de comportamiento',
    brief: `Los **behaviour trees** son la IA de casi todos los juegos AAA. Te damos **Resultado** y **Nodo**. Implementa:
- **Accion(Func<Resultado> f)**: devuelve lo que devuelva f.
- **Condicion(Func<bool> f)**: Exito o Fallo.
- **Inversor(Nodo hijo)**: cambia Exito ↔ Fallo; Corriendo se queda igual.
- **Secuencia(params Nodo[] hijos)**: ejecuta en orden mientras tengan éxito. Falla en cuanto uno falla. Si uno devuelve **Corriendo**, devuelve Corriendo y **en el siguiente Tick continúa por ese mismo hijo** (sin repetir los anteriores). Al terminar (Exito o Fallo) vuelve a empezar desde el primero.
- **Selector(params Nodo[] hijos)**: prueba en orden hasta que uno no falle. Misma memoria con Corriendo.`,
    starter: `using System;

public enum Resultado { Exito, Fallo, Corriendo }

public abstract class Nodo
{
    public abstract Resultado Tick();
}

// tu código aquí
`,
    solution: `using System;

public enum Resultado { Exito, Fallo, Corriendo }

public abstract class Nodo
{
    public abstract Resultado Tick();
}

public class Accion : Nodo
{
    readonly Func<Resultado> f;
    public Accion(Func<Resultado> f) { this.f = f; }
    public override Resultado Tick() => f();
}

public class Condicion : Nodo
{
    readonly Func<bool> f;
    public Condicion(Func<bool> f) { this.f = f; }
    public override Resultado Tick() => f() ? Resultado.Exito : Resultado.Fallo;
}

public class Inversor : Nodo
{
    readonly Nodo hijo;
    public Inversor(Nodo hijo) { this.hijo = hijo; }
    public override Resultado Tick() => hijo.Tick() switch
    {
        Resultado.Exito => Resultado.Fallo,
        Resultado.Fallo => Resultado.Exito,
        _ => Resultado.Corriendo,
    };
}

public abstract class Compuesto : Nodo
{
    protected readonly Nodo[] hijos;
    protected int actual;
    protected Compuesto(Nodo[] hijos) { this.hijos = hijos; }

    // Sigue mientras el hijo devuelva "continuar"; para en cuanto devuelva "parar".
    protected Resultado Recorrer(Resultado continuar)
    {
        while (actual < hijos.Length)
        {
            var r = hijos[actual].Tick();
            if (r == Resultado.Corriendo) return r;
            if (r != continuar) { actual = 0; return r; }
            actual++;
        }
        actual = 0;
        return continuar;
    }
}

public class Secuencia : Compuesto
{
    public Secuencia(params Nodo[] hijos) : base(hijos) { }
    public override Resultado Tick() => Recorrer(Resultado.Exito);
}

public class Selector : Compuesto
{
    public Selector(params Nodo[] hijos) : base(hijos) { }
    public override Resultado Tick() => Recorrer(Resultado.Fallo);
}
`,
    checks: [
      [/:\s*Nodo/, 'Los nodos heredan de Nodo', 'class Secuencia : Nodo (o de una base común).'],
      [/Corriendo/, 'Tratas el estado Corriendo', 'Corriendo detiene el recorrido y se recuerda el hijo.', 2],
      [/actual|indice|índice|hijoActual/i, 'Recuerdas el hijo en curso', 'Un índice "actual" permite continuar en el siguiente Tick.', 3],
      [/=\s*0\s*;/, 'Reinicias al terminar', 'Al devolver Exito o Fallo, vuelve a empezar por el primero.'],
    ],
    hints: ['Secuencia y Selector son el mismo algoritmo con el papel de Exito y Fallo intercambiado.', 'Sin memoria, una acción larga (andar hasta un punto) haría re-evaluar todo cada Tick.'],
    learn: ['Behaviour trees: secuencia, selector, decoradores', 'Blackboard (memoria compartida)', 'Behavior Designer, NodeCanvas y Unity Behavior'],
    search: ['"behavior trees for AI how they work" gamedeveloper', '"behaviour tree sequence selector running"', '"unity behavior package"'],
    test: `
var log = new List<string>();
Nodo A(string n, params Resultado[] rs) { int i = 0; return new Accion(() => { log.Add(n); return rs[Math.Min(i++, rs.Length - 1)]; }); }
Check("Condicion", () => new Condicion(() => true).Tick() == Resultado.Exito && new Condicion(() => false).Tick() == Resultado.Fallo);
Check("Inversor", () => new Inversor(new Condicion(() => true)).Tick() == Resultado.Fallo && new Inversor(A("x", Resultado.Corriendo)).Tick() == Resultado.Corriendo);
log.Clear();
var s = new Secuencia(A("a", Resultado.Exito), A("b", Resultado.Exito));
Check("Secuencia: todos con éxito", () => s.Tick() == Resultado.Exito && string.Join(",", log) == "a,b");
log.Clear();
Check("Secuencia falla en el primero que falla", () => new Secuencia(A("a", Resultado.Fallo), A("b", Resultado.Exito)).Tick() == Resultado.Fallo && string.Join(",", log) == "a");
log.Clear();
var s2 = new Secuencia(A("a", Resultado.Exito), A("andar", Resultado.Corriendo, Resultado.Corriendo, Resultado.Exito), A("c", Resultado.Exito));
var r1 = s2.Tick(); var r2 = s2.Tick(); var r3 = s2.Tick();
Check("Secuencia recuerda el hijo Corriendo", () => r1 == Resultado.Corriendo && r2 == Resultado.Corriendo && r3 == Resultado.Exito);
Check("sin repetir los anteriores", () => string.Join(",", log) == "a,andar,andar,andar,c");
log.Clear(); s2.Tick();
Check("al terminar vuelve a empezar", () => log[0] == "a");
log.Clear();
var sel = new Selector(A("a", Resultado.Fallo), A("b", Resultado.Exito), A("c", Resultado.Exito));
Check("Selector: primero que no falla", () => sel.Tick() == Resultado.Exito && string.Join(",", log) == "a,b");
log.Clear();
Check("Selector: todos fallan", () => new Selector(A("a", Resultado.Fallo), A("b", Resultado.Fallo)).Tick() == Resultado.Fallo);
log.Clear();
var sel2 = new Selector(A("a", Resultado.Fallo), A("b", Resultado.Corriendo, Resultado.Exito));
sel2.Tick(); sel2.Tick();
Check("Selector recuerda el hijo Corriendo", () => string.Join(",", log) == "a,b,b");
bool veEnemigo = false; string hecho = "";
var arbol = new Selector(
    new Secuencia(new Condicion(() => veEnemigo), new Accion(() => { hecho = "atacar"; return Resultado.Exito; })),
    new Accion(() => { hecho = "patrullar"; return Resultado.Exito; }));
arbol.Tick(); var h1 = hecho; veEnemigo = true; arbol.Tick();
Check("un árbol pequeño: patrulla y luego ataca", () => h1 == "patrullar" && hecho == "atacar");
`,
  },
  {
    id: 'ia-5', level: 3, title: 'Utility AI con inercia',
    brief: `En *utility AI* cada acción tiene una puntuación y se elige la mejor (como los Sims). Te damos **Opcion**. Escribe **static class Utilidad**:
- **float Puntuar(Opcion o)**: multiplica todas sus **consideraciones**, cada una limitada a [0, 1]. Sin consideraciones vale 0.
- **float Curva(float x, float exponente)**: x limitado a [0, 1] elevado al exponente (para dar forma a las consideraciones).
- **string Elegir(IReadOnlyList<Opcion> opciones, string accionActual, float inercia, float minimo)**:
  - Suma *inercia* a la puntuación de la acción que ya se está haciendo (evita que la IA cambie de idea cada fotograma).
  - Devuelve el nombre de la mejor; en empate, la primera de la lista.
  - Si ninguna llega a *minimo* (con la inercia incluida), devuelve null.`,
    starter: `using System;
using System.Collections.Generic;

public class Opcion
{
    public string Nombre;
    public List<Func<float>> Consideraciones = new List<Func<float>>();
    public Opcion(string nombre, params Func<float>[] consideraciones) { Nombre = nombre; Consideraciones.AddRange(consideraciones); }
}

public static class Utilidad
{
    // tu código aquí
}
`,
    solution: `using System;
using System.Collections.Generic;

public class Opcion
{
    public string Nombre;
    public List<Func<float>> Consideraciones = new List<Func<float>>();
    public Opcion(string nombre, params Func<float>[] consideraciones) { Nombre = nombre; Consideraciones.AddRange(consideraciones); }
}

public static class Utilidad
{
    static float Clamp01(float x) => x < 0 ? 0 : x > 1 ? 1 : x;

    public static float Puntuar(Opcion o)
    {
        if (o.Consideraciones.Count == 0) return 0;
        float p = 1;
        foreach (var c in o.Consideraciones)
        {
            p *= Clamp01(c());
            if (p == 0) break;
        }
        return p;
    }

    public static float Curva(float x, float exponente) => (float)Math.Pow(Clamp01(x), exponente);

    public static string Elegir(IReadOnlyList<Opcion> opciones, string accionActual, float inercia, float minimo)
    {
        string mejor = null;
        float mejorPuntos = float.NegativeInfinity;
        foreach (var o in opciones)
        {
            float p = Puntuar(o) + (o.Nombre == accionActual ? inercia : 0);
            if (p > mejorPuntos) { mejorPuntos = p; mejor = o.Nombre; }
        }
        return mejorPuntos >= minimo ? mejor : null;
    }
}
`,
    checks: [
      [/\*=/, 'Multiplicas las consideraciones', 'Multiplicar hace que cualquier consideración a 0 anule la acción (un "veto").', 2],
      [/Clamp|<\s*0\s*\?\s*0/, 'Limitas a [0, 1]', 'Una consideración fuera de rango descuadra todo.'],
      [/inercia/, 'Aplicas la inercia a la acción actual', 'Suma inercia solo si o.Nombre == accionActual.', 2],
      [/>\s*mejor/, 'Empate: la primera gana', 'Usa > (no >=) para no reemplazar en empate.', 2],
      [/Pow/, 'Curva con potencia', 'Math.Pow(x, exponente) da curvas cuadráticas, cúbicas...'],
    ],
    hints: ['Si "comer" tiene hambre 0,9 pero no hay comida (0), la acción no debe elegirse: por eso se multiplica.', 'Sin inercia, dos acciones con 0,50 y 0,51 que oscilan hacen que la IA "tiemble".'],
    learn: ['Utility AI y curvas de respuesta', 'Histéresis/inercia en la toma de decisiones', 'Dave Mark, "Building a Better Centaur" (GDC)'],
    search: ['"utility AI game" Dave Mark', '"infinite axis utility system"', '"utility ai unity"'],
    test: `
float hambre = 0.8f, hayComida = 1, cansancio = 0.3f, enemigos = 0;
var ops = new List<Opcion> {
    new Opcion("comer", () => hambre, () => hayComida),
    new Opcion("dormir", () => Utilidad.Curva(cansancio, 2)),
    new Opcion("huir", () => enemigos),
    new Opcion("nada"),
};
Check("Puntuar multiplica", () => Math.Abs(Utilidad.Puntuar(ops[0]) - 0.8f) < 1e-4);
Check("sin consideraciones vale 0", () => Utilidad.Puntuar(ops[3]) == 0);
Check("Curva cuadrática", () => Math.Abs(Utilidad.Curva(0.5f, 2) - 0.25f) < 1e-4 && Utilidad.Curva(2, 2) == 1);
Check("elige la mejor", () => Utilidad.Elegir(ops, null, 0, 0.1f) == "comer");
hayComida = 0;
Check("una consideración a 0 veta la acción", () => Utilidad.Elegir(ops, null, 0, 0.01f) == "dormir");
Check("limita valores fuera de rango", () => { enemigos = 5; var r = Utilidad.Puntuar(ops[2]); enemigos = 0; return r == 1; });
hayComida = 1; hambre = 0.5f; cansancio = Mathf.Sqrt(0.52f);
Check("sin inercia cambia a la de 0,52", () => Utilidad.Elegir(ops, "comer", 0, 0) == "dormir");
Check("con inercia mantiene la actual", () => Utilidad.Elegir(ops, "comer", 0.1f, 0) == "comer");
Check("por debajo del mínimo → null", () => Utilidad.Elegir(ops, null, 0, 0.9f) == null);
var emp = new List<Opcion> { new Opcion("a", () => 0.5f), new Opcion("b", () => 0.5f) };
Check("empate: la primera", () => Utilidad.Elegir(emp, null, 0, 0) == "a");
`,
  },
];

module.exports = { track, challenges };
