// Parte 3: Inglés. Retos de práctica que se corrigen de verdad (ver runner_ingles.js), sin .NET ni API key.
// Cada reto es una lista de ejercicios: [enunciado, respuestas aceptadas separadas por " || ", ejemplo opcional].
// Una respuesta que empieza por "~" es una expresión regular sobre el texto normalizado (minúsculas, sin puntuación, sin contracciones).

const LV = { 1: 'Básico (A1–A2)', 2: 'Intermedio (B1)', 3: 'Avanzado (B2+)' };

const tracks = [
  { id: 'ing-base', part: 3, name: 'Inglés básico', lang: 'inglés', color: '#60A5FA', levels: LV, blurb: 'To be, presente, preguntas, there is/are y pasado simple.' },
  { id: 'ing-gram', part: 3, name: 'Gramática B1–B2', lang: 'inglés', color: '#F472B6', levels: LV, blurb: 'Present perfect, futuro, condicionales, modales, pasiva y estilo indirecto.' },
  { id: 'ing-vocab', part: 3, name: 'Vocabulario y expresiones', lang: 'inglés', color: '#FBBF24', levels: LV, blurb: 'Falsos amigos, phrasal verbs, collocations, preposiciones e idioms.' },
  { id: 'ing-trabajo', part: 3, name: 'Inglés para trabajar', lang: 'inglés', color: '#34D399', levels: LV, blurb: 'Presentarte, emails, entrevistas, reuniones y el inglés de programar.' },
  { id: 'ing-sonido', part: 3, name: 'Pronunciación y ortografía', lang: 'inglés', color: '#C084FC', levels: LV, blurb: 'Terminaciones -ed, rimas, acento de palabra, homófonos y reducciones.' },
];

const SEARCH = {
  'ing-base': ['learnenglish.britishcouncil.org (nivel A1–A2)', 'English Grammar in Use (Raymond Murphy), edición elemental', 'dictionary.cambridge.org'],
  'ing-gram': ['learnenglish.britishcouncil.org: Grammar', 'English Grammar in Use (Raymond Murphy), edición intermedia', 'englishpage.com'],
  'ing-vocab': ['dictionary.cambridge.org (ejemplos de uso)', 'ludwig.guru (frases reales)', 'English Vocabulary in Use (Cambridge)'],
  'ing-trabajo': ['learnenglish.britishcouncil.org: Business English', 'bbc.co.uk/learningenglish', 'grammarly.com/blog (escritura)'],
  'ing-sonido': ['youglish.com (oír la palabra en vídeos reales)', 'forvo.com', 'dictionary.cambridge.org (botón de audio UK/US)'],
};

const challenges = [];
const tests = {};

function D(id, track, level, title, lesson, intro, items, opts = {}) {
  const rows = items.map(([q, a, ex], i) => ({ n: i + 1, q, alts: a.split(' || '), ex }));
  const show = (r) => r.ex || r.alts.find((x) => !x.startsWith('~'));
  for (const r of rows) if (!show(r)) throw new Error(`${id} #${r.n}: falta un ejemplo para la solución`);
  challenges.push({
    id, track, level, title, lesson, materia: 'ingles',
    brief: `${intro}\n\n**Cómo responder:** escribe tu respuesta en cada línea, después de "=>". Responde solo lo que se pide: la palabra que falta o la frase completa, según el enunciado. Da igual mayúsculas, el punto final y las contracciones (don't = do not).\n- Para superar el reto deben salir bien todas las líneas.\n- Si una línea falla, la prueba te dice cuál.`,
    starter: `# Escribe tu respuesta después de =>\n${rows.map((r) => `${r.n}) ${r.q}  =>`).join('\n')}\n`,
    solution: `${rows.map((r) => `${r.n}) ${r.q}  => ${show(r)}`).join('\n')}\n`,
    checks: [[/=>\s*\S/, 'Escribes respuestas después de =>', 'Escribe tu respuesta después de "=>" en cada línea.']],
    hints: [opts.tip || 'Lee primero la lección enlazada: sus ejemplos contienen el patrón que se pide.', 'Si una línea falla, revisa el tiempo verbal, el orden de las palabras y la forma exacta del verbo.'],
    learn: opts.learn || ['Repasa la lección enlazada', 'Anota en un cuaderno los errores y vuelve a escribirlos bien', 'Di cada frase en voz alta'],
    search: SEARCH[track],
  });
  tests[id] = {
    lang: 'english',
    items: rows.map((r) => ({ n: r.n, name: `${r.n}. ${r.q}`.slice(0, 80), ok: r.alts })),
  };
}

// ───────────── INGLÉS BÁSICO ─────────────
D('ing-base-1', 'ing-base', 1, 'To be: am, is, are', 'l-en-be',
  'Completa con la forma correcta de **to be** o traduce la frase. Cuidado con la edad, el tiempo y las preguntas.',
  [
    ['I ___ a student.', 'am'],
    ['She ___ from Mexico.', 'is'],
    ['They ___ my friends.', 'are'],
    ['My brother ___ not at home.', 'is'],
    ['___ you tired?', 'are'],
    ['Traduce: Tengo veinte años.', 'I am twenty years old || I am twenty'],
    ['Traduce: Hace frío hoy.', 'It is cold today || It is cold || Today it is cold'],
    ['Traduce: ¿Cómo estás?', 'How are you'],
    ['Traduce: Ellos no son de aquí.', 'They are not from here || They are not from around here'],
    ['Traduce: ¿Dónde está el baño?', 'Where is the bathroom || Where is the restroom || Where is the toilet || Where is the washroom || Where is the loo'],
  ], { tip: 'En inglés se dice "I am twenty", no "I have twenty". Y el sujeto siempre se escribe: "It is cold".', learn: ['Verbo to be en afirmativa, negativa y pregunta', 'Edad y sensaciones con to be', 'El sujeto es obligatorio en inglés'] });

