const fs = require("fs");
const path = require("path");

const bankPath = path.join(__dirname, "..", "data", "questions.json");
const questions = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const directTopicByConcept = new Map();

for (const q of questions) {
  if (q.id.startsWith("auto-") && q.id.includes("-direct-")) {
    directTopicByConcept.set(autoConceptKey(q.id), q.topic);
  }
}

const topicLabels = {
  room: "Room",
  dao: "DAO",
  retrofit: "Retrofit",
  auth: "autenticacion",
  repositorios: "repositorios",
  mappers: "mappers",
  viewmodel: "ViewModel",
  compose: "Compose",
  activity: "Android Manifest y Activities",
  gradle: "Gradle",
  usecases: "casos de uso",
  "json-api": "parseo JSON de la API",
  modelos: "modelos de dominio",
  "analisis-conceptual": "analisis conceptual",
  perfil: "pantalla de perfil",
  "profile-ui": "pantalla de perfil",
  "ui-estado": "estado de UI",
  "remote-datasources": "datasources remotos",
  "local-datasources": "datasources locales",
  interfaces: "interfaces de repositorio",
  "bug-hunt": "revision tecnica",
  "estrategia-examen": "criterios del examen",
  "app-entrenador": "funcionamiento del entrenador"
};

function labelTopic(topic) {
  return topicLabels[topic] || topic.replaceAll("-", " ");
}

function cleanText(value) {
  if (typeof value !== "string") return value;
  return value
    .replaceAll("Forma directa: ", "")
    .replaceAll("Forma inversa: ", "")
    .replaceAll("Forma inversa sobre ", "En relacion con ")
    .replaceAll("Pregunta con truco: ", "")
    .replaceAll("Indirecta de DAO: ", "")
    .replaceAll("Lio de capas: ", "")
    .replaceAll("Codigo de otro grupo: ", "")
    .replaceAll("Que contestas?", "Que evaluacion tecnica corresponde?")
    .replaceAll("Que dices?", "Que evaluacion tecnica corresponde?")
    .replaceAll("Que opcion encaja mejor?", "Seleccione la afirmacion correcta.")
    .replaceAll("cual es la afirmacion falsa?", "seleccione la afirmacion incorrecta.")
    .replaceAll("Selecciona las ideas correctas relacionadas con:", "Seleccione las afirmaciones correctas sobre")
    .replaceAll("Completa con la palabra clave que mejor arregla este caso:", "Complete con el concepto clave que corrige la siguiente situacion:")
    .replaceAll("Trampa:", "Observacion:")
    .replaceAll("codigo", "codigo")
    .replace(/\bel alumno dice que\b/gi, "se afirma que")
    .replace(/\bel alumno mete\b/gi, "se utiliza")
    .replace(/\bCodigo\b/g, "Codigo")
    .replace(/\s+/g, " ")
    .trim();
}

function polishGeneratedQuestion(q) {
  if (!q.id.startsWith("auto-")) return;
  const parts = q.id.split("-");
  const variant = parts.includes("direct") ? "direct"
    : parts.includes("inverse") ? "inverse"
    : parts.includes("review") ? "review"
    : parts.includes("multi") ? "multi"
    : parts.includes("fill") ? "fill"
    : null;

  if (!variant) return;

  const sourceTopic = variant === "review" || variant === "inverse" || q.topic === "analisis-conceptual"
    ? (directTopicByConcept.get(autoConceptKey(q.id)) || inferTopicFromId(q.id))
    : q.topic;
  const topic = labelTopic(sourceTopic);
  if (variant === "direct") {
    q.question = `Seleccione la afirmacion tecnicamente correcta sobre ${topic}.`;
    if (Array.isArray(q.options) && q.options.length === 4) {
      q.options[2] = "La correccion depende exclusivamente de que el fragmento compile sin errores.";
      q.options[3] = "La responsabilidad deberia trasladarse a una capa no relacionada para simplificar la implementacion.";
    }
  } else if (variant === "inverse") {
    q.topic = "analisis-conceptual";
    q.question = `En relación con ${topic}, seleccione la opción incompatible con el comportamiento implementado.`;
    if (Array.isArray(q.options) && q.options.length === 4) {
      q.options[3] = "La implementacion debe evaluarse a partir del contrato y del flujo real del codigo.";
    }
  } else if (variant === "review") {
    q.question = `Evalúe el fragmento de código asociado a ${topic}. Determine si la implementación es correcta, incorrecta o parcialmente correcta y justifique la corrección necesaria.`;
  } else if (variant === "multi") {
    q.question = `Seleccione todas las afirmaciones tecnicamente correctas sobre ${topic}.`;
    if (Array.isArray(q.options) && q.options.length === 4) {
      q.options[3] = "La compilacion del fragmento garantiza por si sola que se respeta la arquitectura esperada.";
    }
  } else if (variant === "fill") {
    const key = Array.isArray(q.answer) ? q.answer[0] : "la solución";
    q.question = `Complete con el concepto, anotación o identificador clave relacionado con ${key}.`;
  }
}

