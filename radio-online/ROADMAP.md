# Hoja de Ruta — La Voz de Filadelfia

> Documento de planificación para el desarrollo futuro de la app.
> Actualizado: abril 2026

---

## Estado actual (completado ✅)

- [x] **Íconos MDI offline** — fuente woff2 embebida como base64 dentro del CSS (vite.config.mjs
      `assetsInlineLimit`). Los íconos funcionan sin internet desde el primer deploy.
      CSS pasó de 725KB a 1,263KB; no existe archivo woff2 separado en el bundle.
- [x] **Audio global — stopAll()** — `audioManager.js` tiene `stopAll()` que detiene radio,
      himnario y devocional a la vez. Se llama al cambiar de sección y al abrir AdminPanel.
- [x] **AdminPanel — tabs siempre visibles** — layout con flexbox en v-card:
      `d-flex flex-column / height:100%`, header+tabs con `flex-shrink:0`,
      v-card-text con `flex:1; overflow-y:auto; min-height:0`. Tabs nunca se ocultan.
- [x] **Guard offline HymnList** — si el himno no está en IndexedDB y no hay internet,
      muestra snackbar de advertencia y NO abre el reproductor.
- [x] **Guard offline DevotionalList** — igual que HymnList para devocionales.
- [x] **Banner sin conexión** — HymnList y DevotionalList muestran un alert amarillo
      "Sin conexión — mostrando contenido guardado" cuando `navigator.onLine === false`.
- [x] **Detener audio al navegar** — `watch(page)` en App.vue llama `stopAll()` al cambiar sección.
- [x] **Detener audio al entrar AdminPanel** — `openDrawer()` llama `stopAll()` antes de abrir.
- [x] Descarga offline con IndexedDB — himnos y devocionales se guardan en el navegador
      con `useOfflineAudio.js`. El reproductor lee de IndexedDB primero (offline),
      y si no existe usa la URL remota (online). Ícono ✅ verde cuando está en caché.
- [x] Timeout 12s en descarga de himnos y devocionales — si CORS bloquea la descarga,
      aparece un snackbar rojo de error en vez de un spinner infinito. `Promise.race()`.
- [x] Categorías predefinidas en admin himnario — lista de 16 categorías estándar más
      cualquier categoría extra ya usada en himnos subidos. El campo sigue siendo libre.
- [x] Tamaño de texto A+/A− en devocionales — igual que en el himnario (botones en el
      encabezado del panel expandido). Rango 10–22px, persiste mientras la sesión esté abierta.
- [x] Barra flotante de formato en editores (AdminPanel) — aparece al seleccionar texto,
      doble clic = palabra, triple clic = párrafo. Negrita, cursiva, alineación.
- [x] Pegado sin formato en editores — `Ctrl+V` inserta solo texto plano, sin estilos externos.
- [x] Menú clic derecho en editores de himnario y devocional (PC).
- [x] Ícono auricular eliminado de la lista de devocionales.
- [x] Descarga en fila para devocionales (igual que himnario).
- [x] Espacio izquierdo del panel expandido de devocional eliminado.



- [x] Radio en vivo con metadatos (Centova Cast)
- [x] Badge EN VIVO / FUERA DE AIRE / RECONECTANDO
- [x] Reconexión automática si el stream falla
- [x] Catálogo de episodios con Firestore (tiempo real)
- [x] Panel de administración con autenticación email + Google
- [x] Widget de Spotify (show completo auto-actualizable)
- [x] Redes sociales, contacto, programación, WhatsApp flotante
- [x] Diseño limpio con Vuetify, secciones alternadas
- [x] PWA instalable — icono en pantalla de inicio, splash screen, abre sin barra del navegador
- [x] Banner de instalación + activar notificaciones en la app (sin ir a opciones del navegador)
- [x] Notificaciones push — admin envía "¡Estamos en vivo!" a todos los suscriptores (FCM)
- [x] Himnario completo — lista compacta, búsqueda, favoritos, lista de reproducción, velocidad
- [x] Letra del himno expandible por acordeón (campo en Firestore, admin puede agregar)
- [ ] **Barra de formato de letra (negrita, cursiva, centrar, justificar) — botones visibles pero no funcionan correctamente, pendiente depuración**
- [x] Devocional público — lista con acordeón, audio, favoritos, lista de reproducción, velocidad
- [x] Coordinación de audio global — himnario/devocional/radio no suenan juntos

