const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const sourcePath = path.join(root, "data", "questions.json");
const targetPath = path.join(root, "data", "questionsMoodle.json");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const base = source.filter(question => question.moodle === true);

const vf = [
  ["moodle-vf-repository-provider-033", "repositorios", "trampa", "RepositoryProvider actúa como un service locator manual para obtener repositorios.", true, "Es verdadero. Centraliza la creación u obtención de repositorios sin usar un framework de inyección."],
  ["moodle-vf-cache-refresh-034", "repositorios", "matar", "Si un refresco remoto no elimina datos locales anteriores, pueden permanecer registros obsoletos.", true, "Es verdadero. Insertar datos nuevos sin limpiar puede dejar elementos que el servidor ya no devuelve."],
  ["moodle-vf-bike-rent-uuid-035", "repositorios", "matar", "Un método llamado isRentActive(uuid) siempre debe recibir el uuid de la bici, aunque internamente consulte rentas.", false, "Es falso. Según la implementación, puede estar esperando el uuid de la renta, no necesariamente el de la bici."],
  ["moodle-vf-or-empty-036", "mappers", "normal", "orEmpty() permite convertir un String nullable en una cadena vacía cuando el valor es null.", true, "Es verdadero. Es una forma habitual de evitar persistir null o el literal \"null\" en campos de texto."],
  ["moodle-vf-localdatetime-037", "mappers", "trampa", "LocalDateTime.parse acepta cualquier formato de fecha escrito por el usuario.", false, "Es falso. Requiere un formato compatible; por eso conviene capturar fallos de parseo."],
  ["moodle-vf-json-array-038", "api", "trampa", "Algunas respuestas de API pueden venir envueltas en un objeto y requerir buscar un JsonArray interno.", true, "Es verdadero. El parser puede necesitar localizar el primer campo que contenga un array."],
  ["moodle-vf-user-direct-039", "api", "normal", "Si un objeto JSON contiene campos como uuid, email o username, puede interpretarse como un usuario directo.", true, "Es verdadero. Esos campos ayudan a distinguir una respuesta directa de una respuesta envuelta."],
  ["moodle-vf-cvv-profile-040", "profile", "normal", "Mostrar el CVV en la pantalla de perfil corresponde a un dato del usuario, no a un dato de la bici.", true, "Es verdadero. El CVV pertenece a los datos de tarjeta del usuario."],
  ["moodle-vf-lazycolumn-key-041", "compose", "trampa", "items(bikes) usa automáticamente bike.uuid como key estable aunque no se indique explícitamente.", false, "Es falso. Para usar una key estable se debe pasar explícitamente."],
  ["moodle-vf-ksp-compiler-042", "gradle", "matar", "El compilador de Room debe configurarse como procesador, no como una dependencia normal de runtime.", true, "Es verdadero. En un proyecto con KSP se declara con la configuración ksp del compilador de Room."],
  ["moodle-vf-minsdk-043", "gradle", "normal", "minSdk define la versión mínima de Android en la que puede ejecutarse la aplicación.", true, "Es verdadero. Forma parte de la configuración Android del proyecto."],
  ["moodle-vf-run-catching-044", "viewmodel", "trampa", "runCatching puede usarse para intentar una recuperación sin propagar una segunda excepción al flujo principal.", true, "Es verdadero. Permite capturar fallos de una operación secundaria."],
  ["moodle-vf-trim-login-045", "login", "normal", "trim() elimina espacios al principio y al final de las credenciales antes de construir una petición.", true, "Es verdadero. Reduce errores por espacios accidentales."],
  ["moodle-vf-response-body-046", "retrofit", "normal", "response.body() puede ser null y debe tratarse de forma segura.", true, "Es verdadero. Un código robusto no debe asumir que body() siempre contiene datos."],
].map(([id, topic, difficulty, statement, truth, explanation]) => ({
  id,
  topic,
  type: "verdadero-falso",
  difficulty,
  moodle: true,
  question: `Indica si la afirmación es verdadera o falsa: ${statement}`,
  options: ["Verdadero", "Falso"],
  answer: truth ? 0 : 1,
  explanation,
}));