D('ing-base-2', 'ing-base', 1, 'Presente simple: rutinas', 'l-en-presente',
  'Usa el presente simple. Recuerda la **-s** de he/she/it y los auxiliares **do / does** en negativas.',
  [
    ['He ___ (work) in a bank.', 'works'],
    ['We ___ (not / like) coffee.', 'do not like'],
    ['My sister ___ (study) English every day.', 'studies'],
    ['She ___ (not / have) a car.', 'does not have'],
    ['The bus ___ (leave) at 8:00.', 'leaves'],
    ['Traduce: Yo me levanto a las siete.', "~^i (get|wake) up at (7|seven)( o'clock)?( am)?$", 'I get up at seven'],
    ['Traduce: Ella nunca come carne.', 'She never eats meat'],
    ['Traduce: ¿A qué hora empieza la clase?', 'What time does the class start || What time does the class begin || What time does class start || What time does class begin || When does the class start || When does the class begin'],
    ['Traduce: Normalmente no veo la tele.', '~^i (do not (usually|normally|generally) |(usually|normally|generally) do not )watch (the )?(tv|television)$', 'I do not usually watch TV'],
    ['Traduce: Mi padre trabaja los sábados.', '~^my (father|dad) works (on )?saturdays?$', 'My father works on Saturdays'],
  ], { tip: 'Después de does/doesn\'t el verbo va SIN -s: "she does not have", no "she does not has".', learn: ['La -s de la tercera persona y sus reglas de ortografía', 'do / does para negar y preguntar', 'Posición de never, usually, always'] });

D('ing-base-3', 'ing-base', 2, 'Preguntas y negaciones', 'l-en-preguntas',
  'Forma preguntas y negaciones con **do / does** y las palabras interrogativas (who, what, where, why, how...).',
  [
    ['___ you like pizza?', 'do'],
    ['___ she work here?', 'does'],
    ['Where ___ they live?', 'do'],
    ['He ___ not play football.', 'does'],
    ['What time ___ the shop open?', 'does'],
    ['Traduce: ¿Quién es ese chico?', 'Who is that boy || Who is that guy || Who is that man'],
    ['Traduce: ¿Por qué estás triste?', 'Why are you sad'],
    ['Traduce: ¿Cuánto cuesta esto?', 'How much is this || How much does this cost || How much is it || How much does it cost'],
    ['Traduce: ¿Cuántos hermanos tienes?', 'How many brothers do you have || How many brothers have you got || How many siblings do you have || How many siblings have you got || How many brothers and sisters do you have'],
    ['Traduce: No entiendo.', 'I do not understand || I do not get it'],
  ], { tip: 'Con who/what como sujeto no hace falta do: "Who called you?". Con el resto, el auxiliar va antes del sujeto.', learn: ['Orden de la pregunta: palabra interrogativa + auxiliar + sujeto + verbo', 'How much / How many', 'Respuestas cortas: Yes, I do. / No, she doesn\'t.'] });

D('ing-base-4', 'ing-base', 2, 'There is / there are y lugares', 'l-en-there',
  'Practica **there is / there are**, los artículos a / an, **some / any** y las preposiciones de lugar.',
  [
    ['There ___ a book on the table.', 'is'],
    ['There ___ two cats in the garden.', 'are'],
    ['___ there any milk?', 'is'],
    ['She has ___ umbrella. (a / an)', 'an'],
    ['We need ___ sugar. (some / any)', 'some'],
    ['We do not have ___ bread. (some / any)', 'any'],
    ['The cat is ___ the box. (dentro de)', 'in || inside'],
    ['The picture is ___ the wall. (en la pared)', 'on'],
    ['Traduce: Hay mucha gente en la calle.', '~^there are (a lot of|lots of|many) people (in|on) the street$', 'There are a lot of people in the street'],
    ['Traduce: No hay nada en la nevera.', 'There is nothing in the fridge || There is nothing in the refrigerator || There is not anything in the fridge || There is not anything in the refrigerator'],
  ], { tip: 'a / an dependen del SONIDO inicial, no de la letra: "an hour", "a university".', learn: ['there is (singular) y there are (plural)', 'Contables e incontables: some, any, much, many', 'in, on, at, under, between, next to'] });

D('ing-base-5', 'ing-base', 3, 'Presente simple o continuo', 'l-en-presente',
  'Elige entre presente simple (hábitos, hechos) y presente continuo (ahora, temporal). Ojo con los verbos de estado.',
  [
    ['Look! It ___ (rain).', 'is raining'],
    ['Right now she ___ (talk) on the phone.', 'is talking'],
    ['He ___ (play) tennis every Sunday.', 'plays'],
    ['We ___ (not / watch) TV at the moment.', 'are not watching'],
    ['___ you understand this? (verbo de estado)', 'do'],
    ['I ___ (know) the answer. (verbo de estado)', 'know'],
    ['Traduce: Estoy aprendiendo inglés.', 'I am learning English || I am studying English'],
    ['Traduce: Ella siempre llega tarde.', 'She always arrives late || She is always late || She always comes late || She always gets here late'],
    ['Traduce: Ahora mismo estoy trabajando en casa.', '~^(right now |at the moment |now )?i am working (from|at) home( right now| at the moment| now)?$', 'I am working from home right now'],
    ['Traduce: ¿Qué estás haciendo?', 'What are you doing'],
  ], { tip: 'Verbos de estado (know, like, want, understand, need) casi nunca se usan en continuo.', learn: ['Cuándo usar -ing y cuándo no', 'Verbos de estado', 'Palabras señal: now, at the moment, every day, usually'] });

D('ing-base-6', 'ing-base', 3, 'Pasado simple', 'l-en-pasado',
  'Escribe el pasado. Los verbos irregulares hay que memorizarlos: repítelos hasta que salgan solos.',
  [
    ['Pasado de "go":', 'went'],
    ['Pasado de "buy":', 'bought'],
    ['Pasado de "see":', 'saw'],
    ['Pasado de "think":', 'thought'],
    ['Pasado de "write":', 'wrote'],
    ['Yesterday I ___ (not / go) to work.', 'did not go'],
    ['She ___ (meet) him in 2019.', 'met'],
    ['Traduce: ¿Dónde estuviste ayer?', 'Where were you yesterday'],
    ['Traduce: Ayer llovió mucho.', '~^(it rained (a lot|heavily|hard) yesterday|yesterday it rained (a lot|heavily|hard))$', 'It rained a lot yesterday'],
    ['Traduce: No vi la película.', 'I did not see the movie || I did not see the film || I did not watch the movie || I did not watch the film'],
  ], { tip: 'En negativas y preguntas el verbo vuelve a la forma base: "I did not go", no "I did not went".', learn: ['Pasado regular (-ed) e irregular', 'did / did not + verbo base', 'was / were'] });

