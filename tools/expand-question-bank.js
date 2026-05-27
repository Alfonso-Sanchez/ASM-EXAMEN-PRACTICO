const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const bankPath = path.join(root, "data", "questions.json");
const questions = JSON.parse(fs.readFileSync(bankPath, "utf8"));
const ids = new Set(questions.map(q => q.id));
const target = 300;

const concepts = [
  {
    key: "room-app-context",
    topic: "room",
    difficulty: "matar",
    fact: "Room.databaseBuilder debe recibir context.applicationContext para evitar retener una Activity.",
    good: "Usar context.applicationContext en Room.databaseBuilder",
    bad: "Pasar una Activity como contexto permanente",
    keywords: ["applicationContext"],
    codeBad: "Room.databaseBuilder(this, Pedalean2AppDatabase::class.java, \"pedalean2.db\").build()"
  },
  {
    key: "room-export-schema",
    topic: "room",
    difficulty: "trampa",
    fact: "exportSchema = false evita exportar el esquema de Room, pero no desactiva la base de datos.",
    good: "exportSchema controla la exportacion del esquema",
    bad: "exportSchema=false borra las tablas al arrancar",
    keywords: ["exportSchema", "esquema"],
    codeBad: "@Database(entities = [UserEntity::class], version = 1, exportSchema = false)\nabstract class Db : RoomDatabase() // Comentario: esto borra la BD cada inicio"
  },
  {
    key: "dao-delete-return",
    topic: "dao",
    difficulty: "normal",
    fact: "Un @Query DELETE que devuelve Int informa cuantas filas se han borrado.",
    good: "DELETE devuelve filas afectadas si la funcion retorna Int",
    bad: "DELETE devuelve siempre 1 aunque no exista el uuid",
    keywords: ["filas", "Int"],
    codeBad: "fun delete(uuid: String): Boolean = bikeDao.delete(uuid) == 1 // asume que todo no-1 es error fatal"
  },
  {
    key: "dao-replace",
    topic: "dao",
    difficulty: "matar",
    fact: "OnConflictStrategy.REPLACE reemplaza una fila con la misma clave primaria, no fusiona campos parcialmente.",
    good: "REPLACE sustituye la entidad conflictiva",
    bad: "REPLACE mezcla solo los campos no nulos",
    keywords: ["REPLACE", "sustituye"],
    codeBad: "@Insert(onConflict = OnConflictStrategy.REPLACE)\nfun insert(user: UserEntity): Long // Comentario: solo actualiza campos no vacios"
  },
  {
    key: "retrofit-base-slash",
    topic: "retrofit",
    difficulty: "trampa",
    fact: "La baseUrl de Retrofit debe terminar en /.",
    good: "La base URL termina en barra",
    bad: "Quitar la barra final de baseUrl no importa",
    keywords: ["barra", "baseUrl"],
    codeBad: "Retrofit.Builder().baseUrl(\"https://api.pedalean2.com/endpoints/v2\").build()"
  },
  {
    key: "retrofit-sync-execute",
    topic: "retrofit",
    difficulty: "matar",
    fact: "Call.execute() es sincronico y debe ejecutarse fuera del hilo principal.",
    good: "execute es sincronico y se lleva a Dispatchers.IO",
    bad: "execute ya es asincrono por ser Retrofit",
    keywords: ["execute", "Dispatchers.IO"],
    codeBad: "val response = RetrofitClient.apiService.getBikes().execute()\n_bikes.value = response.body()"
  },
  {
    key: "token-refresh-unused",
    topic: "auth",
    difficulty: "matar",
    fact: "El refresh token se guarda, pero no hay flujo implementado que renueve automaticamente el access token.",
    good: "El refresh se almacena pero no se usa para renovar",
    bad: "TokenManager renueva automaticamente el access token",
    keywords: ["refresh", "renovar"],
    codeBad: "if (TokenManager.hasValidSession()) { /* esto tambien renueva access si expiro */ }"
  },
  {
    key: "token-clear",
    topic: "auth",
    difficulty: "normal",
    fact: "clearTokens borra todas las claves del SharedPreferences de autenticacion.",
    good: "clearTokens hace prefs.edit().clear().apply()",
    bad: "clearTokens solo borra access_token",
    keywords: ["clear", "SharedPreferences"],
    codeBad: "fun clearTokens() { prefs.edit().remove(KEY_ACCESS_TOKEN).apply() }"
  },
  {
    key: "repo-provider-service-locator",
    topic: "repositorios",
    difficulty: "trampa",
    fact: "RepositoryProvider es un service locator manual, no Hilt ni Koin.",
    good: "Centraliza creacion de repositorios manualmente",
    bad: "Usa inyeccion Hilt automaticamente",
    keywords: ["RepositoryProvider", "manual"],
    codeBad: "@HiltViewModel\nclass BikeViewModel @Inject constructor(private val repo: BikeRepository) : ViewModel()"
  },
  {
    key: "bike-refresh-clear",
    topic: "repositorios",
    difficulty: "matar",
    fact: "BikeRepository.refreshFromRemote borra la cache local y la reemplaza con datos remotos si remoto responde.",
    good: "refreshFromRemote reemplaza cache local con remoto",
    bad: "refreshFromRemote solo anade nuevas bicis y nunca borra antiguas",
    keywords: ["borra", "cache"],
    codeBad: "override fun refreshFromRemote(): List<Bike> {\n    remoteDatasource.getAll().forEach(localDatasource::insert)\n    return localDatasource.getAll().map { it.toBike() }\n}"
  },
  {
    key: "rent-active-by-rent-uuid",
    topic: "repositorios",
    difficulty: "matar",
    fact: "isRentActive(uuid) consulta una renta por uuid de renta, no por uuid de bici.",
    good: "isRentActive espera uuid de la renta",
    bad: "isRentActive recibe siempre bikeUuid",
    keywords: ["renta", "uuid"],
    codeBad: "val active = rentRepository.isRentActive(bike.uuid) // lo toma como si fuera uuid de bici"
  },
  {
    key: "mapper-null-or-empty",
    topic: "mappers",
    difficulty: "trampa",
    fact: "Los mappers usan orEmpty() para convertir Strings nulos de API/modelos en cadenas vacias.",
    good: "orEmpty evita null en campos persistidos",
    bad: "orEmpty convierte null en 'null' literal",
    keywords: ["orEmpty", "vacia"],
    codeBad: "lastUse = lastUse.toString() // si es null guarda \"null\""
  },
  {
    key: "local-date-parse",
    topic: "mappers",
    difficulty: "matar",
    fact: "LocalDateTime.parse requiere formato compatible ISO; si falla, el mapper devuelve null.",
    good: "runCatching devuelve null si la fecha no parsea",
    bad: "Cualquier fecha española dd/MM/yyyy parsea directamente",
    keywords: ["LocalDateTime", "null"],
    codeBad: "lastUse = LocalDateTime.parse(lastUse) // sin runCatching"
  },
  {
    key: "viewmodel-finally-loading",
    topic: "viewmodel",
    difficulty: "trampa",
    fact: "El patron finally asegura que isLoading vuelva a false aunque haya excepcion.",
    good: "finally limpia estado de carga",
    bad: "Solo se debe poner isLoading=false dentro del try",
    keywords: ["finally", "isLoading"],
    codeBad: "try { refreshBikeState(); _isLoading.value = false } catch(e: Exception) { _error.value = e.message }"
  },
  {
    key: "viewmodel-runcatching-refresh",
    topic: "viewmodel",
    difficulty: "matar",
    fact: "Tras error en start/stop, BikeViewModel intenta refrescar estado con runCatching.",
    good: "runCatching evita que falle tambien el refresco de recuperacion",
    bad: "En catch no se intenta recuperar estado",
    keywords: ["runCatching", "refresh"],
    codeBad: "catch (e: Exception) { _error.value = e.message }"
  },
  {
    key: "compose-scaffold-padding",
    topic: "compose",
    difficulty: "normal",
    fact: "Las pantallas con Scaffold aplican innerPadding al contenido.",
    good: "Usar Modifier.padding(innerPadding)",
    bad: "Ignorar innerPadding no afecta nunca a topBar",
    keywords: ["innerPadding"],
    codeBad: "Scaffold(topBar = { TopAppBar(...) }) { LazyColumn(Modifier.fillMaxSize()) { /* ... */ } }"
  },
  {
    key: "compose-items-key",
    topic: "compose",
    difficulty: "trampa",
    fact: "items(bikes) pinta cada elemento; no crea estado estable por key si no se le da key.",
    good: "items recorre la lista visible",
    bad: "items(bikes) persiste automaticamente estado por uuid",
    keywords: ["items", "key"],
    codeBad: "items(bikes) { bike -> /* comentario: Compose usa bike.uuid como key automaticamente */ }"
  },
  {
    key: "manifest-exported-launcher",
    topic: "activity",
    difficulty: "matar",
    fact: "La Activity launcher con intent-filter MAIN/LAUNCHER debe declarar exported=true en Android moderno.",
    good: "SplashActivity es exported=true",
    bad: "La launcher puede ser exported=false con MAIN/LAUNCHER",
    keywords: ["exported", "launcher"],
    codeBad: "<activity android:name=\".presentation.SplashActivity\" android:exported=\"false\"><intent-filter>...</intent-filter></activity>"
  },
  {
    key: "manifest-internet",
    topic: "activity",
    difficulty: "normal",
    fact: "Sin android.permission.INTERNET las llamadas de Retrofit a red fallarian.",
    good: "Declarar INTERNET en manifest",
    bad: "Retrofit anade permiso INTERNET automaticamente",
    keywords: ["INTERNET"],
    codeBad: "<manifest><application>...</application></manifest>"
  },
  {
    key: "gradle-ksp-room",
    topic: "gradle",
    difficulty: "matar",
    fact: "Room compiler esta configurado con ksp, no kapt.",
    good: "ksp(libs.androidx.room.compiler)",
    bad: "kapt es obligatorio en este proyecto",
    keywords: ["ksp", "room.compiler"],
    codeBad: "dependencies { implementation(libs.androidx.room.compiler) }"
  },
  {
    key: "gradle-minsdk",
    topic: "gradle",
    difficulty: "trampa",
    fact: "El minSdk configurado es 33.",
    good: "minSdk = 33",
    bad: "minSdk es 21 por defecto",
    keywords: ["minSdk", "33"],
    codeBad: "defaultConfig { minSdk = 21 }"
  },
  {
    key: "login-trim",
    topic: "usecases",
    difficulty: "trampa",
    fact: "LoginUsecase hace trim de email y password antes de crear TokenRequest.",
    good: "Usa credentials.email.trim() y password.trim()",
    bad: "Envia los espacios tal cual",
    keywords: ["trim"],
    codeBad: "TokenRequest(username = credentials.email, password = credentials.password)"
  },
  {
    key: "login-cache-not-fatal",
    topic: "usecases",
    difficulty: "matar",
    fact: "Si cachear usuario falla despues de guardar tokens, el login sigue devolviendo true.",
    good: "El fallo de cache no invalida login",
    bad: "Si falla cachear usuario, execute devuelve false siempre",
    keywords: ["cache", "true"],
    codeBad: "val user = userRepository.getUser() ?: return false\nreturn true"
  },
  {
    key: "api-user-direct-object",
    topic: "json-api",
    difficulty: "matar",
    fact: "UserRemoteDatasource acepta un objeto directo si tiene uuid, email o username.",
    good: "Acepta objeto usuario directo",
    bad: "Solo acepta arrays",
    keywords: ["uuid", "email", "username"],
    codeBad: "if (!element.isJsonArray) return emptyList()"
  },
  {
    key: "api-first-array",
    topic: "json-api",
    difficulty: "trampa",
    fact: "Bike/Rent remote buscan el primer campo JsonArray dentro de un objeto.",
    good: "Busca el primer array interno",
    bad: "Exige que el campo se llame exactamente data",
    keywords: ["JsonArray", "entrySet"],
    codeBad: "val array = element.asJsonObject.getAsJsonArray(\"data\")"
  },
  {
    key: "domain-user-nullable",
    topic: "modelos",
    difficulty: "normal",
    fact: "User de dominio usa campos nullable, pero UserModel local usa valores no nulos.",
    good: "El mapper usa orEmpty y defaults",
    bad: "UserModel guarda nulls igual que User",
    keywords: ["nullable", "orEmpty"],
    codeBad: "UserModel(uuid = user.uuid, email = user.email) // sin gestionar nulls"
  },
  {
    key: "domain-rent-rents-name",
    topic: "modelos",
    difficulty: "matar",
    fact: "En Rent de dominio la bici alquilada se llama rents, nombre confuso pero usado por UI.",
    good: "rent.rents contiene BikeRent",
    bad: "La UI usa rent.bike porque existe en dominio",
    keywords: ["rents", "BikeRent"],
    codeBad: "Text(rent.bike.name)"
  },
  {
    key: "profile-credit-card",
    topic: "perfil",
    difficulty: "trampa",
    fact: "ProfileScreen muestra datos de tarjeta, incluido CVV, segun el codigo actual.",
    good: "Muestra Number, CVV y Expiration",
    bad: "Nunca muestra informacion de tarjeta",
    keywords: ["CVV", "Expiration"],
    codeBad: "// Comentario: por seguridad esta pantalla no muestra CVV"
  },
  {
    key: "profile-duration-hours",
    topic: "profile-ui",
    difficulty: "matar",
    fact: "formatDuration usa h:mm:ss si hay horas, y m:ss si no las hay.",
    good: "3661 -> 1:01:01",
    bad: "3661 -> 61:01 siempre",
    keywords: ["h", "m", "s"],
    codeBad: "return \"%d:%02d\".format(seconds / 60, seconds % 60)"
  },
  {
    key: "bike-active-rent-disable",
    topic: "ui-estado",
    difficulty: "matar",
    fact: "Si hay activeRent, los botones de alquilar otras bicis disponibles se deshabilitan.",
    good: "enabled = activeRent == null",
    bad: "Permite varias rentas activas desde la UI",
    keywords: ["activeRent", "enabled"],
    codeBad: "Button(onClick = onRentClick, enabled = available) { Text(\"Rent Bike\") }"
  },
  {
    key: "start-rent-fixed-coords",
    topic: "preguntas-rebuscadas",
    difficulty: "matar",
    fact: "BikeViewModel usa coordenadas fijas 41.1189, 1.2445 al iniciar/parar rentas.",
    good: "Usa coordenadas fijas",
    bad: "Lee ubicacion GPS real",
    keywords: ["41.1189", "1.2445"],
    codeBad: "RepositoryProvider.rentRepository().startRent(bikeUuid, currentGps.lat, currentGps.lng)"
  },
  {
    key: "splash-file-typo",
    topic: "preguntas-rebuscadas",
    difficulty: "trampa",
    fact: "El archivo se llama SplashActivitiy.kt, aunque la clase es SplashActivity.",
    good: "El typo esta en el nombre de archivo",
    bad: "La clase tambien se llama SplashActivitiy",
    keywords: ["archivo", "SplashActivity"],
    codeBad: "class SplashActivitiy : ComponentActivity()"
  },
  {
    key: "remote-stop-request",
    topic: "remote-datasources",
    difficulty: "matar",
    fact: "RentRemoteDatasource.update usa StopRentRequest con bikeUuid y coordenadas del RentModel.",
    good: "update remoto equivale a stopRent",
    bad: "update manda un RentModel completo al servidor",
    keywords: ["StopRentRequest", "bikeUuid"],
    codeBad: "apiService.stopRent(dataModel).execute()"
  },
  {
    key: "remote-bike-no-write",
    topic: "remote-datasources",
    difficulty: "trampa",
    fact: "BikeRemoteDatasource no soporta insert/update/delete remotos y devuelve false.",
    good: "Solo lectura remota de bicis",
    bad: "update remoto de Bike cambia la API",
    keywords: ["false", "insert"],
    codeBad: "override fun update(dataModel: BikeModel): Boolean = apiService.updateBike(dataModel).execute().isSuccessful"
  },
  {
    key: "local-ds-entity-model",
    topic: "local-datasources",
    difficulty: "normal",
    fact: "Los datasources locales convierten Entity a Model y Model a Entity.",
    good: "Usan toModel y toEntity",
    bad: "Devuelven entidades Room directamente al repositorio de dominio",
    keywords: ["toModel", "toEntity"],
    codeBad: "override fun getAll(): List<BikeModel> = bikeDao.getAll()"
  },
  {
    key: "contracts-comment-mismatch",
    topic: "interfaces",
    difficulty: "matar",
    fact: "El comentario de IRentRepository.startRent habla de servidor, pero la implementacion devuelve true por exito local.",
    good: "Hay desajuste entre contrato comentado e implementacion",
    bad: "La implementacion solo devuelve true si servidor confirma",
    keywords: ["servidor", "local"],
    codeBad: "// Returns true if server confirms success\nreturn true // Local start always succeeds initially"
  },
  {
    key: "security-card-cvv",
    topic: "bug-hunt",
    difficulty: "matar",
    fact: "Mostrar CVV en ProfileScreen es funcional segun codigo, pero criticable por seguridad.",
    good: "Es criticable mostrar CVV",
    bad: "No hay ningun dato sensible en perfil",
    keywords: ["CVV", "seguridad"],
    codeBad: "ProfileField(\"CVV\", user.creditCardCvv?.toString())"
  },
  {
    key: "state-error-priority",
    topic: "ui-estado",
    difficulty: "trampa",
    fact: "BikeListScreen prioriza error sobre lista vacia y lista de bicis.",
    good: "error se muestra primero",
    bad: "Si hay error y bicis vacias, muestra No bikes available",
    keywords: ["error", "primero"],
    codeBad: "if (bikes.isEmpty()) Text(\"No bikes available\") else if (error != null) Text(\"Error\")"
  },
  {
    key: "review-verdict-partial",
    topic: "revision-codigo",
    difficulty: "matar",
    fact: "Codigo parcial significa que algo compila o hace parte del trabajo, pero incumple detalles de la practica.",
    good: "Parcial no es correcto completo",
    bad: "Si compila, siempre es correcto",
    keywords: ["parcial", "detalle"],
    codeBad: "val request = chain.request().newBuilder().header(\"Authorization\", \"Bearer token\").build()"
  },
  {
    key: "exam-no-negative",
    topic: "estrategia-examen",
    difficulty: "normal",
    fact: "Las incorrectas no restan y se aprueba con 6/10.",
    good: "Conviene contestar todo",
    bad: "Conviene dejar en blanco si dudas",
    keywords: ["no restan", "6"],
    codeBad: "// Estrategia: dejar sin responder las dudosas porque penalizan"
  },
  {
    key: "exam-15-pass",
    topic: "estrategia-examen",
    difficulty: "normal",
    fact: "En un test de 15 preguntas, 6/10 equivale a 9 aciertos.",
    good: "9 de 15 aprueba",
    bad: "8 de 15 aprueba seguro",
    keywords: ["9", "15"],
    codeBad: "const passed = score >= 8 // para 15 preguntas"
  },
  {
    key: "app-review-keywords",
    topic: "app-entrenador",
    difficulty: "trampa",
    fact: "El tipo revisar-codigo corrige por veredicto y palabras clave, no por IA.",
    good: "No usa IA, usa keywords",
    bad: "El diagnostico lo hace una IA embebida",
    keywords: ["keywords", "veredicto"],
    codeBad: "const ok = await ai.grade(answer)"
  }
];

