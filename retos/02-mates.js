// Matemáticas para juegos: vectores, interpolación, ángulos y movimiento independiente de los FPS.
const track = { id: 'mates', name: 'Matemáticas para juegos', lang: 'csharp', color: '#5EC8F2', blurb: 'Vectores, producto punto, interpolación y ángulos: la base de todo gameplay.' };

const challenges = [
  {
    id: 'm-1', level: 1, title: 'Distancia, dirección y alcance',
    brief: `Crea **static class Vectores** con:
- **float Distancia(Vector3 a, Vector3 b)**.
- **Vector3 Direccion(Vector3 desde, Vector3 hacia)**: vector de longitud 1 que apunta de *desde* a *hacia* (Vector3.zero si son el mismo punto).
- **bool EnAlcance(Vector3 a, Vector3 b, float radio)**: true si la distancia es ≤ radio. **Sin raíz cuadrada**: usa sqrMagnitude.`,
    starter: `using UnityEngine;

public static class Vectores
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Vectores
{
    public static float Distancia(Vector3 a, Vector3 b) => (b - a).magnitude;

    public static Vector3 Direccion(Vector3 desde, Vector3 hacia) => (hacia - desde).normalized;

    public static bool EnAlcance(Vector3 a, Vector3 b, float radio) => (b - a).sqrMagnitude <= radio * radio;
}
`,
    checks: [
      [/magnitude|Vector3\.Distance/, 'Calculas la distancia', '(b - a).magnitude o Vector3.Distance(a, b).'],
      [/normalized|Normalize/, 'Normalizas la dirección', '(hacia - desde).normalized da longitud 1.', 2],
      [/sqrMagnitude/, 'EnAlcance sin raíz', 'Compara (b - a).sqrMagnitude con radio * radio.', 2],
      [/radio\s*\*\s*radio/, 'Elevas el radio al cuadrado', 'Si comparas cuadrados, el radio también va al cuadrado.'],
    ],
    hints: ['b - a es el vector que va de a hacia b.', 'Comparar a² ≤ r² es lo mismo que a ≤ r cuando ambos son positivos.'],
    learn: ['Resta de vectores = "de A hacia B"', 'magnitude vs sqrMagnitude', 'Vectores normalizados (unitarios)'],
    search: ['"unity vector3 sqrMagnitude performance"', '"vector math for game developers"', 'docs.unity3d.com Vector3'],
    test: `
var a = new Vector3(1, 2, 3); var b = new Vector3(4, 6, 3);
Check("distancia 3-4-5", () => Cerca(Vectores.Distancia(a, b), 5));
Check("dirección normalizada", () => Cerca(Vectores.Direccion(a, b), new Vector3(0.6f, 0.8f, 0)));
Check("dirección con el mismo punto es cero", () => Vectores.Direccion(a, a) == Vector3.zero);
Check("en alcance justo en el borde", () => Vectores.EnAlcance(a, b, 5));
Check("fuera de alcance", () => !Vectores.EnAlcance(a, b, 4.99f));
Check("dentro de alcance", () => Vectores.EnAlcance(Vector3.zero, Vector3.one, 2));
`,
  },
  {
    id: 'm-2', level: 1, title: 'Lerp, InverseLerp y Remap',
    brief: `Implementa tú mismo (sin usar Mathf.Lerp ni Mathf.InverseLerp) en **static class Interp**:
- **float Lerp(float a, float b, float t)**: con t limitado a [0, 1].
- **float InverseLerp(float a, float b, float valor)**: devuelve t en [0, 1]. Si a == b, devuelve 0.
- **float Remap(float valor, float desdeMin, float desdeMax, float haciaMin, float haciaMax)**: pasa un valor de un rango a otro (limitado). Ejemplo: vida 25 de 0–50 → 0.5 en una barra de 0–1.`,
    starter: `public static class Interp
{
    // tu código aquí
}
`,
    solution: `public static class Interp
{
    static float Clamp01(float t) => t < 0 ? 0 : t > 1 ? 1 : t;

    public static float Lerp(float a, float b, float t) => a + (b - a) * Clamp01(t);

    public static float InverseLerp(float a, float b, float valor)
    {
        if (a == b) return 0;
        return Clamp01((valor - a) / (b - a));
    }

    public static float Remap(float valor, float desdeMin, float desdeMax, float haciaMin, float haciaMax)
    {
        return Lerp(haciaMin, haciaMax, InverseLerp(desdeMin, desdeMax, valor));
    }
}
`,
    checks: [
      [/a\s*\+\s*\(\s*b\s*-\s*a\s*\)\s*\*/, 'Fórmula de Lerp: a + (b - a) * t', 'Lerp = a + (b - a) * t.', 2],
      [/\(\s*valor\s*-\s*a\s*\)\s*\/\s*\(\s*b\s*-\s*a\s*\)/, 'Fórmula de InverseLerp', 'InverseLerp = (valor - a) / (b - a).', 2],
      [/a\s*==\s*b/, 'Evitas dividir entre 0', 'Si a == b devuelve 0.'],
      [/Lerp\s*\([^)]*InverseLerp/, 'Remap combina las dos', 'Remap = Lerp(haciaMin, haciaMax, InverseLerp(desdeMin, desdeMax, valor)).'],
    ],
    hints: ['InverseLerp responde "¿qué tan lejos de a hacia b está valor?".', 'Remap es InverseLerp en el rango origen seguido de Lerp en el destino.'],
    learn: ['Interpolación lineal', 'Normalizar valores a [0, 1]', 'Remap para UI, audio y curvas de dificultad'],
    search: ['"lerp inverse lerp remap explained"', 'Freya Holmér "Lerp smoothing"', '"unity Mathf.InverseLerp"'],
    test: `
Check("Lerp a mitad", () => Cerca(Interp.Lerp(10, 20, 0.5f), 15));
Check("Lerp limita t > 1", () => Cerca(Interp.Lerp(10, 20, 3), 20));
Check("Lerp limita t < 0", () => Cerca(Interp.Lerp(10, 20, -1), 10));
Check("Lerp con rango invertido", () => Cerca(Interp.Lerp(20, 10, 0.25f), 17.5f));
Check("InverseLerp", () => Cerca(Interp.InverseLerp(0, 50, 25), 0.5f));
Check("InverseLerp limitado", () => Cerca(Interp.InverseLerp(0, 50, 80), 1));
Check("InverseLerp con a == b", () => Interp.InverseLerp(3, 3, 3) == 0);
Check("Remap vida → barra", () => Cerca(Interp.Remap(25, 0, 50, 0, 1), 0.5f));
Check("Remap a rango invertido", () => Cerca(Interp.Remap(2, 0, 10, 100, 0), 80));
`,
  },
  {
    id: 'm-3', level: 2, title: 'Cono de visión con producto punto',
    brief: `Un guardia ve al jugador si está **dentro de su distancia** y **dentro de su ángulo de visión**.
Crea **static class Vision** con:
- **bool PuedeVer(Vector3 posGuardia, Vector3 haciaDondeMira, Vector3 objetivo, float anguloTotal, float distancia)**
  - *anguloTotal* es la apertura completa del cono en grados (90 = 45° a cada lado).
  - *haciaDondeMira* puede no venir normalizado.
  - Usa el **producto punto** contra el coseno del medio ángulo, no Vector3.Angle.
  - Si el objetivo está en la misma posición que el guardia, devuelve true.`,
    starter: `using UnityEngine;

public static class Vision
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Vision
{
    public static bool PuedeVer(Vector3 posGuardia, Vector3 haciaDondeMira, Vector3 objetivo, float anguloTotal, float distancia)
    {
        Vector3 aObjetivo = objetivo - posGuardia;
        float dist2 = aObjetivo.sqrMagnitude;
        if (dist2 > distancia * distancia) return false;
        if (dist2 < 1e-8f) return true;

        float coseno = Vector3.Dot(haciaDondeMira.normalized, aObjetivo / Mathf.Sqrt(dist2));
        return coseno >= Mathf.Cos(anguloTotal * 0.5f * Mathf.Deg2Rad);
    }
}
`,
    checks: [
      [/Vector3\.Dot/, 'Usas el producto punto', 'Vector3.Dot(adelante, direcciónAlObjetivo) es el coseno del ángulo entre ellos.', 3],
      [/Mathf\.Cos/, 'Comparas con el coseno', 'Compara con Mathf.Cos(medioAngulo * Mathf.Deg2Rad).', 2],
      [/Deg2Rad/, 'Conviertes grados a radianes', 'Las funciones trigonométricas usan radianes: multiplica por Mathf.Deg2Rad.'],
      [/\*\s*0\.5f|\/\s*2/, 'Usas el medio ángulo', 'El ángulo total se reparte a ambos lados: usa la mitad.'],
    ],
    hints: ['Si los dos vectores están normalizados, Dot = cos(ángulo).', 'Comparar cosenos evita calcular un arcocoseno: cos es decreciente entre 0° y 180°.'],
    learn: ['Producto punto y su significado geométrico', 'Conos de visión y sigilo', 'Radianes vs grados'],
    search: ['"dot product field of view unity"', '"vector dot product game development"', '"stealth game vision cone"'],
    test: `
var g = Vector3.zero; var f = new Vector3(0, 0, 2);
Check("ve lo que tiene enfrente", () => Vision.PuedeVer(g, f, new Vector3(0, 0, 5), 90, 10));
Check("no ve detrás", () => !Vision.PuedeVer(g, f, new Vector3(0, 0, -5), 90, 10));
Check("dentro del cono (40° con apertura 90)", () => Vision.PuedeVer(g, f, Quaternion.Euler(0, 40, 0) * Vector3.forward * 5, 90, 10));
Check("fuera del cono (50° con apertura 90)", () => !Vision.PuedeVer(g, f, Quaternion.Euler(0, 50, 0) * Vector3.forward * 5, 90, 10));
Check("demasiado lejos", () => !Vision.PuedeVer(g, f, new Vector3(0, 0, 11), 90, 10));
Check("apertura 360 ve todo", () => Vision.PuedeVer(g, f, new Vector3(0, 0, -3), 360, 10));
Check("misma posición", () => Vision.PuedeVer(g, f, g, 30, 1));
Check("guardia desplazado", () => Vision.PuedeVer(new Vector3(10, 0, 10), Vector3.right, new Vector3(14, 0, 11), 60, 5));
`,
  },
  {
    id: 'm-4', level: 2, title: 'Movimiento que no depende de los FPS',
    brief: `En Unity, Update se llama una vez por fotograma, y los fotogramas no duran siempre lo mismo. Crea **static class Mover** con:
- **Vector3 Hacia(Vector3 actual, Vector3 objetivo, float velocidad, float dt)**: avanza *velocidad × dt* hacia el objetivo **sin pasarse** (como Vector3.MoveTowards, pero implementado por ti).
- **float Suavizar(float actual, float objetivo, float rapidez, float dt)**: acerca *actual* al objetivo de forma exponencial e **independiente de los FPS**: el resultado de un paso de 0.1 s debe ser igual al de dos pasos de 0.05 s.
  Pista: el clásico \`Lerp(a, b, rapidez * dt)\` **no** cumple esto.`,
    starter: `using UnityEngine;

public static class Mover
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Mover
{
    public static Vector3 Hacia(Vector3 actual, Vector3 objetivo, float velocidad, float dt)
    {
        Vector3 resto = objetivo - actual;
        float paso = velocidad * dt;
        float distancia = resto.magnitude;
        if (distancia <= paso || distancia == 0) return objetivo;
        return actual + resto / distancia * paso;
    }

    public static float Suavizar(float actual, float objetivo, float rapidez, float dt)
    {
        return Mathf.Lerp(objetivo, actual, Mathf.Exp(-rapidez * dt));
    }
}
`,
    checks: [
      [/<=\s*paso|<=\s*velocidad\s*\*\s*dt|>=\s*\w*distancia/, 'No te pasas del objetivo', 'Si la distancia restante es menor que el paso, devuelve el objetivo.', 2],
      [/Exp\s*\(/, 'Suavizado exponencial', 'Usa Mathf.Exp(-rapidez * dt) para que sea independiente del dt.', 3],
      [/\*\s*dt|dt\s*\*/, 'Multiplicas por dt', 'Todo lo que es "por segundo" se multiplica por el tiempo del fotograma.'],
    ],
    hints: ['Lerp(a, b, k·dt) depende del número de pasos: con más FPS se acerca más rápido.', 'Tras un tiempo t, lo que queda por recorrer es exp(-rapidez·t) de la distancia inicial.'],
    learn: ['Time.deltaTime y por qué existe', 'Movimiento lineal con MoveTowards', 'Suavizado exponencial independiente del framerate'],
    search: ['"frame rate independent lerp"', 'Freya Holmér "Lerp smoothing is broken"', '"unity Time.deltaTime explained"'],
    test: `
Check("avanza velocidad × dt", () => Cerca(Mover.Hacia(Vector3.zero, new Vector3(10, 0, 0), 5, 0.5f), new Vector3(2.5f, 0, 0)));
Check("no se pasa del objetivo", () => Cerca(Mover.Hacia(Vector3.zero, new Vector3(1, 0, 0), 5, 1), new Vector3(1, 0, 0)));
Check("en diagonal mantiene la velocidad", () => Cerca(Mover.Hacia(Vector3.zero, new Vector3(30, 40, 0), 10, 0.1f).magnitude, 1));
Check("ya en el objetivo", () => Mover.Hacia(Vector3.one, Vector3.one, 5, 1) == Vector3.one);
float uno = Mover.Suavizar(0, 10, 5, 0.1f);
float dos = Mover.Suavizar(Mover.Suavizar(0, 10, 5, 0.05f), 10, 5, 0.05f);
Check("Suavizar: 1 paso de 0.1 == 2 pasos de 0.05", () => Cerca(uno, dos, 1e-4f));
Check("Suavizar se acerca al objetivo", () => uno > 0 && uno < 10);
Check("Suavizar con dt 0 no cambia", () => Cerca(Mover.Suavizar(3, 10, 5, 0), 3));
float lento = 0; for (int i = 0; i < 30; i++) lento = Mover.Suavizar(lento, 10, 5, 1f / 30);
float rapido = 0; for (int i = 0; i < 144; i++) rapido = Mover.Suavizar(rapido, 10, 5, 1f / 144);
Check("igual a 30 FPS que a 144 FPS durante 1 s", () => Cerca(lento, rapido, 1e-3f));
`,
  },
  {
    id: 'm-5', level: 3, title: 'Ángulos y rotación en 2D',
    brief: `Para un juego top-down en 2D, crea **static class Angulos** con:
- **float AnguloHacia(Vector2 desde, Vector2 hacia)**: ángulo en grados del vector (hacia − desde) medido desde el eje X positivo, en sentido antihorario, en el rango (−180, 180].
- **Vector2 Rotar(Vector2 v, float grados)**: rota el vector en sentido antihorario.
- **float Diferencia(float desde, float hacia)**: el giro más corto en grados para ir de un ángulo a otro, en [−180, 180]. Ej.: de 350 a 10 → +20.
- **float GirarHacia(float actual, float objetivo, float maxGrados)**: gira como mucho *maxGrados* por el camino más corto.`,
    starter: `using UnityEngine;

public static class Angulos
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Angulos
{
    public static float AnguloHacia(Vector2 desde, Vector2 hacia)
    {
        Vector2 d = hacia - desde;
        return Mathf.Atan2(d.y, d.x) * Mathf.Rad2Deg;
    }

    public static Vector2 Rotar(Vector2 v, float grados)
    {
        float r = grados * Mathf.Deg2Rad;
        float c = Mathf.Cos(r), s = Mathf.Sin(r);
        return new Vector2(v.x * c - v.y * s, v.x * s + v.y * c);
    }

    public static float Diferencia(float desde, float hacia)
    {
        float d = (hacia - desde) % 360f;
        if (d > 180f) d -= 360f;
        if (d < -180f) d += 360f;
        return d;
    }

    public static float GirarHacia(float actual, float objetivo, float maxGrados)
    {
        float d = Diferencia(actual, objetivo);
        if (Mathf.Abs(d) <= maxGrados) return actual + d;
        return actual + Mathf.Sign(d) * maxGrados;
    }
}
`,
    checks: [
      [/Atan2/, 'Usas Atan2', 'Mathf.Atan2(y, x) da el ángulo correcto en los cuatro cuadrantes.', 2],
      [/Cos[\s\S]*Sin|Sin[\s\S]*Cos/, 'Matriz de rotación con seno y coseno', 'x\' = x·cos − y·sin, y\' = x·sin + y·cos.', 2],
      [/%\s*360|Repeat/, 'Envuelves el ángulo', 'Usa % 360 (o Mathf.Repeat) y ajusta a [−180, 180].', 2],
      [/Sign/, 'Respetas el sentido del giro', 'Mathf.Sign(diferencia) te dice hacia qué lado girar.'],
    ],
    hints: ['Atan2 recibe primero y, luego x.', 'Si la diferencia es mayor que 180, es más corto ir por el otro lado: resta 360.'],
    learn: ['Atan2 y cuadrantes', 'Matriz de rotación 2D', 'Envolver ángulos (wrap) y el camino más corto'],
    search: ['"atan2 explained game dev"', '"2D rotation matrix"', '"unity Mathf.DeltaAngle"'],
    test: `
Check("ángulo hacia la derecha = 0", () => Cerca(Angulos.AnguloHacia(Vector2.zero, Vector2.right), 0));
Check("ángulo hacia arriba = 90", () => Cerca(Angulos.AnguloHacia(Vector2.zero, Vector2.up), 90));
Check("ángulo hacia abajo-izquierda = -135", () => Cerca(Angulos.AnguloHacia(new Vector2(1, 1), new Vector2(0, 0)), -135));
Check("rotar (1,0) 90° da (0,1)", () => Cerca(Angulos.Rotar(Vector2.right, 90), Vector2.up));
Check("rotar conserva la longitud", () => Cerca(Angulos.Rotar(new Vector2(3, 4), 37).magnitude, 5));
Check("diferencia 350 → 10 = +20", () => Cerca(Angulos.Diferencia(350, 10), 20));
Check("diferencia 10 → 350 = -20", () => Cerca(Angulos.Diferencia(10, 350), -20));
Check("diferencia con vueltas extra", () => Cerca(Angulos.Diferencia(0, 725), 5));
Check("GirarHacia limita el giro", () => Cerca(Angulos.GirarHacia(0, 90, 30), 30));
Check("GirarHacia por el camino corto", () => Cerca(Angulos.Diferencia(0, Angulos.GirarHacia(10, 300, 15)), -5));
Check("GirarHacia llega si está cerca", () => Cerca(Angulos.Diferencia(Angulos.GirarHacia(0, 5, 30), 5), 0));
`,
  },
  {
    id: 'm-6', level: 3, title: 'Rebotar y deslizarse por paredes',
    brief: `Dos operaciones que usan todos los controladores de personaje y las pelotas que rebotan. En **static class Superficies**:
- **Vector3 Rebotar(Vector3 velocidad, Vector3 normal, float rebote)**: refleja la velocidad respecto a la normal de la superficie y escala **solo la componente normal** por *rebote* (0 = no rebota, 1 = rebote perfecto). La componente tangencial se conserva.
- **Vector3 Deslizar(Vector3 velocidad, Vector3 normal)**: quita la componente que entra en la pared para deslizarse por ella. Si la velocidad **se aleja** de la pared, devuélvela sin cambios.
- La normal puede venir sin normalizar. Impleméntalo con el producto punto (no uses Vector3.Reflect ni ProjectOnPlane).`,
    starter: `using UnityEngine;

public static class Superficies
{
    // tu código aquí
}
`,
    solution: `using UnityEngine;

public static class Superficies
{
    public static Vector3 Rebotar(Vector3 velocidad, Vector3 normal, float rebote)
    {
        Vector3 n = normal.normalized;
        Vector3 componenteNormal = Vector3.Dot(velocidad, n) * n;
        Vector3 tangencial = velocidad - componenteNormal;
        return tangencial - componenteNormal * rebote;
    }

    public static Vector3 Deslizar(Vector3 velocidad, Vector3 normal)
    {
        Vector3 n = normal.normalized;
        float entra = Vector3.Dot(velocidad, n);
        if (entra >= 0) return velocidad;
        return velocidad - entra * n;
    }
}
`,
    checks: [
      [/Vector3\.Dot/, 'Usas el producto punto', 'Dot(v, n) · n es la componente de v en la dirección de la normal.', 2],
      [/normal\.normalized|Normalize/, 'Normalizas la normal', 'La fórmula supone una normal de longitud 1.', 2],
      [/>=?\s*0\)?\s*return\s+velocidad/, 'Deslizar respeta si te alejas', 'Si Dot(v, n) ≥ 0 la velocidad ya sale de la pared: no la toques.'],
      [/Vector3\.Reflect|ProjectOnPlane/, 'Usas las funciones prohibidas', 'Implementa la proyección tú mismo con Dot.', 1, 'no'],
    ],
    hints: ['Divide la velocidad en dos partes: la que va hacia la normal y la que es paralela a la superficie.', 'Rebotar = tangencial − normal · rebote.'],
    learn: ['Proyección de un vector sobre otro', 'Reflexión respecto a una normal', 'Collide-and-slide en controladores de personaje'],
    search: ['"vector projection dot product"', '"collide and slide character controller"', '"reflect vector formula"'],
    test: `
var v = new Vector3(3, -4, 0);
Check("rebote perfecto en el suelo", () => Cerca(Superficies.Rebotar(v, Vector3.up, 1), new Vector3(3, 4, 0)));
Check("rebote a la mitad", () => Cerca(Superficies.Rebotar(v, Vector3.up, 0.5f), new Vector3(3, 2, 0)));
Check("rebote 0 conserva lo tangencial", () => Cerca(Superficies.Rebotar(v, Vector3.up, 0), new Vector3(3, 0, 0)));
Check("normal sin normalizar", () => Cerca(Superficies.Rebotar(v, new Vector3(0, 7, 0), 1), new Vector3(3, 4, 0)));
Check("rebote en pared inclinada conserva rapidez", () => Cerca(Superficies.Rebotar(new Vector3(1, -1, 0), new Vector3(1, 1, 0), 1).magnitude, Mathf.Sqrt(2)));
Check("deslizar contra una pared", () => Cerca(Superficies.Deslizar(new Vector3(2, 0, 5), Vector3.back), new Vector3(2, 0, 0)));
Check("deslizar en el suelo", () => Cerca(Superficies.Deslizar(v, Vector3.up), new Vector3(3, 0, 0)));
Check("si se aleja, no cambia", () => Cerca(Superficies.Deslizar(new Vector3(1, 3, 0), Vector3.up), new Vector3(1, 3, 0)));
`,
  },
];

module.exports = { track, challenges };