const single = [
  {
    id: "moodle-single-json-array-047",
    topic: "api",
    difficulty: "trampa",
    question: "¿Qué objetivo tiene recorrer las entradas de un JsonObject buscando value.isJsonArray?",
    options: ["Localizar un array de datos dentro de una respuesta envuelta.", "Eliminar todos los campos que no sean String.", "Crear automáticamente una tabla de Room.", "Renovar el access token."],
    answer: 0,
    explanation: "Ese recorrido permite extraer una lista cuando la API no devuelve directamente un array en la raíz.",
  },
  {
    id: "moodle-single-localdatetime-048",
    topic: "mappers",
    difficulty: "matar",
    question: "¿Por qué conviene envolver LocalDateTime.parse en runCatching o una estructura equivalente?",
    options: ["Porque el texto puede no tener un formato compatible y lanzar una excepción.", "Porque LocalDateTime.parse siempre devuelve Boolean.", "Porque Room solo acepta fechas con permisos del Manifest.", "Porque Gson no puede leer fechas en ningún caso."],
    answer: 0,
    explanation: "El parseo puede fallar si el formato no encaja; capturarlo permite devolver null o controlar el error.",
  },
  {
    id: "moodle-single-refresh-cache-049",
    topic: "repositorios",
    difficulty: "matar",
    question: "¿Qué comportamiento es más coherente si se quiere que la caché local refleje exactamente el estado remoto?",
    options: ["Eliminar los datos locales anteriores y guardar los datos remotos recibidos.", "Insertar siempre encima sin borrar nada.", "Guardar los datos remotos en AndroidManifest.xml.", "Actualizar únicamente la primera fila de la tabla."],
    answer: 0,
    explanation: "Si la caché debe representar el remoto, conviene reemplazar el contenido local con la respuesta actual.",
  },
  {
    id: "moodle-single-items-key-050",
    topic: "compose",
    difficulty: "trampa",
    question: "¿Qué afirmación describe mejor items(bikes) sin parámetro key?",
    options: ["Pinta los elementos, pero no declara una key estable explícita.", "Usa siempre bike.uuid como key aunque no se indique.", "Solo pinta el primer elemento de la lista.", "Convierte la lista en una entidad de Room."],
    answer: 0,
    explanation: "items recorre la lista, pero la key estable debe indicarse si se necesita ese comportamiento.",
  },
  {
    id: "moodle-single-token-cache-051",
    topic: "login",
    difficulty: "matar",
    question: "Si el login obtiene token pero falla la carga posterior del usuario, ¿qué interpretación es más precisa?",
    options: ["La autenticación puede haber funcionado aunque falle la actualización de la caché de usuario.", "El token nunca se obtuvo.", "Room elimina automáticamente todos los tokens.", "El Manifest impide iniciar sesión."],
    answer: 0,
    explanation: "El flujo de autenticación y la carga/cache del usuario son pasos relacionados, pero no idénticos.",
  },
  {
    id: "moodle-single-nullable-model-052",
    topic: "modelos",
    difficulty: "normal",
    question: "¿Qué indica una propiedad declarada como Int? en un modelo Kotlin?",
    options: ["Que puede contener null.", "Que siempre se serializa como String.", "Que no puede mostrarse en Compose.", "Que Room la convierte en clave primaria automáticamente."],
    answer: 0,
    explanation: "El signo ? convierte el tipo en nullable.",
  },
  {
    id: "moodle-single-bike-rent-053",
    topic: "modelos",
    difficulty: "trampa",
    question: "Si Bike contiene una propiedad rents: BikeRent?, ¿qué se debe tener en cuenta?",
    options: ["Puede no existir renta asociada y debe tratarse como nullable.", "Siempre contiene una lista completa de rentas históricas.", "Es el DAO de rentas.", "Es el token de sesión."],
    answer: 0,
    explanation: "BikeRent? indica una renta opcional asociada, no una lista obligatoria.",
  },
  {
    id: "moodle-single-viewmodel-state-054",
    topic: "viewmodel",
    difficulty: "normal",
    question: "¿Cuál es una responsabilidad habitual de un ViewModel en esta práctica?",
    options: ["Exponer estado de pantalla y coordinar llamadas al repositorio.", "Declarar permisos de red.", "Definir las columnas de una entidad.", "Compilar las anotaciones de Room."],
    answer: 0,
    explanation: "El ViewModel prepara estado para la UI y llama a casos de uso o repositorios.",
  },
  {
    id: "moodle-single-dao-annotation-055",
    topic: "dao",
    difficulty: "normal",
    question: "¿Qué anotación identifica una interfaz como DAO de Room?",
    options: ["@Dao", "@Database", "@Entity", "@Composable"],
    answer: 0,
    explanation: "@Dao marca la interfaz donde se declaran operaciones de acceso a datos.",
  },
  {
    id: "moodle-single-entity-primary-056",
    topic: "room",
    difficulty: "trampa",
    question: "¿Qué representa una clave primaria en una entidad de Room?",
    options: ["El campo que identifica de forma única una fila.", "El endpoint principal de Retrofit.", "El primer Composable de la pantalla.", "El permiso principal del Manifest."],
    answer: 0,
    explanation: "La clave primaria permite identificar de forma única cada registro de la tabla.",
  },
];

