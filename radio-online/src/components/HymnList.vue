<template>
  <v-container class="pb-6 px-2">

    <h2 class="text-h6 font-weight-bold text-center mb-1 mt-2">
      <v-icon color="primary" class="mr-1">mdi-book-music</v-icon>
      Himnario
    </h2>
    <p class="text-caption text-center text-medium-emphasis mb-3">
      Escucha o descarga los himnos de la congregación
    </p>

    <!-- Búsqueda + botón modo selección -->
    <div class="d-flex align-center gap-2 mb-2">
      <v-text-field
        v-model="search"
        :placeholder="numericSearch ? 'Número de himno...' : 'Buscar por título o número...'"
        :inputmode="numericSearch ? 'numeric' : 'text'"
        :type="numericSearch ? 'number' : 'text'"
        variant="outlined" density="compact" clearable hide-details
        prepend-inner-icon="mdi-magnify"
        style="flex:1">
        <template #append-inner>
          <v-btn
            :color="numericSearch ? 'primary' : 'default'"
            :variant="numericSearch ? 'flat' : 'text'"
            size="x-small" class="num-toggle-btn"
            @click.stop="numericSearch = !numericSearch">
            #
          </v-btn>
        </template>
      </v-text-field>
      <v-btn
        :color="selectionMode ? 'primary' : 'default'"
        :variant="selectionMode ? 'flat' : 'tonal'"
        size="small" icon
        @click="toggleSelectionMode">
        <v-icon>{{ selectionMode ? 'mdi-check-circle' : 'mdi-playlist-plus' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ selectionMode ? 'Salir selección' : 'Seleccionar himnos' }}
        </v-tooltip>
      </v-btn>
    </div>

    <!-- Filtro categorías -->
    <div class="d-flex flex-wrap ga-1 mb-3">
      <v-chip
        :variant="categoriaActiva === '' ? 'flat' : 'tonal'"
        color="primary" size="x-small" clickable
        @click="categoriaActiva = ''">
        Todos
      </v-chip>
      <v-chip
        :variant="categoriaActiva === '__fav__' ? 'flat' : 'tonal'"
        color="pink" size="x-small" clickable
        prepend-icon="mdi-heart"
        @click="categoriaActiva = '__fav__'">
        Favoritos
        <span v-if="favorites.size > 0" class="ml-1">({{ favorites.size }})</span>
      </v-chip>
      <v-chip
        v-for="cat in categorias" :key="cat"
        :variant="categoriaActiva === cat ? 'flat' : 'tonal'"
        color="primary" size="x-small" clickable
        @click="categoriaActiva = cat">
        {{ cat }}
      </v-chip>
    </div>

    <!-- Barra de selección activa -->
    <v-slide-y-transition>
      <div v-if="selectionMode" class="selection-bar mb-2">
        <v-icon size="16" color="primary">mdi-hand-pointing-up</v-icon>
        <span class="text-caption ml-1">
          {{ selectedIds.size > 0 ? `${selectedIds.size} himno${selectedIds.size !== 1 ? 's' : ''} seleccionado${selectedIds.size !== 1 ? 's' : ''}` : 'Toca los himnos para seleccionar' }}
        </span>
        <v-spacer />
        <v-btn v-if="selectedIds.size > 0" size="x-small" variant="text" color="error" @click="selectedIds.clear()">
          Limpiar
        </v-btn>
        <v-btn v-if="selectedIds.size > 0" size="x-small" variant="flat" color="primary" class="ml-1" @click="startQueue">
          <v-icon size="14" class="mr-1">mdi-play</v-icon>
          Reproducir
        </v-btn>
      </div>
    </v-slide-y-transition>

    <!-- Skeleton -->
    <template v-if="loading">
      <div v-for="i in 10" :key="i" class="hymn-row-skeleton mb-px" />
    </template>

    <!-- Sin resultados -->
    <div v-else-if="filtrados.length === 0" class="text-center py-8 text-medium-emphasis">
      <v-icon size="48" class="mb-2">mdi-music-note-off</v-icon>
      <p>No se encontraron himnos</p>
    </div>

    <!-- Lista compacta -->
    <div v-else class="hymn-list">
      <div v-for="h in filtrados" :key="h.id">

        <!-- Fila principal -->
        <div
          class="hymn-row"
          :class="{
            'hymn-row--active':   playingId === h.id && !selectionMode,
            'hymn-row--selected': selectionMode && selectedIds.has(h.id),
            'hymn-row--expanded': expandedId === h.id
          }"
          @click="onRowClick(h)">

          <!-- Izquierda: checkbox / barras / número -->
          <div class="hymn-num">
            <template v-if="selectionMode">
              <v-icon :color="selectedIds.has(h.id) ? 'primary' : ''" size="18">
                {{ selectedIds.has(h.id) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
              </v-icon>
            </template>
            <template v-else-if="playingId === h.id && !isPaused">
              <span class="hymn-bars"><span /><span /><span /></span>
            </template>
            <template v-else>
              <span class="hymn-num-text">{{ h.numero || '♪' }}</span>
            </template>
          </div>

          <!-- Centro: título + autor -->
          <div class="hymn-info">
            <span class="hymn-title">{{ h.titulo }}</span>
            <span v-if="h.autor" class="hymn-sub">{{ h.autor }}</span>
          </div>

          <!-- Duración -->
          <span v-if="h.duracion" class="hymn-dur">{{ h.duracion }}</span>

          <!-- Expandir letra (solo si tiene) -->
          <button
            v-if="h.letra"
            class="hymn-expand-btn"
            :class="{ 'hymn-expand-btn--open': expandedId === h.id }"
            @click.stop="toggleExpand(h.id)">
            <v-icon size="15">mdi-text</v-icon>
          </button>

          <!-- Descargar MP3 -->
          <button
            v-if="h.url"
            class="hymn-dl-btn"
            :class="{ 'hymn-dl-btn--done': downloadedIds.has(h.id) }"
            :title="downloadedIds.has(h.id) ? 'Descargado' : 'Descargar MP3'"
            @click.stop="downloadHymn(h)">
            <v-progress-circular
              v-if="downloadingId === h.id"
              indeterminate size="13" width="2" color="primary" />
            <v-icon v-else size="16">
              {{ downloadedIds.has(h.id) ? 'mdi-check-circle' : 'mdi-download' }}
            </v-icon>
          </button>

          <!-- Separador + favorito -->
          <div class="hymn-fav-sep" />
          <button
            class="hymn-fav-btn"
            :class="{ 'hymn-fav-btn--active': favorites.has(h.id) }"
            @click.stop="toggleFavorite(h.id)">
            <v-icon size="16">{{ favorites.has(h.id) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </button>
        </div>

        <!-- Panel expandido: letra del himno -->
        <v-expand-transition>
          <div v-if="expandedId === h.id && h.letra" class="hymn-letra-panel">
            <div class="hymn-letra-header">
              <v-icon size="14" class="mr-1" color="primary">mdi-music-note</v-icon>
              <span>{{ h.titulo }}</span>
              <span v-if="h.numero" class="hymn-letra-num">Himno #{{ h.numero }}</span>
              <div class="hymn-letra-size-btns">
                <button class="hymn-size-btn" title="Reducir texto" @click.stop="letraFontSize = Math.max(10, letraFontSize - 1)">A−</button>
                <button class="hymn-size-btn" title="Aumentar texto" @click.stop="letraFontSize = Math.min(22, letraFontSize + 1)">A+</button>
              </div>
            </div>
            <div class="hymn-letra-text" :style="{ fontSize: letraFontSize + 'px' }" v-html="h.letra" />
          </div>
        </v-expand-transition>

      </div>
    </div>

    <!-- Contador -->
    <p v-if="!loading && filtrados.length > 0" class="text-caption text-center text-medium-emphasis mt-2 mb-2">
      {{ filtrados.length }} himno{{ filtrados.length !== 1 ? 's' : '' }}
    </p>

    <!-- ═══ MINI REPRODUCTOR FIJO ═══ -->
    <v-slide-y-reverse-transition>
      <div v-if="playingId" class="hymn-player">

        <!-- Info: número visible + título -->
        <div class="hymn-player__info">
          <div class="hymn-player__title text-truncate">
            <span v-if="playingHymn?.numero" class="hymn-player__num">{{ playingHymn.numero }} · </span>{{ playingHymn?.titulo }}
          </div>
          <div class="hymn-player__sub text-truncate">
            <template v-if="queue.length > 0">
              Lista · {{ queueIndex + 1 }} / {{ queue.length }}
            </template>
            <template v-else>
              {{ playingHymn?.categoria || 'Himnario' }}
            </template>
          </div>
        </div>

        <!-- Controles -->
        <div class="hymn-player__controls">
          <v-btn icon size="x-small" variant="text" color="white" @click="prevHymn">
            <v-icon size="18">mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="flat" color="white" @click="togglePause" class="mx-1">
            <v-icon color="primary">{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="white" @click="nextHymn">
            <v-icon size="18">mdi-skip-next</v-icon>
          </v-btn>
          <!-- WhatsApp: deshabilitado temporalmente para dar espacio al título -->
          <!-- <v-btn icon size="x-small" variant="text" color="white" @click="compartirWhatsApp(playingHymn)">
            <v-icon size="18">mdi-whatsapp</v-icon>
          </v-btn> -->
          <!-- Descarga: deshabilitada temporalmente para dar espacio al título -->
          <!-- <v-btn icon size="x-small" variant="text" color="white" :href="playingHymn?.url" target="_blank" download>
            <v-icon size="18">mdi-download</v-icon>
          </v-btn> -->
          <!-- Velocidad -->
          <v-menu v-model="showSpeedMenu" location="top" :close-on-content-click="true">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                size="x-small" variant="tonal" color="white"
                class="speed-btn">
                {{ playbackSpeed === 1 ? '1x' : `x${playbackSpeed.toFixed(2)}` }}
              </v-btn>
            </template>
            <v-card rounded="xl" elevation="8" class="speed-menu-card">
              <div class="speed-menu-title">Velocidad de reproducción</div>
              <div class="speed-menu-note">Solo aplica al himno actual</div>
              <v-divider class="mb-1" />
              <div
                v-for="sp in SPEEDS" :key="sp"
                class="speed-option"
                :class="{ 'speed-option--active': playbackSpeed === sp }"
                @click="setSpeed(sp)">
                <span class="speed-option__label">{{ sp === 1 ? '1x' : `x${sp.toFixed(2)}` }}</span>
                <span class="speed-option__desc">{{ SPEED_LABELS[sp] }}</span>
                <v-icon v-if="playbackSpeed === sp" size="16" color="primary" class="ml-auto">mdi-check</v-icon>
              </div>
            </v-card>
          </v-menu>

          <v-btn icon size="x-small" variant="text" color="white" @click="stopHymn">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-slide-y-reverse-transition>

  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase'
import { activeAudioSource, stopRadio, registerStopCallback, stopAllExcept } from '@/utils/audioManager'

// ── Estado general ──────────────────────────────────────────────
const search          = ref('')
const numericSearch   = ref(false)
const categoriaActiva = ref('')
const loading         = ref(true)
const hymns           = ref([])
const playingId       = ref(null)
const isPaused        = ref(false)
const playingHymn     = computed(() => hymns.value.find(h => h.id === playingId.value))

// ── Velocidad de reproducción ────────────────────────────────────
const SPEEDS = [1, 1.15, 1.20, 1.25, 1.30]
const SPEED_LABELS = { 1: 'Normal', 1.15: 'Un poco más rápido', 1.20: 'Moderado', 1.25: 'Rápido', 1.30: 'Muy rápido' }
const playbackSpeed  = ref(1)
const showSpeedMenu  = ref(false)

const setSpeed = (sp) => {
  playbackSpeed.value = sp
  if (hymnAudio) hymnAudio.playbackRate = sp
}

// ── Letra / acordeón ────────────────────────────────────────────
const expandedId   = ref(null)
const letraFontSize = ref(13)
const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

// ── Favoritos (localStorage) ────────────────────────────────────
const favorites = reactive(new Set(JSON.parse(localStorage.getItem('hymn_favorites') || '[]')))

const toggleFavorite = (id) => {
  if (favorites.has(id)) favorites.delete(id)
  else favorites.add(id)
  localStorage.setItem('hymn_favorites', JSON.stringify([...favorites]))
}

// ── Descargas ────────────────────────────────────────────────────
const downloadedIds  = reactive(new Set(JSON.parse(localStorage.getItem('hymn_downloaded') || '[]')))
const downloadingId  = ref(null)

const downloadHymn = async (h) => {
  if (downloadingId.value) return
  downloadingId.value = h.id
  try {
    // Descarga vía fetch → blob para que funcione desde Firebase Storage
    const res  = await fetch(h.url)
    const blob = await res.blob()
    const num  = h.numero ? String(h.numero).padStart(3, '0') + ' - ' : ''
    const name = `${num}${h.titulo}.mp3`

    // Chrome/Edge desktop: ofrecemos elegir ubicación y crear carpeta Filadelfia/Himnario
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await showSaveFilePicker({
          suggestedName: name,
          startIn: 'music',
          types: [{ description: 'Audio MP3', accept: { 'audio/mpeg': ['.mp3'] } }],
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
      } catch (e) {
        if (e.name === 'AbortError') { downloadingId.value = null; return }
        throw e
      }
    } else {
      // Móvil y Firefox: descarga estándar
      const url = URL.createObjectURL(blob)
      const a   = Object.assign(document.createElement('a'), { href: url, download: name })
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    }
    downloadedIds.add(h.id)
    localStorage.setItem('hymn_downloaded', JSON.stringify([...downloadedIds]))
  } catch { /* fallo silencioso — la descarga puede cancelarse */ }
  finally { downloadingId.value = null }
}

// ── Modo selección / cola ────────────────────────────────────────
const selectionMode = ref(false)
const selectedIds   = reactive(new Set())
const queue         = ref([])
const queueIndex    = ref(-1)

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) selectedIds.clear()
}

const onRowClick = (h) => {
  if (selectionMode.value) {
    if (selectedIds.has(h.id)) selectedIds.delete(h.id)
    else selectedIds.add(h.id)
    return
  }
  // Modo normal: tap = reproducir / pausar
  if (playingId.value === h.id) { togglePause(); return }
  playDirect(h)
}

const startQueue = () => {
  if (selectedIds.size === 0) return
  // Preserva orden de filtrados
  queue.value = filtrados.value.filter(h => selectedIds.has(h.id))
  queueIndex.value = 0
  selectionMode.value = false
  selectedIds.clear()
  playDirect(queue.value[0])
}

// ── Filtros ──────────────────────────────────────────────────────
const categorias = computed(() => {
  const set = new Set(hymns.value.map(h => h.categoria).filter(Boolean))
  return [...set].sort()
})

const filtrados = computed(() => {
  let lista = hymns.value
  if (categoriaActiva.value === '__fav__') {
    lista = lista.filter(h => favorites.has(h.id))
  } else if (categoriaActiva.value) {
    lista = lista.filter(h => h.categoria === categoriaActiva.value)
  }
  if (search.value?.trim()) {
    const q = search.value.trim().toLowerCase()
    lista = lista.filter(h =>
      h.titulo.toLowerCase().includes(q) ||
      String(h.numero).includes(q)
    )
  }
  return lista
})

// ── Audio ────────────────────────────────────────────────────────
let hymnAudio  = null
let unsubscribe = null

onMounted(() => {
  registerStopCallback('himnario', stopHymn)
  const q = query(collection(db, 'hymns'), orderBy('numero', 'asc'))
  unsubscribe = onSnapshot(q, (snap) => {
    hymns.value   = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
})

onUnmounted(() => { unsubscribe?.(); stopHymn() })

// Detener si otra fuente toma el control (radio, devocional)
watch(activeAudioSource, (src) => { if (src && src !== 'himnario') stopHymn() })

const playDirect = (h) => {
  stopAllExcept('himnario')           // detiene radio, devocional, spotify
  activeAudioSource.value = 'himnario'
  if (hymnAudio) { hymnAudio.pause(); hymnAudio = null }
  playbackSpeed.value = 1          // cada himno nuevo siempre arranca en 1x
  expandedId.value = null           // cierra letra al cambiar himno
  hymnAudio = new Audio(h.url)
  hymnAudio.playbackRate = 1
  hymnAudio.play()
  hymnAudio.onended = () => nextHymn()
  playingId.value = h.id
  isPaused.value  = false
}

const togglePause = () => {
  if (!hymnAudio) return
  if (isPaused.value) { hymnAudio.play(); isPaused.value = false }
  else                { hymnAudio.pause(); isPaused.value = true  }
}

const stopHymn = () => {
  if (hymnAudio) { hymnAudio.pause(); hymnAudio = null }
  playingId.value  = null
  isPaused.value   = false
  queue.value      = []
  queueIndex.value = -1
  if (activeAudioSource.value === 'himnario') activeAudioSource.value = null
}

const nextHymn = () => {
  if (queue.value.length > 0) {
    const next = queueIndex.value + 1
    if (next < queue.value.length) { queueIndex.value = next; playDirect(queue.value[next]) }
    else { queue.value = []; queueIndex.value = -1; stopHymn() }
    return
  }
  const idx  = filtrados.value.findIndex(h => h.id === playingId.value)
  const next = filtrados.value[idx + 1]
  if (next) playDirect(next)
  else stopHymn()
}

const prevHymn = () => {
  if (queue.value.length > 0) {
    const prev = queueIndex.value - 1
    if (prev >= 0) { queueIndex.value = prev; playDirect(queue.value[prev]) }
    return
  }
  const idx  = filtrados.value.findIndex(h => h.id === playingId.value)
  const prev = filtrados.value[idx - 1]
  if (prev) playDirect(prev)
}

const compartirWhatsApp = (h) => {
  if (!h) return
  const texto = `🎵 *${h.titulo}*${h.autor ? ' — ' + h.autor : ''}\n\nEscúchalo en La Voz de Filadelfia:\n${h.url}`
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
}
</script>

<style scoped>
/* ── Lista ── */
.hymn-list {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.hymn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.07);
  min-height: 44px;
}
.hymn-row:last-child { border-bottom: none; }
.hymn-row:hover      { background: rgba(var(--v-theme-primary), 0.06); }

.hymn-row--active   { background: rgba(var(--v-theme-primary), 0.12) !important; }
.hymn-row--selected { background: rgba(var(--v-theme-primary), 0.10) !important; }
.hymn-row--active .hymn-title   { color: rgb(var(--v-theme-primary)); font-weight: 600; }
.hymn-row--selected .hymn-title { color: rgb(var(--v-theme-primary)); }

/* Columna número */
.hymn-num {
  width: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hymn-num-text {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-weight: 600;
}

/* Info */
.hymn-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.hymn-title {
  font-size: 13px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hymn-sub {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hymn-dur {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.38);
  flex-shrink: 0;
}

/* Botón descargar */
.hymn-dl-btn {
  background: none;
  border: none;
  padding: 4px 5px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.28);
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s;
}
.hymn-dl-btn:hover  { color: rgb(var(--v-theme-primary)); }
.hymn-dl-btn--done  { color: #4caf50 !important; }

/* Separador antes del corazón */
.hymn-fav-sep {
  width: 1px;
  height: 20px;
  background: rgba(var(--v-border-color), 0.2);
  flex-shrink: 0;
  margin: 0 2px;
}

/* Botón expandir letra */
.hymn-expand-btn {
  background: none;
  border: none;
  padding: 4px 5px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.3);
  flex-shrink: 0;
  transition: transform 0.2s, color 0.15s;
  line-height: 1;
}
.hymn-expand-btn:hover     { color: rgb(var(--v-theme-primary)); }
.hymn-expand-btn--open     { color: rgb(var(--v-theme-primary)); }
.hymn-row--expanded        { background: rgba(var(--v-theme-primary), 0.05); }

/* Panel de letra */
.hymn-letra-panel {
  background: rgba(var(--v-theme-primary), 0.04);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.07);
  padding: 10px 12px 14px 12px;
}
.hymn-letra-header {
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 8px;
  gap: 2px;
}
.hymn-letra-num {
  margin-left: auto;
  font-weight: 400;
  opacity: 0.6;
  font-size: 10px;
}
.hymn-letra-size-btns {
  display: flex;
  gap: 3px;
  margin-left: 6px;
}
.hymn-size-btn {
  background: rgba(var(--v-theme-primary), 0.1);
  border: none;
  border-radius: 5px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  line-height: 1.6;
}
.hymn-size-btn:hover { background: rgba(var(--v-theme-primary), 0.2); }

.hymn-letra-text {
  line-height: 1.7;
  font-family: inherit;
  color: rgba(var(--v-theme-on-surface), 0.85);
  margin: 0;
}
/* Estilos para el HTML formateado dentro de la letra */
.hymn-letra-text :deep(strong) { font-weight: 700; }
.hymn-letra-text :deep(em)     { font-style: italic; }
.hymn-letra-text :deep(div)    { margin: 2px 0; }
.hymn-letra-text :deep(p)      { margin: 4px 0; }

/* Favorito */
.hymn-fav-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.25);
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s, transform 0.15s;
}
.hymn-fav-btn:hover         { color: #e91e63; transform: scale(1.2); }
.hymn-fav-btn--active       { color: #e91e63 !important; }

/* Botón toggle numérico en el buscador */
.num-toggle-btn {
  font-weight: 700;
  font-size: 12px;
  min-width: 24px !important;
  height: 24px !important;
  padding: 0 6px !important;
  border-radius: 6px;
}

/* Barras animadas */
.hymn-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.hymn-bars span {
  display: block;
  width: 3px;
  background: rgb(var(--v-theme-primary));
  border-radius: 1px;
  animation: bar-bounce 0.8s ease-in-out infinite alternate;
}
.hymn-bars span:nth-child(1) { height: 6px;  animation-delay: 0s; }
.hymn-bars span:nth-child(2) { height: 12px; animation-delay: 0.2s; }
.hymn-bars span:nth-child(3) { height: 8px;  animation-delay: 0.4s; }

@keyframes bar-bounce {
  from { transform: scaleY(0.4); }
  to   { transform: scaleY(1);   }
}

/* Skeleton */
.hymn-row-skeleton {
  height: 44px;
  margin-bottom: 1px;
  background: linear-gradient(90deg,
    rgba(var(--v-theme-on-surface), 0.05) 25%,
    rgba(var(--v-theme-on-surface), 0.10) 50%,
    rgba(var(--v-theme-on-surface), 0.05) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0;  }
  100% { background-position: -200% 0; }
}

/* Barra de selección */
.selection-bar {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px dashed rgba(var(--v-theme-primary), 0.4);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
}

/* ── Mini reproductor ── */
.hymn-player {
  position: fixed;
  bottom: 66px;
  left: 12px;
  right: 12px;
  z-index: 900;
  background: rgb(var(--v-theme-primary));
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.hymn-player__info {
  flex: 1;
  min-width: 0;
}
.hymn-player__title {
  font-size: 13px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
}
.hymn-player__num {
  opacity: 0.75;
  font-weight: 400;
}
.hymn-player__sub {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}
.hymn-player__controls {
  display: flex;
  align-items: center;
}

/* Botón velocidad en el reproductor */
.speed-btn {
  font-size: 11px !important;
  font-weight: 700 !important;
  min-width: 38px !important;
  height: 26px !important;
  padding: 0 6px !important;
  border-radius: 8px !important;
  color: white !important;
  border: 1px solid rgba(255,255,255,0.4) !important;
  background: rgba(255,255,255,0.15) !important;
}

/* Menú de velocidades */
.speed-menu-card {
  padding: 8px 0 4px;
  min-width: 220px;
}
.speed-menu-title {
  font-size: 12px;
  font-weight: 700;
  padding: 0 16px 2px;
  opacity: 0.9;
}
.speed-menu-note {
  font-size: 10px;
  padding: 0 16px 6px;
  opacity: 0.5;
}
.speed-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.12s;
}
.speed-option:hover { background: rgba(var(--v-theme-primary), 0.08); }
.speed-option--active { background: rgba(var(--v-theme-primary), 0.1); }
.speed-option__label {
  font-size: 14px;
  font-weight: 700;
  min-width: 40px;
  color: rgb(var(--v-theme-primary));
}
.speed-option__desc {
  font-size: 12px;
  opacity: 0.65;
  flex: 1;
}
</style>
