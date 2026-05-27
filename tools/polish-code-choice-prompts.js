const fs = require("fs");
const path = require("path");

const questionsPath = path.join(__dirname, "..", "data", "questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

const prompts = {
  "code-choice-room-context-001": "Analiza esta creación de la base de datos Room. ¿Cuál es el problema principal si se usa como singleton?",
  "code-choice-room-replace-002": "Analiza este insert de Room. ¿Qué efecto tiene OnConflictStrategy.REPLACE?",
  "code-choice-dao-delete-int-003": "Analiza este método DAO. ¿Qué representa el Int que devuelve?",
  "code-choice-retrofit-baseurl-004": "Analiza esta configuración de Retrofit. ¿Qué problema puede provocar la baseUrl?",
  "code-choice-retrofit-execute-005": "Analiza esta llamada Retrofit. ¿Cuál es el riesgo de ejecutar ese código desde UI o desde un ViewModel sin cambiar de dispatcher?",
  "code-choice-token-clear-006": "Analiza este cierre de sesión. ¿Por qué puede dejar credenciales guardadas?",
  "code-choice-token-refresh-007": "Analiza el comentario del fragmento. ¿Qué afirmación es correcta según la práctica?",
  "code-choice-repo-provider-008": "Analiza este acceso a repositorios. ¿Qué patrón o enfoque se está usando?",
  "code-choice-refresh-cache-009": "Analiza este refresh de bicis. ¿Qué problema puede aparecer al no limpiar antes la caché local?",
  "code-choice-rent-active-010": "Analiza esta llamada al repositorio de rentas. ¿Qué identificador espera realmente el método?",
  "code-choice-mapper-null-string-011": "Analiza este mapper. ¿Qué problema puede aparecer si algún campo de la API viene a null?",
  "code-choice-localdatetime-012": "Analiza este parseo de fecha. ¿Qué ocurre si el texto no tiene un formato compatible?",
  "code-choice-viewmodel-loading-013": "Analiza este manejo de carga en el ViewModel. ¿Qué bug de estado puede aparecer si falla el repositorio?",
  "code-choice-viewmodel-recover-014": "Analiza este catch tras una operación de start/stop. ¿Qué paso de recuperación falta?",
  "code-choice-compose-padding-015": "Analiza este Scaffold de Compose. ¿Qué detalle falta para evitar solapes con la topBar?",
  "code-choice-compose-items-key-016": "Analiza este LazyColumn. ¿Qué afirmación describe mejor cómo se pintan los elementos?",
  "code-choice-manifest-exported-017": "Analiza esta Activity launcher del Manifest. ¿Qué problema tiene android:exported?",
  "code-choice-manifest-internet-018": "Analiza este Manifest mínimo. ¿Qué permiso falta para que Retrofit pueda hacer llamadas de red?",
  "code-choice-gradle-ksp-019": "Analiza estas dependencias Gradle de Room. ¿Qué está mal en la configuración del compiler?",
  "code-choice-gradle-minsdk-020": "Analiza este defaultConfig. ¿Qué no coincide con la configuración esperada de la práctica?",
  "code-choice-api-direct-user-021": "Analiza este parser de usuario. ¿Por qué comprueba campos como uuid, email o username?",
  "code-choice-json-first-array-022": "Analiza este recorrido de un objeto JSON. ¿Qué valor intenta extraer?",
  "code-choice-login-trim-023": "Analiza la construcción del TokenRequest. ¿Para qué se aplica trim() a las credenciales?",
  "code-choice-login-cache-024": "Analiza este flujo después de obtener token. ¿Qué significa que falle userRepository.getUser() en el catch?",
  "code-choice-domain-nullable-025": "Analiza este modelo Kotlin. ¿Qué indica el signo ? en los tipos de las propiedades?",
  "code-choice-bike-rents-026": "Analiza este modelo Bike. ¿Qué representa la propiedad rents?",
  "code-choice-profile-cvv-027": "Analiza esta línea de ProfileScreen. ¿Qué dato del usuario se está mostrando?",
  "code-choice-profile-duration-028": "Analiza este cálculo de duración. ¿Qué representa la variable h?",
  "code-choice-review-wrong-query-029": "Analiza este código de DAO. ¿Qué fallo tiene la consulta si se quiere buscar una bici por uuid?",
  "code-choice-review-correct-query-030": "El objetivo es obtener una bici por uuid. ¿Cuál de las opciones implementa correctamente la consulta?",
};

let updated = 0;
for (const question of questions) {
  const prompt = prompts[question.id];
  if (!prompt) continue;
  question.question = prompt;
  updated += 1;
}

if (updated !== Object.keys(prompts).length) {
  const ids = new Set(questions.map((question) => question.id));
  const missing = Object.keys(prompts).filter((id) => !ids.has(id));
  throw new Error(`Faltan preguntas de seleccionar-codigo: ${missing.join(", ")}`);
}

fs.writeFileSync(questionsPath, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Prompts de seleccionar-codigo actualizados: ${updated}`);