// ───────────── GRAMÁTICA B1–B2 ─────────────
D('ing-gram-1', 'ing-gram', 1, 'Present perfect', 'l-en-perfect',
  'Usa **have / has + participio** y elige bien entre **for** y **since**.',
  [
    ['I ___ (live) here for five years.', 'have lived'],
    ['She ___ (never / be) to London.', 'has never been'],
    ['Have you ever ___ (eat) sushi?', 'eaten'],
    ['We ___ (just / finish) the project.', 'have just finished'],
    ['He ___ (not / see) that film yet.', 'has not seen'],
    ['She has worked here ___ 2018. (for / since)', 'since'],
    ['I have known him ___ ten years. (for / since)', 'for'],
    ['Traduce: ¿Has terminado ya?', 'Have you finished yet || Have you finished already || Have you already finished'],
    ['Traduce: Nunca he visto nieve.', 'I have never seen snow'],
    ['Traduce: Vivo aquí desde 2020.', 'I have lived here since 2020 || I have been living here since 2020'],
  ], { tip: 'since + punto en el tiempo (2018, Monday); for + duración (ten years, two hours).', learn: ['have / has + participio', 'for vs since', 'just, already, yet, ever, never'] });

D('ing-gram-2', 'ing-gram', 1, 'Futuro: will, going to y más', 'l-en-futuro',
  'Elige la forma de futuro adecuada: decisión del momento, plan, predicción o cita fija.',
  [
    ['Look at those clouds! It ___ rain. (going to)', 'is going to'],
    ['I think she ___ pass the exam. (will, predicción)', 'will'],
    ['— The phone is ringing. — I ___ answer it. (will / am going to)', 'will'],
    ['I ___ visit my aunt next week; I already bought the ticket. (will / am going to)', 'am going to'],
    ['We ___ (meet) at 6 pm tomorrow. (plan fijo, presente continuo)', 'are meeting'],
    ['Traduce: Voy a estudiar medicina.', 'I am going to study medicine'],
    ['Traduce: Te llamaré luego.', 'I will call you later || I will call you back later || I will phone you later || I will give you a call later || I will ring you later'],
    ['Traduce: ¿Qué vas a hacer este fin de semana?', '~^what are you (going to do|doing) (this|at the|on the) weekend$', 'What are you doing this weekend'],
    ['Traduce: Quizás llueva mañana.', 'It might rain tomorrow || It may rain tomorrow || Maybe it will rain tomorrow || Perhaps it will rain tomorrow || Maybe it is going to rain tomorrow'],
    ['Traduce: Mañana no trabajo (tengo el día libre).', '~^i (am not working|am not going to work|will not be working|do not work|have the day off|am off) tomorrow$', 'I am not working tomorrow'],
  ], { tip: 'will = decisión en el momento o predicción; going to = plan previo o evidencia presente.', learn: ['will vs going to', 'Presente continuo para planes con fecha', 'may / might para posibilidad'] });

D('ing-gram-3', 'ing-gram', 2, 'Condicionales', 'l-en-condicionales',
  'Completa los condicionales (0, 1, 2 y 3) o tradúcelos. Mira la forma del verbo en cada parte.',
  [
    ['If it rains, we ___ at home. (stay)', 'will stay'],
    ['If I ___ (have) time, I will help you.', 'have'],
    ['If I ___ (be) you, I would study more.', 'were || was'],
    ['If she ___ (know) the answer, she would tell us.', 'knew'],
    ['If you heat ice, it ___ (melt).', 'melts'],
    ['If I won the lottery, I ___ (buy) a house.', 'would buy'],
    ['If I ___ (study) harder, I would have passed. (tercer condicional)', 'had studied'],
    ['She would have come if she ___ (know). (tercer condicional)', 'had known'],
    ['___ you hurry, you will miss the bus. (si no)', 'unless'],
    ['Traduce: Si estudias, aprobarás.', '~^(if you study you will pass( the (exam|test))?|you will pass( the (exam|test))? if you study)$', 'If you study, you will pass'],
    ['Traduce: Si tuviera dinero, viajaría por el mundo.', '~^(if i had (some |enough )?money i would travel (around |round )?the world|i would travel (around |round )?the world if i had (some |enough )?money)$', 'If I had money, I would travel the world'],
  ], { tip: 'En la parte con "if" nunca va will / would: "If I have time", "If I had time".', learn: ['Estructuras de los cuatro condicionales', 'if I were', 'unless = if ... not'] });

D('ing-gram-4', 'ing-gram', 2, 'Verbos modales', 'l-en-modales',
  'Elige o traduce el modal correcto: obligación, prohibición, consejo, deducción y peticiones educadas.',
  [
    ['You ___ wear a seatbelt. It is the law. (obligación)', 'must || have to'],
    ['You ___ smoke here. (prohibido)', 'must not || can not || are not allowed to'],
    ['She sings beautifully. She ___ practice a lot. (deducción)', 'must'],
    ['It ___ be Tom. He is in Paris. (imposible)', 'can not || could not'],
    ['___ I open the window? (pedir permiso)', 'can || may || could'],
    ['You ___ see a doctor. (consejo)', 'should || ought to || had better'],
    ['Yesterday I ___ find my keys. (no pude)', 'could not || was not able to'],
    ['Traduce: No tienes que venir.', 'You do not have to come || You do not need to come || You need not come'],
    ['Traduce: Deberías descansar.', 'You should rest || You should get some rest || You ought to rest || You should take a break || You ought to get some rest'],
    ['Traduce: ¿Podrías ayudarme, por favor?', 'Could you help me please || Could you please help me || Can you help me please || Can you please help me || Would you help me please || Would you mind helping me'],
    ['Traduce: Podría llover.', 'It could rain || It might rain || It may rain'],
  ], { tip: '"must not" = prohibido; "do not have to" = no hace falta. Son muy distintos.', learn: ['must / have to / should', 'must, might, can\'t para deducir', 'could / would / can para pedir cosas'] });

