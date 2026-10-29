---
id: l-fisica-integracion
grupo: fisica
min: 11
titulo: Integrar el movimiento y el paso fijo
resumen: Cómo avanza la física en el tiempo, cómo diseñar un salto por su altura y por qué FixedUpdate usa pasos fijos.
practica: f-4, f-5
clave:
- Euler semi-implícito: primero velocidad += aceleración·dt, después posición += velocidad·dt.
- Para saltar una altura h con gravedad g: v = √(2·|g|·h).
- La física usa pasos fijos para ser estable y reproducible; el render va a su ritmo.
- Limita los pasos por fotograma o caerás en la espiral de la muerte.
---
## Posición, velocidad, aceleración
Cada paso de tiempo `dt`:

- La **aceleración** (gravedad, fuerzas) cambia la velocidad.
- La **velocidad** cambia la posición.

Hay varias formas de hacer esa cuenta. La más sencilla (Euler explícito) usa la velocidad vieja para mover; la que usan casi todos los juegos (**Euler semi-implícito**) actualiza primero la velocidad y mueve con la nueva:

~~~
// semi-implícito: estable y casi tan barato como el explícito
velocidad += gravedad * dt;
posicion += velocidad * dt;
~~~

El orden importa: con el explícito un muelle o una órbita ganan energía poco a poco hasta descontrolarse.

## Diseñar el salto por su altura
Un diseñador no quiere "velocidad inicial 8,94": quiere "salta 2 metros". En el punto más alto la velocidad vertical es 0, y de la cinemática sale:

~~~
v² = 2 · |g| · h      →      v = √(2 · |g| · h)
~~~

Con `g = −20` y `h = 2`: `v = √80 ≈ 8,94`. La gravedad suele ser negativa, así que usa su valor absoluto (o `−2·g·h`).

En la práctica la simulación por pasos no da exactamente la altura teórica, pero se acerca mucho con un `dt` pequeño. Muchos juegos van más lejos: eligen altura y **tiempo** hasta la cima, y de ahí sacan también la gravedad (`g = −2h / t²`). Así el salto se siente igual aunque cambies la altura.

## El suelo y el doble salto
Un suelo simple en `y = 0`:

~~~
if (posicion.y < 0f)
{
    posicion.y = 0f;
    if (velocidad.y < 0f) velocidad.y = 0f;   // solo anula si iba hacia abajo
}
~~~

Considera "en el suelo" cuando está en `y ≤ 0` y no sube. Sin esa condición puedes volver a saltar en el aire.

Dos ideas de game feel para cuando lleves esto a Unity: **coyote time** (dejar saltar unos milisegundos después de salir de un borde) y **jump buffer** (recordar un salto pulsado justo antes de aterrizar).

## Por qué un paso fijo
Si la física avanza con el `dt` de cada fotograma:

- Con un fotograma lento (`dt` grande) los objetos atraviesan paredes.
- La misma partida da resultados distintos en PCs distintos: imposible hacer repeticiones o red determinista.

La solución es que la física avance **siempre** en pasos de, por ejemplo, 0,02 s, y que cada fotograma ejecute los pasos que le tocan. Es lo que hace Unity con `FixedUpdate` y `Time.fixedDeltaTime`.

## El acumulador
~~~
acumulado += dtFotograma;
while (acumulado >= paso)
{
    Simular(paso);
    acumulado -= paso;
}
~~~

Si un fotograma dura 0,05 s y el paso es 0,02 s, se simulan 2 pasos y quedan 0,01 s guardados para el siguiente fotograma.

## La espiral de la muerte
Si simular un paso tarda más que el propio paso, cada fotograma tiene más trabajo pendiente que el anterior y el juego se congela. Por eso se pone un **máximo de pasos por fotograma** y se descarta el tiempo que sobre. El juego se ralentiza un momento, pero no se cuelga. Unity lo llama `Maximum Allowed Timestep`.

## Interpolar el render
Tras simular, en el acumulador queda una fracción de paso. Esa fracción (`acumulado / paso`, entre 0 y 1) dice cuánto hemos avanzado hacia el siguiente estado. Si dibujas el objeto entre el estado anterior y el actual según esa fracción, el movimiento se ve suave aunque la física vaya a 50 Hz y la pantalla a 144 Hz. Es lo que activa `Rigidbody.interpolation`.

## Antes de los retos
- **f-4:** el orden velocidad → posición, el suelo, y que `Saltar` solo funcione en el suelo.
- **f-5:** tras el límite de pasos, deja el acumulador por debajo de un paso; `Alfa` siempre en [0, 1).
- Lectura recomendada: "Fix Your Timestep!" de Glenn Fiedler.