---

## QUÉ ES PWA Y MEDIA SESSION API

### PWA (Progressive Web App)

Tu app web se comporta como app nativa del celular — sin App Store ni Google Play.

**Cómo funciona:**

1. El usuario abre la app en Chrome/Safari en su celular
2. Aparece un banner: "Instalar La Voz de Filadelfia"
3. Se instala en la pantalla de inicio igual que WhatsApp
4. Se abre sin barra del navegador, como app real
5. Carga instantáneo con internet lento (usa caché)
6. Puede recibir notificaciones push ("¡Estamos en vivo!")

**Implementación técnica:** `vite-plugin-pwa` + `manifest.json` + Service Worker.
Tiempo estimado: 2-3 horas.

### Media Session API

Le dice al sistema operativo que la app está reproduciendo audio.
Cuando el usuario bloquea el teléfono, aparece en pantalla de bloqueo:

```
📻 La Voz de Filadelfia
   Magos Oriente — Fernando Miranda
   [⏮]  [⏸]  [⏭]
```

Sin desbloquear el teléfono. Igual que Spotify o YouTube Music.
**Implementación:** 10 líneas de JavaScript en audioManager.js. Muy fácil.

### Centova Cast — Audio On Demand

Centova tiene una función "On Demand" donde puedes subir un MP3
y te da una URL de streaming directa (como el stream de la radio).
Ideal para devocionales grabados o mensajes especiales sin depender
de Spotify. Revisar en tu panel de Centova: Sección "Media" o "On Demand".

---

## FASE A — Panel Admin Expandido (ALTA PRIORIDAD)

### Por qué

Actualmente para cambiar el nombre de la radio, la programación,
agregar himnos o publicar un devocional hay que editar código en VSCode
y redesplegar. El objetivo es que todo sea gestionable desde el panel
admin de la misma app, desde el celular si hace falta.

### A.1 — Configuración general de la app

Desde el panel admin, sin tocar código:

- [ ] Nombre y slogan de la radio (aparece en el header)
- [ ] Número de WhatsApp
- [ ] Links de redes sociales (Facebook, YouTube, Spotify)
- [ ] Horario de programación (editar los programas y horarios)
- [ ] Color principal del tema (paleta de Vuetify)
- [ ] Foto del predicador / hosts

**Implementación:** Colección `config` en Firestore con un único documento.
Los componentes leen de Firestore en vez de tener los valores hardcodeados.

### A.2 — Himnario con subida de MP3

- [ ] Subir archivos MP3 directamente desde el panel admin
- [ ] Campos: número de himno, título, autor, categoría (alabanza, adoración, etc.)
- [ ] Se sube a Firebase Storage (5 GB gratis ≈ 1,000 himnos a buena calidad)
- [ ] Lista/búsqueda para el usuario en la sección Himnario
- [ ] Reproductor con anterior / play / siguiente

**Implementación:**

```
Firebase Storage: gs://filadelfia-b6238.appspot.com/hymns/001-cuanto-me-ama.mp3
Firestore colección: hymns/ { numero, titulo, autor, categoria, storage_url }
```

### A.3 — Devocional diario con audio grabado

Dos formas de publicar:

1. **Texto:** El admin escribe título + versículo + reflexión desde el panel
2. **Audio grabado:** El admin toca un botón, graba su voz directamente
   en el celular/computador, y se sube automáticamente a Firebase Storage