function direct(c, n) {
  return {
    id: `auto-${c.key}-direct-${n}`,
    topic: c.topic,
    type: "single",
    difficulty: c.difficulty,
    question: `Forma directa: ${c.fact} Que opcion encaja mejor?`,
    options: [c.good, c.bad, "Depende solo de si compila", "No se puede saber mirando el codigo"],
    answer: 0,
    explanation: c.fact
  };
}

function inverse(c, n) {
  return {
    id: `auto-${c.key}-inverse-${n}`,
    topic: "preguntas-inversas",
    type: "single",
    difficulty: c.difficulty,
    question: `Forma inversa sobre ${c.topic}: cual es la afirmacion falsa?`,
    options: [c.fact, c.good, c.bad, "Es un detalle que puede salir en examen"],
    answer: 2,
    explanation: `La falsa es: ${c.bad}. ${c.fact}`
  };
}

function review(c, n) {
  return {
    id: `auto-${c.key}-review-${n}`,
    topic: "revision-codigo",
    type: "revisar-codigo",
    difficulty: c.difficulty,
    question: "Codigo de otro grupo: di si esta bien, mal o parcial y como lo arreglarias.",
    code: c.codeBad,
    verdictOptions: ["correcto", "incorrecto", "parcial"],
    answer: { verdict: "incorrecto", keywords: c.keywords },
    explanation: `La idea problematica es: ${c.bad}. Arreglo esperado: ${c.good}.`
  };
}