const codeChoice = [
  {
    id: "moodle-code-choice-cache-057",
    topic: "repositorios",
    difficulty: "matar",
    question: "Analiza este refresco. ¿Qué riesgo presenta?",
    code: "remoteDatasource.getAll().forEach { bike ->\n    localDatasource.insert(bike.toEntity())\n}",
    options: ["Puede conservar datos locales obsoletos si no se limpia la caché.", "Siempre elimina todos los datos antes de insertar.", "No compila porque forEach no existe en Kotlin.", "Convierte automáticamente las bicis en usuarios."],
    answer: 0,
    explanation: "Sin limpieza previa pueden quedarse registros que ya no existen en remoto.",
  },
  {
    id: "moodle-code-choice-or-empty-058",
    topic: "mappers",
    difficulty: "trampa",
    question: "Analiza este mapper. ¿Qué mejora sería más adecuada?",
    code: "lastUse = apiBike.lastUse.toString()",
    options: ["Tratar el null explícitamente, por ejemplo con orEmpty() si se espera String.", "Eliminar la entidad de Room.", "Mover el código al Manifest.", "Cambiar Retrofit por Compose."],
    answer: 0,
    explanation: "toString() sobre null puede producir el literal \"null\".",
  },
  {
    id: "moodle-code-choice-json-059",
    topic: "api",
    difficulty: "trampa",
    question: "Analiza este fragmento. ¿Qué está comprobando?",
    code: "if (jsonObject.has(\"uuid\") || jsonObject.has(\"email\") || jsonObject.has(\"username\")) {\n    return gson.fromJson(jsonObject, ApiUser::class.java)\n}",
    options: ["Que la respuesta parece contener directamente un usuario.", "Que la respuesta es obligatoriamente un array.", "Que el usuario está autenticado en Room.", "Que el Manifest tiene permiso INTERNET."],
    answer: 0,
    explanation: "Campos como uuid, email o username permiten detectar un objeto de usuario directo.",
  },
  {
    id: "moodle-code-choice-scaffold-060",
    topic: "compose",
    difficulty: "normal",
    question: "Analiza este Scaffold. ¿Qué falta en el contenido?",
    code: "Scaffold(topBar = { TopAppBar(title = { Text(\"Bicis\") }) }) { innerPadding ->\n    LazyColumn(Modifier.fillMaxSize()) {\n        item { Text(\"Listado de bicis\") }\n    }\n}",
    options: ["Aplicar el innerPadding recibido por Scaffold.", "Eliminar LazyColumn.", "Declarar INTERNET dentro del Composable.", "Crear un DAO dentro de TopAppBar."],
    answer: 0,
    explanation: "El contenido debe respetar el padding estructural para evitar solapes.",
  },
  {
    id: "moodle-code-choice-ksp-061",
    topic: "gradle",
    difficulty: "matar",
    question: "Analiza estas dependencias. ¿Qué corrección es más adecuada para Room compiler?",
    code: "dependencies {\n    implementation(libs.androidx.room.compiler)\n}",
    options: ["Usar ksp(libs.androidx.room.compiler).", "Mover room.compiler a AndroidManifest.xml.", "Eliminar room.runtime.", "Convertirlo en un Composable."],
    answer: 0,
    explanation: "Room compiler debe configurarse como procesador de anotaciones.",
  },
  {
    id: "moodle-code-choice-exported-062",
    topic: "activity",
    difficulty: "matar",
    question: "Analiza esta Activity launcher. ¿Qué valor debería revisarse?",
    code: "<activity android:name=\".presentation.SplashActivity\" android:exported=\"false\">\n    <intent-filter>\n        <action android:name=\"android.intent.action.MAIN\" />\n        <category android:name=\"android.intent.category.LAUNCHER\" />\n    </intent-filter>\n</activity>",
    options: ["android:exported debería permitir que el sistema lance la Activity.", "El intent-filter debe ir en build.gradle.", "MAIN solo puede usarse con Room.", "LAUNCHER impide usar Retrofit."],
    answer: 0,
    explanation: "Una Activity launcher debe poder ser lanzada por el sistema.",
  },
  {
    id: "moodle-code-choice-runcatching-063",
    topic: "viewmodel",
    difficulty: "trampa",
    question: "Analiza este catch. ¿Qué podría añadirse para recuperar estado sin romper el flujo?",
    code: "catch (e: Exception) {\n    _error.value = e.message\n}",
    options: ["Un runCatching que intente refrescar el estado.", "Un permiso INTERNET.", "Una nueva entidad Room para errores.", "Un @Insert en el ViewModel."],
    answer: 0,
    explanation: "runCatching permite intentar una operación de recuperación capturando sus fallos.",
  },
  {
    id: "moodle-code-choice-delete-064",
    topic: "dao",
    difficulty: "normal",
    question: "Analiza este DAO. ¿Qué devuelve el método si se ejecuta correctamente?",
    code: "@Query(\"DELETE FROM bikes WHERE uuid = :uuid\")\nfun delete(uuid: String): Int",
    options: ["El número de filas eliminadas.", "La entidad eliminada completa.", "El código HTTP de la petición.", "El nuevo uuid de la bici."],
    answer: 0,
    explanation: "Un DELETE de Room que retorna Int informa de filas afectadas.",
  },
];