**Implementación:** API `MediaRecorder` del navegador (funciona en Chrome/Firefox).
No necesita ninguna app externa. El audio queda en Firebase Storage y
el link en Firestore.

**Alternativa Centova:** Si Centova tiene On Demand activado, el devocional
puede ser un stream especial — el admin sube el MP3 a Centova y pega el
link en el panel admin.

### A.4 — Solicitudes de oración (desde el panel)

- [ ] El admin ve todas las solicitudes recibidas
- [ ] Puede marcarlas como "orado" o archivarlas
- [ ] Contador de intercesores por solicitud

---

## FASE B — Himnario para el Usuario (ALTA PRIORIDAD)

### Sección visible en la app

- [ ] Lista de himnos con número, título, categoría
- [ ] Búsqueda por número o palabras del título
- [ ] **Himno del día** (rotación automática por fecha del año)
- [ ] Reproductor integrado (usa audioManager — para radio al abrir un himno)
- [ ] Letra del himno mientras suena (texto en Firestore)
- [ ] Favoritos (guardados en localStorage del dispositivo)
- [ ] Compartir himno por WhatsApp

### Componentes a crear

- `src/components/HymnPlayer.vue` — reproductor con controles
- `src/components/HymnList.vue` — lista navegable con búsqueda
- `src/components/HymnOfDay.vue` — card del himno del día

### Categorías sugeridas para adventistas

- Alabanza y adoración
- Himnos clásicos del himnario adventista
- Música de jóvenes (Reavivados por su Palabra, etc.)
- Música instrumental (para culto de estudio)
- Villancicos navideños adventistas

---

## FASE C — Devocional Diario (EN PROGRESO 🔄)

### Admin panel ✅ (implementado, en pruebas)
- [x] Título, versículo, texto de reflexión
- [x] Grabación de audio directo desde el celular (estilo WhatsApp)
- [x] Pausa y reanudación durante la grabación (sin perder lo grabado)
- [x] Ecualizador de micrófono: graves / medios / brillo (-10 a +10 dB)
- [x] O subir MP3 pregrabado
- [x] Lista de devocionales publicados con opción a borrar
- [x] Editar devocional ya publicado
- [ ] Música de fondo desde himnario mezclada en la grabación
      ⚠️  Requiere configurar CORS en Firebase Storage:
      `gsutil cors set cors.json gs://filadelfia-b6238.firebasestorage.app`

### Sección pública (pendiente — esperar pruebas del admin)
- [ ] Mostrar devocional del día con texto y audio
- [ ] Historial de devocionales anteriores
- [ ] Botón compartir por WhatsApp
- [ ] Imagen de fondo inspiradora

### FASE C.2 — Colaboradores de devocionales (FUTURO)
Permitir que otros pastores/colaboradores publiquen devocionales sin acceso al admin completo.
- [ ] Admin agrega email de colaborador desde el panel
- [ ] Colaborador se loguea y ve SOLO la pestaña Devocional
- [ ] Puede grabar y publicar, no puede borrar episodios ni enviar notificaciones
- [ ] Cada devocional muestra quién lo escribió
- [ ] Reglas Firestore verifican que el email esté en colección `colaboradores`

---

## FASE D — Media Session API (MEDIA PRIORIDAD — fácil)

### Qué logra

Controles de audio en pantalla de bloqueo del celular:

- Título del programa / himno que está sonando
- Foto de portada
- Botones play/pausa, anterior, siguiente

### Implementación

Agregar en `audioManager.js`:

```javascript
if ("mediaSession" in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentSong,
    artist: currentArtist,
    artwork: [{ src: coverImage, sizes: "512x512", type: "image/png" }],
  });
  navigator.mediaSession.setActionHandler("play", () => playRadio(streamUrl));
  navigator.mediaSession.setActionHandler("pause", () => stopRadio());
}
```

