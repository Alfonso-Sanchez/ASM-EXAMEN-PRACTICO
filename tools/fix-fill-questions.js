const fs = require("fs");
const path = require("path");

const questionsPath = path.join(__dirname, "..", "data", "questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));

const patches = {
  "auto-room-app-context-fill-1": {
    question: "Complete el acceso al contexto correcto para construir el singleton de Room sin retener una Activity.",
    code: `Room.databaseBuilder(
    context.____,
    Pedalean2Database::class.java,
    "pedalean2.db"
)`,
    answer: ["applicationContext"],
  },
  "auto-room-export-schema-fill-2": {
    question: "Complete el atributo de @Database que evita que Room exporte el esquema a una carpeta externa.",
    code: `@Database(
    entities = [UserEntity::class, BikeEntity::class, RentEntity::class],
    version = 1,
    ____ = false
)`,
    answer: ["exportSchema"],
  },
  "auto-dao-delete-return-fill-3": {
    question: "Complete que representa el Int que devuelve una consulta DELETE en un DAO de Room.",
    code: `@Query("DELETE FROM bikes WHERE uuid = :uuid")
fun deleteByUuid(uuid: String): Int

// El Int devuelto indica el numero de ____ afectadas.`,
    answer: ["filas", "rows"],
  },
  "auto-dao-replace-fill-4": {
    question: "Complete la estrategia de conflicto usada para reemplazar una entidad existente al insertar en Room.",
    code: `@Insert(onConflict = OnConflictStrategy.____)
fun insertBike(bike: BikeEntity)`,
    answer: ["REPLACE"],
  },
  "auto-retrofit-base-slash-fill-5": {
    question: "Complete el caracter obligatorio al final de la baseUrl de Retrofit para que no lance IllegalArgumentException.",
    code: `Retrofit.Builder()
    .baseUrl("https://api.pedalean2.com/endpoints/v2____")
    .build()`,
    answer: ["/", "barra"],
  },
  "auto-retrofit-sync-execute-fill-6": {
    question: "Complete la llamada que ejecuta una peticion Retrofit de forma sincronica cuando se trabaja con Call<T>.",
    code: `val call = apiService.getBikes()
val response = call.____()`,
    answer: ["execute"],
  },
  "auto-token-refresh-unused-fill-7": {
    question: "Complete el tipo de token que se guarda en preferencias pero no se usa para renovar automaticamente el access token.",
    code: `prefs.edit()
    .putString("access_token", token.accessToken)
    .putString("_____token", token.refreshToken)
    .apply()`,
    answer: ["refresh"],
  },
  "auto-token-clear-fill-8": {
    question: "Complete la operacion de SharedPreferences que borra todos los tokens al cerrar sesion.",
    code: `prefs.edit()
    .____()
    .apply()`,
    answer: ["clear"],
  },
  "auto-repo-provider-service-locator-fill-9": {
    question: "Complete el objeto usado como service locator para obtener repositorios desde la capa de presentacion.",
    code: `val bikeRepository = ____.bikeRepository(context)
val userRepository = ____.userRepository(context)`,
    answer: ["RepositoryProvider"],
  },
  "auto-bike-refresh-clear-fill-10": {
    question: "Complete el metodo del datasource local que se llama para borrar cada bici antes de guardar las descargadas.",
    code: `localDatasource.getAll().forEach { bike ->
    localDatasource.____(bike.uuid)
}`,
    answer: ["delete", "deleteByUuid", "borra"],
  },
  "auto-rent-active-by-rent-uuid-fill-11": {
    question: "Complete la propiedad de BikeRent que permite saber si una renta sigue activa.",
    code: `override fun isRentActive(uuid: String): Boolean {
    return localDatasource.getById(uuid)
        ?.toRent()
        ?.____ ?: false
}`,
    answer: ["isRented", "rented", "renta"],
  },
  "auto-mapper-null-or-empty-fill-12": {
    question: "Complete la funcion Kotlin que convierte un String nullable en cadena vacia si viene null.",
    code: `Bike(
    uuid = uuid,
    name = name,
    lastUse = lastUse.____()
)`,
    answer: ["orEmpty"],
  },
  "auto-local-date-parse-fill-13": {
    question: "Complete la clase usada para parsear una fecha-hora sin zona horaria en los mappers.",
    code: `fun String.toLocalDateTimeOrNull() =
    runCatching { ____.parse(this) }.getOrNull()`,
    answer: ["LocalDateTime"],
  },
  "auto-viewmodel-finally-loading-fill-14": {
    question: "Complete el bloque que garantiza apagar el indicador de carga aunque falle la operacion.",
    code: `_isLoading.value = true
try {
    refreshBikeState()
} catch (e: Exception) {
    _error.value = e.message
} ____ {
    _isLoading.value = false
}`,
    answer: ["finally"],
  },
  "auto-viewmodel-runcatching-refresh-fill-15": {
    question: "Complete el helper Kotlin usado para capturar excepciones al refrescar el estado desde un ViewModel.",
    code: `____ {
    refreshBikeState()
}.onFailure { error ->
    _error.value = error.message
}`,
    answer: ["runCatching"],
  },
  "auto-compose-scaffold-padding-fill-16": {
    question: "Complete el padding que debe aplicar el contenido interno de un Scaffold para respetar barras superiores e inferiores.",
    code: `Scaffold(
    topBar = { TopAppBar(title = { Text("Pedalean2") }) }
) { innerPadding ->
    BikeList(
        modifier = Modifier.padding(____)
    )
}`,
    answer: ["innerPadding"],
  },
  "auto-compose-items-key-fill-17": {
    question: "Complete la funcion de LazyColumn que pinta una fila por cada elemento de la lista.",
    code: `LazyColumn {
    ____(bikes) { bike ->
        BikeRow(bike = bike)
    }
}`,
    answer: ["items"],
  },
  "auto-manifest-exported-launcher-fill-18": {
    question: "Complete el atributo obligatorio en Android 12+ para una Activity con intent-filter launcher.",
    code: `<activity
    android:name=".presentation.SplashActivity"
    android:____="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>`,
    answer: ["exported"],
  },
  "auto-manifest-internet-fill-19": {
    question: "Complete el permiso del Manifest necesario para que Retrofit pueda llamar a la API.",
    code: `<uses-permission android:name="android.permission.____" />`,
    answer: ["INTERNET"],
  },
  "auto-gradle-ksp-room-fill-20": {
    question: "Complete la configuracion Gradle usada para aplicar el compilador de Room con Kotlin Symbol Processing.",
    code: `dependencies {
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ____(libs.androidx.room.compiler)
}`,
    answer: ["ksp"],
  },
  "auto-gradle-minsdk-fill-21": {
    question: "Complete el campo de defaultConfig que fija la version minima de Android soportada por la app.",
    code: `android {
    defaultConfig {
        applicationId = "com.example.pedalean2"
        ____ = 33
    }
}`,
    answer: ["minSdk"],
  },
  "auto-login-trim-fill-22": {
    question: "Complete la funcion aplicada a email y password antes de construir el TokenRequest en el login.",
    code: `val request = TokenRequest(
    username = credentials.email.____(),
    password = credentials.password.____()
)`,
    answer: ["trim"],
  },
  "auto-login-cache-not-fatal-fill-23": {
    question: "Complete que parte puede fallar tras el login sin invalidar necesariamente que el token se haya obtenido.",
    code: `val token = authRepository.login(credentials)
try {
    userRepository.getUser()
} catch (e: Exception) {
    // Fallo al refrescar la ____ local, pero el login ya devolvio token.
}`,
    answer: ["cache", "caché"],
  },
  "auto-api-user-direct-object-fill-24": {
    question: "Complete el campo que se comprueba para detectar que la respuesta ya contiene directamente un usuario.",
    code: `if (
    jsonObject.has("____") ||
    jsonObject.has("email") ||
    jsonObject.has("username")
) {
    return gson.fromJson(jsonObject, ApiUser::class.java)
}`,
    answer: ["uuid"],
  },
  "auto-api-first-array-fill-25": {
    question: "Complete la propiedad de JsonElement que permite detectar el primer array dentro de una respuesta JSON envoltorio.",
    code: `for ((_, value) in jsonObject.entrySet()) {
    if (value.is____) {
        return value.asJsonArray
    }
}`,
    answer: ["JsonArray", "isJsonArray"],
  },
  "auto-domain-user-nullable-fill-26": {
    question: "Complete el concepto que describe un campo Kotlin declarado con ? porque puede venir sin valor.",
    code: `data class User(
    val uuid: String?,
    val email: String?
)

// String? significa que el campo es ____.`,
    answer: ["nullable"],
  },
  "auto-domain-rent-rents-name-fill-27": {
    question: "Complete el nombre de la propiedad del dominio Bike que guarda la renta activa asociada a la bici.",
    code: `data class Bike(
    val uuid: String,
    val name: String,
    val ____: BikeRent? = null
)`,
    answer: ["rents"],
  },
  "auto-profile-credit-card-fill-28": {
    question: "Complete la etiqueta que se muestra para el codigo de seguridad de la tarjeta en el perfil.",
    code: `ProfileField(
    label = "____",
    value = user.creditCardCvv?.toString()
)`,
    answer: ["CVV", "cvv"],
  },
  "auto-profile-duration-hours-fill-29": {
    question: "Complete la variable que representa las horas al convertir segundos de uso a formato legible.",
    code: `val totalSeconds = user.totalUsageSeconds ?: 0
val ____ = totalSeconds / 3600
val m = (totalSeconds % 3600) / 60`,
    answer: ["h"],
  },
};

let updated = 0;
for (const question of questions) {
  const patch = patches[question.id];
  if (!patch) continue;
  Object.assign(question, patch);
  updated += 1;
}

if (updated !== Object.keys(patches).length) {
  const found = new Set(questions.map((question) => question.id));
  const missing = Object.keys(patches).filter((id) => !found.has(id));
  throw new Error(`No se han encontrado ${missing.length} preguntas: ${missing.join(", ")}`);
}

fs.writeFileSync(questionsPath, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Preguntas completar-codigo actualizadas: ${updated}`);