function inferTopicFromId(id) {
  const known = Object.keys(topicLabels).sort((a, b) => b.length - a.length);
  return known.find(topic => id.includes(topic)) || "preguntas-inversas";
}

function autoConceptKey(id) {
  return id.replace(/-(direct|inverse|review|multi|fill)-\d+$/, "");
}

function polishManualQuestion(q) {
  const replacements = new Map([
    ["inverse-022", "Revise el siguiente flujo de navegacion desde SplashActivity e indique que condicion funcional no se esta contemplando."],
    ["inverse-023", "Revise la siguiente modificacion de startRent orientada a evitar duplicados y determine si preserva el comportamiento offline-first."],
    ["inverse-024", "Analice la semantica de @Update en Room y explique si la siguiente interpretacion es correcta."],
    ["inverse-025", "Revise la configuracion de entidades de Room y determine si respeta la separacion entre entidades de persistencia y modelos de dominio."],
    ["inverse-005", "Según la implementación de TokenManager, determine qué ocurre cuando el payload del JWT no contiene la propiedad exp."],
    ["inverse-021", "Evalúe el fragmento propuesto y determine si compilar correctamente es suficiente para considerarlo válido en esta práctica."]
  ]);
  if (replacements.has(q.id)) q.question = replacements.get(q.id);

  if (q.topic === "preguntas-inversas") q.topic = "analisis-conceptual";

  if (/^review-\d+/.test(q.id)) {
    q.question = `Evalúe el fragmento de código asociado a ${reviewArea(q)}. Determine si la implementación es correcta, incorrecta o parcialmente correcta y justifique la corrección necesaria.`;
  }

  if (q.id === "remote-ds-003") {
    q.question = "El banco de preguntas representa los tipos de ejercicio mediante el campo type. ¿Qué ocurriría si una pregunta declarase type = \"matar\" en lugar de un tipo reconocido?";
    q.options = [
      "La aplicación no sabría renderizarla como pregunta de opción única",
      "La respuesta se consideraría correcta automáticamente",
      "El archivo JSON dejaría de ser válido",
      "Se transformaría automáticamente en una pregunta de completar código"
    ];
    q.answer = 0;
    q.explanation = "El motor de la aplicación espera tipos reconocidos como single, multiple, completar-codigo, ordenar-codigo o revisar-codigo. La dificultad se modela en difficulty, no en type.";
    q.trap = "Confundir type con difficulty rompe el flujo de renderizado.";
  }
}

for (const q of questions) {
  if (q.topic === "preguntas-inversas") q.topic = "analisis-conceptual";
  polishGeneratedQuestion(q);
  polishManualQuestion(q);
  q.question = cleanText(q.question);
  q.explanation = cleanText(q.explanation);
  q.trap = cleanText(q.trap);
  q.code = cleanText(q.code);
  if (Array.isArray(q.options)) q.options = q.options.map(cleanText);

  if (q.question.includes("Que opcion") || q.question.includes("qué opcion")) {
    q.question = q.question.replace(/Que opcion.*$/i, "Seleccione la respuesta correcta.");
  }

  if (q.type === "revisar-codigo" && q.question.includes("di si")) {
    q.question = `Evalúe el fragmento de código asociado a ${reviewArea(q)}. Determine si la implementación es correcta, incorrecta o parcialmente correcta y justifique la corrección necesaria.`;
  }
}