D('ing-gram-5', 'ing-gram', 3, 'Voz pasiva', 'l-en-pasiva',
  'Forma la pasiva: **be + participio**. Fíjate en el tiempo verbal de **be**.',
  [
    ['English ___ (speak) all over the world.', 'is spoken'],
    ['The window ___ (break) yesterday.', 'was broken'],
    ['The report ___ (finish) by tomorrow.', 'will be finished'],
    ['These cars ___ (make) in Japan.', 'are made'],
    ['This house ___ (build) in 1950.', 'was built'],
    ['The problem ___ (solve) already.', 'has been solved'],
    ['Reescribe en pasiva: They repair the road.', 'The road is repaired || The road is repaired by them'],
    ['Reescribe en pasiva: Someone cleaned the room.', 'The room was cleaned || The room was cleaned by someone'],
    ['Traduce: Me robaron la cartera.', 'My wallet was stolen || My purse was stolen || My wallet got stolen || I had my wallet stolen || I got my wallet stolen'],
    ['Traduce: Aquí se habla español.', 'Spanish is spoken here'],
  ], { tip: 'La pasiva conserva el tiempo: presente → is/are + participio; pasado → was/were + participio.', learn: ['be + participio en cada tiempo', 'Cuándo se usa by + agente', 'La pasiva impersonal: "Spanish is spoken here"'] });

D('ing-gram-6', 'ing-gram', 3, 'Estilo indirecto y oraciones de relativo', 'l-en-pasiva',
  'En el estilo indirecto el tiempo verbal retrocede un paso. Completa también las oraciones de relativo.',
  [
    ['“I am tired,” she said. → She said that she ___ tired.', 'was'],
    ['“I will call you,” he said. → He said he ___ call me.', 'would'],
    ['“I live in Rome,” Ana said. → Ana said she ___ in Rome.', 'lived'],
    ['“I have finished,” he said. → He said he ___ finished.', 'had'],
    ['“Do you like jazz?” she asked me. → She asked me ___ I liked jazz.', 'if || whether'],
    ['“Close the door,” he told me. → He told me ___ the door.', 'to close'],
    ['The man ___ lives next door is a doctor.', 'who || that'],
    ['The book ___ I read last week was great.', 'that || which'],
    ['The city ___ I was born is small.', 'where'],
    ['Traduce: Me dijo que no sabía.', '~^(he|she) (told me|said) (that )?(he|she) did not know$', 'He told me he did not know'],
  ], { tip: 'am/is → was; will → would; present simple → past simple; have → had.', learn: ['Retroceso de tiempos en el estilo indirecto', 'say vs tell; ask if / whether', 'who, which, that, where, whose'] });

// ───────────── VOCABULARIO Y EXPRESIONES ─────────────
D('ing-vocab-1', 'ing-vocab', 1, 'Falsos amigos', 'l-en-vocab',
  'Palabras que se parecen al español pero significan otra cosa. Escribe la palabra inglesa correcta.',
  [
    ['Me da vergüenza hablar en público. → I am ___ to speak in public.', 'embarrassed'],
    ['Fui a la biblioteca a leer. → I went to the ___ to read.', 'library'],
    ['Estoy constipado (resfriado). → I have a ___.', 'cold'],
    ['Actualmente vivo en Madrid. → ___ I live in Madrid.', 'currently || at the moment || nowadays'],
    ['Ella se ofende fácilmente: es muy ___ . (sensible emocionalmente)', 'sensitive'],
    ['Es una persona muy sensata: he is a very ___ person.', 'sensible'],
    ['Asistí a la reunión. → I ___ the meeting.', 'attended'],
    ['Me di cuenta de mi error. → I ___ my mistake.', 'realized || realised'],
    ['Compré un libro en la librería. → I bought a book at the ___ .', 'bookstore || bookshop'],
    ['Mi compañero de trabajo me ayudó. → My ___ helped me.', 'colleague || coworker || co-worker'],
  ], { tip: 'Si dudas, busca la palabra en dictionary.cambridge.org y lee sus ejemplos.', learn: ['Falsos amigos más comunes', 'Por qué "actually" no es "actualmente"', 'Buscar siempre ejemplos, no solo traducciones'] });

D('ing-vocab-2', 'ing-vocab', 1, 'Frases para el día a día', 'l-en-cotidiano',
  'Traduce frases útiles para viajar, comer, pedir ayuda y presentarte.',
  [
    ['Hola, me llamo Carlos.', '~^(hi|hello) (my name is|i am) carlos$', 'Hello, my name is Carlos'],
    ['Mucho gusto.', 'Nice to meet you || Pleased to meet you || Pleasure to meet you || It is nice to meet you'],
    ['Perdón, ¿puede repetir eso, por favor?', '~^((i am )?sorry |excuse me |pardon )?(can|could|would) you (please )?(repeat (that|it)|say (that|it) again)( please)?$', 'Sorry, could you repeat that, please?'],
    ['No hablo muy bien inglés.', 'I do not speak English very well || I do not speak much English || My English is not very good || I do not speak English well'],
    ['Quisiera un café, por favor.', '~^(i would like|could i have|can i have|may i have|i will have) (a|a cup of) coffee( please)?$', 'I would like a coffee, please'],
    ['La cuenta, por favor.', '~^((can|could) (i|we) have |may i have )?the (bill|check)( please)?$', 'The bill, please'],
    ['¿Cuánto se tarda en llegar al aeropuerto?', 'How long does it take to get to the airport || How long does it take to reach the airport || How long does it take to go to the airport || How long does it take to arrive at the airport'],
    ['Me he perdido.', 'I am lost || I got lost || I have lost my way || I lost my way'],
    ['Estoy buscando mi pasaporte.', 'I am looking for my passport'],
    ['Me duele la cabeza.', 'I have a headache || My head hurts || My head aches || I have got a headache'],
  ], { tip: 'Para pedir con cortesía usa "I would like..." o "Could I have...?" en vez de "I want".', learn: ['Fórmulas de cortesía', 'Pedir comida, direcciones y ayuda', 'Pedir que repitan'] });