function complete(c, n) {
  const first = c.keywords[0];
  return {
    id: `auto-${c.key}-fill-${n}`,
    topic: "codigo",
    type: "completar-codigo",
    difficulty: c.difficulty,
    question: `Completa con la palabra clave que mejor arregla este caso: ${c.bad}`,
    code: `// Pista del arreglo esperado\n// usar ____`,
    answer: [first],
    explanation: `Una palabra clave esperada es ${first}. ${c.fact}`
  };
}

function multi(c, n) {
  return {
    id: `auto-${c.key}-multi-${n}`,
    topic: c.topic,
    type: "multiple",
    difficulty: c.difficulty,
    question: `Selecciona las ideas correctas relacionadas con: ${c.fact}`,
    options: [c.good, c.fact, c.bad, "La compilacion siempre demuestra que la arquitectura es correcta"],
    answer: [0, 1],
    explanation: `Son correctas la descripcion y la consecuencia real. La trampa es: ${c.bad}.`
  };
}

const generated = [];
let serial = 1;
for (const concept of concepts) {
  generated.push(direct(concept, serial));
  generated.push(inverse(concept, serial));
  generated.push(review(concept, serial));
  if (generated.length < target - questions.length + 20) generated.push(multi(concept, serial));
  if (concept.keywords.length) generated.push(complete(concept, serial));
  serial += 1;
}

for (const question of generated) {
  if (questions.length >= target) break;
  if (ids.has(question.id)) continue;
  ids.add(question.id);
  questions.push(question);
}

if (questions.length !== target) {
  throw new Error(`Expected ${target} questions, got ${questions.length}`);
}

fs.writeFileSync(bankPath, JSON.stringify(questions, null, 2) + "\n");
console.log(`Question bank expanded to ${questions.length}`);