const multiple = [
  {
    id: "moodle-multiple-mappers-065",
    topic: "mappers",
    difficulty: "trampa",
    question: "Selecciona las afirmaciones correctas sobre mappers y nulabilidad.",
    options: ["orEmpty() evita null en Strings.", "toString() sobre null puede producir el literal \"null\".", "LocalDateTime.parse puede fallar si el formato no es compatible.", "String? significa que el campo nunca puede ser null."],
    answer: [0, 1, 2],
    explanation: "La nulabilidad debe tratarse de forma explícita en mappers.",
  },
  {
    id: "moodle-multiple-dao-066",
    topic: "dao",
    difficulty: "normal",
    question: "Selecciona las afirmaciones correctas sobre DAO de Room.",
    options: ["@Dao marca una interfaz de acceso a datos.", "@Query permite declarar consultas SQL.", "Un DELETE que devuelve Int informa de filas afectadas.", "@Composable convierte una interfaz en DAO."],
    answer: [0, 1, 2],
    explanation: "DAO y @Query pertenecen a Room; @Composable pertenece a Compose.",
  },
  {
    id: "moodle-multiple-viewmodel-067",
    topic: "viewmodel",
    difficulty: "trampa",
    question: "Selecciona las afirmaciones correctas sobre estados de carga y errores.",
    options: ["finally ayuda a apagar isLoading aunque haya excepción.", "Un catch puede publicar un mensaje de error.", "runCatching puede capturar fallos de recuperación.", "isLoading solo puede modificarse desde AndroidManifest.xml."],
    answer: [0, 1, 2],
    explanation: "El estado de pantalla se gestiona desde el ViewModel, no desde el Manifest.",
  },
  {
    id: "moodle-multiple-api-068",
    topic: "api",
    difficulty: "matar",
    question: "Selecciona las afirmaciones correctas sobre parseo de respuestas API.",
    options: ["Una respuesta puede venir como objeto directo.", "Una respuesta puede venir envuelta y contener un JsonArray interno.", "Gson puede mapear objetos si la estructura coincide.", "Toda respuesta de API debe ser siempre una lista en la raíz."],
    answer: [0, 1, 2],
    explanation: "La práctica contempla respuestas directas y respuestas envueltas.",
  },
  {
    id: "moodle-multiple-manifest-gradle-069",
    topic: "gradle",
    difficulty: "trampa",
    question: "Selecciona las afirmaciones correctas sobre configuración del proyecto.",
    options: ["INTERNET se declara en el Manifest.", "Room compiler se configura como procesador.", "minSdk fija la versión mínima soportada.", "android:exported sustituye a ksp."],
    answer: [0, 1, 2],
    explanation: "Manifest y Gradle tienen responsabilidades distintas.",
  },
  {
    id: "moodle-multiple-session-070",
    topic: "auth",
    difficulty: "matar",
    question: "Selecciona las afirmaciones correctas sobre sesión.",
    options: ["El access token se usa para autenticar peticiones.", "Guardar refresh token no prueba que haya renovación automática.", "Cerrar sesión debe limpiar credenciales.", "El token debe guardarse como entidad BikeEntity."],
    answer: [0, 1, 2],
    explanation: "La sesión se gestiona en almacenamiento de autenticación, no como entidad de bici.",
  },
];