D('ing-vocab-3', 'ing-vocab', 2, 'Phrasal verbs', 'l-en-phrasal',
  'Completa con la partícula correcta (off, up, out, on, for, after...).',
  [
    ['Please turn ___ the lights when you leave. (apagar)', 'off'],
    ['Can you turn ___ the music? I cannot hear it. (subir)', 'up'],
    ['I am looking ___ my keys. (buscar)', 'for'],
    ['She grew ___ in Chile. (crecer)', 'up'],
    ['We ran ___ of milk. (quedarse sin)', 'out'],
    ['Do not give ___ ! You can do it. (rendirse)', 'up'],
    ['He took ___ his jacket. (quitarse)', 'off'],
    ['The match was called ___ because of the storm. (cancelar)', 'off'],
    ['I get ___ well with my boss. (llevarse bien)', 'on || along'],
    ['Can you look ___ the kids tonight? (cuidar)', 'after'],
    ['I need to find ___ what happened. (averiguar)', 'out'],
    ['We have to put ___ the meeting until Monday. (posponer)', 'off'],
  ], { tip: 'Aprende los phrasal verbs dentro de frases completas, no como listas de traducciones sueltas.', learn: ['Verbo + partícula = significado nuevo', 'Separables e inseparables', 'Agruparlos por partícula: up, off, out'] });

D('ing-vocab-4', 'ing-vocab', 2, 'Collocations: make, do, take, have', 'l-en-collocations',
  'En inglés ciertos verbos "se llevan bien" con ciertos sustantivos. Elige el verbo natural.',
  [
    ['I need to ___ a decision. (make / do)', 'make'],
    ['Can you ___ me a favor? (make / do)', 'do'],
    ['Please ___ the dishes. (make / do)', 'do'],
    ['Let us ___ a break. (take / have)', 'take || have'],
    ['I would like to ___ a look at the menu. (have / take)', 'have || take'],
    ['Do not ___ mistakes. (make / do)', 'make'],
    ['He wants to ___ a shower. (make / take)', 'take || have'],
    ['We should ___ attention in class. (pay / make)', 'pay'],
    ['I ___ homework every night. (make / do)', 'do'],
    ['Please ___ care of yourself. (take / do)', 'take'],
    ['Let us ___ a plan. (make / do)', 'make'],
    ['She ___ well on her exam yesterday. (did / made)', 'did'],
  ], { tip: 'make = crear o producir algo (a decision, a plan); do = actividad o tarea (homework, the dishes).', learn: ['make vs do', 'take / have / get / give + sustantivo', 'Aprender "bloques" de palabras'] });

D('ing-vocab-5', 'ing-vocab', 3, 'Preposiciones dependientes', 'l-en-vocab',
  'Muchos adjetivos y verbos exigen una preposición concreta. No se traduce: se memoriza el bloque.',
  [
    ['I am interested ___ music.', 'in'],
    ['She is good ___ math.', 'at'],
    ['It depends ___ the weather.', 'on'],
    ['He is afraid ___ spiders.', 'of'],
    ['We are looking forward ___ seeing you.', 'to'],
    ['This is different ___ what I expected.', 'from || to || than'],
    ['I am tired ___ waiting.', 'of'],
    ['She is married ___ a doctor.', 'to'],
    ['I am proud ___ you.', 'of'],
    ['He apologized ___ being late.', 'for'],
    ['She is responsible ___ the project.', 'for'],
    ['They arrived ___ the airport at noon.', 'at'],
  ], { tip: 'Después de una preposición el verbo va en -ing: "tired of waiting", "good at swimming".', learn: ['adjetivo + preposición', 'verbo + preposición', 'preposición + -ing'] });

D('ing-vocab-6', 'ing-vocab', 3, 'Idioms', 'l-en-vocab',
  'Los idioms no se traducen palabra por palabra. Completa el que falta.',
  [
    ['Es muy fácil → It is a piece of ___ .', 'cake'],
    ['Buena suerte → Break a ___ !', 'leg'],
    ['Llueve a cántaros → It is raining cats and ___ .', 'dogs'],
    ['Muy raramente → Once in a blue ___ .', 'moon'],
    ['Terminemos por hoy → Let us call it a ___ .', 'day'],
    ['Me siento mal → I am under the ___ .', 'weather'],
    ['Te toca decidir → The ball is in your ___ .', 'court'],
    ['Reveló el secreto → He spilled the ___ .', 'beans'],
    ['Cuesta carísimo → It costs an arm and a ___ .', 'leg'],
    ['Aguantar y hacerlo → Bite the ___ .', 'bullet'],
    ['Más vale tarde que nunca → Better late than ___ .', 'never'],
  ], { tip: 'Si no lo reconoces, busca el idiom entero entre comillas en un buscador.', learn: ['Idioms frecuentes', 'No traducir literalmente', 'Aprenderlos dentro de una frase propia'] });

// ───────────── INGLÉS PARA TRABAJAR ─────────────
D('ing-trabajo-1', 'ing-trabajo', 1, 'Presentarte y conversar', 'l-en-trabajo',
  'Traduce frases para presentarte, hablar de tu trabajo y despedirte.',
  [
    ['Me llamo Ana y soy ingeniera.', '~^(my name is|i am) ana and i am an engineer$', 'My name is Ana and I am an engineer'],
    ['Trabajo en una empresa de software.', 'I work at a software company || I work for a software company || I work in a software company'],
    ['¿A qué te dedicas?', 'What do you do || What do you do for a living || What is your job || What is your occupation'],
    ['¿De dónde eres?', 'Where are you from'],
    ['Vivo en Bogotá desde hace tres años.', 'I have lived in Bogota for three years || I have been living in Bogota for three years'],
    ['Me encanta mi trabajo, pero a veces es estresante.', '~^i (love|like) my job but (sometimes )?it (is|can be) (sometimes )?stressful$', 'I love my job, but sometimes it is stressful'],
    ['Hablo español e inglés.', 'I speak Spanish and English'],
    ['Estoy aprendiendo inglés para mi carrera.', 'I am learning English for my career || I am studying English for my career || I am learning English for my job || I am studying English for my job'],
    ['Me gustaría practicar contigo.', 'I would like to practice with you || I would like to practise with you || I would love to practice with you || I would love to practise with you'],
    ['Hasta luego, que tengas un buen día.', '~^(see you later|see you|bye|goodbye)( and)? have a (nice|good|great) day$', 'See you later, have a nice day'],
  ], { tip: 'Usa "I work at / for" para tu empresa y "I live in" para tu ciudad.', learn: ['Presentación personal', 'Hablar de trabajo y experiencia', 'Despedidas naturales'] });