for (const q of questions) {
  q.question = q.question
    .replace(/^Que /, "Qué ")
    .replace(/^Cual /, "Cuál ")
    .replace(/^Como /, "Cómo ")
    .replace(/ Que /g, " qué ")
    .replace(/ Cual /g, " cuál ")
    .replace(/ Como /g, " cómo ");
  q.explanation = q.explanation
    .replaceAll("La falsa es:", "La afirmación incorrecta es:")
    .replace(/ esta /g, " está ")
    .replace(/ estan /g, " están ")
    .replace(/ esta\./g, " está.")
    .replace(/ esta,/g, " está,");
}

for (const q of questions) {
  if (q.question.includes("preguntas inversas") || q.question.includes("Preguntas Inversas")) {
    q.question = `Seleccione la afirmación incompatible con el comportamiento implementado en ${labelTopic(q.topic)}.`;
  }
  q.explanation = q.explanation
    .replaceAll("preguntas inversas", "análisis conceptual")
    .replaceAll("preguntas-inversas", "analisis-conceptual");
}

for (const q of questions) {
  if (q.type === "revisar-codigo" && q.question === "Evalúe el siguiente fragmento de código y determine si la implementación es correcta, incorrecta o parcialmente correcta. Justifique la corrección necesaria.") {
    q.question = `Evalúe el fragmento de código asociado a ${reviewArea(q)}. Determine si la implementación es correcta, incorrecta o parcialmente correcta y justifique la corrección necesaria.`;
  }
  if (q.type === "completar-codigo" && q.question === "Complete con el concepto, anotación o identificador clave que corrige la situación planteada.") {
    const key = Array.isArray(q.answer) ? q.answer[0] : "la solución";
    q.question = `Complete con el concepto, anotación o identificador clave relacionado con ${key}.`;
  }
  if (q.topic === "analisis-conceptual" && q.question === "Identifique la afirmación que contradice el comportamiento implementado.") {
    q.question = "Seleccione la afirmación incompatible con el comportamiento implementado en la práctica.";
  }
}

function reviewArea(q) {
  const idTopic = inferTopicFromId(q.id);
  if (idTopic !== "preguntas-inversas") return labelTopic(idTopic);
  const text = `${q.code || ""} ${(q.answer?.keywords || []).join(" ")}`.toLowerCase();
  if (text.includes("dao") || text.includes("@query") || text.includes("@update")) return "DAO y Room";
  if (text.includes("retrofit") || text.includes("api") || text.includes("post") || text.includes("json")) return "Retrofit y API";
  if (text.includes("viewmodel") || text.includes("dispatchers")) return "ViewModel y corrutinas";
  if (text.includes("compose") || text.includes("observeasstate")) return "Compose";
  if (text.includes("token") || text.includes("authorization")) return "autenticación";
  if (text.includes("pending") || text.includes("offline")) return "sincronización offline";
  if (text.includes("entity") || text.includes("primarykey")) return "persistencia Room";
  return "la arquitectura de Pedalean2";
}

const banned = [
  "Forma directa",
  "Forma inversa",
  "preguntas inversas",
  "preguntas-inversas",
  "Pregunta con truco",
  "Codigo de otro grupo",
  "Lio de capas",
  "Indirecta de DAO",
  "Que contestas",
  "Que dices",
  "Un grupo",
  "Revisa este",
  "implementa login asi",
  "el alumno dice",
  "el alumno mete"
];

const remaining = [];
for (const q of questions) {
  const text = JSON.stringify(q);
  for (const token of banned) {
    if (text.includes(token)) remaining.push({ id: q.id, token });
  }
}

if (remaining.length) {
  console.error(JSON.stringify(remaining.slice(0, 20), null, 2));
  throw new Error(`Unprofessional markers remain: ${remaining.length}`);
}

fs.writeFileSync(bankPath, JSON.stringify(questions, null, 2) + "\n");
console.log(`Polished ${questions.length} questions`);