const brief = [
  ["moodle-brief-service-locator-071", "repositorios", "trampa", "Explica brevemente por qué RepositoryProvider puede considerarse un service locator manual.", ["RepositoryProvider", "repositorios", "manual"], "La respuesta debe mencionar que centraliza la obtención de repositorios sin un framework de inyección."],
  ["moodle-brief-json-array-072", "api", "trampa", "Explica por qué puede ser necesario buscar un JsonArray dentro de un JsonObject de respuesta.", ["JsonArray", "respuesta", "envuelta"], "La respuesta debe identificar que algunas respuestas vienen envueltas y la lista está en un campo interno."],
  ["moodle-brief-body-null-073", "retrofit", "normal", "Explica por qué response.body() debe tratarse como potencialmente null.", ["body", "null", "respuesta"], "La respuesta debe mencionar que la respuesta HTTP puede no contener cuerpo válido."],
  ["moodle-brief-ksp-074", "gradle", "matar", "Explica por qué Room compiler no debería declararse como una dependencia normal de implementation.", ["compiler", "ksp", "procesador"], "La respuesta debe indicar que es un procesador de anotaciones y se configura con KSP."],
  ["moodle-brief-exported-075", "activity", "matar", "Explica por qué una Activity launcher necesita una configuración correcta de android:exported.", ["Activity", "launcher", "exported"], "La respuesta debe mencionar que el sistema debe poder lanzar la Activity principal."],
  ["moodle-brief-items-key-076", "compose", "trampa", "Explica qué limitación tiene usar items(bikes) sin proporcionar una key estable.", ["items", "key", "estable"], "La respuesta debe diferenciar pintar la lista de declarar una key estable explícita."],
  ["moodle-brief-delete-int-077", "dao", "normal", "Explica qué significa el Int devuelto por un DELETE en Room.", ["Int", "filas", "afectadas"], "La respuesta debe indicar que representa el número de filas afectadas."],
  ["moodle-brief-minsdk-078", "gradle", "normal", "Explica qué representa minSdk dentro de defaultConfig.", ["minSdk", "version", "minima"], "La respuesta debe mencionar que fija la versión mínima de Android soportada."],
  ["moodle-brief-cvv-079", "profile", "normal", "Explica qué representa el campo CVV si aparece en la pantalla de perfil.", ["CVV", "tarjeta", "usuario"], "La respuesta debe relacionarlo con el código de seguridad de la tarjeta del usuario."],
  ["moodle-brief-bike-rent-080", "modelos", "trampa", "Explica qué implica que una propiedad de dominio sea BikeRent?.", ["BikeRent", "nullable", "renta"], "La respuesta debe indicar que la renta asociada puede no existir."],
].map(([id, topic, difficulty, question, keywords, explanation]) => ({
  id,
  topic,
  type: "respuesta-breve",
  difficulty,
  moodle: true,
  question,
  answer: { keywords },
  explanation,
}));

const typedSingle = single.map(question => ({ ...question, type: "single", moodle: true }));
const typedCodeChoice = codeChoice.map(question => ({ ...question, type: "seleccionar-codigo", moodle: true }));
const typedMultiple = multiple.map(question => ({ ...question, type: "multiple", moodle: true }));
const additions = [...vf, ...typedSingle, ...typedCodeChoice, ...typedMultiple, ...brief];
const byId = new Map();
for (const question of [...base, ...additions]) {
  byId.set(question.id, question);
}

const moodle = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(targetPath, `${JSON.stringify(moodle, null, 2)}\n`);
console.log(`Banco Moodle escrito: ${moodle.length} preguntas`);
console.log(JSON.stringify(Object.fromEntries([...new Set(moodle.map(q => q.type))].map(type => [type, moodle.filter(q => q.type === type).length])), null, 2));