D('ing-trabajo-2', 'ing-trabajo', 1, 'Emails: frases útiles', 'l-en-trabajo',
  'Traduce frases típicas de un email profesional.',
  [
    ['Estimado Sr. Smith,', 'Dear Mr Smith'],
    ['Le escribo para preguntar por el puesto.', '~^i am writing to (ask|inquire|enquire) (about|regarding) the (position|job|vacancy|role)$', 'I am writing to ask about the position'],
    ['Adjunto mi currículum.', '~^(i (attach|have attached|am attaching) my (cv|resume)|please find (my (cv|resume) attached|attached my (cv|resume)))$', 'I have attached my CV'],
    ['Quedo a la espera de su respuesta.', 'I look forward to hearing from you || I am looking forward to hearing from you || I look forward to your reply || I look forward to your response'],
    ['Disculpe la demora en responder.', '~^(sorry for|apologies for|i apologi[sz]e for|i am sorry for) the (late (reply|response)|delay in (replying|responding|my reply|my response))$', 'Sorry for the delay in replying'],
    ['¿Podría enviarme más información?', '~^(could|can|would) you (please )?(send|email) me (some )?(more|further|additional) (information|info|details)( please)?$', 'Could you send me more information, please?'],
    ['Adjunto encontrará el informe.', 'Please find the report attached || Please find attached the report || The report is attached || I have attached the report || I attach the report'],
    ['Saludos cordiales,', 'Kind regards || Best regards || Regards || Sincerely || Yours sincerely || Best wishes || Warm regards'],
    ['Le agradezco su ayuda.', 'Thank you for your help || Thanks for your help || I appreciate your help || Thank you for your assistance || Thanks for your assistance'],
    ['Si tiene alguna pregunta, avíseme.', 'If you have any questions let me know || If you have any questions please let me know || Please let me know if you have any questions || Let me know if you have any questions || If you have any questions feel free to contact me'],
  ], { tip: 'En emails formales evita contracciones y frases demasiado directas: "I am writing to..." en vez de "I want...".', learn: ['Saludo y despedida formal', 'Frases para adjuntar y pedir información', 'Tono formal vs informal'] });

D('ing-trabajo-3', 'ing-trabajo', 2, 'Entrevista de trabajo', 'l-en-trabajo',
  'Responde y traduce frases de una entrevista en inglés.',
  [
    ['Cuéntame sobre ti → Tell me about ___ .', 'yourself'],
    ['Tengo cinco años de experiencia en ventas. → I have five years of ___ in sales.', 'experience'],
    ['Mi mayor fortaleza es el trabajo en equipo. → My biggest ___ is teamwork.', 'strength'],
    ['A veces soy perfeccionista. → My biggest ___ is that I am sometimes a perfectionist.', 'weakness'],
    ['Estoy buscando nuevos retos.', 'I am looking for new challenges || I am looking for a new challenge || I am looking for new opportunities || I am seeking new challenges'],
    ['Dejé mi empleo anterior porque quería crecer.', '~^i left my (previous|last|former|old) (job|position) because i wanted to (grow|develop|advance)$', 'I left my previous job because I wanted to grow'],
    ['¿Por qué quiere trabajar aquí? → Why do you want to ___ here?', 'work'],
    ['¿Cuál es el salario de este puesto? → What is the ___ for this position?', 'salary || pay'],
    ['Gestiono un equipo de cuatro personas.', '~^(i am responsible for (managing|leading)|i (manage|lead)) a team of (4|four)( people)?$', 'I manage a team of four people'],
    ['Aprendo rápido y trabajo bien bajo presión.', 'I learn quickly and work well under pressure || I learn fast and work well under pressure || I am a quick learner and I work well under pressure || I am a fast learner and I work well under pressure'],
    ['¿Cuándo podría empezar? → When could you ___ ?', 'start || begin'],
  ], { tip: 'Responde con el método STAR: Situación, Tarea, Acción, Resultado.', learn: ['Vocabulario de entrevistas', 'Fortalezas y debilidades con tacto', 'El método STAR'] });

D('ing-trabajo-4', 'ing-trabajo', 2, 'Inglés para programar', 'l-en-dev',
  'Frases reales de stand-ups, pull requests y reportes de bugs.',
  [
    ['Ayer terminé el endpoint de login.', '~^(yesterday i|i) (finished|completed) the login endpoint( yesterday)?$', 'Yesterday I finished the login endpoint'],
    ['Hoy voy a arreglar un bug en producción.', '~^((today )?i (am going to|will) fix a (production bug|bug in production)( today)?|(today )?i am fixing a (production bug|bug in production)( today)?)$', 'Today I am going to fix a bug in production'],
    ['Estoy bloqueado esperando la revisión de código.', '~^i am (blocked|stuck) (waiting for|waiting on|on) (the |a )?code review$', 'I am blocked waiting for the code review'],
    ['Por favor, revisa mi pull request.', '~^((please )?(review|take a look at|have a look at|look at) my (pull request|pr)( please)?|(could|can) you (please )?(review|take a look at|have a look at) my (pull request|pr)( please)?)$', 'Please review my pull request'],
    ['La prueba falla porque la variable es nula. → The test ___ because the variable is null.', 'fails'],
    ['Hice un deploy ayer pero lo revertí. → I deployed yesterday but I rolled it ___ .', 'back'],
    ['Necesitamos reproducir el error primero.', '~^we need to (reproduce|replicate) the (bug|error|issue) first$', 'We need to reproduce the bug first'],
    ['El servidor devuelve un error 500.', 'The server returns a 500 error || The server is returning a 500 error || The server returns an error 500 || The server returns error 500 || The server responds with a 500 error'],
    ['¿Puedes explicar cómo funciona esta función?', '~^(can|could) you (please )?explain how this function works( please)?$', 'Can you explain how this function works?'],
    ['Escribí pruebas unitarias para cubrir los casos límite.', '~^i wrote (some )?unit tests to cover (the )?(edge cases|corner cases)$', 'I wrote unit tests to cover the edge cases'],
    ['Voy a fusionar mi rama en main. → I am going to ___ my branch into main.', 'merge'],
  ], { tip: 'En un stand-up usa tres bloques: "Yesterday I...", "Today I will...", "I am blocked by...".', learn: ['Vocabulario técnico en inglés', 'Plantilla de stand-up', 'Cómo pedir un code review'] });

