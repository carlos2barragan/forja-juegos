// Tutoriales de inglés para hispanohablantes. Se agregan en lecciones/index.js.
// En el texto, «así» marca un ejemplo en inglés: se muestra como código y, al pulsarlo, se oye (ver lessons-ui.js).
// `practica` se calcula a partir de los retos que enlazan cada lección.
const { challenges } = require('../retos/ingles');

const md = (s) => s.replace(/«/g, '`').replace(/»/g, '`');

const grupos = [
  { id: 'en-inicio', nombre: 'Inglés: cómo empezar', texto: 'El método, los niveles y la rutina. Antes de estudiar, decide cómo vas a estudiar.' },
  { id: 'en-base', nombre: 'Inglés básico (A1–A2)', texto: 'Las estructuras que sostienen todo lo demás: to be, presente, preguntas, there is/are y pasado.' },
  { id: 'en-gram', nombre: 'Gramática intermedia y avanzada (B1–B2)', texto: 'Tiempos perfectos, futuro, condicionales, modales, pasiva y estilo indirecto: lo que te hace sonar fluido.' },
  { id: 'en-vocab', nombre: 'Vocabulario y expresiones', texto: 'Falsos amigos, phrasal verbs, collocations, preposiciones e idioms. Las palabras que nadie te explica bien.' },
  { id: 'en-trabajo', nombre: 'Inglés para trabajar y programar', texto: 'Emails, entrevistas, reuniones y el inglés técnico del día a día de un desarrollador.' },
  { id: 'en-sonido', nombre: 'Pronunciación y ortografía', texto: 'Cómo suena el inglés y cómo se escribe, con los problemas típicos de quien habla español.' },
];

