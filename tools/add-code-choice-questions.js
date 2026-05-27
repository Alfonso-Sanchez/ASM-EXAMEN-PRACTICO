const fs = require("fs");
const path = require("path");

const questionsPath = path.join(__dirname, "..", "data", "questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
const ids = new Set(questions.map((question) => question.id));

const newQuestions = [
  {
    id: "code-choice-room-context-001",
    topic: "room",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "Analiza esta creacion de la base de datos Room. Cual es el problema principal si se usa como singleton?",
    code: `Room.databaseBuilder(
    activity,
    Pedalean2Database::class.java,
    "pedalean2.db"
).build()`,
    options: [
      "Es peligroso si se guarda como singleton porque puede retener una Activity; debería usarse applicationContext.",
      "Es obligatorio pasar Activity porque Room necesita ciclo de vida.",
      "Solo falla si exportSchema está a false.",
      "Es equivalente a usar applicationContext en todos los casos.",
    ],
    answer: 0,
    explanation: "Para un singleton de base de datos se debe usar context.applicationContext y evitar retener una Activity.",
  },
  {
    id: "code-choice-room-replace-002",
    topic: "dao",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "Observa el insert. ¿Qué interpretación es correcta?",
    code: `@Insert(onConflict = OnConflictStrategy.REPLACE)
fun insertBike(entity: BikeEntity)`,
    options: [
      "Si existe otra fila con la misma clave primaria, Room sustituye la entidad conflictiva.",
      "Room mezcla solo los campos no nulos y conserva el resto.",
      "Room ignora siempre el insert si ya existe una fila.",
      "REPLACE solo funciona con @Update, no con @Insert.",
    ],
    answer: 0,
    explanation: "REPLACE sustituye la fila que entra en conflicto con la clave primaria; no es una fusion parcial de campos.",
  },
  {
    id: "code-choice-dao-delete-int-003",
    topic: "dao",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "Si el DAO contiene este método, ¿qué significa el Int devuelto?",
    code: `@Query("DELETE FROM rents WHERE uuid = :uuid")
fun delete(uuid: String): Int`,
    options: [
      "El número de filas afectadas por el DELETE.",
      "El id autogenerado de la renta borrada.",
      "Siempre vale 1 si la query compila.",
      "El código HTTP devuelto por Retrofit.",
    ],
    answer: 0,
    explanation: "En Room, una query DELETE que retorna Int devuelve cuántas filas han sido afectadas.",
  },
  {
    id: "code-choice-retrofit-baseurl-004",
    topic: "retrofit",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "¿Qué pasaría con esta configuración de Retrofit?",
    code: `Retrofit.Builder()
    .baseUrl("https://api.pedalean2.com/endpoints/v2")
    .build()`,
    options: [
      "Puede lanzar IllegalArgumentException porque la baseUrl debe terminar en /.",
      "Retrofit añade automáticamente la barra final.",
      "Solo falla si se usa GsonConverterFactory.",
      "La URL es correcta porque termina en v2.",
    ],
    answer: 0,
    explanation: "Retrofit exige que baseUrl termine en barra para resolver correctamente rutas relativas.",
  },
  {
    id: "code-choice-retrofit-execute-005",
    topic: "retrofit",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "En este fragmento de repositorio/ViewModel, ¿cuál es el riesgo principal?",
    code: `val response = apiService.getBikes().execute()
_bikes.value = response.body() ?: emptyList()`,
    options: [
      "execute() es síncrono y no debería ejecutarse en el hilo principal.",
      "execute() siempre es asíncrono, así que no hay riesgo.",
      "body() nunca puede devolver null.",
      "El problema es que Retrofit no permite listas.",
    ],
    answer: 0,
    explanation: "Call.execute() bloquea el hilo actual; debe ejecutarse desde IO o dentro de una capa que no bloquee UI.",
  },
  {
    id: "code-choice-token-clear-006",
    topic: "auth",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "Este cierre de sesión intenta borrar credenciales. ¿Qué problema tiene?",
    code: `fun clearTokens() {
    prefs.edit()
        .remove("access_token")
        .apply()
}`,
    options: [
      "Solo borra access_token; podrían quedar refresh token u otras claves de autenticación.",
      "remove no existe en SharedPreferences.",
      "apply bloquea siempre el hilo principal hasta escribir en disco.",
      "No compila porque edit() devuelve Unit.",
    ],
    answer: 0,
    explanation: "En la práctica, clearTokens borra el SharedPreferences de autenticación completo con clear().apply().",
  },
  {
    id: "code-choice-token-refresh-007",
    topic: "auth",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "Si ves este comentario en un examen, ¿qué opción es más precisa según la práctica?",
    code: `if (tokenManager.hasValidSession()) {
    // Si el access token expiró, aquí se renueva con el refresh token.
    navigateToHome()
}`,
    options: [
      "El comentario es engañoso: se guarda refresh token, pero no hay flujo automático de renovación implementado.",
      "Es correcto: hasValidSession renueva siempre el access token.",
      "Es correcto solo si Room está inicializado.",
      "El refresh token solo sirve para borrar la sesión.",
    ],
    answer: 0,
    explanation: "El refresh token se almacena, pero no aparece un flujo de renovación automática del access token.",
  },
  {
    id: "code-choice-repo-provider-008",
    topic: "repositorios",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "¿Qué patrón describe mejor este acceso a repositorios?",
    code: `val bikeRepository = RepositoryProvider.bikeRepository(context)
val rentRepository = RepositoryProvider.rentRepository(context)`,
    options: [
      "Service locator manual.",
      "Inyección automática con Hilt.",
      "Factory generada por Room.",
      "Patrón Observer de LiveData.",
    ],
    answer: 0,
    explanation: "RepositoryProvider centraliza manualmente la creación/obtención de repositorios; no es Hilt ni Koin.",
  },
  {
    id: "code-choice-refresh-cache-009",
    topic: "repositorios",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "¿Qué diferencia importante tiene este refresh frente a uno que primero borra la caché local?",
    code: `override fun refreshFromRemote(): List<Bike> {
    remoteDatasource.getAll().forEach { localDatasource.insert(it.toEntity()) }
    return localDatasource.getAll().map { it.toBike() }
}`,
    options: [
      "Puede dejar bicis antiguas que ya no vengan del remoto, porque no limpia la caché antes de insertar.",
      "Es idéntico a borrar e insertar porque Room siempre limpia la tabla.",
      "No compila porque forEach no existe en Kotlin.",
      "Hace que Retrofit devuelva siempre una lista vacía.",
    ],
    answer: 0,
    explanation: "Si no se borra la caché local antes, pueden quedarse datos obsoletos que el servidor ya no devuelve.",
  },
  {
    id: "code-choice-rent-active-010",
    topic: "repositorios",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "Mira esta llamada. ¿Cuál es la trampa típica?",
    code: `val active = rentRepository.isRentActive(bike.uuid)`,
    options: [
      "isRentActive espera uuid de renta, no necesariamente uuid de bici.",
      "bike.uuid nunca puede ser String.",
      "isRentActive solo se puede llamar desde Compose.",
      "El método cambia el estado de la renta a finalizada.",
    ],
    answer: 0,
    explanation: "En la práctica isRentActive(uuid) consulta por uuid de renta; confundirlo con bike.uuid puede dar resultados falsos.",
  },
  {
    id: "code-choice-mapper-null-string-011",
    topic: "mappers",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "¿Por qué este mapper puede guardar un valor feo o incorrecto?",
    code: `BikeEntity(
    uuid = apiBike.uuid.toString(),
    lastUse = apiBike.lastUse.toString()
)`,
    options: [
      "Si el valor viene null, toString() puede producir el literal \"null\"; es mejor usar orEmpty() o tratar el null.",
      "toString() siempre lanza excepción con String nullable.",
      "Room no permite guardar Strings.",
      "El problema solo ocurre si minSdk es menor que 21.",
    ],
    answer: 0,
    explanation: "Los mappers de la práctica usan orEmpty() para evitar persistir cadenas como \"null\".",
  },
  {
    id: "code-choice-localdatetime-012",
    topic: "mappers",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "¿Qué problema puede tener este parseo directo?",
    code: `val lastUseDate = LocalDateTime.parse(lastUse)`,
    options: [
      "Si el formato no es compatible o viene mal, puede lanzar excepción; conviene envolverlo con runCatching.",
      "LocalDateTime.parse devuelve siempre null si falla.",
      "LocalDateTime solo parsea fechas con zona horaria obligatoria.",
      "No compila porque LocalDateTime no existe en Kotlin.",
    ],
    answer: 0,
    explanation: "En el banco se espera saber que runCatching permite devolver null si la fecha no parsea.",
  },
  {
    id: "code-choice-viewmodel-loading-013",
    topic: "viewmodel",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "¿Qué bug de estado puede aparecer en este ViewModel?",
    code: `_isLoading.value = true
try {
    repository.refreshFromRemote()
    _isLoading.value = false
} catch (e: Exception) {
    _error.value = e.message
}`,
    options: [
      "Si hay excepción, isLoading puede quedarse en true porque falta finally.",
      "El catch se ejecuta antes que el try.",
      "repository.refreshFromRemote() nunca puede fallar.",
      "MutableStateFlow no puede almacenar Boolean.",
    ],
    answer: 0,
    explanation: "El patrón correcto apaga el loading en finally para cubrir éxito y fallo.",
  },
  {
    id: "code-choice-viewmodel-recover-014",
    topic: "viewmodel",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "Tras fallar una operación de start/stop, ¿qué falta si se compara con el patrón de recuperación de la práctica?",
    code: `catch (e: Exception) {
    _error.value = e.message
}`,
    options: [
      "Intentar refrescar el estado con runCatching para no dejar la UI desactualizada.",
      "Cerrar la aplicación desde el catch.",
      "Borrar siempre la base de datos local.",
      "Convertir el error en un token.",
    ],
    answer: 0,
    explanation: "El patrón de la práctica intenta recuperar el estado con runCatching { refreshBikeState() }.",
  },
  {
    id: "code-choice-compose-padding-015",
    topic: "compose",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "¿Qué detalle falta en este Scaffold?",
    code: `Scaffold(
    topBar = { TopAppBar(title = { Text("Bicis") }) }
) {
    LazyColumn(Modifier.fillMaxSize()) {
        items(bikes) { BikeRow(it) }
    }
}`,
    options: [
      "Usar el innerPadding del Scaffold en el contenido.",
      "Eliminar el TopAppBar porque Scaffold no lo soporta.",
      "Cambiar LazyColumn por Column siempre.",
      "Añadir INTERNET al Composable.",
    ],
    answer: 0,
    explanation: "El contenido de Scaffold debe aplicar Modifier.padding(innerPadding) para respetar barras y evitar solapes.",
  },
  {
    id: "code-choice-compose-items-key-016",
    topic: "compose",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "¿Qué afirmación sobre este código es correcta?",
    code: `LazyColumn {
    items(bikes) { bike ->
        BikeRow(bike)
    }
}`,
    options: [
      "Pinta una fila por cada bici, pero no está dando una key estable explícita.",
      "Compose usa automáticamente bike.uuid como key aunque no se indique.",
      "items(bikes) solo pinta el primer elemento.",
      "LazyColumn exige que bikes sea un JsonArray.",
    ],
    answer: 0,
    explanation: "items(bikes) recorre la lista, pero si quieres key estable debes pasarla explícitamente.",
  },
  {
    id: "code-choice-manifest-exported-017",
    topic: "activity",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "¿Qué problema tiene esta Activity launcher en Android moderno?",
    code: `<activity
    android:name=".presentation.SplashActivity"
    android:exported="false">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>`,
    options: [
      "Una Activity con MAIN/LAUNCHER debe estar exportada para poder lanzarse desde el sistema.",
      "MAIN y LAUNCHER solo se pueden poner en servicios.",
      "android:exported no existe.",
      "Debe declararse dentro de uses-permission.",
    ],
    answer: 0,
    explanation: "La launcher con intent-filter debe declarar exported=true en Android 12+.",
  },
  {
    id: "code-choice-manifest-internet-018",
    topic: "activity",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "Si el Manifest solo tiene esto, ¿qué faltaría para que Retrofit pueda salir a red?",
    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application>
        ...
    </application>
</manifest>`,
    options: [
      "El permiso android.permission.INTERNET.",
      "Una entidad de Room llamada InternetEntity.",
      "android:exported en todos los Composables.",
      "Cambiar minSdk a 1.",
    ],
    answer: 0,
    explanation: "Las llamadas de red requieren declarar INTERNET en el Manifest.",
  },
  {
    id: "code-choice-gradle-ksp-019",
    topic: "gradle",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "¿Qué problema conceptual tiene esta dependencia de Room compiler?",
    code: `dependencies {
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    implementation(libs.androidx.room.compiler)
}`,
    options: [
      "El compiler de Room debe ir como procesador, por ejemplo ksp(...), no como implementation.",
      "room.runtime debe ir dentro de AndroidManifest.",
      "room.ktx sustituye al permiso INTERNET.",
      "Room compiler solo se usa en Java, nunca en Kotlin.",
    ],
    answer: 0,
    explanation: "En la práctica se usa ksp(libs.androidx.room.compiler) para el procesador de Room.",
  },
  {
    id: "code-choice-gradle-minsdk-020",
    topic: "gradle",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "Según la configuración esperada de la práctica, ¿qué elegirías al ver esto?",
    code: `android {
    defaultConfig {
        minSdk = 21
    }
}`,
    options: [
      "No coincide con la práctica si se espera minSdk = 33.",
      "Es correcto porque minSdk siempre debe ser 21.",
      "minSdk solo se declara en AndroidManifest.",
      "El valor minSdk no afecta a Android.",
    ],
    answer: 0,
    explanation: "El banco recoge como detalle de la práctica que minSdk está configurado a 33.",
  },
  {
    id: "code-choice-api-direct-user-021",
    topic: "api",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "Este parser intenta detectar un usuario directo. ¿Cuál es la idea clave?",
    code: `if (jsonObject.has("uuid") ||
    jsonObject.has("email") ||
    jsonObject.has("username")
) {
    return gson.fromJson(jsonObject, ApiUser::class.java)
}`,
    options: [
      "Si el objeto ya trae campos típicos de usuario, se parsea directamente como ApiUser.",
      "Solo se puede parsear si viene dentro de un array obligatorio.",
      "uuid impide usar Gson.",
      "email y username se ignoran siempre.",
    ],
    answer: 0,
    explanation: "La práctica contempla respuestas directas o envueltas; uuid/email/username ayudan a identificar un usuario directo.",
  },
  {
    id: "code-choice-json-first-array-022",
    topic: "api",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "¿Qué está haciendo este código al leer una respuesta JSON envoltorio?",
    code: `for ((_, value) in jsonObject.entrySet()) {
    if (value.isJsonArray) {
        return value.asJsonArray
    }
}`,
    options: [
      "Busca el primer campo cuyo valor sea un array JSON.",
      "Convierte cualquier objeto en usuario.",
      "Borra los campos que no sean arrays.",
      "Comprueba que todos los campos sean arrays.",
    ],
    answer: 0,
    explanation: "El parser recorre entradas del objeto y toma el primer JsonArray encontrado.",
  },
  {
    id: "code-choice-login-trim-023",
    topic: "login",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "¿Por qué se usa trim() en este login?",
    code: `val request = TokenRequest(
    username = email.trim(),
    password = password.trim()
)`,
    options: [
      "Para quitar espacios accidentales al principio o final antes de pedir el token.",
      "Para cifrar el password.",
      "Para convertir el email en UUID.",
      "Para renovar el refresh token automáticamente.",
    ],
    answer: 0,
    explanation: "trim() elimina espacios laterales antes de construir el TokenRequest.",
  },
  {
    id: "code-choice-login-cache-024",
    topic: "login",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "¿Cómo deberías interpretar este catch después de obtener token?",
    code: `val token = authRepository.login(credentials)
try {
    userRepository.getUser()
} catch (e: Exception) {
    // No se invalida necesariamente el token obtenido.
}`,
    options: [
      "Puede fallar la carga/cache del usuario aunque el login haya devuelto token.",
      "Si getUser falla, el token nunca se guardó.",
      "El catch renueva automáticamente el token.",
      "getUser borra Room siempre.",
    ],
    answer: 0,
    explanation: "El login y la posterior carga/cache de usuario son pasos relacionados pero distinguibles.",
  },
  {
    id: "code-choice-domain-nullable-025",
    topic: "modelos",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "¿Qué significa el signo ? en este modelo?",
    code: `data class User(
    val uuid: String?,
    val creditCardCvv: Int?
)`,
    options: [
      "Los campos pueden ser null.",
      "Los campos son constantes de compilación.",
      "Los campos se guardan automáticamente en Room.",
      "Los campos no se pueden serializar.",
    ],
    answer: 0,
    explanation: "String? e Int? son tipos nullable en Kotlin.",
  },
  {
    id: "code-choice-bike-rents-026",
    topic: "modelos",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "En este modelo de dominio, ¿qué representa rents?",
    code: `data class Bike(
    val uuid: String,
    val name: String,
    val rents: BikeRent? = null
)`,
    options: [
      "La renta asociada/activa de la bici, nullable.",
      "Una lista obligatoria de todas las rentas históricas.",
      "El DAO de rentas.",
      "El token de autenticación.",
    ],
    answer: 0,
    explanation: "En el modelo mostrado, rents es un BikeRent? opcional, no una lista obligatoria.",
  },
  {
    id: "code-choice-profile-cvv-027",
    topic: "profile",
    type: "seleccionar-codigo",
    difficulty: "trampa",
    question: "¿Qué dato está mostrando esta línea del perfil?",
    code: `ProfileField(
    label = "CVV",
    value = user.creditCardCvv?.toString()
)`,
    options: [
      "El código de seguridad de la tarjeta si existe.",
      "La matrícula de la bici.",
      "El uuid de la renta activa.",
      "El refresh token.",
    ],
    answer: 0,
    explanation: "CVV corresponde al código de seguridad de la tarjeta guardado en el modelo de usuario.",
  },
  {
    id: "code-choice-profile-duration-028",
    topic: "profile",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "¿Qué calcula h en este fragmento?",
    code: `val totalSeconds = user.totalUsageSeconds ?: 0
val h = totalSeconds / 3600
val m = (totalSeconds % 3600) / 60`,
    options: [
      "Las horas completas dentro del total de segundos.",
      "Los milisegundos de uso.",
      "El número de rentas activas.",
      "El porcentaje de batería.",
    ],
    answer: 0,
    explanation: "Dividir segundos entre 3600 obtiene las horas completas.",
  },
  {
    id: "code-choice-review-wrong-query-029",
    topic: "revision-codigo",
    type: "seleccionar-codigo",
    difficulty: "matar",
    question: "Te dan este código de otro grupo. ¿Qué opción de test marca mejor el fallo?",
    code: `@Query("SELECT * FROM bikes WHERE id = :uuid LIMIT 1")
fun getById(uuid: String): BikeEntity?`,
    options: [
      "Usa id en la query aunque el parámetro y la clave esperada van por uuid.",
      "Debe quitarse LIMIT 1 porque Room no lo soporta.",
      "BikeEntity no puede devolverse nullable.",
      "El parámetro uuid debe ser Int siempre.",
    ],
    answer: 0,
    explanation: "La trampa es buscar por id cuando la práctica trabaja la identidad de las bicis por uuid.",
  },
  {
    id: "code-choice-review-correct-query-030",
    topic: "revision-codigo",
    type: "seleccionar-codigo",
    difficulty: "normal",
    question: "¿Cuál sería la versión más coherente si se quiere buscar una bici por uuid?",
    code: `// Se quiere obtener una bici por uuid`,
    options: [
      "@Query(\"SELECT * FROM bikes WHERE uuid = :uuid LIMIT 1\") fun getById(uuid: String): BikeEntity?",
      "@Query(\"SELECT * FROM bikes WHERE id = :uuid LIMIT 1\") fun getById(uuid: String): BikeEntity?",
      "@Query(\"DELETE FROM bikes WHERE uuid = :uuid\") fun getById(uuid: String): BikeEntity?",
      "@Insert fun getById(uuid: String): BikeEntity?",
    ],
    answer: 0,
    explanation: "La query correcta filtra la columna uuid con el parámetro uuid y limita a una fila.",
  },
];

let added = 0;
for (const question of newQuestions) {
  if (ids.has(question.id)) continue;
  questions.push(question);
  ids.add(question.id);
  added += 1;
}

fs.writeFileSync(questionsPath, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Preguntas de seleccion con codigo añadidas: ${added}`);
console.log(`Total de preguntas: ${questions.length}`);