Tiempo estimado: 30 minutos.

---

## FASE E — PWA Instalable ✅ COMPLETADO

- `vite-plugin-pwa` configurado con manifest, service worker y caché offline
- Rutas de Firebase Auth excluidas del service worker
- App instalable en Android/iOS desde el navegador

---

## FASE F — Solicitudes de Oración Públicas (MEDIA PRIORIDAD)

### Para el usuario

- [ ] Formulario: nombre (opcional anónimo) + motivo
- [ ] Ver solicitudes de otros (las que son públicas)
- [ ] Botón "Orar por esto" — contador visible
- [ ] Notificación al admin cuando llega una nueva solicitud

---

## FASE G — Notificaciones Push (BAJA PRIORIDAD)

### Casos de uso

- "¡La Voz de Filadelfia está EN VIVO ahora!" — cuando comienza transmisión
- "Nuevo episodio: [título]" — cuando el admin publica uno
- "Devocional del día disponible" — cada mañana a las 6am

### Implementación

Firebase Cloud Messaging (FCM) — incluido en el plan gratuito.
Requiere PWA implementada primero (Fase E).

---

## FASE H — Mejoras del Reproductor de Radio (BAJA PRIORIDAD)

### Contador de oyentes en vivo

La API de Centova ya devuelve `listeners`. Mostrar:
"👥 34 personas escuchando ahora" — crea sentido de comunidad.

### Velocidad de reproducción para podcasts

Opciones 1x / 1.5x / 2x en el reproductor de episodios.

### Historial de transmisiones

Si Centova guarda grabaciones, listarlas como "Transmisiones pasadas".

---

## Hosting de audio — Opciones gratuitas

| Opción                | Almacenamiento   | Descarga/mes        | Mejor para                        |
| --------------------- | ---------------- | ------------------- | --------------------------------- |
| **Firebase Storage**  | 5 GB gratis      | 1 GB/día            | Himnos propios, control total     |
| **Archive.org**       | Ilimitado        | Ilimitado           | Himnos dominio público            |
| **Cloudflare R2**     | 10 GB gratis     | 10 GB gratis        | Volumen mayor                     |
| **Centova On Demand** | Depende del plan | Incluido en tu plan | Devocionales, mensajes especiales |

**Recomendación:** Firebase Storage para himnos grabados por la iglesia +
Archive.org para complementar con himnos clásicos de dominio público.

---

---

## PENDIENTE — Retomar próxima sesión

### Offline — Estado tras sesión de abril 17, 2026
- **Íconos offline** ✅ — woff2 embebido en CSS. Deploy hecho. El usuario debe abrir la app
  CON internet una vez para que el nuevo SW se instale; después funcionan offline.
- **Guard offline HymnList / DevotionalList** ✅ — código desplegado.
- **Banner sin conexión** ✅ — código desplegado.
- **Verificar en celular** — usuario debe confirmar que íconos aparecen offline y que los guards funcionan.

### Mejoras pendientes para offline
- [ ] **Gestionar almacenamiento** — mostrar cuánto espacio usan los archivos guardados
      y botón para borrar caché individual o total (usar `deleteAudio` de `useOfflineAudio.js`)
- [ ] **Descarga masiva** — botón "Descargar todos los favoritos" en himnario/devocional
- [ ] **Formateo de texto en editores** — botones de formato (barra flotante + clic derecho)
      están implementados pero pendiente verificar que `syncEditor()` funciona correctamente
      en todos los casos (especialmente `removeFormat`)

### Config app desde admin (Fase A.1) — Pendiente
- [ ] Nombre y slogan desde Firestore (actualmente hardcodeados en Header.vue)
- [ ] WhatsApp y redes sociales desde Firestore (actualmente en `useAppConfig.js`)

### CORS Firebase Storage — Pendiente (bloquea descarga offline de himnos/devocionales)

El archivo `cors.json` ya existe en `radio-online/cors.json`. Falta aplicarlo.