const lecciones = [
  // ───────────── CÓMO EMPEZAR ─────────────
  {
    id: 'l-en-metodo', grupo: 'en-inicio', min: 10, titulo: 'Cómo aprender inglés de verdad: método y niveles',
    resumen: 'Qué significa A1, B2 o C1, cuánto tarda cada nivel y la rutina diaria que funciona.',
    cuerpo: md(`El inglés no se aprende "estudiando mucho" una vez a la semana: se aprende **un poco cada día durante meses**, usando las cuatro habilidades (escuchar, hablar, leer, escribir). Esta plataforma te entrena gramática, vocabulario y escritura con corrección automática. El resto (escuchar mucho y hablar con personas) lo tienes que sumar tú.

## Los niveles (marco europeo, CEFR)
| Nivel | Qué puedes hacer |
| A1 | Presentarte y frases muy básicas |
| A2 | Rutinas, compras, viajes sencillos, pasado simple |
| B1 | Defenderte en la mayoría de situaciones y contar experiencias |
| B2 | Hablar con naturalidad, entender textos complejos y trabajar en inglés |
| C1 | Fluidez casi total, matices y humor |
| C2 | Dominio como un nativo culto |

Cambridge estima en torno a 200 horas de estudio guiado por nivel, y más a medida que subes. Es orientativo: lo que importa es la constancia.

## La rutina de 60 minutos al día
- **15 min de vocabulario** con repetición espaciada (Anki): palabras dentro de frases, no sueltas.
- **15 min de escucha**: un podcast, un vídeo o una serie con subtítulos en inglés. Entiende la idea general, no cada palabra.
- **15 min de habla**: repite en voz alta lo que escuchas (técnica shadowing) o conversa con un tutor.
- **15 min de lectura y escritura**: un artículo corto y un párrafo tuyo sobre tu día.

## Cómo usar esta plataforma
- Lee la lección, haz los retos que enlaza y repite los que fallen hasta que salgan todos bien.
- En cada lección, **pulsa sobre los ejemplos en inglés** (los que se ven como código) para oírlos.
- Lleva un **cuaderno de errores**: anota cada frase que falló, escríbela bien y vuelve a ella a los tres días.

## Recursos gratuitos y fiables
- British Council LearnEnglish: lecciones, gramática y audios por nivel.
- BBC Learning English: 6 Minute English y vídeos cortos.
- Cambridge Dictionary y Oxford Learner's Dictionaries: significado, ejemplos y audio UK/US.
- YouGlish: escribe una palabra y oye cientos de vídeos reales donde se pronuncia.
- Elllo.org y TED: escucha con transcripción.
- Tutores (italki, Preply) o intercambios de idioma (Tandem, HelloTalk) para hablar de verdad.

## La regla de oro
Hablar mal con una persona enseña más que estudiar perfecto solo. No esperes a "saber más" para empezar a hablar.`),
    clave: ['Constancia diaria vale más que sesiones largas y raras.', 'Vocabulario en frases, escucha activa, habla en voz alta y escritura breve.', 'Un cuaderno de errores acelera el progreso.'],
    practica: [],
  },

  // ───────────── BÁSICO ─────────────
  {
    id: 'l-en-be', grupo: 'en-base', min: 9, titulo: 'To be: el verbo que más usarás',
    resumen: 'Am, is, are, sus formas cortas, negativas y preguntas, y las trampas con la edad, el clima y el sujeto obligatorio.',
    cuerpo: md(`**To be** equivale a ser y estar, y también aparece donde en español usarías tener o hacer.

## Formas
| Persona | Afirmativa | Corta | Negativa |
| I | «I am» | «I'm» | «I am not» |
| you / we / they | «you are» | «you're» | «you aren't» |
| he / she / it | «she is» | «she's» | «she isn't» |

La pregunta invierte el orden: «Are you ready?», «Where is the station?». Respuesta corta: «Yes, I am.» / «No, he isn't.»

## Trampas para hispanohablantes
- **El sujeto es obligatorio.** No existe «Is raining»; se dice «It is raining». Tampoco «Is a good idea»: «It is a good idea».
- **La edad es to be:** «I am twenty» (no «I have twenty years»).
- **Sensaciones también:** «I am hungry», «I am thirsty», «I am cold», «I am afraid», «I am right», «I am wrong».
- **El tiempo:** «It is hot today», «It is sunny».
- **"Ser" y "estar" se unen:** «He is a doctor» (profesión) y «He is at home» (lugar) usan el mismo verbo.

## Practica en voz alta
~~~
I am a student.
She is not at home.
Are they your friends?
Where is the bathroom?
~~~`),
    clave: ['I am, you are, he/she/it is, we/you/they are.', 'El sujeto nunca se omite: It is raining.', 'La edad y las sensaciones usan to be, no have.'],
    practica: [],
  },
  {
    id: 'l-en-presente', grupo: 'en-base', min: 12, titulo: 'Presente simple y presente continuo',
    resumen: 'La -s de la tercera persona, do/does, adverbios de frecuencia y cuándo usar -ing.',
    cuerpo: md(`## Presente simple: hábitos y hechos
Se usa para rutinas, gustos y verdades generales: «I work in a bank», «Water boils at 100 degrees».

La tercera persona (he, she, it) añade **-s**:
- Normal: «works», «plays».
- Tras s, sh, ch, x, o: **-es** → «watches», «goes», «washes».
- Consonante + y: **-ies** → «studies», «tries» (pero «plays», «enjoys»).

**Negativa y pregunta con do / does** (el verbo vuelve a la forma base):
~~~
I do not like coffee.
She does not work here.
Do you speak English?
Does he live nearby?
~~~

## Adverbios de frecuencia
Van **antes** del verbo principal y **después** de to be: «I always drink tea», «She is never late». De más a menos: always, usually, often, sometimes, rarely, never.

## Presente continuo: ahora y temporal
Se forma con **am / is / are + verbo-ing**: «I am working», «They are watching TV». Se usa para algo que ocurre ahora o es temporal, y para planes: «I am meeting Ana tomorrow».

Ortografía del -ing: «make → making», «run → running», «lie → lying».

## Verbos de estado (casi nunca en -ing)
know, like, love, hate, want, need, understand, believe, prefer, own: «I know the answer», no «I am knowing».

## Señales de tiempo
| Simple | Continuo |
| every day, usually, never | now, at the moment, today |
| on Mondays | this week, currently |

## Trampa
En español dices "ella trabaja"; en inglés **hace falta la -s**: «she works». Y no digas «she don't»: «she doesn't».`),
    clave: ['he/she/it + verbo con -s; negativa y pregunta con do/does + verbo base.', 'Presente continuo = am/is/are + -ing, para "ahora" y planes.', 'Los verbos de estado (know, like, want) no suelen ir en continuo.'],
    practica: [],
  },
  {
    id: 'l-en-preguntas', grupo: 'en-base', min: 9, titulo: 'Preguntas y negaciones',
    resumen: 'Cómo formar preguntas con do/does, las palabras interrogativas y las respuestas cortas.',
    cuerpo: md(`## Orden de la pregunta
**Palabra interrogativa + auxiliar + sujeto + verbo base**: «Where do you live?», «What time does the shop open?».

| Palabra | Para preguntar |
| who | quién |
| what | qué |
| where | dónde |
| when | cuándo |
| why | por qué |
| how | cómo |
| which | cuál (entre pocas opciones) |
| whose | de quién |
| how much / how many | cuánto (incontable) / cuántos (contable) |

## Respuestas cortas
«Do you like jazz?» → «Yes, I do.» / «No, I don't.»
«Is she here?» → «Yes, she is.» / «No, she isn't.»

## Preguntas sobre el sujeto (sin do)
Cuando la palabra interrogativa **es** el sujeto no se usa do: «Who called you?» (no «Who did call you?»). «What happened?».

## Preposición al final
Es natural: «Who are you talking to?», «What are you looking at?».

## Negaciones
- Con to be: «I am not», «she isn't».
- Con otros verbos: do/does + not + verbo base: «I don't know».
- **Una sola negación por frase:** «I don't have anything» o «I have nothing», nunca «I don't have nothing».

## Trampas
- «Do you like?» está incompleta: «Do you like it?».
- «Where you live?» no vale: «Where do you live?».
- El verbo no lleva -s tras does: «Does she work?», no «Does she works?».`),
    clave: ['Pregunta = interrogativa + auxiliar + sujeto + verbo base.', 'Con who/what como sujeto no se usa do.', 'Una sola negación por frase.'],
    practica: [],
  },
  {
    id: 'l-en-there', grupo: 'en-base', min: 10, titulo: 'There is / there are, artículos, cantidades y lugares',
    resumen: 'Cómo decir "hay", a/an/the, some/any, much/many, plurales y las preposiciones in, on, at.',
    cuerpo: md(`## There is / there are = "hay"
«There is a book on the table.» (singular o incontable)
«There are two cats in the garden.» (plural)
Pregunta: «Is there a bank near here?», «Are there any seats?» Negativa: «There isn't any milk», «There aren't any cars».

## A, an, the
- **a** delante de sonido de consonante: «a book», «a university» (suena "yu").
- **an** delante de sonido de vocal: «an apple», «an hour» (la h no suena).
- **the** cuando es algo conocido o único: «the sun», «Close the door».

## Contables e incontables
- Contables: «apple, car, person» (tienen plural).
- Incontables: «water, money, information, advice, furniture» (no llevan plural ni «a»): «some advice», nunca «an advice».

| | Afirmativa | Negativa / pregunta |
| Contable plural | some apples | any apples |
| Incontable | some water | any water |
| Cantidad grande | many / a lot of | many / much |

«How many books?» (contable) y «How much water?» (incontable).

## Plurales irregulares
man → men, woman → women, child → children, person → people, foot → feet, tooth → teeth, mouse → mice.

## Preposiciones de lugar
- **in**: dentro («in the box», «in Madrid»)
- **on**: sobre una superficie («on the table», «on the wall»)
- **at**: un punto concreto («at home», «at the bus stop», «at work»)
- **under, behind, in front of, next to, between, opposite, above**

## Preposiciones de tiempo
**at** + hora («at 6 pm»), **on** + día («on Monday»), **in** + mes/año/parte del día («in May», «in 2024», «in the morning»).`),
    clave: ['There is + singular/incontable; there are + plural.', 'a/an dependen del sonido, no de la letra.', 'at + hora, on + día, in + mes/año.'],
    practica: [],
  },
  {
    id: 'l-en-pasado', grupo: 'en-base', min: 12, titulo: 'El pasado simple y el pasado continuo',
    resumen: 'Verbos regulares e irregulares, did/did not, was/were, used to y while/when.',
    cuerpo: md(`## Pasado simple
Para acciones terminadas en un momento concreto del pasado: «I visited Rome last year», «She called me yesterday».

- **Regulares:** añaden **-ed**: «work → worked», «study → studied», «stop → stopped».
- **Irregulares:** hay que memorizarlos: 

| Presente | Pasado |
| go | went |
| have | had |
| see | saw |
| buy | bought |
| think | thought |
| write | wrote |
| meet | met |
| take | took |
| come | came |
| eat | ate |
| get | got |
| give | gave |
| know | knew |
| make | made |
| say | said |
| tell | told |

## Negativa y pregunta con did
El verbo vuelve a la forma base:
~~~
I did not go to work.
Did you see the film?
Where did they live?
~~~
Error típico: «I did not went». Con did, el verbo siempre va sin pasado.

## Was / were
«I was tired», «They were at home», «Were you there?» (to be no usa did).

## Used to
Hábitos pasados que ya no ocurren: «I used to smoke» (ya no fumo), «She used to live in Paris».

## Pasado continuo
**was / were + -ing**: acción en curso en un momento del pasado: «I was sleeping at 10 pm», «They were playing when it started to rain».

Combina con while y when:
~~~
I was cooking when she arrived.
While we were walking, it started to rain.
~~~
La acción larga va en continuo; la corta que la interrumpe, en simple.

## Señales de pasado
yesterday, last week, in 2019, two days ago, when I was a child.`),
    clave: ['Regulares: -ed; irregulares: se memorizan.', 'Con did/did not el verbo va en forma base.', 'Pasado continuo = was/were + -ing, con when/while.'],
    practica: [],
  },

  // ───────────── GRAMÁTICA B1–B2 ─────────────
  {
    id: 'l-en-perfect', grupo: 'en-gram', min: 12, titulo: 'Present perfect: el tiempo que más confunde',
    resumen: 'Have/has + participio, for/since, just/already/yet/ever/never y la diferencia con el pasado simple.',
    cuerpo: md(`## Forma
**have / has + participio pasado**: «I have finished», «She has lived here for years».

El participio de los verbos regulares es igual al pasado (-ed). Los irregulares cambian: «go → gone», «see → seen», «eat → eaten», «write → written», «be → been», «do → done», «take → taken», «break → broken».

## Para qué se usa
- **Algo que empezó en el pasado y sigue:** «I have lived here for five years» (y sigo viviendo).
- **Experiencias de la vida, sin decir cuándo:** «I have been to Japan», «Have you ever tried sushi?».
- **Resultado presente de algo reciente:** «I have lost my keys» (y ahora no los tengo).

## For y since
- **for** + duración: «for two hours», «for ten years».
- **since** + punto de inicio: «since 2018», «since Monday», «since I was a child».

## Palabras clave
| Palabra | Ejemplo |
| just | «I have just arrived.» |
| already | «She has already eaten.» |
| yet (negativa y pregunta) | «Have you finished yet?» |
| ever | «Have you ever been to London?» |
| never | «I have never seen snow.» |

## Present perfect vs pasado simple
Si dices **cuándo** pasó (yesterday, last year, in 2019), usa **pasado simple**:
~~~
I lost my keys yesterday.
I have lost my keys.
~~~
Si el periodo **sigue abierto** (this week, today, so far), usa present perfect: «I have seen three films this week».

## Been vs gone
«She has been to Paris» (fue y volvió). «She has gone to Paris» (está allí ahora).

## Present perfect continuous
**have / has been + -ing** enfatiza la duración: «I have been learning English for two years».`),
    clave: ['have/has + participio.', 'for = duración, since = momento de inicio.', 'Si das fecha concreta, usa pasado simple.'],
    practica: [],
  },
  {
    id: 'l-en-futuro', grupo: 'en-gram', min: 9, titulo: 'Hablar del futuro: will, going to y más',
    resumen: 'Cuándo usar will, going to, el presente continuo y el presente simple, y may/might.',
    cuerpo: md(`En inglés no hay un solo futuro: hay varias formas según la intención.

## Will
- **Decisión en el momento:** «The phone is ringing. I'll get it.»
- **Predicción o opinión:** «I think it will rain.»
- **Promesas y ofertas:** «I'll help you.»

## Going to
- **Plan ya decidido:** «I'm going to study medicine.»
- **Predicción con evidencia presente:** «Look at those clouds! It's going to rain.»

## Presente continuo
Para citas ya acordadas: «We are meeting Ana at 6 tomorrow.»

## Presente simple
Para horarios y calendarios: «The train leaves at 8.», «The course starts on Monday.»

## May / might
Posibilidad: «It might rain», «She may come». Equivale a quizás.

## Cláusulas de tiempo (no uses will después de when, if, as soon as)
~~~
I will call you when I arrive.
If it rains, we will stay at home.
~~~
No digas «when I will arrive».

## Resumen rápido
| Situación | Forma |
| Decido ahora | will |
| Lo tenía planeado | going to |
| Cita fija | presente continuo |
| Horario | presente simple |
| Quizás | may / might |`),
    clave: ['will = decisión del momento o predicción; going to = plan o evidencia.', 'Presente continuo para citas acordadas.', 'Después de when/if no se usa will.'],
    practica: [],
  },
  {
    id: 'l-en-condicionales', grupo: 'en-gram', min: 12, titulo: 'Condicionales: 0, 1, 2 y 3',
    resumen: 'Las cuatro estructuras con "if", unless y cómo hablar de deseos con wish.',
    cuerpo: md(`## Los cuatro tipos
| Tipo | Uso | Estructura | Ejemplo |
| 0 | Hechos | if + presente, presente | «If you heat ice, it melts.» |
| 1 | Posible en el futuro | if + presente, will + base | «If it rains, we will stay.» |
| 2 | Hipotético o irreal | if + pasado, would + base | «If I won the lottery, I would travel.» |
| 3 | Pasado irreal | if + past perfect, would have + participio | «If I had studied, I would have passed.» |

## Reglas clave
- **Nunca pongas will / would después de if:** «If I have time» y no «If I will have time».
- En el segundo condicional, con **be** se usa **were** para todas las personas en inglés formal: «If I were you, I would apologize.» («was» también se oye.)
- Puedes invertir el orden sin coma: «I would help you if I could.»

## Unless
Unless = if not: «Unless you hurry, you will miss the bus» = «If you don't hurry, you will miss the bus».

## Wish: deseos
- Presente irreal: «I wish I had more time» (pero no tengo).
- Pasado irreal: «I wish I had studied more» (pero no estudié).

## Trampas
Muchos hablantes de español dicen «If I will go...» por influencia de la traducción. En inglés, tras if el verbo va en presente o pasado, y la consecuencia lleva will o would.`),
    clave: ['0: hechos; 1: posible; 2: irreal presente; 3: irreal pasado.', 'Nunca will/would justo después de if.', 'unless = if not.'],
    practica: [],
  },
  {
    id: 'l-en-modales', grupo: 'en-gram', min: 11, titulo: 'Verbos modales: obligación, permiso, deducción',
    resumen: 'Can, could, may, must, have to, should y cómo pedir cosas con cortesía.',
    cuerpo: md(`Los modales (can, could, may, might, must, should, would...) van **seguidos del verbo base sin to ni -s**: «She can swim», no «She cans swims».

## Habilidad y permiso
- **can / could:** capacidad o permiso. «I can swim.», «Could I open the window?»
- **may:** permiso formal. «May I come in?»
- **be able to:** se usa donde can no tiene forma: «I will be able to help you tomorrow.»

## Obligación y prohibición
| Idea | Expresión |
| Obligación fuerte | must / have to |
| Prohibido | must not / can't |
| No hace falta | don't have to / needn't |
| Consejo | should / ought to |

**Ojo:** «You mustn't smoke» = prohibido; «You don't have to come» = no hace falta.

## Deducción (qué tan seguro estás)
- **must:** casi seguro → «She must be tired.»
- **might / may / could:** posible → «He might be at home.»
- **can't:** casi imposible → «That can't be true.»

## Peticiones corteses
- Informal: «Can you help me?»
- Más cortés: «Could you help me, please?»
- Muy cortés: «Would you mind helping me?»
- Ofrecer: «Shall I open the window?»

## Modales en pasado
- «should have + participio» → reproche o consejo tardío: «You should have called me.»
- «could have + participio» → posibilidad no realizada: «I could have won.»
- «must have + participio» → deducción: «He must have forgotten.»`),
    clave: ['Modal + verbo base, sin -s ni to.', 'mustn\'t = prohibido; don\'t have to = no hace falta.', 'could / would suavizan una petición.'],
    practica: [],
  },
  {
    id: 'l-en-pasiva', grupo: 'en-gram', min: 13, titulo: 'Voz pasiva, estilo indirecto y oraciones de relativo',
    resumen: 'Cómo formar la pasiva, "contar" lo que otro dijo y unir ideas con who, which, that.',
    cuerpo: md(`## Voz pasiva
Se forma con **be + participio**. Pones el foco en la acción, no en quién la hace: «The window was broken».

| Tiempo | Pasiva |
| Presente | «English is spoken here.» |
| Pasado | «The house was built in 1950.» |
| Futuro | «The report will be finished tomorrow.» |
| Present perfect | «The problem has been solved.» |

El agente (quién lo hace) se añade con **by** solo si importa: «The book was written by Orwell».

Sirve para el equivalente a "se": «Spanish is spoken here» = aquí se habla español. Y para decir "me robaron": «My wallet was stolen».

## Estilo indirecto (reported speech)
Cuando cuentas lo que alguien dijo, **el tiempo retrocede un paso**:

| Directo | Indirecto |
| «I am tired» | she said she **was** tired |
| «I work here» | he said he **worked** there |
| «I have finished» | she said she **had finished** |
| «I will call» | he said he **would call** |

- Preguntas sí/no: «Do you like jazz?» → «She asked **if / whether** I liked jazz.»
- Órdenes: «Close the door.» → «He told me **to close** the door.»
- say no lleva persona; tell sí: «He said that...» / «He told me that...».

## Oraciones de relativo
| Palabra | Se refiere a |
| who | personas: «The man who lives here...» |
| which | cosas: «The book which I read...» |
| that | personas o cosas (más informal) |
| where | lugares: «The city where I was born...» |
| whose | posesión: «A girl whose mother is a doctor...» |

Cuando el relativo es complemento se puede omitir: «The book (that) I read was great».`),
    clave: ['Pasiva = be + participio (el tiempo está en be).', 'En el estilo indirecto, el tiempo retrocede.', 'who = personas, which = cosas, where = lugares.'],
    practica: [],
  },

  // ───────────── VOCABULARIO ─────────────
  {
    id: 'l-en-vocab', grupo: 'en-vocab', min: 12, titulo: 'Falsos amigos, preposiciones dependientes e idioms',
    resumen: 'Las palabras que engañan por parecerse al español y las expresiones que no se traducen literalmente.',
    cuerpo: md(`## Falsos amigos
Palabras que se parecen al español pero significan otra cosa:

| Inglés | Significa (no es...) |
| actually | de hecho / en realidad (no actualmente, que es «currently») |
| embarrassed | avergonzado (no embarazada, que es «pregnant») |
| library | biblioteca (no librería, que es «bookstore») |
| sensible | sensato (sensible es «sensitive») |
| attend | asistir a (atender es «to help / to serve») |
| realize | darse cuenta (realizar es «to carry out / to do») |
| carpet | alfombra (carpeta es «folder») |
| college | universidad o escuela superior (no colegio, que es «school») |
| exit | salida (éxito es «success») |
| constipated | estreñido (constipado es «to have a cold») |
| pretend | fingir (pretender es «to intend» o «to try») |
| assist | ayudar (asistir a un evento es «attend») |
| support | apoyar (soportar es «stand / bear») |
| introduce | presentar a alguien (no introducir) |

## Preposiciones dependientes
Algunas palabras exigen una preposición fija. Memoriza el bloque entero:
~~~
interested in music
good at math
afraid of spiders
depend on the weather
tired of waiting
proud of you
responsible for the project
married to a doctor
different from / to
apologize for being late
~~~
Después de una preposición, el verbo va en **-ing**: «good at cooking».

## Idioms comunes (no se traducen palabra por palabra)
~~~
It's a piece of cake.   (muy fácil)
Break a leg!   (buena suerte)
It's raining cats and dogs.   (llueve a cántaros)
Once in a blue moon.   (muy rara vez)
I'm under the weather.   (me siento mal)
The ball is in your court.   (te toca decidir)
He spilled the beans.   (reveló el secreto)
Let's call it a day.   (terminemos por hoy)
It costs an arm and a leg.   (carísimo)
Better late than never.   (más vale tarde que nunca)
~~~

## Cómo aprenderlos
Escribe cada palabra en **una frase propia** y repasa con Anki. Busca los ejemplos en Cambridge Dictionary.`),
    clave: ['Muchas palabras parecidas al español significan otra cosa.', 'Aprende preposiciones como parte del bloque (interested in).', 'Los idioms se memorizan enteros, nunca por traducción literal.'],
    practica: [],
  },
  {
    id: 'l-en-phrasal', grupo: 'en-vocab', min: 11, titulo: 'Phrasal verbs',
    resumen: 'Verbo + partícula que cambia el significado: cómo se usan, cuáles aprender primero y cómo no olvidarlos.',
    cuerpo: md(`Un **phrasal verb** es un verbo + una partícula (up, off, out, on, in, down, away...) con un significado propio: «give up» = rendirse, no solo «dar arriba».

## Los más usados
| Phrasal verb | Significado |
| turn on / turn off | encender / apagar |
| turn up / turn down | subir / bajar (volumen) |
| look for | buscar |
| look after | cuidar |
| look up | buscar en un diccionario |
| give up | rendirse |
| find out | averiguar |
| run out of | quedarse sin |
| put off | posponer |
| call off | cancelar |
| get on (with) | llevarse bien |
| get up | levantarse |
| grow up | crecer |
| take off | quitarse (ropa) / despegar |
| set up | montar, configurar |
| carry on | continuar |
| break down | averiarse |
| come across | encontrarse con |

## Separables o inseparables
- **Separables:** el objeto puede ir en medio: «turn the light off» o «turn off the light». Si el objeto es un pronombre, va en medio: «turn it off» (nunca «turn off it»).
- **Inseparables:** el objeto va después: «look after the kids», «look for my keys».

## Cómo aprenderlos
- Agrupa por partícula: **up** (completar, subir), **off** (separar, terminar), **out** (salir, agotar).
- Aprende cada uno **en una frase**, no en una lista de traducciones.
- Oye cómo se usan en series y podcasts.
- Aprende 5 por semana, no 50 de golpe.`),
    clave: ['El significado cambia con la partícula.', 'Con pronombre: «turn it off», no «turn off it».', 'Agrupa por partícula y aprende en frases.'],
    practica: [],
  },
  {
    id: 'l-en-collocations', grupo: 'en-vocab', min: 8, titulo: 'Collocations: las palabras que se llevan bien',
    resumen: 'Por qué se dice "make a decision" y "do homework": los bloques naturales del inglés.',
    cuerpo: md(`Una **collocation** es una combinación de palabras que suena natural. «Heavy rain» suena bien; «strong rain» suena raro, aunque se entienda.

## make vs do
- **make** = crear o producir: «make a decision», «make a plan», «make a mistake», «make money», «make coffee», «make a noise».
- **do** = actividad o tarea: «do homework», «do the dishes», «do a favor», «do your best», «do exercise», «do business».

## take, have, get, give
- **take:** «take a break», «take a shower», «take a photo», «take care», «take a taxi», «take notes».
- **have:** «have breakfast», «have a look», «have fun», «have a meeting», «have a good time».
- **get:** «get a job», «get tired», «get home», «get better», «get a ticket».
- **give:** «give advice», «give a presentation», «give an example», «give a hand» (ayudar).
- **pay:** «pay attention», «pay a visit», «pay the bill».
- **keep:** «keep a secret», «keep in touch», «keep calm».

## Adjetivo + sustantivo
~~~
heavy traffic
strong coffee
fast food
high risk
deep sleep
~~~

## Cómo aprender collocations
Cuando aprendas un sustantivo, apunta con qué verbos y adjetivos se usa. Cambia tu pregunta de "¿cómo se dice esto?" a "¿qué palabras lo acompañan?".`),
    clave: ['make = crear; do = tarea o actividad.', 'Aprende verbo + sustantivo como un bloque.', 'Los diccionarios de collocations (Oxford) ayudan mucho.'],
    practica: [],
  },
  {
    id: 'l-en-cotidiano', grupo: 'en-vocab', min: 10, titulo: 'Inglés de supervivencia: viajar, comer y pedir ayuda',
    resumen: 'Las frases que necesitas el primer día en un país de habla inglesa.',
    cuerpo: md(`## Saludar y presentarte
~~~
Hello, my name is Ana.
Nice to meet you.
How are you? I'm fine, thanks. And you?
Where are you from?
~~~

## Pedir con cortesía
Evita "I want". Usa:
~~~
I would like a coffee, please.
Could I have the bill, please?
Can you help me, please?
Excuse me, where is the bathroom?
~~~

## Cuando no entiendes
~~~
Sorry, could you repeat that, please?
Could you speak more slowly?
What does this word mean?
I don't understand.
~~~

## En el restaurante
~~~
A table for two, please.
What do you recommend?
I'll have the chicken, please.
Could we have the check, please?
~~~

## Direcciones y transporte
~~~
How do I get to the station?
Turn left at the corner.
Go straight ahead.
How long does it take to get to the airport?
I'm lost.
~~~

## En el médico
~~~
I have a headache.
I have a sore throat.
I feel sick.
I need to see a doctor.
~~~

## Hora y fechas
«It's half past three» (3:30), «a quarter to five» (4:45), «at 7 o'clock». Fechas: «on Monday», «on May 3rd», «in 2026».

## Small talk
~~~
What do you do?
How long have you lived here?
What do you do in your free time?
See you later. Have a nice day.
~~~`),
    clave: ['I would like... suena más educado que I want...', 'Aprende frases para pedir que repitan o hablen más despacio.', 'Practica estos bloques en voz alta con situaciones reales.'],
    practica: [],
  },

  // ───────────── TRABAJO Y PROGRAMAR ─────────────
  {
    id: 'l-en-trabajo', grupo: 'en-trabajo', min: 14, titulo: 'Inglés profesional: emails, entrevistas y reuniones',
    resumen: 'Estructura de un email, método STAR para entrevistas, frases de reunión y cómo suavizar el tono.',
    cuerpo: md(`## Emails: estructura
1. **Saludo:** «Dear Mr Smith,» / «Dear Ms Lopez,» / «Hi Ana,» (informal). Para un grupo: «Dear all,».
2. **Motivo:** «I am writing to ask about the position.»
3. **Detalles:** frases cortas, un tema por párrafo.
4. **Petición o cierre:** «I look forward to hearing from you.»
5. **Despedida:** «Kind regards,» / «Best regards,» (formal), «Best,» (neutral).

Frases útiles:
~~~
Please find the report attached.
Thank you for your quick reply.
Sorry for the delay in replying.
If you have any questions, please let me know.
Could you send me more information, please?
~~~

## Entrevista de trabajo
Organiza tus respuestas con el método **STAR**:
- **S**ituation: contexto.
- **T**ask: tu responsabilidad.
- **A**ction: qué hiciste.
- **R**esult: qué lograste, con números si puedes.

Frases útiles:
~~~
Tell me about yourself.
I have five years of experience in sales.
My biggest strength is teamwork.
I'm looking for new challenges.
I learn quickly and work well under pressure.
What is the salary range for this position?
~~~

## Reuniones
- Interrumpir: «Sorry to interrupt, can I add something?»
- Estar de acuerdo: «I agree with you.» / «Exactly.»
- Discrepar con tacto: «I see your point, but...» / «I'm not sure I agree.»
- Pedir aclaración: «Could you clarify what you mean?»
- Resumir: «To sum up, we need more time.»
- Cerrar: «Thank you all for your time.»

## Suavizar el tono
| Directo | Más cortés |
| Give me the report. | Could you send me the report, please? |
| I want a refund. | I would like to request a refund. |
| You are wrong. | I'm not sure I agree. |
| Sorry, I can't come. | I'm afraid I won't be able to attend. |
| Thanks a lot! | I'm very grateful for your help. |

## Al teléfono
~~~
Hello, this is Ana speaking.
Can I speak to Mr Smith, please?
Hold on a moment, please.
Could you spell that, please?
~~~`),
    clave: ['Email: saludo, motivo, detalles, cierre.', 'Entrevista: usa STAR para estructurar.', 'Suaviza con could, would e I\'m afraid.'],
    practica: [],
  },
  {
    id: 'l-en-dev', grupo: 'en-trabajo', min: 12, titulo: 'Inglés para desarrolladores',
    resumen: 'Stand-ups, pull requests, mensajes de commit, preguntas técnicas y cómo se pronuncian las palabras de programación.',
    cuerpo: md(`## Vocabulario del día a día
| Término | Significado |
| bug | error de software |
| fix | arreglar / arreglo |
| deploy | desplegar a producción |
| rollback | revertir un despliegue |
| merge | fusionar ramas |
| pull request (PR) | solicitud de revisión de cambios |
| code review | revisión de código |
| blocker | impedimento |
| technical debt | deuda técnica |
| flaky test | prueba inestable |
| edge case | caso límite |
| workaround | solución provisional |

## Stand-up en tres bloques
~~~
Yesterday I finished the login endpoint.
Today I'm going to fix a bug in production.
I'm blocked waiting for the code review.
~~~

## Pull requests y revisiones
~~~
Please review my pull request.
Could you take a look at this when you have a chance?
I've addressed your comments.
LGTM, looks good to me.
Nit: rename this variable for clarity.
~~~
Sé amable en los comentarios: «Could we extract this into a function?» suena mejor que «This is wrong».

## Mensajes de commit
Usa el imperativo, corto y claro:
~~~
Fix login redirect bug
Add unit tests for payment service
Refactor user repository
Update README with setup steps
~~~

## Preguntar bien (Stack Overflow, GitHub issues)
1. Qué quieres conseguir.
2. Qué hiciste («I tried...»).
3. Qué esperabas y qué pasó.
4. El error exacto, copiado.
5. Versiones y entorno.

~~~
I'm trying to connect to the database, but I get a timeout error.
I expected the request to return 200, but it returns 500.
~~~

## Pronunciación de términos técnicos
- cache: "cash" · SQL: "S-Q-L" o "sequel" · nginx: "engine-x"
- Linux: "LIN-ux" · GUI: "gooey" · char: "car" o "char"
- daemon: "DEE-mon" · null: "nul" · sudo: "SOO-doo" · async: "AY-sink"`),
    clave: ['Stand-up: ayer, hoy, bloqueos.', 'Commits en imperativo: Fix, Add, Refactor.', 'Pregunta con contexto, intento y error exacto.'],
    practica: [],
  },
  {
    id: 'l-en-juegos', grupo: 'en-trabajo', min: 10, titulo: 'Inglés para desarrollar videojuegos',
    resumen: 'El vocabulario de gameplay, balance y producción que se usa en todos los estudios, y cómo reportar un bug en inglés.',
    cuerpo: md(`En casi todos los estudios, aunque el equipo hable español, el vocabulario técnico se dice en inglés. La documentación de Unity, las charlas de la GDC, los foros y las ofertas de empleo también están en inglés.

## Gameplay
| Término | Significado |
| --- | --- |
| «health» / «HP» | vida (hit points) |
| «damage» | daño |
| «spawn» / «respawn» | aparecer / reaparecer |
| «hitbox» / «hurtbox» | zona que golpea / zona que recibe el golpe |
| «cooldown» | tiempo de recarga |
| «power-up» | mejora temporal |
| «checkpoint» | punto de control |
| «loot» / «drop» | botín / objeto que suelta un enemigo |

## Balance y game feel
- «The boss is overpowered.» El jefe está demasiado fuerte (OP).
- «This weapon is underpowered.» Esta arma es demasiado débil.
- «We need to nerf the shotgun.» Hay que debilitar la escopeta. Lo contrario: «buff».
- «The controls feel floaty.» Los controles se sienten flotantes, poco precisos.
- «The jump feels great.» El salto se siente genial.
- «Add some screen shake on hit.» Añade una sacudida de cámara al golpear.

## Producción
| Término | Significado |
| --- | --- |
| «build» | versión compilada del juego |
| «playtest» | sesión de prueba con jugadores |
| «milestone» | hito de entrega |
| «crunch» | jornadas extra antes de una entrega |
| «patch notes» | notas del parche |
| «vertical slice» | un trozo pequeño del juego, terminado con calidad final |
| «scope creep» | el alcance crece sin control |
| «game jam» | maratón para hacer un juego en pocos días |

## Cómo reportar un bug
Un buen reporte tiene siempre las mismas partes:

~~~
Title: Player clips through the wall in level 2
Steps to reproduce:
1. Start level 2.
2. Dash into the left wall while jumping.
Expected: The player stops at the wall.
Actual: The player goes through the wall and falls.
Frequency: 3 out of 5 tries.
Build: 0.4.2 (Windows)
~~~

Frases útiles:
- «I can reproduce it every time.» Lo reproduzco siempre.
- «It only happens on low frame rates.» Solo pasa con pocos FPS.
- «It's a regression: it worked in the last build.» Es una regresión: funcionaba en la build anterior.

## Pronunciación que se oye en los estudios
- shader: "SHAY-der" · sprite: "sprait" · cache: "cash"
- Unity: "YOU-ni-ti" · physics: "FI-zics" · vertex: "VER-tex", plural vertices: "VER-ti-sis"
- quaternion: "kwa-TER-ni-on" · frame rate: "freim reit"`),
    clave: ['Health, spawn, hitbox, cooldown y playtest se dicen igual en un estudio hispano.', 'Nerf debilita, buff refuerza.', 'Un reporte de bug: pasos, esperado, obtenido, frecuencia y build.'],
    practica: [],
  },

  // ───────────── PRONUNCIACIÓN ─────────────
  {
    id: 'l-en-pronun', grupo: 'en-sonido', min: 14, titulo: 'Pronunciación y ortografía para hispanohablantes',
    resumen: 'Los sonidos que más cuestan, el acento de palabra, las terminaciones -ed y -s, las reducciones y la ortografía engañosa.',
    cuerpo: md(`## El inglés no se lee como se escribe
Una misma letra suena distinto (through, though, tough, cough) y un mismo sonido se escribe de muchas formas. **Fíate del oído**: busca cada palabra nueva con audio en Cambridge o en YouGlish.

## Sonidos difíciles para quien habla español
- **/θ/ y /ð/ (th):** pon la lengua entre los dientes. «think», «this», «three», «mother».
- **Vocales cortas y largas:** «ship» ≠ «sheep», «full» ≠ «fool», «live» (vivir) ≠ «leave».
- **Schwa /ə/:** la vocal más común del inglés, débil y neutra: about, teacher, another.
- **/v/ vs /b/:** «very» y «berry» son distintas; /v/ se hace con los dientes superiores sobre el labio inferior.
- **/h/:** se pronuncia suave, sin la fuerza de la «j» española: «house».
- **S inicial + consonante:** no digas "es-cool": es «school», sin vocal antes.
- **Final -ng:** «sing» suena /sɪŋ/, sin la «g» fuerte.

## Acento de palabra
Cada palabra de varias sílabas tiene **una sílaba fuerte**: «PHOtograph», «phoTOgrapher», «phoTOgraphy».
Pares sustantivo/verbo: «a REcord» (sustantivo) vs «to reCORD» (verbo). Mira el diccionario: la marca ˈ va antes de la sílaba fuerte.

## Terminación -ed
- Tras sonido sordo (p, k, s, sh, ch, f): **/t/** → «worked», «watched».
- Tras t o d: **/ɪd/** → «wanted», «needed».
- En el resto: **/d/** → «played», «cleaned».

## Terminación -s
- /s/ tras sonido sordo: «cats».
- /z/ tras sonido sonoro: «dogs».
- /ɪz/ tras s, sh, ch, x, z: «buses», «watches».

## Reducciones del inglés hablado
~~~
going to → gonna
want to → wanna
got to → gotta
I don't know → I dunno
let me → lemme
give me → gimme
kind of → kinda
~~~
Úsalas para entender, pero en textos formales escribe la forma completa.

## Homófonos (suenan igual, se escriben distinto)
~~~
there / their / they're
your / you're
its / it's
to / too / two
weather / whether
here / hear
~~~

## Ortografía engañosa
- «i antes de e, salvo después de c»: believe, receive.
- Dobles consonantes: occurred, necessary, accommodation, separate.
- Letras mudas: knife, write, psychology, Wednesday, island.

## Cómo practicar
- **Shadowing:** escucha una frase y repítela inmediatamente, copiando ritmo y entonación.
- **Grábate** y compara con el original.
- **Pares mínimos** (ship/sheep, bed/bad) con YouGlish.
- Pulsa los ejemplos de esta lección para oírlos.`),
    clave: ['Fíate del oído, no de la ortografía.', '-ed suena /t/, /d/ o /ɪd/ según el sonido anterior.', 'Shadowing y grabarte son las prácticas más útiles.'],
    practica: [],
  },
];

for (const l of lecciones) l.practica = challenges.filter((c) => c.lesson === l.id).map((c) => c.id);

module.exports = { grupos, lecciones };
