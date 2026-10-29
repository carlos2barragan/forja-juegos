// Contenido de la guía: rangos, plan, hábitos, proyectos, empleo y dónde buscar, para programación de videojuegos.
module.exports = {
  // Hay 10 puntos por reto. Los umbrales están pensados para los 34 retos actuales de la Parte 1.
  stages: [
    { name: 'Aprendiz', xp: 0, text: 'Escribes clases, propiedades y colecciones en C#. Sabes qué es un vector.' },
    { name: 'Scripter', xp: 40, text: 'Mueves cosas en Unity sin depender de los FPS y lees la entrada del jugador.' },
    { name: 'Programador de gameplay', xp: 110, text: 'Usas eventos, corrutinas y ScriptableObjects. Tus componentes no tienen fugas.' },
    { name: 'Desarrollador de juegos', xp: 190, text: 'Programas tus propias colisiones, saltos y paso fijo. Entiendes qué hace el motor por dentro.' },
    { name: 'Arquitecto de juego', xp: 260, text: 'Estructuras un juego con estados, pools, comandos y guardados versionados.' },
    { name: 'Junior sólido', xp: 310, text: 'Terminaste casi toda la Parte 1, IA incluida. Tienes la base para un puesto de programador de gameplay junior.' },
  ],
  veredicto: {
    titulo: '¿Terminar todos los retos te vuelve programador de videojuegos?',
    texto: [
      'Te da la base técnica de un junior fuerte: C#, matemáticas, Unity, física, arquitectura e IA. Es justo lo que preguntan en una prueba técnica de gameplay.',
      'Lo que no te da es haber terminado juegos. En la industria pesa más un juego pequeño, pulido y publicado que diez prototipos a medias. Eso solo sale de construir, enseñar y escuchar a quien juega.',
      'Usa los retos como entrenamiento y los proyectos de esta guía como partido. Lo normal es tardar entre uno y dos años de práctica constante hasta el primer empleo, según tu punto de partida.',
    ],
  },
  plan: [
    { t: 'Meses 1 a 2', d: 'Rutas C# y Matemáticas completas. En paralelo, instala Unity y sigue el tutorial oficial de Unity Learn para conocer el editor.' },
    { t: 'Meses 3 a 4', d: 'Ruta Unity y Física. Primer juego: un arcade de una pantalla (tipo esquivar o disparar), terminado con menú, sonido y puntuación.' },
    { t: 'Meses 5 a 6', d: 'Rutas Patrones e IA. Segundo juego más ambicioso: un plataformas corto o un top-down con enemigos que patrullan y persiguen.' },
    { t: 'Meses 7 a 9', d: 'Participa en dos game jams (Ludum Dare, GMTK, Global Game Jam). Aprende a trabajar con artistas y a recortar alcance.' },
    { t: 'Meses 10 a 12', d: 'Pule tu mejor juego, publícalo en itch.io con vídeo y página cuidada. Prepara portafolio, currículum y aplica cada semana.' },
  ],
  habits: [
    { t: 'Escribe antes de mirar', d: 'Intenta el reto sin pistas. El esfuerzo de recordar es lo que fija el aprendizaje.' },
    { t: 'Repite hasta 9 o 10', d: 'Si sacas menos de 9, reescribe el reto desde cero al día siguiente.' },
    { t: 'Lleva cada reto a Unity', d: 'Cada pieza de los retos (el salto, la patrulla, el pool) mételas en una escena y míralas moverse. Ver el bug enseña más que leerlo.' },
    { t: 'Termina cosas pequeñas', d: 'Un juego de una pantalla terminado vale más que un RPG a medias. Recorta alcance hasta que puedas acabarlo en dos semanas.' },
    { t: 'Juega con ojos de programador', d: 'Cuando juegues, pregúntate cómo está hecho: ¿cómo detecta el suelo?, ¿por qué la cámara no tiembla? Luego intenta replicarlo.' },
    { t: 'Haz que otros lo prueben', d: 'Mira jugar a alguien sin explicarle nada. Lo que no entiende es tu siguiente tarea.' },
  ],
  proyectos: [
    { ruta: 'C# y Matemáticas', t: 'Arcade de una pantalla', d: 'Nave o personaje que esquiva y dispara. Movimiento independiente de los FPS, puntuación, vidas y reinicio.' },
    { ruta: 'Unity', t: 'Torre de defensa mínima', d: 'Oleadas de enemigos desde prefabs, torretas configuradas con ScriptableObjects y una UI que escucha eventos.' },
    { ruta: 'Física', t: 'Plataformas con controlador propio', d: 'Sin Rigidbody: tu propio salto por altura, coyote time, jump buffer y colisiones contra el mapa.' },
    { ruta: 'Patrones', t: 'Puzle por turnos con deshacer', d: 'Máquina de estados para el flujo de partida, comandos con deshacer ilimitado y guardado con versiones.' },
    { ruta: 'IA', t: 'Juego de sigilo', d: 'Guardias con cono de visión, patrulla, árbol de comportamiento para investigar ruidos y A* para perseguir.' },
  ],
  huecos: {
    intro: 'La plataforma entrena la programación. Un juego tiene más piezas, y conviene que sepas que existen para aprenderlas con Unity abierto.',
    items: [
      { t: 'El editor de Unity', d: 'Escenas, prefabs, inspector, Animator, Timeline. Se aprende usándolo.', r: 'Unity Learn (Junior Programmer)' },
      { t: 'Física real de Unity', d: 'Rigidbody, colisionadores, capas y triggers. Ya sabes qué hacen por dentro; ahora toca su API.', r: 'Manual de Unity: Physics' },
      { t: 'Render y shaders', d: 'URP, Shader Graph, iluminación y posprocesado.', r: 'Manual de URP y The Book of Shaders' },
      { t: 'UI', d: 'uGUI o UI Toolkit, anclas, resoluciones y navegación con mando.', r: 'Manual de Unity: UI' },
      { t: 'Audio', d: 'Mezcla, AudioMixer y sonido espacial. El sonido es la mitad del game feel.', r: 'Manual de Unity: Audio' },
      { t: 'Perfilado', d: 'Profiler, Frame Debugger y Memory Profiler para encontrar por qué va lento.', r: 'Manual de Unity: Profiler' },
      { t: 'Control de versiones', d: 'Git con .gitignore de Unity y Git LFS para assets grandes.', r: 'github/gitignore: Unity.gitignore' },
    ],
  },
  empleo: {
    pasos: [
      'Ten de dos a tres juegos pequeños terminados y jugables en el navegador (itch.io con build WebGL). Quien revisa tu portafolio dedica pocos minutos: que se pueda jugar sin descargar nada.',
      'Para cada juego, un vídeo de 30 a 60 segundos y una lista corta de lo que programaste tú (por ejemplo: "IA de guardias con árbol de comportamiento").',
      'Código en GitHub, limpio y con un README que explique la arquitectura. Te lo van a leer.',
      'Prepárate para pruebas técnicas: vectores, producto punto, ciclo de vida de Unity, rendimiento (GC, pooling) y un ejercicio práctico en Unity de unas horas.',
      'Busca también fuera de los estudios de videojuegos: simulación, formación, realidad virtual, arquitectura y publicidad contratan perfiles de Unity y suelen tener más vacantes.',
      'Participa en comunidades y game jams: muchos primeros trabajos salen de contactos hechos allí.',
    ],
    certs: [
      { n: 'Unity Certified User: Programmer', d: 'Nivel de entrada, útil si no tienes experiencia demostrable.' },
      { n: 'Unity Certified Associate / Professional: Programmer', d: 'Para quien ya ha trabajado con Unity; valida conocimiento más profundo.' },
    ],
    nota: 'En videojuegos el portafolio pesa mucho más que las certificaciones. Revisa en la web de Unity qué certificaciones siguen vigentes, porque cambian con el tiempo.',
  },
  buscar: [
    { grupo: 'Documentación', items: [
      ['Manual y referencia de scripts de Unity', 'docs.unity3d.com', 'La fuente oficial. Cada método con ejemplos.'],
      ['Unity Learn', 'learn.unity.com', 'Cursos gratuitos oficiales, incluido el itinerario Junior Programmer.'],
      ['Documentación de C#', 'learn.microsoft.com/dotnet/csharp', 'El lenguaje en detalle.'],
    ] },
    { grupo: 'Libros y lecturas', items: [
      ['Game Programming Patterns, de Robert Nystrom', 'gameprogrammingpatterns.com', 'Los patrones de la ruta Patrones explicados para juegos. Gratis en la web.'],
      ['Fix Your Timestep!, de Glenn Fiedler', 'gafferongames.com', 'El artículo clásico sobre el paso fijo de la ruta Física.'],
      ['Red Blob Games, de Amit Patel', 'redblobgames.com', 'A*, cuadrículas hexagonales y más, con diagramas interactivos.'],
      ['Real-Time Collision Detection, de Christer Ericson', '', 'La referencia sobre colisiones para cuando quieras ir más allá.'],
      ['Game AI Pro', 'gameaipro.com', 'Capítulos gratuitos de IA de juegos escritos por profesionales.'],
    ] },
    { grupo: 'Charlas y vídeos', items: [
      ['GDC Vault y el canal de GDC', 'gdcvault.com', 'Charlas de profesionales: "Math for Game Programmers", postmortems y más.'],
      ['Game Maker\'s Toolkit', '', 'Canal de diseño de juegos que explica por qué funcionan las mecánicas.'],
    ] },
    { grupo: 'Comunidad y práctica', items: [
      ['itch.io', 'itch.io', 'Publica tus juegos y encuentra game jams.'],
      ['Ludum Dare y GMTK Game Jam', '', 'Game jams populares; ideales para terminar algo en pocos días.'],
      ['Foros y Discord de Unity', 'discussions.unity.com', 'Para preguntas concretas. Busca antes de preguntar.'],
    ] },
  ],
};
