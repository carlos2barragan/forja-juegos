// Física y colisiones a mano: entender lo que hacen los motores de física por dentro.
const track = { id: 'fisica', name: 'Física y colisiones', lang: 'csharp', color: '#5EE0A0', blurb: 'Cajas, círculos, rayos, saltos con gravedad y el paso de tiempo fijo.' };

const challenges = [
  {
    id: 'f-1', level: 1, title: 'Cajas que chocan (AABB)',
    brief: `Una **AABB** es una caja alineada con los ejes. Te damos el tipo en el código inicial. En **static class Colision2D** escribe:
- **bool Solapan(Caja a, Caja b)**: true si se solapan. **Tocarse solo por el borde no cuenta.**
- **bool Contiene(Caja c, Vector2 punto)**: el borde sí cuenta.
- **Vector2 Separacion(Caja a, Caja b)**: el vector más corto que hay que sumar al centro de **a** para sacarla de **b** (por el eje de menor penetración). Vector2.zero si no se solapan.`,
    starter: `using UnityEngine;

public struct Caja
{
    public Vector2 centro;
    public Vector2 tamaño;
    public Caja(Vector2 centro, Vector2 tamaño) { this.centro = centro; this.tamaño = tamaño; }
    public Vector2 Min => centro - tamaño / 2f;
    public Vector2 Max => centro + tamaño / 2f;
}

public static class Colision2D
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public struct Caja
{
    public Vector2 centro;
    public Vector2 tamaño;
    public Caja(Vector2 centro, Vector2 tamaño) { this.centro = centro; this.tamaño = tamaño; }
    public Vector2 Min => centro - tamaño / 2f;
    public Vector2 Max => centro + tamaño / 2f;
}

public static class Colision2D
{
    public static bool Solapan(Caja a, Caja b)
    {
        return a.Min.x < b.Max.x && a.Max.x > b.Min.x
            && a.Min.y < b.Max.y && a.Max.y > b.Min.y;
    }

    public static bool Contiene(Caja c, Vector2 p)
    {
        return p.x >= c.Min.x && p.x <= c.Max.x && p.y >= c.Min.y && p.y <= c.Max.y;
    }

    public static Vector2 Separacion(Caja a, Caja b)
    {
        if (!Solapan(a, b)) return Vector2.zero;
        Vector2 d = a.centro - b.centro;
        float px = (a.tamaño.x + b.tamaño.x) / 2f - Mathf.Abs(d.x);
        float py = (a.tamaño.y + b.tamaño.y) / 2f - Mathf.Abs(d.y);
        if (px < py) return new Vector2(d.x < 0 ? -px : px, 0);
        return new Vector2(0, d.y < 0 ? -py : py);
    }
}
`,
    checks: [
      [/Min\.x\s*<\s*\w+\.Max\.x|Max\.x\s*>\s*\w+\.Min\.x/, 'Comparas los intervalos en X', 'Se solapan en X si a.Min.x < b.Max.x y a.Max.x > b.Min.x.', 2],
      [/Min\.y\s*<\s*\w+\.Max\.y|Max\.y\s*>\s*\w+\.Min\.y/, 'Comparas los intervalos en Y', 'Lo mismo en Y: deben solaparse en los dos ejes.', 2],
      [/Mathf\.Abs/, 'Calculas la penetración por eje', 'penetración = semitamaños sumados − |distancia entre centros|.'],
      [/<\s*py|px\s*<|<\s*penY|Min\s*\(/, 'Eliges el eje de menor penetración', 'Saca la caja por el eje donde menos ha entrado.', 2],
    ],
    hints: ['Dos intervalos [a1, a2] y [b1, b2] se solapan si a1 < b2 y a2 > b1.', 'El signo de la separación depende de en qué lado está a respecto a b.'],
    learn: ['AABB y el test de separación por ejes', 'Vector de traslación mínima (MTV)', 'Por qué los motores separan por el eje de menor penetración'],
    search: ['"AABB collision detection"', '"minimum translation vector AABB"', '"2D collision resolution tutorial"'],
    test: `
var a = new Caja(new Vector2(0, 0), new Vector2(2, 2));
Check("se solapan", () => Colision2D.Solapan(a, new Caja(new Vector2(1.5f, 0.5f), new Vector2(2, 2))));
Check("separadas en X", () => !Colision2D.Solapan(a, new Caja(new Vector2(3, 0), new Vector2(1, 1))));
Check("separadas en Y aunque se solapen en X", () => !Colision2D.Solapan(a, new Caja(new Vector2(0, 5), new Vector2(2, 2))));
Check("tocarse por el borde no es solapar", () => !Colision2D.Solapan(a, new Caja(new Vector2(2, 0), new Vector2(2, 2))));
Check("contiene un punto del borde", () => Colision2D.Contiene(a, new Vector2(1, -1)));
Check("no contiene un punto fuera", () => !Colision2D.Contiene(a, new Vector2(1.01f, 0)));
Check("separación por X hacia la izquierda", () => Cerca(Colision2D.Separacion(a, new Caja(new Vector2(1.5f, 0.2f), new Vector2(2, 2))), new Vector2(-0.5f, 0)));
Check("separación por Y hacia arriba", () => Cerca(Colision2D.Separacion(new Caja(new Vector2(0.1f, 1.8f), new Vector2(2, 2)), a), new Vector2(0, 0.2f)));
Check("tras separar ya no se solapan", () => { var m = new Caja(new Vector2(0.7f, 0.3f), new Vector2(1, 1)); m.centro += Colision2D.Separacion(m, a); return !Colision2D.Solapan(m, a); });
Check("sin solape la separación es cero", () => Colision2D.Separacion(a, new Caja(new Vector2(10, 0), Vector2.one)) == Vector2.zero);
`,
  },
  {
    id: 'f-2', level: 2, title: 'Círculos que se empujan',
    brief: `Para que las unidades de un RTS no se amontonen, en **static class Circulos** escribe:
- **bool Solapan(Vector2 a, float ra, Vector2 b, float rb)** (tocarse no cuenta). Sin raíz cuadrada.
- **void Separar(ref Vector2 a, float ra, ref Vector2 b, float rb)**: si se solapan, mueve **cada uno la mitad** de la penetración en direcciones opuestas, a lo largo de la línea que une sus centros, hasta que queden justo tocándose.
  - Si tienen **el mismo centro**, sepáralos a lo largo del eje X (a hacia −X, b hacia +X).
  - Si no se solapan, no los toques.`,
    starter: `using UnityEngine;

public static class Circulos
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Circulos
{
    public static bool Solapan(Vector2 a, float ra, Vector2 b, float rb)
    {
        float r = ra + rb;
        return (b - a).sqrMagnitude < r * r;
    }

    public static void Separar(ref Vector2 a, float ra, ref Vector2 b, float rb)
    {
        if (!Solapan(a, ra, b, rb)) return;
        Vector2 d = b - a;
        float dist = d.magnitude;
        Vector2 n = dist > 1e-6f ? d / dist : Vector2.right;
        float penetracion = ra + rb - dist;
        a -= n * (penetracion / 2f);
        b += n * (penetracion / 2f);
    }
}
`,
    checks: [
      [/sqrMagnitude/, 'Solapan sin raíz', 'Compara la distancia al cuadrado con (ra + rb)².', 2],
      [/ref\s+Vector2/, 'Usas parámetros ref', 'ref permite modificar las posiciones de quien llama.'],
      [/\/\s*2f?|\*\s*0\.5f/, 'Repartes la penetración a medias', 'Cada uno se mueve penetración / 2.', 2],
      [/Vector2\.right|1e-|<=?\s*0\.0+1|==\s*0/, 'Cubres el caso del mismo centro', 'Si la distancia es 0, la dirección es indefinida: usa Vector2.right.', 2],
    ],
    hints: ['La normal de la colisión es (b − a) normalizado.', 'Penetración = ra + rb − distancia.'],
    learn: ['Colisión círculo-círculo', 'Resolución por posición', 'Separación (separation) en steering y RTS'],
    search: ['"circle circle collision resolution"', '"RTS unit separation steering"', '"C# ref parameters"'],
    test: `
Check("se solapan", () => Circulos.Solapan(Vector2.zero, 1, new Vector2(1.5f, 0), 1));
Check("tocarse no cuenta", () => !Circulos.Solapan(Vector2.zero, 1, new Vector2(2, 0), 1));
Check("lejos no se solapan", () => !Circulos.Solapan(Vector2.zero, 1, new Vector2(3, 3), 1));
var a = Vector2.zero; var b = new Vector2(1, 0);
Circulos.Separar(ref a, 1, ref b, 1);
Check("separa a medias", () => Cerca(a, new Vector2(-0.5f, 0)) && Cerca(b, new Vector2(1.5f, 0)));
Check("quedan justo tocándose", () => Cerca(Vector2.Distance(a, b), 2));
var c = new Vector2(1, 1); var d = new Vector2(1.6f, 1.8f);
Circulos.Separar(ref c, 0.5f, ref d, 1);
Check("en diagonal quedan a ra + rb", () => Cerca(Vector2.Distance(c, d), 1.5f));
Check("se mueven a lo largo de la línea de centros", () => Cerca((d - c).normalized, new Vector2(0.6f, 0.8f)));
var e = new Vector2(2, 2); var f = new Vector2(2, 2);
Circulos.Separar(ref e, 1, ref f, 1);
Check("mismo centro: separa en X", () => Cerca(e, new Vector2(1, 2)) && Cerca(f, new Vector2(3, 2)));
var g = Vector2.zero; var h = new Vector2(5, 0);
Circulos.Separar(ref g, 1, ref h, 1);
Check("sin solape no se mueven", () => g == Vector2.zero && h == new Vector2(5, 0));
`,
  },
  {
    id: 'f-3', level: 2, title: 'Raycast contra esferas y planos',
    brief: `Implementa lo que hace Physics.Raycast por dentro. En **static class Rayos**:
- **bool ContraEsfera(Vector3 origen, Vector3 direccion, Vector3 centro, float radio, float maxDistancia, out float distancia)**
  - *direccion* puede no estar normalizada; *distancia* se mide en unidades del mundo.
  - Devuelve el **primer** punto de impacto hacia delante, dentro de maxDistancia.
  - Como Unity, si el origen está **dentro** de la esfera, no hay impacto.
- **bool ContraPlano(Vector3 origen, Vector3 direccion, Vector3 puntoPlano, Vector3 normal, out float distancia)**: false si el rayo es paralelo o el plano queda detrás.
- Si no hay impacto, distancia = 0.`,
    starter: `using UnityEngine;

public static class Rayos
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Rayos
{
    public static bool ContraEsfera(Vector3 origen, Vector3 direccion, Vector3 centro, float radio, float maxDistancia, out float distancia)
    {
        distancia = 0f;
        Vector3 d = direccion.normalized;
        Vector3 oc = origen - centro;
        float c = oc.sqrMagnitude - radio * radio;
        if (c < 0f) return false; // el origen está dentro
        float b = Vector3.Dot(oc, d);
        if (b > 0f) return false; // la esfera queda detrás
        float disc = b * b - c;
        if (disc < 0f) return false;
        float t = -b - Mathf.Sqrt(disc);
        if (t > maxDistancia) return false;
        distancia = t;
        return true;
    }

    public static bool ContraPlano(Vector3 origen, Vector3 direccion, Vector3 puntoPlano, Vector3 normal, out float distancia)
    {
        distancia = 0f;
        Vector3 d = direccion.normalized;
        float den = Vector3.Dot(normal, d);
        if (Mathf.Abs(den) < 1e-6f) return false;
        float t = Vector3.Dot(puntoPlano - origen, normal) / den;
        if (t < 0f) return false;
        distancia = t;
        return true;
    }
}
`,
    checks: [
      [/normalized|Normalize/, 'Normalizas la dirección', 'Con dirección unitaria, t es directamente la distancia.', 2],
      [/b\s*\*\s*b\s*-|discriminante|disc/, 'Resuelves la cuadrática (discriminante)', 'Sustituye el rayo en la ecuación de la esfera: sale una cuadrática en t.', 2],
      [/Sqrt/, 'Calculas la raíz del discriminante', 't = −b − √(b² − c) es el primer impacto.'],
      [/Vector3\.Dot\s*\(\s*normal|Dot\s*\([^)]*normal/, 'Usas Dot con la normal del plano', 't = Dot(puntoPlano − origen, n) / Dot(n, d).', 2],
      [/maxDistancia/, 'Respetas maxDistancia', 'Si t > maxDistancia, no hay impacto.'],
    ],
    hints: ['Punto del rayo: P(t) = O + t·D. Punto de la esfera: |P − C|² = r².', 'Si Dot(n, d) es casi 0, el rayo es paralelo al plano.'],
    learn: ['Intersección rayo-esfera', 'Intersección rayo-plano', 'Physics.Raycast, LayerMask y QueryTriggerInteraction'],
    search: ['"ray sphere intersection"', '"ray plane intersection"', 'scratchapixel ray-sphere'],
    test: `
float t;
Check("impacta de frente a distancia 4", () => Rayos.ContraEsfera(Vector3.zero, Vector3.forward, new Vector3(0, 0, 5), 1, 100, out t) && Cerca(t, 4));
Check("dirección sin normalizar", () => Rayos.ContraEsfera(Vector3.zero, new Vector3(0, 0, 10), new Vector3(0, 0, 5), 1, 100, out t) && Cerca(t, 4));
Check("falla por un lado", () => !Rayos.ContraEsfera(Vector3.zero, Vector3.forward, new Vector3(2, 0, 5), 1, 100, out t) && t == 0);
Check("roza tangente", () => Rayos.ContraEsfera(Vector3.zero, Vector3.forward, new Vector3(1, 0, 5), 1, 100, out t) && Cerca(t, 5, 0.01f));
Check("la esfera detrás no cuenta", () => !Rayos.ContraEsfera(Vector3.zero, Vector3.forward, new Vector3(0, 0, -5), 1, 100, out t));
Check("respeta maxDistancia", () => !Rayos.ContraEsfera(Vector3.zero, Vector3.forward, new Vector3(0, 0, 5), 1, 3.9f, out t));
Check("desde dentro no impacta", () => !Rayos.ContraEsfera(new Vector3(0, 0, 5), Vector3.forward, new Vector3(0, 0, 5), 1, 100, out t));
Check("rayo diagonal contra esfera", () => Rayos.ContraEsfera(Vector3.zero, new Vector3(1, 1, 0), new Vector3(5, 5, 0), 1, 100, out t) && Cerca(t, Mathf.Sqrt(50) - 1));
Check("rayo hacia el suelo", () => Rayos.ContraPlano(new Vector3(0, 10, 0), new Vector3(0, -2, 0), Vector3.zero, Vector3.up, out t) && Cerca(t, 10));
Check("rayo inclinado contra el suelo", () => Rayos.ContraPlano(new Vector3(0, 3, 0), new Vector3(4, -3, 0), Vector3.zero, Vector3.up, out t) && Cerca(t, 5));
Check("paralelo al plano", () => !Rayos.ContraPlano(new Vector3(0, 3, 0), Vector3.right, Vector3.zero, Vector3.up, out t));
Check("plano detrás", () => !Rayos.ContraPlano(new Vector3(0, 3, 0), Vector3.up, Vector3.zero, Vector3.up, out t));
`,
  },
  {
    id: 'f-4', level: 3, title: 'Un salto que mide lo que debe',
    brief: `Los diseñadores no piensan en "velocidad inicial": piensan en **"quiero que salte 2 metros"**. Escribe **class Saltador**:
- Constructor **Saltador(float gravedad)** (negativa, p. ej. −20).
- Campos públicos **Vector3 Posicion** y **Vector3 Velocidad**.
- **bool EnSuelo**: Posicion.y ≤ 0 y no está subiendo.
- **static float VelocidadParaAltura(float altura, float gravedad)**: la velocidad vertical inicial necesaria para alcanzar *altura* (sale de v² = 2·g·h).
- **bool Saltar(float altura)**: solo si está en el suelo (nada de doble salto).
- **void Paso(float dt)**: integra con **Euler semi-implícito** (primero velocidad, luego posición). El suelo está en y = 0: si lo atraviesa, colócalo en 0 y anula la velocidad vertical. La velocidad horizontal se conserva.`,
    starter: `using UnityEngine;

public class Saltador
{
    public Vector3 Posicion;
    public Vector3 Velocidad;

    // tu código aquí
}
`,
    solution: `using UnityEngine;

public class Saltador
{
    public Vector3 Posicion;
    public Vector3 Velocidad;

    readonly float gravedad;

    public Saltador(float gravedad)
    {
        this.gravedad = gravedad;
    }

    public bool EnSuelo => Posicion.y <= 0f && Velocidad.y <= 0f;

    public static float VelocidadParaAltura(float altura, float gravedad)
    {
        return Mathf.Sqrt(2f * altura * Mathf.Abs(gravedad));
    }

    public bool Saltar(float altura)
    {
        if (!EnSuelo) return false;
        Velocidad.y = VelocidadParaAltura(altura, gravedad);
        return true;
    }

    public void Paso(float dt)
    {
        Velocidad.y += gravedad * dt;
        Posicion += Velocidad * dt;
        if (Posicion.y < 0f)
        {
            Posicion.y = 0f;
            Velocidad.y = 0f;
        }
    }
}
`,
    checks: [
      [/Sqrt\s*\(\s*2f?\s*\*/, 'v = √(2·g·h)', 'De v² = 2·g·h sale v = Mathf.Sqrt(2 * altura * |gravedad|).', 3],
      [/Velocidad\.y\s*\+=\s*gravedad\s*\*\s*dt[\s\S]*Posicion\s*\+=/, 'Euler semi-implícito: velocidad antes que posición', 'Actualiza primero Velocidad y luego Posicion: es más estable.', 2],
      [/if\s*\(\s*!\s*EnSuelo\s*\)\s*return\s+false/, 'Sin doble salto', 'if (!EnSuelo) return false;'],
      [/Posicion\.y\s*<\s*0/, 'Detectas el suelo', 'Si Posicion.y < 0, colócalo en 0 y anula Velocidad.y.'],
    ],
    hints: ['En el punto más alto la velocidad es 0: v₀² = 2·|g|·h.', 'Como Posicion es un campo (no una propiedad), Posicion.y = 0 funciona.'],
    learn: ['Cinemática: posición, velocidad, aceleración', 'Euler explícito vs semi-implícito', 'Diseñar saltos por altura y tiempo (GDC "Math for Game Programmers: Building a Better Jump")'],
    search: ['"building a better jump GDC"', '"semi implicit euler game physics"', '"jump height formula game dev"'],
    test: `
var s = new Saltador(-20);
Check("VelocidadParaAltura(2, -20) ≈ 8,94", () => Cerca(Saltador.VelocidadParaAltura(2, -20), Mathf.Sqrt(80)));
Check("empieza en el suelo", () => s.EnSuelo);
Check("Saltar desde el suelo", () => s.Saltar(2));
float maxY = 0; int pasos = 0; bool dobles = false;
s.Velocidad.x = 3;
for (int i = 0; i < 240; i++) { s.Paso(1f / 120); maxY = Mathf.Max(maxY, s.Posicion.y); if (i == 10 && s.Saltar(2)) dobles = true; if (!s.EnSuelo) pasos++; }
Check("alcanza ~2 m de altura", () => Cerca(maxY, 2, 0.1f));
Check("no hay doble salto en el aire", () => !dobles);
Check("tiempo en el aire ≈ 2·v/g ≈ 0,89 s", () => Cerca(pasos / 120f, 2 * Mathf.Sqrt(80) / 20, 0.03f));
Check("aterriza en y = 0 sin velocidad vertical", () => s.Posicion.y == 0 && s.Velocidad.y == 0 && s.EnSuelo);
Check("conserva la velocidad horizontal", () => Cerca(s.Velocidad.x, 3) && Cerca(s.Posicion.x, 6, 0.05f));
var l = new Saltador(-9.81f); l.Saltar(1);
float m2 = 0; for (int i = 0; i < 600; i++) { l.Paso(1f / 300); m2 = Mathf.Max(m2, l.Posicion.y); }
Check("con otra gravedad también mide lo que debe", () => Cerca(m2, 1, 0.03f));
`,
  },
  {
    id: 'f-5', level: 3, title: 'Paso de tiempo fijo con acumulador',
    brief: `La física debe avanzar en pasos **fijos** aunque los fotogramas duren distinto (eso es FixedUpdate). Escribe **class BucleFijo**:
- Constructor **BucleFijo(float paso, int maxPasosPorFotograma, System.Action<float> simular)**.
- **int Avanzar(float dtFotograma)**: acumula el tiempo y llama a *simular(paso)* tantas veces como quepan pasos completos. Devuelve cuántas veces llamó.
- **Espiral de la muerte**: si harían falta más de *maxPasosPorFotograma* pasos, ejecuta solo ese máximo y **descarta** el tiempo sobrante (deja el acumulador por debajo de un paso).
- **float Alfa**: fracción del siguiente paso ya acumulada (acumulado / paso), en [0, 1). Se usa para interpolar el render entre dos estados de física.`,
    starter: `using System;

public class BucleFijo
{
    // tu código aquí
}
`,
    solution: `using System;

public class BucleFijo
{
    readonly float paso;
    readonly int maxPasos;
    readonly Action<float> simular;
    float acumulado;

    public BucleFijo(float paso, int maxPasosPorFotograma, Action<float> simular)
    {
        this.paso = paso;
        maxPasos = maxPasosPorFotograma;
        this.simular = simular;
    }

    public float Alfa => acumulado / paso;

    public int Avanzar(float dtFotograma)
    {
        acumulado += dtFotograma;
        int n = 0;
        while (acumulado >= paso && n < maxPasos)
        {
            simular(paso);
            acumulado -= paso;
            n++;
        }
        if (acumulado >= paso) acumulado %= paso; // espiral de la muerte: tiramos lo que no cabe
        return n;
    }
}
`,
    checks: [
      [/while\s*\(\s*acumulad\w*\s*>=\s*paso/, 'Bucle mientras quepa un paso', 'while (acumulado >= paso) { simular(paso); acumulado -= paso; }', 3],
      [/-=\s*paso/, 'Restas el paso al acumulador', 'No pongas el acumulador a 0: conserva el resto.', 2],
      [/maxPasos|maxPasosPorFotograma/, 'Limitas los pasos por fotograma', 'Sin límite, un fotograma lento genera más pasos, que lo hacen más lento...', 2],
      [/Alfa\s*=>\s*\w+\s*\/\s*paso/, 'Alfa = acumulado / paso', 'Esa fracción sirve para interpolar entre el estado anterior y el actual.'],
    ],
    hints: ['Piensa en el acumulador como "tiempo que la física aún no ha consumido".', 'Si tras el máximo de pasos aún queda más de un paso, quédate solo con el resto (acumulado % paso).'],
    learn: ['FixedUpdate y Time.fixedDeltaTime', '"Fix Your Timestep!" de Glenn Fiedler', 'Interpolación del render y Rigidbody.interpolation'],
    search: ['"fix your timestep gaffer on games"', '"unity FixedUpdate vs Update"', '"spiral of death game loop"'],
    test: `
int llamadas = 0; float simulado = 0;
var b = new BucleFijo(0.25f, 3, dt => { llamadas++; simulado += dt; });
Check("0,625 s → 2 pasos", () => b.Avanzar(0.625f) == 2);
Check("Alfa = 0,5", () => Cerca(b.Alfa, 0.5f));
Check("0,125 s más → 1 paso", () => b.Avanzar(0.125f) == 1 && Cerca(b.Alfa, 0));
Check("0,0625 s → 0 pasos, Alfa 0,25", () => b.Avanzar(0.0625f) == 0 && Cerca(b.Alfa, 0.25f));
Check("simular recibe siempre el paso fijo", () => Cerca(simulado, llamadas * 0.25f));
Check("espiral de la muerte: como mucho 3 pasos", () => b.Avanzar(10f) == 3);
Check("tras la espiral, Alfa < 1", () => b.Alfa >= 0 && b.Alfa < 1);
Check("el siguiente fotograma normal vuelve a la normalidad", () => b.Avanzar(0.25f) <= 2);
var c = new BucleFijo(1f / 50, 10, dt => { });
int total = 0; for (int i = 0; i < 144; i++) total += c.Avanzar(1f / 144);
Check("1 s a 144 FPS ≈ 50 pasos de física", () => total >= 49 && total <= 50);
`,
  },
];

module.exports = { track, challenges };
