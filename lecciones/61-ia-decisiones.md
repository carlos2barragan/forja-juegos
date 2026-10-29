---
id: l-ia-decisiones
grupo: ia
min: 12
titulo: Decidir: árboles de comportamiento y utility AI
resumen: Las dos formas más usadas de que un personaje elija qué hacer, y cómo evitar que cambie de idea cada fotograma.
practica: ia-4, ia-5
clave:
- Secuencia = Y lógico: falla en cuanto un hijo falla. Selector = O lógico: acierta en cuanto uno acierta.
- Corriendo significa "aún no he terminado": el nodo compuesto recuerda por qué hijo iba.
- En utility AI cada acción se puntúa de 0 a 1 multiplicando sus consideraciones.
- Un bono de inercia para la acción actual evita que la IA dude entre dos opciones parecidas.
---
## Árboles de comportamiento
Una máquina de estados con veinte estados se vuelve una telaraña de transiciones. Los **behaviour trees** (árboles de comportamiento) organizan las decisiones en un árbol que se evalúa de arriba abajo cada **tick**.

Cada nodo devuelve uno de tres resultados:

| Resultado | Significado |
| --- | --- |
| Éxito | Lo hice |
| Fallo | No pude |
| Corriendo | Estoy en ello, vuelve a preguntarme en el próximo tick |

## Los nodos básicos
- **Acción**: hace algo (moverse, atacar). Puede tardar varios ticks: devuelve Corriendo.
- **Condición**: pregunta algo (¿veo al jugador?). Éxito o Fallo.
- **Decorador**: tiene un hijo y cambia su resultado. El **inversor** cambia Éxito por Fallo y al revés.
- **Secuencia**: ejecuta los hijos en orden. Si uno falla, falla. Si todos aciertan, acierta. Es un **Y**.
- **Selector**: prueba los hijos en orden hasta que uno no falle. Es un **O**: "intenta esto; si no, aquello".

~~~
Selector
├── Secuencia                     // combate
│   ├── Condicion: ¿veo al jugador?
│   ├── Accion: acercarme
│   └── Accion: atacar
├── Secuencia                     // investigar
│   ├── Condicion: ¿oí un ruido?
│   └── Accion: ir al ruido
└── Accion: patrullar             // por defecto
~~~

## La memoria de Corriendo
Si "acercarme" tarda 3 segundos, devuelve Corriendo varios ticks. ¿Qué hace la secuencia en el siguiente tick?

- **Sin memoria**: empieza otra vez desde el primer hijo. Reevalúa "¿veo al jugador?" cada tick: reacciona rápido, pero repite acciones que ya terminaron.
- **Con memoria**: recuerda el índice del hijo que estaba corriendo y continúa desde ahí.

~~~
int indice = 0;

public override Resultado Tick()
{
    while (indice < hijos.Length)
    {
        var r = hijos[indice].Tick();
        if (r == Resultado.Corriendo) return r;          // sigue aquí el próximo tick
        if (r == Resultado.Fallo) { indice = 0; return r; }
        indice++;
    }
    indice = 0;                                          // terminó: la próxima vez desde el principio
    return Resultado.Exito;
}
~~~

El selector es el espejo: avanza cuando un hijo **falla** y termina cuando uno **acierta**.

`params Nodo[] hijos` permite escribir `new Secuencia(a, b, c)` sin crear el array a mano.

Los árboles reales añaden una **blackboard** (memoria compartida donde los nodos guardan "última posición del jugador") y nodos como Repetir, Esperar o Paralelo. Unity tiene el paquete **Behavior**, y hay herramientas como Behavior Designer y NodeCanvas.

## Utility AI
Otra forma de decidir: en lugar de reglas fijas, **puntuar** cada acción y elegir la mejor. Es la IA de los Sims y de muchos juegos de estrategia.

Cada acción tiene **consideraciones**: preguntas con respuesta entre 0 y 1.

~~~
Comer = hambre × hayComidaCerca × noHayPeligro
Dormir = cansancio × esDeNoche
Huir = peligro
~~~

Se **multiplican** porque cualquier 0 debe anular la acción: si no hay comida, da igual el hambre que tengas.

Las **curvas** dan forma a cada consideración. Elevar `x` a un exponente cambia cómo responde:

| Exponente | Efecto |
| --- | --- |
| 1 | Lineal |
| 2 o más | Solo importa cuando es alto (urgencias) |
| 0,5 | Importa enseguida y luego se satura |

Limita siempre la entrada a [0, 1] antes de aplicar la curva: una consideración de 1,4 o −0,2 rompe el producto.

## La inercia
Si "comer" vale 0,61 y "dormir" 0,60, un pequeño cambio hará que la IA alterne cada fotograma: empieza a comer, se gira hacia la cama, vuelve a la comida. La solución es la **histéresis**: sumar un pequeño bono a la acción que ya está haciendo. Solo cambia si otra la supera con claridad.

Añade también un **mínimo**: si ninguna acción llega a él, la IA no hace nada (o hace algo por defecto) en lugar de elegir la "menos mala".

## Antes de los retos
- **ia-4:** las pruebas cuentan cuántas veces se ejecuta cada hijo: con memoria, no se repiten los anteriores.
- **ia-5:** sin consideraciones, 0; la inercia también cuenta para superar el mínimo; en empate gana la primera.
- Para profundizar: la charla "Building a Better Centaur" de Dave Mark (GDC).
