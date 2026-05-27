# Estudio de examen Pedalean2

App estatica para entrenar preguntas de la practica sin tocar el codigo de entrega.

## Abrir

Desde esta carpeta:

```powershell
node serve-local.js
```

Luego abre:

```text
http://localhost:8080
```

## Estructura

- `index.html`: interfaz.
- `styles.css`: estilos.
- `app.js`: motor de tests, informes y refuerzo.
- `data/questions.json`: banco de preguntas por tema, tipo y dificultad.

El navegador guarda el historial de resultados en `localStorage`.

## Actualizaciones desde GitHub

La app comprueba el repo publico:

```text
https://github.com/Alfonso-Sanchez/ASM-EXAMEN-PRACTICO
```

Para que la autoactualizacion pueda aplicarse, abre la app con:

```powershell
node serve-local.js
```

El navegador por si solo no puede sobrescribir archivos locales. Por eso el boton `Actualizar` pide al servidor local que descargue desde GitHub y reemplace estos archivos si existen en el repo:

- `index.html`
- `app.js`
- `styles.css`
- `README.md`
- `data/questions.json`

Ahora mismo el repo publico solo contiene licencia/metadatos. Cuando subas esos archivos al repo, el boton `Actualizar` podra detectar el commit nuevo y aplicar la update.