D('ing-trabajo-5', 'ing-trabajo', 3, 'Reuniones y desacuerdo educado', 'l-en-trabajo',
  'Participa en una reunión: interrumpe con cortesía, discrepa sin sonar agresivo y cierra con claridad.',
  [
    ['Perdón por interrumpir, ¿puedo añadir algo?', '~^(sorry (to interrupt|for interrupting)|excuse me) (but )?(can|could|may) i (add|say) (something|one thing|a (quick )?(point|word))$', 'Sorry to interrupt, can I add something?'],
    ['Estoy de acuerdo contigo.', 'I agree with you || I agree'],
    ['No estoy del todo de acuerdo.', 'I do not completely agree || I do not totally agree || I do not fully agree || I am not sure I agree || I am not sure that I agree || I do not entirely agree'],
    ['Entiendo tu punto, pero tengo una duda.', '~^i (see|understand|get) your point but i have a (question|doubt|concern)$', 'I see your point, but I have a question'],
    ['¿Podemos agendar una reunión para la próxima semana?', '~^(can|could|shall) we (schedule|set up|arrange|plan) a (meeting|call) for next week$', 'Can we schedule a meeting for next week?'],
    ['Resumiendo, necesitamos más tiempo.', '~^(to sum up|in summary|to summari[sz]e|in short|to conclude) we need more time$', 'To sum up, we need more time'],
    ['Voy a tomar nota de los puntos de acción. → I will take ___ of the action items.', 'note'],
    ['Vamos con retraso.', 'We are behind schedule || We are running behind schedule || We are running behind || We are behind'],
    ['Tenemos que priorizar las tareas.', '~^we (need|have|must)( to)? prioriti[sz]e (the |our )?(tasks|work)$', 'We need to prioritize the tasks'],
    ['Dejémoslo para la próxima reunión.', '~^let us (leave|postpone|park|discuss|move) (it|this|that)( to| until| for)? ?(the )?next meeting$', 'Let us leave it for the next meeting'],
    ['Gracias a todos por su tiempo.', '~^thank(s| you) (all|everyone|everybody|you all) for your time$', 'Thank you all for your time'],
  ], { tip: 'Para discrepar suaviza con "I see your point, but..." o "I am not sure I agree".', learn: ['Frases para interrumpir y discrepar', 'Resumir y cerrar', 'Hablar de plazos y prioridades'] });

D('ing-trabajo-6', 'ing-trabajo', 3, 'Escribe con tono profesional', 'l-en-trabajo',
  'Transforma frases demasiado directas o informales en frases profesionales.',
  [
    ['Informal: “Gimme the report ASAP.” → Más cortés:', '~^(could|can|would) you (please )?(send|give) me the report( as soon as possible| today)?( please)?$', 'Could you please send me the report as soon as possible?'],
    ['“I want a refund.” → Formal:', '~^(i would like to (request|ask for|have|get) a refund|i would like a refund)$', 'I would like to request a refund'],
    ['“Sorry, I can’t come.” → Formal: I am afraid I am ___ to attend.', 'unable'],
    ['“What do you think?” → Formal: I would be grateful for your ___ .', 'thoughts || feedback || opinion || input'],
    ['“Hi guys,” para un equipo, de forma formal → Dear ___ ,', 'all || colleagues || team'],
    ['Cierre: I look forward ___ hearing from you.', 'to'],
    ['Petición cortés: ___ you mind helping me?', 'would'],
    ['“Thanks a lot!” → Formal: I am ___ grateful for your help.', 'very || extremely || truly || deeply || most'],
    ['“Maybe we should delay the launch.” → We might want to ___ the launch. (posponer)', 'delay || postpone || reschedule || push back'],
    ['Palabra más formal para “problem” (cinco letras, empieza por i): We have an ___ with the system.', 'issue'],
  ], { tip: 'El tono profesional se logra con modales (could, would), verbos suaves y sin abreviaturas.', learn: ['Pedir con cortesía', 'Vocabulario formal', 'Evitar abreviaturas en escritos profesionales'] });

// ───────────── PRONUNCIACIÓN Y ORTOGRAFÍA ─────────────
D('ing-trabajo-7', 'ing-trabajo', 3, 'Inglés de la industria del videojuego', 'l-en-juegos',
  'Frases reales de un estudio: reportes de bugs, balance, playtests y notas de parche. Completa la palabra que falta o traduce.',
  [
    ['El jefe tiene demasiada vida. → The boss has too much ___ .', 'health || hp || hit points'],
    ['Hay que bajar el tiempo de recarga de la habilidad. → We need to reduce the ability ___ .', 'cooldown || cool down || cool-down'],
    ['Los enemigos aparecen detrás del jugador. → Enemies ___ behind the player.', 'spawn'],
    ['La caja de colisión del enemigo es demasiado grande. → The enemy ___ is too big.', 'hitbox || hit box || hit-box'],
    ['El juego va a 30 FPS en consola. → The game ___ at 30 FPS on console.', 'runs'],
    ['Traduce: Encontré un bug: el jugador atraviesa la pared.', '~^i found a bug( -)? the player (goes|passes|clips|walks|falls|moves) through the wall$', 'I found a bug: the player goes through the wall'],
    ['Mañana hacemos una sesión de prueba con jugadores. → Tomorrow we have a ___ session.', 'playtest || playtesting || play test || play-test'],
    ['Las notas del parche ya están publicadas. → The patch ___ are live.', 'notes'],
    ['Traduce: El salto no se siente bien.', '~^the jump (does not feel (good|right)|feels (bad|wrong|off|weird))$', 'The jump does not feel right'],
    ['Subimos el juego a itch.io. → We ___ the game on itch.io.', '~^(published|uploaded|released|launched|posted)$', 'published'],
  ], { tip: 'En los estudios casi todo el vocabulario técnico se dice en inglés aunque se hable español: health, spawn, hitbox, cooldown, playtest.', learn: ['Vocabulario de gameplay y balance', 'Cómo escribir un reporte de bug: pasos, esperado, obtenido', 'Leer notas de parche de juegos que te gusten'] });

