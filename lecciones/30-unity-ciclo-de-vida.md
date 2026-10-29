---
id: l-unity-ciclo
grupo: unity
min: 13
titulo: MonoBehaviour, Update, Input y corrutinas
resumen: Cómo vive un componente en Unity, cómo leer la entrada, cómo medir el tiempo y cómo repartir una acción en varios fotogramas.
practica: u-1, u-2, u-3
clave:
- Awake → OnEnable → Start → Update cada fotograma → OnDisable → OnDestroy.
- Time.deltaTime mide el último fotograma; Time.time es el reloj del juego desde que empezó.
- GetButtonDown es verdadero solo en el fotograma en que se pulsa; GetButton mientras se mantiene.
- Una corrutina es un método que se pausa con yield return y sigue en el siguiente fotograma.
---
En Unity todo lo que hay en una escena es un **GameObject**. Por sí solo no hace nada: lo que le da comportamiento son sus **componentes**. Un script tuyo es un componente si hereda de `MonoBehaviour`.

~~~
using UnityEngine;

public class Girar : MonoBehaviour
{
    public float gradosPorSegundo = 90f;      // público → editable en el inspector

    void Update()
    {
        transform.Rotate(0f, gradosPorSegundo * Time.deltaTime, 0f);
    }
}
~~~

- `transform` es el componente de posición, rotación y escala que todo GameObject tiene.
- Los campos públicos (o con `[SerializeField]`) aparecen en el inspector para que los diseñadores los ajusten sin tocar código.
- Unity llama a `Update` por su nombre. No hace falta `override`, pero sí escribirlo exacto.

## El ciclo de vida
| Método | Cuándo | Para qué |
| --- | --- | --- |
| `Awake` | Al crearse, una vez | Preparar referencias propias |
| `OnEnable` | Cada vez que se activa | Suscribirse a eventos |
| `Start` | Antes de su primer Update | Usar referencias de otros objetos |
| `Update` | Cada fotograma | Entrada y lógica |
| `FixedUpdate` | Cada paso de física | Fuerzas y Rigidbody |
| `OnDisable` | Al desactivarse | Desuscribirse |
| `OnDestroy` | Al destruirse | Liberar recursos |

La diferencia entre Awake y Start importa: en `Awake` otros objetos pueden no estar listos todavía; en `Start` todos los `Awake` de la escena ya se ejecutaron.

## Leer la entrada
~~~
float x = Input.GetAxisRaw("Horizontal");   // −1, 0 o 1 (A/D, flechas)
float z = Input.GetAxisRaw("Vertical");     // −1, 0 o 1 (W/S)
bool salto = Input.GetButtonDown("Jump");   // solo el fotograma en que se pulsa
bool fuego = Input.GetButton("Fire1");      // todos los fotogramas mientras se mantiene
~~~

`GetAxis` suaviza el valor; `GetAxisRaw` lo devuelve tal cual. Unity tiene además el **nuevo Input System**, que es el recomendado en proyectos nuevos, pero el Input Manager clásico sigue siendo el más fácil de aprender.

## La trampa de la diagonal
Si pulsas derecha y arriba a la vez, el vector de entrada es (1, 0, 1), que mide √2 ≈ 1,41. Te moverías un 41 % más rápido en diagonal. Soluciones:

~~~
Vector3 entrada = new Vector3(x, 0f, z);
entrada = Vector3.ClampMagnitude(entrada, 1f);   // limita a 1 (respeta joysticks a medias)
// o: entrada = entrada.normalized;               // siempre 1 o 0
~~~

## Medir el tiempo
- `Time.deltaTime`: segundos del último fotograma. Para todo lo que va "por segundo".
- `Time.time`: segundos desde que empezó el juego. Para "¿ya pasó suficiente tiempo?".

Un temporizador de enfriamiento típico guarda **cuándo** puede volver a actuar:

~~~
float siguienteSalto;

void Update()
{
    if (Input.GetButtonDown("Jump") && Time.time >= siguienteSalto)
    {
        Saltar();
        siguienteSalto = Time.time + enfriamiento;
    }
}
~~~

Empezar con `siguienteSalto = 0` permite actuar en el primer fotograma.

## Corrutinas
Abrir una puerta dura un segundo, pero `Update` solo dura un fotograma. Una **corrutina** reparte el trabajo en varios fotogramas sin un montón de variables de estado:

~~~
using System.Collections;

public void Desvanecer() => StartCoroutine(Fundido());

IEnumerator Fundido()
{
    float t = 0f;
    while (t < duracion)
    {
        t += Time.deltaTime;
        alfa = Mathf.Lerp(1f, 0f, t / duracion);
        yield return null;                   // espera al siguiente fotograma
    }
    alfa = 0f;                               // valor final exacto
}
~~~

| Instrucción | Espera |
| --- | --- |
| `yield return null` | Un fotograma |
| `yield return new WaitForSeconds(2f)` | 2 segundos de juego |
| `yield break` | Termina la corrutina |

Detalles que dan bugs:
- Si llamas dos veces a `StartCoroutine`, se ejecutan **dos** corrutinas a la vez. Usa una bandera (`bool animando`) para impedirlo.
- Al acabar el bucle, asigna el valor final: `t / duracion` rara vez cae justo en 1.
- Si se desactiva el GameObject, sus corrutinas se detienen y no se reanudan solas.

## Antes de los retos
- **u-1:** limita la entrada antes de multiplicar por velocidad y `Time.deltaTime`.
- **u-2:** el primer disparo sale el mismo fotograma; después, uno por cadencia.
- **u-3:** guarda la posición inicial en `Awake` y bloquea las llamadas repetidas a `Abrir`.
