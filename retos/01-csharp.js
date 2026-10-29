// Ruta C# para juegos: el lenguaje de Unity, con ejemplos de gameplay.
const track = { id: 'csharp', name: 'C# para juegos', lang: 'csharp', color: '#B794F6', blurb: 'Clases, colecciones, interfaces, eventos y LINQ con ejemplos de gameplay.' };

const challenges = [
  {
    id: 'cs-1', level: 1, title: 'Vida con límites',
    brief: `Crea una clase **Salud** para un personaje.
- Constructor **Salud(int maxima)**: empieza con la vida llena.
- Propiedades de solo lectura desde fuera: **Maxima** y **Actual**.
- **RecibirDaño(int cantidad)**: resta vida sin bajar de 0. Una cantidad negativa se ignora.
- **Curar(int cantidad)**: suma vida sin pasar de Maxima. Una cantidad negativa se ignora.
- **EstaMuerto**: true cuando Actual es 0.`,
    starter: `public class Salud
{
    // tu código aquí
}
`,
    solution: `using System;

public class Salud
{
    public int Maxima { get; }
    public int Actual { get; private set; }
    public bool EstaMuerto => Actual == 0;

    public Salud(int maxima)
    {
        Maxima = maxima;
        Actual = maxima;
    }

    public void RecibirDaño(int cantidad)
    {
        if (cantidad <= 0) return;
        Actual = Math.Max(0, Actual - cantidad);
    }

    public void Curar(int cantidad)
    {
        if (cantidad <= 0 || EstaMuerto) return;
        Actual = Math.Min(Maxima, Actual + cantidad);
    }
}
`,
    checks: [
      [/class\s+Salud/, 'Declaras la clase Salud', 'Declara "public class Salud".'],
      [/Actual\s*\{\s*get;\s*private\s+set;/, 'Actual solo se cambia desde dentro', 'Usa "public int Actual { get; private set; }" para que nadie la cambie desde fuera.', 2],
      [/Math(f)?\.(Max|Min|Clamp)|<\s*0|>\s*Maxima/, 'Limitas la vida entre 0 y Maxima', 'Usa Math.Max / Math.Min o Math.Clamp para no salirte del rango.', 2],
      [/<=?\s*0\)?\s*return|cantidad\s*<\s*0/, 'Ignoras cantidades negativas', 'Un daño negativo curaría: compruébalo y sal con return.'],
      [/EstaMuerto\s*=>|bool\s+EstaMuerto/, 'Propiedad EstaMuerto', 'Una propiedad calculada: public bool EstaMuerto => Actual == 0;'],
    ],
    hints: ['Una propiedad con "private set" se lee desde fuera pero solo se escribe desde la clase.', 'Math.Max(0, Actual - cantidad) nunca baja de 0.'],
    learn: ['Propiedades auto-implementadas y modificadores de acceso', 'Encapsulación: por qué no hacer públicos los campos', 'Propiedades calculadas (expression-bodied members)'],
    search: ['"C# properties private set"', 'learn.microsoft.com C# properties', '"encapsulation game health system"'],
    test: `
var s = new Salud(100);
Check("empieza con la vida llena", () => s.Actual == 100 && s.Maxima == 100);
s.RecibirDaño(30);
Check("RecibirDaño(30) deja 70", () => s.Actual == 70);
s.RecibirDaño(-10);
Check("un daño negativo se ignora", () => s.Actual == 70);
s.Curar(50);
Check("curar no pasa de la máxima", () => s.Actual == 100);
s.Curar(-5);
Check("una curación negativa se ignora", () => s.Actual == 100);
s.RecibirDaño(500);
Check("la vida no baja de 0", () => s.Actual == 0);
Check("EstaMuerto a 0", () => s.EstaMuerto);
Check("Actual no tiene setter público", () => typeof(Salud).GetProperty("Actual").GetSetMethod() == null);
`,
  },
  {
    id: 'cs-2', level: 1, title: 'Inventario con diccionario',
    brief: `Crea una clase **Inventario** que guarde objetos apilables por nombre.
- Constructor **Inventario(int huecos)**: número máximo de tipos de objeto distintos.
- **bool Agregar(string objeto, int cantidad)**: suma la cantidad. Si es un tipo nuevo y no quedan huecos, devuelve false y no cambia nada.
- **bool Quitar(string objeto, int cantidad)**: si no hay suficiente, devuelve false y no cambia nada. Si llega a 0, el tipo deja de ocupar hueco.
- **int Cantidad(string objeto)**: 0 si no lo tiene.
- **int HuecosLibres**.`,
    starter: `using System.Collections.Generic;

public class Inventario
{
    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;

public class Inventario
{
    private readonly Dictionary<string, int> objetos = new();
    private readonly int huecos;

    public Inventario(int huecos)
    {
        this.huecos = huecos;
    }

    public int HuecosLibres => huecos - objetos.Count;

    public int Cantidad(string objeto) => objetos.TryGetValue(objeto, out var n) ? n : 0;

    public bool Agregar(string objeto, int cantidad)
    {
        if (cantidad <= 0) return false;
        if (!objetos.ContainsKey(objeto))
        {
            if (HuecosLibres == 0) return false;
            objetos[objeto] = 0;
        }
        objetos[objeto] += cantidad;
        return true;
    }

    public bool Quitar(string objeto, int cantidad)
    {
        int actual = Cantidad(objeto);
        if (cantidad <= 0 || actual < cantidad) return false;
        if (actual == cantidad) objetos.Remove(objeto);
        else objetos[objeto] = actual - cantidad;
        return true;
    }
}
`,
    checks: [
      [/Dictionary\s*<\s*string\s*,\s*int\s*>/, 'Usas Dictionary<string, int>', 'Un diccionario nombre → cantidad es la estructura natural.', 2],
      [/TryGetValue|ContainsKey/, 'Consultas sin lanzar excepción', 'TryGetValue evita la KeyNotFoundException.'],
      [/\.Remove\s*\(/, 'Liberas el hueco al llegar a 0', 'Quita la clave cuando la cantidad llega a 0.'],
      [/HuecosLibres/, 'Expones HuecosLibres', 'public int HuecosLibres => huecos - objetos.Count;'],
    ],
    hints: ['diccionario.Count te dice cuántos tipos distintos tienes.', 'Comprueba todo antes de modificar: así no dejas el inventario a medias.'],
    learn: ['Dictionary<TKey, TValue> y TryGetValue', 'Validar antes de mutar (operaciones atómicas)', 'Inventarios apilables en juegos'],
    search: ['"C# Dictionary TryGetValue"', '"unity inventory system stackable"', 'learn.microsoft.com Dictionary'],
    test: `
var inv = new Inventario(2);
Check("Agregar un objeto nuevo", () => inv.Agregar("poción", 3) && inv.Cantidad("poción") == 3);
Check("apilar el mismo objeto no gasta hueco", () => inv.Agregar("poción", 2) && inv.Cantidad("poción") == 5 && inv.HuecosLibres == 1);
Check("segundo tipo ocupa el último hueco", () => inv.Agregar("flecha", 10) && inv.HuecosLibres == 0);
Check("sin huecos no entra un tipo nuevo", () => !inv.Agregar("espada", 1) && inv.Cantidad("espada") == 0);
Check("Quitar más de lo que hay falla sin cambiar nada", () => !inv.Quitar("poción", 9) && inv.Cantidad("poción") == 5);
Check("Quitar una parte", () => inv.Quitar("flecha", 4) && inv.Cantidad("flecha") == 6);
Check("al llegar a 0 se libera el hueco", () => inv.Quitar("flecha", 6) && inv.HuecosLibres == 1 && inv.Cantidad("flecha") == 0);
Check("Cantidad de algo que no existe es 0", () => inv.Cantidad("nada") == 0);
`,
  },
  {
    id: 'cs-3', level: 2, title: 'Enemigos con herencia',
    brief: `Modela enemigos con una clase base abstracta.
- **abstract class Enemigo** con **Nombre** (string), **Vida** (int, protegida para escribir), constructor **Enemigo(string nombre, int vida)**.
- **abstract int Ataque()**: el daño que hace.
- **virtual void RecibirGolpe(int daño)**: resta vida (mínimo 0).
- **Slime : Enemigo** → vida 30, Ataque() = 5.
- **Jefe : Enemigo** → vida 200, Ataque() = 20 y su RecibirGolpe recibe solo **la mitad** del daño (redondeando hacia abajo) gracias a su armadura.
- Constructores sin parámetros para Slime y Jefe.`,
    starter: `public abstract class Enemigo
{
    // tu código aquí
}
`,
    solution: `using System;

public abstract class Enemigo
{
    public string Nombre { get; }
    public int Vida { get; protected set; }

    protected Enemigo(string nombre, int vida)
    {
        Nombre = nombre;
        Vida = vida;
    }

    public abstract int Ataque();

    public virtual void RecibirGolpe(int daño)
    {
        Vida = Math.Max(0, Vida - daño);
    }
}

public class Slime : Enemigo
{
    public Slime() : base("Slime", 30) { }
    public override int Ataque() => 5;
}

public class Jefe : Enemigo
{
    public Jefe() : base("Jefe", 200) { }
    public override int Ataque() => 20;

    public override void RecibirGolpe(int daño)
    {
        base.RecibirGolpe(daño / 2);
    }
}
`,
    checks: [
      [/abstract\s+class\s+Enemigo/, 'Enemigo es abstracta', 'Nadie debería crear un "Enemigo" genérico: hazla abstract.'],
      [/abstract\s+int\s+Ataque/, 'Ataque abstracto', 'Cada enemigo decide su ataque: public abstract int Ataque();'],
      [/virtual\s+void\s+RecibirGolpe/, 'RecibirGolpe virtual', 'Márcalo virtual para que el Jefe lo pueda cambiar.'],
      [/override\s+void\s+RecibirGolpe/, 'El Jefe sobrescribe RecibirGolpe', 'Usa override en Jefe.', 2],
      [/base\.RecibirGolpe/, 'Reutilizas la lógica base', 'Llama a base.RecibirGolpe(daño / 2) en vez de copiar código.', 2],
      [/:\s*base\s*\(/, 'Encadenas constructores', 'public Slime() : base("Slime", 30) { }'],
    ],
    hints: ['"protected set" deja escribir Vida a las clases hijas, pero no a otras.', 'Con base.Metodo() llamas a la versión de la clase padre.'],
    learn: ['Clases abstractas vs interfaces', 'virtual, override y base', 'Cuándo la herencia es buena idea y cuándo usar composición'],
    search: ['"C# abstract class vs interface"', '"C# virtual override base"', '"composition over inheritance unity"'],
    test: `
Enemigo s = new Slime();
Enemigo j = new Jefe();
Check("Slime: nombre, vida 30 y ataque 5", () => s.Nombre == "Slime" && s.Vida == 30 && s.Ataque() == 5);
Check("Jefe: vida 200 y ataque 20", () => j.Vida == 200 && j.Ataque() == 20);
s.RecibirGolpe(12);
Check("Slime recibe el golpe completo", () => s.Vida == 18);
j.RecibirGolpe(15);
Check("Jefe recibe la mitad (15 → 7)", () => j.Vida == 193);
s.RecibirGolpe(100);
Check("la vida no baja de 0", () => s.Vida == 0);
Check("Enemigo es abstracta", () => typeof(Enemigo).IsAbstract);
Check("polimorfismo: suma de ataques de una lista", () => new List<Enemigo> { new Slime(), new Jefe(), new Slime() }.Sum(e => e.Ataque()) == 30);
`,
  },
  {
    id: 'cs-4', level: 2, title: 'Interfaces: todo lo que se puede dañar',
    brief: `Una explosión debe dañar a todo lo que pueda recibir daño, sin saber qué es.
- **interface IDañable** con **void RecibirDaño(int cantidad)** y **bool Destruido { get; }**.
- **Barril : IDañable**: aguanta 10 de daño acumulado; al llegar a 10 o más queda Destruido.
- **Caja : IDañable**: se destruye con cualquier daño mayor que 0.
- **static class Explosion** con **int Aplicar(IEnumerable<IDañable> objetivos, int daño)**: daña solo a los que **no** están destruidos y devuelve cuántos quedaron destruidos **por esta explosión**.`,
    starter: `using System.Collections.Generic;

public interface IDañable
{
    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;

public interface IDañable
{
    void RecibirDaño(int cantidad);
    bool Destruido { get; }
}

public class Barril : IDañable
{
    private int dañoAcumulado;
    public bool Destruido => dañoAcumulado >= 10;

    public void RecibirDaño(int cantidad)
    {
        if (cantidad > 0) dañoAcumulado += cantidad;
    }
}

public class Caja : IDañable
{
    public bool Destruido { get; private set; }

    public void RecibirDaño(int cantidad)
    {
        if (cantidad > 0) Destruido = true;
    }
}

public static class Explosion
{
    public static int Aplicar(IEnumerable<IDañable> objetivos, int daño)
    {
        int destruidos = 0;
        foreach (var o in objetivos)
        {
            if (o.Destruido) continue;
            o.RecibirDaño(daño);
            if (o.Destruido) destruidos++;
        }
        return destruidos;
    }
}
`,
    checks: [
      [/interface\s+IDañable/, 'Declaras la interfaz', 'public interface IDañable { ... }'],
      [/class\s+Barril\s*:\s*IDañable/, 'Barril implementa IDañable', 'class Barril : IDañable'],
      [/class\s+Caja\s*:\s*IDañable/, 'Caja implementa IDañable', 'class Caja : IDañable'],
      [/IEnumerable\s*<\s*IDañable\s*>/, 'Explosion trabaja con la interfaz', 'Recibe IEnumerable<IDañable>: así sirve para cualquier cosa dañable.', 2],
      [/if\s*\(\s*\w+\.Destruido\s*\)\s*continue/, 'Saltas los ya destruidos', 'Comprueba Destruido antes de dañar.'],
    ],
    hints: ['En Unity harías GetComponent<IDañable>() sobre lo que toca la explosión: las interfaces funcionan con GetComponent.', 'Cuenta solo los que pasan de "no destruido" a "destruido".'],
    learn: ['Interfaces en C#', 'Programar contra abstracciones', 'GetComponent<Interfaz>() en Unity'],
    search: ['"unity interface GetComponent IDamageable"', '"C# interfaces tutorial"', '"dependency inversion principle games"'],
    test: `
var b = new Barril(); var c = new Caja(); var b2 = new Barril();
var todos = new List<IDañable> { b, c, b2 };
Check("primera explosión de 6: solo la caja cae", () => Explosion.Aplicar(todos, 6) == 1 && c.Destruido && !b.Destruido);
Check("segunda explosión de 6: caen los dos barriles", () => Explosion.Aplicar(todos, 6) == 2 && b.Destruido && b2.Destruido);
Check("una tercera no destruye nada nuevo", () => Explosion.Aplicar(todos, 50) == 0);
var b3 = new Barril(); b3.RecibirDaño(-5); b3.RecibirDaño(9);
Check("el barril aguanta 9", () => !b3.Destruido);
Check("daño 0 no rompe la caja", () => { var k = new Caja(); k.RecibirDaño(0); return !k.Destruido; });
Check("Explosion acepta un array", () => Explosion.Aplicar(new IDañable[] { new Caja() }, 1) == 1);
`,
  },
  {
    id: 'cs-5', level: 3, title: 'Eventos: avisar sin acoplar',
    brief: `La UI, el audio y los logros quieren enterarse cuando cambia la vida, sin que la clase de vida los conozca.
Crea **VidaConEventos**:
- Constructor **VidaConEventos(int maxima)**.
- **event Action<int, int> AlCambiar** → se invoca con (actual, maxima) cada vez que la vida **cambia de valor**.
- **event Action AlMorir** → se invoca **una sola vez**, cuando llega a 0.
- **void Modificar(int delta)**: suma o resta (negativo = daño), limitado a [0, maxima]. Si ya está muerta, no hace nada.
- Si nadie está suscrito, no debe fallar.`,
    starter: `using System;

public class VidaConEventos
{
    // tu código aquí
}
`,
    solution: `using System;

public class VidaConEventos
{
    public event Action<int, int> AlCambiar;
    public event Action AlMorir;

    public int Maxima { get; }
    public int Actual { get; private set; }

    public VidaConEventos(int maxima)
    {
        Maxima = maxima;
        Actual = maxima;
    }

    public void Modificar(int delta)
    {
        if (Actual == 0) return;
        int nueva = Math.Clamp(Actual + delta, 0, Maxima);
        if (nueva == Actual) return;
        Actual = nueva;
        AlCambiar?.Invoke(Actual, Maxima);
        if (Actual == 0) AlMorir?.Invoke();
    }
}
`,
    checks: [
      [/event\s+Action\s*<\s*int\s*,\s*int\s*>\s+AlCambiar/, 'Evento AlCambiar con (actual, maxima)', 'public event Action<int, int> AlCambiar;', 2],
      [/event\s+Action\s+AlMorir/, 'Evento AlMorir', 'public event Action AlMorir;'],
      [/\?\.\s*Invoke/, 'Invocas de forma segura con ?.', 'AlCambiar?.Invoke(...) no falla si nadie está suscrito.', 2],
      [/Clamp/, 'Limitas con Clamp', 'Math.Clamp(valor, 0, Maxima).'],
    ],
    hints: ['La palabra "event" impide que alguien de fuera invoque el evento o lo borre con =.', 'Si ya está muerta al principio de Modificar, sal: así AlMorir solo ocurre una vez.'],
    learn: ['Delegados, Action y Func', 'La palabra clave event', 'Patrón observador y por qué desacopla UI y lógica', 'Desuscribirse (-=) para no tener fugas'],
    search: ['"C# event Action unity"', '"unity observer pattern events"', '"C# null conditional invoke"'],
    test: `
var v = new VidaConEventos(50);
var cambios = new List<string>(); int muertes = 0;
v.AlCambiar += (a, m) => cambios.Add(a + "/" + m);
v.AlMorir += () => muertes++;
v.Modificar(-20);
Check("AlCambiar recibe (actual, máxima)", () => cambios.Count == 1 && cambios[0] == "30/50");
v.Modificar(+100);
Check("curar limita a la máxima", () => v.Actual == 50 && cambios.Last() == "50/50");
v.Modificar(+5);
Check("si el valor no cambia, no avisa", () => cambios.Count == 2);
v.Modificar(-80);
Check("AlMorir se lanza al llegar a 0", () => v.Actual == 0 && muertes == 1);
v.Modificar(-10); v.Modificar(+10);
Check("muerta no cambia ni vuelve a morir", () => muertes == 1 && v.Actual == 0 && cambios.Count == 3);
Check("sin suscriptores no falla", () => { var w = new VidaConEventos(10); w.Modificar(-10); return w.Actual == 0; });
Check("AlCambiar es un event", () => typeof(VidaConEventos).GetEvent("AlCambiar") != null);
`,
  },
  {
    id: 'cs-6', level: 3, title: 'LINQ para elegir objetivo',
    brief: `Una torreta debe elegir a quién disparar. Te damos el tipo:
~~~
public record Unidad(string Nombre, Vector3 Posicion, int Vida, string Equipo);
~~~
Crea **static class Objetivos** con:
- **Unidad MasCercana(IEnumerable<Unidad> unidades, Vector3 origen, string miEquipo, float alcance)**: la unidad viva (Vida > 0) de **otro** equipo más cercana dentro del alcance. Si no hay ninguna, null.
- **List<string> MasDebiles(IEnumerable<Unidad> unidades, int n)**: nombres de las n unidades vivas con menos vida; en empate, por nombre alfabético.

Incluye el record en tu código (ya está en el código inicial).`,
    starter: `using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public record Unidad(string Nombre, Vector3 Posicion, int Vida, string Equipo);

public static class Objetivos
{
    // tu código aquí
}
`,
    solution: `using System.Collections.Generic;
using System.Linq;
using UnityEngine;

public record Unidad(string Nombre, Vector3 Posicion, int Vida, string Equipo);

public static class Objetivos
{
    public static Unidad MasCercana(IEnumerable<Unidad> unidades, Vector3 origen, string miEquipo, float alcance)
    {
        float alcance2 = alcance * alcance;
        return unidades
            .Where(u => u.Vida > 0 && u.Equipo != miEquipo)
            .Where(u => (u.Posicion - origen).sqrMagnitude <= alcance2)
            .OrderBy(u => (u.Posicion - origen).sqrMagnitude)
            .FirstOrDefault();
    }

    public static List<string> MasDebiles(IEnumerable<Unidad> unidades, int n)
    {
        return unidades
            .Where(u => u.Vida > 0)
            .OrderBy(u => u.Vida)
            .ThenBy(u => u.Nombre)
            .Take(n)
            .Select(u => u.Nombre)
            .ToList();
    }
}
`,
    checks: [
      [/\.Where\s*\(/, 'Filtras con Where', 'Where(u => u.Vida > 0 && u.Equipo != miEquipo)'],
      [/\.OrderBy\s*\(/, 'Ordenas con OrderBy', 'OrderBy por distancia o por vida.'],
      [/\.ThenBy\s*\(/, 'Desempatas con ThenBy', 'ThenBy(u => u.Nombre) resuelve los empates.', 2],
      [/FirstOrDefault/, 'Devuelves null si no hay', 'FirstOrDefault() devuelve null en una secuencia vacía.'],
      [/sqrMagnitude/, 'Comparas distancias al cuadrado', 'sqrMagnitude evita la raíz cuadrada: más rápido y el orden es el mismo.', 2],
    ],
    hints: ['Compara (u.Posicion - origen).sqrMagnitude con alcance * alcance.', 'LINQ asigna memoria: en un Update de 1000 torretas lo cambiarías por un bucle. Aquí es perfecto.'],
    learn: ['LINQ: Where, OrderBy, ThenBy, Take, Select', 'Records en C#', 'Coste de LINQ en el bucle de juego (asignaciones)'],
    search: ['"C# LINQ OrderBy ThenBy"', '"C# record type"', '"unity LINQ garbage collection"'],
    test: `
var us = new List<Unidad> {
    new("orco", new Vector3(5, 0, 0), 10, "rojo"),
    new("elfo", new Vector3(2, 0, 0), 30, "azul"),
    new("troll", new Vector3(3, 0, 0), 0, "rojo"),
    new("goblin", new Vector3(0, 0, 8), 10, "rojo"),
    new("ogro", new Vector3(20, 0, 0), 5, "rojo"),
};
Check("elige el enemigo vivo más cercano", () => Objetivos.MasCercana(us, Vector3.zero, "azul", 10)?.Nombre == "orco");
Check("ignora a los de su equipo", () => Objetivos.MasCercana(us, Vector3.zero, "rojo", 10)?.Nombre == "elfo");
Check("respeta el alcance", () => Objetivos.MasCercana(us, Vector3.zero, "azul", 4) == null);
Check("alcance justo en el borde cuenta", () => Objetivos.MasCercana(us, Vector3.zero, "azul", 5)?.Nombre == "orco");
Check("MasDebiles con empate alfabético", () => string.Join(",", Objetivos.MasDebiles(us, 3)) == "ogro,goblin,orco");
Check("MasDebiles ignora a los muertos", () => !Objetivos.MasDebiles(us, 10).Contains("troll"));
Check("lista vacía", () => Objetivos.MasCercana(new List<Unidad>(), Vector3.zero, "a", 99) == null && Objetivos.MasDebiles(new List<Unidad>(), 2).Count == 0);
`,
  },
];

module.exports = { track, challenges };
