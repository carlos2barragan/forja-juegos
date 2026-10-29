---
id: l-csharp-abstraccion
grupo: csharp
min: 14
titulo: Herencia, interfaces, eventos y LINQ
resumen: Cuatro herramientas para que tu código crezca sin enredarse: clases base, contratos, avisos y consultas.
practica: cs-3, cs-4, cs-5, cs-6
clave:
- abstract obliga a las hijas a implementar; virtual les permite cambiar el comportamiento.
- Una interfaz dice qué sabe hacer algo, sin importar qué es: así una explosión daña barriles y enemigos por igual.
- Un event solo lo puede invocar su clase; usa ?.Invoke para no fallar si nadie escucha.
- LINQ es cómodo pero asigna memoria: úsalo en decisiones puntuales, no en cada Update.
---
## Herencia: una base con huecos
Una **clase abstracta** no se puede instanciar. Define lo común y deja huecos que las hijas rellenan.

~~~
public abstract class Arma
{
    public string Nombre { get; }
    protected int municion;                    // las hijas sí pueden tocarlo

    protected Arma(string nombre, int municion) { Nombre = nombre; this.municion = municion; }

    public abstract int Daño();                // cada hija DEBE implementarlo
    public virtual bool Disparar()             // cada hija PUEDE cambiarlo
    {
        if (municion == 0) return false;
        municion--;
        return true;
    }
}

public class Escopeta : Arma
{
    public Escopeta() : base("Escopeta", 8) { }
    public override int Daño() => 40;
    public override bool Disparar() => base.Disparar() && base.Disparar();   // gasta dos
}
~~~

- `: base(...)` llama al constructor del padre.
- `override` reemplaza; `base.Metodo()` reutiliza la versión del padre.
- `protected` es visible para las hijas, no para el resto.

Para dividir entre enteros redondeando hacia abajo basta con `/`: `7 / 2` es `3`.

**Cuidado:** la herencia profunda (Enemigo → Volador → Dragon → DragonDeHielo) se vuelve rígida. En Unity se prefiere la **composición**: varios componentes pequeños en un GameObject.

## Interfaces: contratos
Una interfaz solo declara lo que algo sabe hacer.

~~~
public interface IInteractuable
{
    string Texto { get; }
    void Usar();
}

public class Palanca : IInteractuable { /* ... */ }
public class Cofre : IInteractuable { /* ... */ }
~~~

Ahora el jugador puede usar cualquier cosa sin saber qué es. En Unity: `GetComponent<IInteractuable>()` funciona con interfaces.

Para contar cuántos cambiaron con una acción, mira el estado **antes** y **después** de cada uno:

~~~
int abiertos = 0;
foreach (var c in cofres)
{
    if (c.Abierto) continue;      // ya estaba: no cuenta
    c.Usar();
    if (c.Abierto) abiertos++;
}
~~~

## Eventos: avisar sin conocer
La vida no debería saber que existe una barra de UI, un sonido y un logro. Solo anuncia que cambió.

~~~
using System;

public class Puntuacion
{
    public event Action<int> AlCambiar;    // quien quiera, se suscribe
    public event Action AlRecord;

    int puntos;
    public void Sumar(int n)
    {
        if (n == 0) return;                 // no cambió: no avises
        puntos += n;
        AlCambiar?.Invoke(puntos);          // ?. por si nadie escucha
    }
}

// En otro sitio:
puntuacion.AlCambiar += MostrarEnPantalla;
puntuacion.AlCambiar -= MostrarEnPantalla;   // ¡desuscribirse!
~~~

- `Action` no tiene parámetros; `Action<int, int>` recibe dos enteros.
- `event` impide que otra clase haga `AlCambiar = null` o lo invoque.
- Para avisar **una sola vez** (como morir), basta con no volver a entrar: si ya está muerto, sal al principio del método.

## LINQ: consultas sobre colecciones
~~~
using System.Linq;

var cercanos = enemigos
    .Where(e => e.Vida > 0)                          // filtrar
    .OrderBy(e => (e.Pos - yo).sqrMagnitude)          // ordenar
    .ThenBy(e => e.Nombre)                            // desempate
    .Take(3)                                          // los 3 primeros
    .Select(e => e.Nombre)                            // transformar
    .ToList();

var primero = enemigos.FirstOrDefault(e => e.Vida > 0);   // null si no hay
~~~

## Records
Un `record` es una clase de datos con igualdad por valor y una sintaxis corta:

~~~
public record Item(string Nombre, int Peso);
var a = new Item("Daga", 2);
a.Nombre;     // "Daga"
~~~

## Antes de los retos
- **cs-3:** el jefe sobrescribe `RecibirGolpe` y llama a la versión base con la mitad.
- **cs-4:** cuenta solo los que pasaron de vivos a destruidos en esta explosión.
- **cs-5:** compara el valor antes y después: si no cambió, no lances el evento.
- **cs-6:** filtra vivos, otro equipo y alcance antes de ordenar. Ordenar por `sqrMagnitude` evita raíces cuadradas.