**Opción A — Google Cloud SDK (gsutil):**
1. Instalar desde: https://cloud.google.com/sdk/docs/install
2. En terminal: `gcloud auth login`
3. Luego: `gsutil cors set cors.json gs://filadelfia-b6238.firebasestorage.app`

**Opción B — Google Cloud Console (sin instalar nada):**
1. Ir a https://console.cloud.google.com
2. Proyecto: filadelfia-b6238
3. Cloud Shell (botón `>_` arriba a la derecha)
4. Subir `cors.json` y ejecutar el comando gsutil

Sin esto las descargas offline fallan con error CORS. El timeout de 12s evita el spinner infinito
pero **no soluciona la raíz del problema**.

### Media Session API (Fase D) — Fácil, 30 min
Controles en pantalla de bloqueo del celular. Ver `audioManager.js`.

---

## Próximos pasos sugeridos (en orden)

| #   | Fase | Descripción                              | Dificultad | Estado        |
| --- | ---- | ---------------------------------------- | ---------- | ------------- |
| 1   | B    | Subir letras de himnos (536+) al admin   | Contenido  | En progreso   |
| 2   | C    | CORS Storage → música de fondo funcional | Fácil      | Pendiente     |
| 3   | A.1  | Config app desde admin (nombre, links…)  | Media      | Pendiente     |
| 4   | F    | Solicitudes de oración pública           | Media      | Pendiente     |
| 5   | D    | Media Session API (pantalla de bloqueo)  | Fácil      | Pendiente     |
| 6   | I    | App Android nativa (TWA / PWABuilder)    | Media      | Planificado   |
| 7   | C.2  | Colaboradores de devocionales            | Alta       | Futuro        |

---

## FASE I — App Android Nativa (PLANIFICADO)

### Opciones disponibles

| Método | Costo | Dificultad | Resultado |
|--------|-------|-----------|-----------|
| **PWABuilder** (Microsoft) | Gratis | Fácil | APK distribuible directamente (sin Play Store) |
| **TWA + Play Store** | $25 una vez | Media | App en Google Play Store |
| **Capacitor (Ionic)** | Gratis | Media | APK/AAB nativo con acceso a cámara, etc. |

### Ruta más económica (sin cuenta Google Play)
1. Ir a **pwabuilder.com** → pegar la URL de la app
2. Descargar el APK generado automáticamente
3. Distribuir el APK por WhatsApp o enlace directo a los oyentes
4. El oyente lo instala activando "Fuentes desconocidas" en su Android

### Ruta Play Store ($25 una vez para siempre)
1. Crear cuenta en **Google Play Console** (pago único $25)
2. Usar **PWABuilder** o **Bubblewrap** para generar el AAB
3. Subir el AAB a Play Store
4. La app queda disponible para buscar e instalar desde Google Play

### Ventajas de ir a Play Store
- Los oyentes la encuentran buscando "Filadelfia Radio"
- Actualizaciones automáticas
- Mayor credibilidad y confianza
- Acceso a funciones nativas adicionales si se necesitan

**Nota:** La PWA actual ya funciona perfectamente como app en Android.
La versión nativa solo añade presencia en Play Store y actualizaciones automáticas.

---

## Estructura Firestore futura

```
episodes/          ← ✅ implementado
config/
  └── app/         ← nombre, links, horario, colores (Fase A.1)
hymns/             ← numero, titulo, autor, categoria, url_mp3 (Fase A.2/B)
devotionals/       ← fecha, versiculo, reflexion, url_audio (Fase A.3/C)
prayer_requests/   ← nombre, motivo, publico, intercesores (Fase F)
events/            ← titulo, fecha, descripcion (futuro)
```

---

_Todas las fases usan Firebase (filadelfia-b6238) sin costo adicional
dentro de los límites del plan gratuito Spark para una audiencia pequeña/mediana._