D('ing-sonido-1', 'ing-sonido', 1, 'Terminaciones -ed', 'l-en-pronun',
  'La terminación **-ed** se pronuncia de tres formas: **t**, **d** o **id**. Escribe cuál para cada verbo.',
  [
    ['worked', 't'], ['played', 'd'], ['wanted', 'id'], ['watched', 't'], ['cleaned', 'd'],
    ['needed', 'id'], ['stopped', 't'], ['decided', 'id'], ['lived', 'd'], ['washed', 't'],
  ], { tip: 'Tras sonido sordo (p, k, s, sh, ch, f) → t; tras t o d → id; en el resto → d.', learn: ['Las tres pronunciaciones de -ed', 'Sonidos sordos y sonoros', 'Escuchar en YouGlish'] });

D('ing-sonido-2', 'ing-sonido', 1, 'Ortografía: corrige la palabra', 'l-en-pronun',
  'Estas palabras están mal escritas. Escríbelas correctamente (ortografía británica o americana, ambas valen).',
  [
    ['recieve', 'receive'], ['definately', 'definitely'], ['seperate', 'separate'], ['occured', 'occurred'], ['beleive', 'believe'],
    ['tommorow', 'tomorrow'], ['neccessary', 'necessary'], ['wich', 'which'], ['untill', 'until'], ['accomodation', 'accommodation'],
  ], { tip: 'Regla útil: "i before e, except after c" (believe, receive).', learn: ['Errores de ortografía frecuentes', 'Dobles consonantes', 'Reglas i/e'] });

D('ing-sonido-3', 'ing-sonido', 2, 'Rimas y sonidos', 'l-en-pronun',
  'Para cada palabra elige la opción que **rima** o que **suena distinto**. Escribe solo la palabra.',
  [
    ['Rima con “though”: through / go / tough', 'go'],
    ['Rima con “tough”: cough / enough / though', 'enough'],
    ['Rima con “bear”: hear / there / here', 'there'],
    ['Rima con “read” (presente): bed / need / red', 'need'],
    ['Rima con “cow”: now / low / show', 'now'],
    ['Suena distinto: cat / hat / father / bat', 'father'],
    ['Suena distinto: done / gone / none / sun', 'gone'],
    ['Suena distinto: food / good / moon / soon', 'good'],
    ['Rima con “live” (verbo): give / five / hive', 'give'],
    ['Rima con “wind” (viento): find / pinned / mind', 'pinned'],
  ], { tip: 'La ortografía del inglés engaña: fíate del sonido, no de las letras. Compruébalo con el audio de Cambridge Dictionary.', learn: ['Vocales cortas y largas', 'Letras que no se pronuncian como parecen', 'Usar el audio del diccionario'] });

D('ing-sonido-4', 'ing-sonido', 2, 'Acento de palabra', 'l-en-pronun',
  'Escribe el **número de la sílaba acentuada** (1, 2 o 3) en cada palabra.',
  [
    ['photograph', '1'], ['photographer', '2'], ['photography', '2'], ['banana', '2'], ['computer', '2'],
    ['comfortable', '1'], ['refuse (verbo, negarse)', '2'], ['record (sustantivo)', '1'], ['engineer', '3'], ['important', '2'],
  ], { tip: 'En muchos pares sustantivo/verbo el sustantivo acentúa la primera sílaba (REcord) y el verbo la segunda (reCORD).', learn: ['Acento de palabra', 'Sustantivo vs verbo', 'Vocales débiles (schwa) en sílabas sin acento'] });

D('ing-sonido-5', 'ing-sonido', 3, 'Homófonos', 'l-en-pronun',
  'Palabras que suenan igual pero se escriben distinto. Escribe la opción correcta.',
  [
    ['I left my keys over ___ . (their / there / they’re)', 'there'],
    ['___ going to be late. (their / there / they’re)', 'they are'],
    ['I do not know ___ to go. (weather / whether)', 'whether'],
    ['The ___ is terrible today. (weather / whether)', 'weather'],
    ['Can you ___ the difference? (here / hear)', 'hear'],
    ['I want to ___ a new car. (buy / by / bye)', 'buy'],
    ['___ going to the party? (Your / You’re)', 'you are'],
    ['The dog wagged ___ tail. (its / it’s)', 'its'],
    ['I have ___ brothers. (to / too / two)', 'two'],
    ['She walked ___ me without speaking. (by / buy)', 'by'],
  ], { tip: 'Sustituye mentalmente: "you’re" = "you are"; "it’s" = "it is"; si no encaja, es "your" / "its".', learn: ['Homófonos más comunes', 'Contracciones vs posesivos', 'Releer lo que escribes'] });

D('ing-sonido-6', 'ing-sonido', 3, 'Reducciones del inglés hablado', 'l-en-pronun',
  'En inglés hablado se juntan palabras: gonna, wanna... Escribe la forma completa.',
  [
    ['gonna', 'going to'], ['wanna', 'want to'], ['gotta', 'got to || have got to || have to'], ['dunno', 'do not know'],
    ['lemme', 'let me'], ['gimme', 'give me'], ['kinda', 'kind of'], ['shoulda', 'should have'], ['outta', 'out of'], ['c’mon', 'come on'],
  ], { tip: 'Se usan al hablar y en chats informales; en textos formales escribe siempre la forma completa.', learn: ['Reducciones comunes', 'Por qué cuesta entender a los nativos', 'Escuchar series y podcasts con subtítulos en inglés'] });

module.exports = { tracks, challenges, tests };
