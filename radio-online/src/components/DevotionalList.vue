<template>
  <v-container class="pb-6 px-2">

    <h2 class="text-h6 font-weight-bold text-center mb-1 mt-2">
      <v-icon color="primary" class="mr-1">mdi-book-open-variant</v-icon>
      Devocionales
    </h2>
    <p class="text-caption text-center text-medium-emphasis mb-3">
      Reflexiones y mensajes del pastor
    </p>

    <!-- Búsqueda + modo selección -->
    <div class="d-flex align-center gap-2 mb-2">
      <v-text-field
        v-model="search"
        placeholder="Buscar por título o versículo..."
        variant="outlined" density="compact" clearable hide-details
        prepend-inner-icon="mdi-magnify"
        style="flex:1" />
      <v-btn
        :color="selectionMode ? 'primary' : 'default'"
        :variant="selectionMode ? 'flat' : 'tonal'"
        size="small" icon
        @click="toggleSelectionMode">
        <v-icon>{{ selectionMode ? 'mdi-check-circle' : 'mdi-playlist-plus' }}</v-icon>
        <v-tooltip activator="parent" location="bottom">
          {{ selectionMode ? 'Salir selección' : 'Seleccionar para lista' }}
        </v-tooltip>
      </v-btn>
    </div>

    <!-- Filtro Favoritos -->
    <div class="d-flex flex-wrap ga-1 mb-3">
      <v-chip
        :variant="showFavOnly ? 'flat' : 'tonal'"
        color="pink" size="x-small" clickable
        prepend-icon="mdi-heart"
        @click="showFavOnly = !showFavOnly">
        Favoritos
        <span v-if="favorites.size > 0" class="ml-1">({{ favorites.size }})</span>
      </v-chip>
    </div>

    <!-- Barra de selección activa -->
    <v-slide-y-transition>
      <div v-if="selectionMode" class="devo-selection-bar mb-2">
        <v-icon size="16" color="primary">mdi-hand-pointing-up</v-icon>
        <span class="text-caption ml-1">
          {{ selectedIds.size > 0
            ? `${selectedIds.size} devocional${selectedIds.size !== 1 ? 'es' : ''} seleccionado${selectedIds.size !== 1 ? 's' : ''}`
            : 'Toca para seleccionar' }}
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
      <div v-for="i in 6" :key="i" class="devo-skeleton mb-1" />
    </template>

    <!-- Sin resultados -->
    <div v-else-if="filtrados.length === 0" class="text-center py-8 text-medium-emphasis">
      <v-icon size="48" class="mb-2">mdi-book-off-outline</v-icon>
      <p>No se encontraron devocionales</p>
    </div>

    <!-- Lista -->
    <div v-else class="devo-list">
      <div v-for="d in filtrados" :key="d.id">

        <!-- Fila principal -->
        <div
          class="devo-row"
          :class="{
            'devo-row--active':   playingId === d.id && !selectionMode,
            'devo-row--selected': selectionMode && selectedIds.has(d.id),
            'devo-row--expanded': expandedId === d.id
          }"
          @click="onRowClick(d)">

          <!-- Izquierda: checkbox / barras / fecha -->
          <div class="devo-date">
            <template v-if="selectionMode">
              <v-icon :color="selectedIds.has(d.id) ? 'primary' : ''" size="18">
                {{ selectedIds.has(d.id) ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline' }}
              </v-icon>
            </template>
            <template v-else-if="playingId === d.id && !isPaused">
              <span class="devo-bars"><span /><span /><span /></span>
            </template>
            <template v-else>
              <span class="devo-day">{{ shortDay(d.createdAt) }}</span>
              <span class="devo-month">{{ shortMonth(d.createdAt) }}</span>
            </template>
          </div>

          <!-- Título + versículo -->
          <div class="devo-info">
            <span class="devo-title">{{ d.titulo }}</span>
            <span v-if="d.versiculo" class="devo-sub">{{ d.versiculo }}</span>
          </div>

          <!-- Expandir texto -->
          <button
            class="devo-expand-btn"
            :class="{ 'devo-expand-btn--open': expandedId === d.id }"
            @click.stop="toggleExpand(d.id)">
            <v-icon size="16">mdi-chevron-down</v-icon>
          </button>

          <!-- Descargar audio -->
          <button
            v-if="d.audioUrl"
            class="devo-dl-btn"
            :class="{ 'devo-dl-btn--done': downloadedIds.has(d.id) }"
            :title="downloadedIds.has(d.id) ? 'Descargado' : 'Descargar audio'"
            @click.stop="downloadDevo(d)">
            <v-progress-circular
              v-if="downloadingId === d.id"
              indeterminate size="13" width="2" color="primary" />
            <v-icon v-else size="16">
              {{ downloadedIds.has(d.id) ? 'mdi-check-circle' : 'mdi-download' }}
            </v-icon>
          </button>

          <!-- Separador + favorito -->
          <div class="devo-fav-sep" />
          <button
            class="devo-fav-btn"
            :class="{ 'devo-fav-btn--active': favorites.has(d.id) }"
            @click.stop="toggleFavorite(d.id)">
            <v-icon size="16">{{ favorites.has(d.id) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
          </button>
        </div>

        <!-- Panel expandido: reflexión + botón audio -->
        <v-expand-transition>
          <div v-if="expandedId === d.id" class="devo-expand-panel">
            <div class="devo-reflexion" v-html="d.reflexion" />
            <div class="devo-expand-actions">
              <v-btn
                size="small" variant="tonal" color="green"
                prepend-icon="mdi-whatsapp"
                @click.stop="compartirWhatsApp(d)">
                Compartir
              </v-btn>
            </div>
          </div>
        </v-expand-transition>

      </div>
    </div>

    <!-- Contador -->
    <p v-if="!loading && filtrados.length > 0" class="text-caption text-center text-medium-emphasis mt-2 mb-2">
      {{ filtrados.length }} devocional{{ filtrados.length !== 1 ? 'es' : '' }}
    </p>

    <!-- ═══ MINI REPRODUCTOR ═══ -->
    <v-slide-y-reverse-transition>
      <div v-if="playingId" class="devo-player">

        <div class="devo-player__info">
          <div class="devo-player__title text-truncate">{{ playingDevo?.titulo }}</div>
          <div class="devo-player__sub text-truncate">
            <template v-if="queue.length > 0">
              Lista · {{ queueIndex + 1 }} / {{ queue.length }}
            </template>
            <template v-else>
              {{ playingDevo?.versiculo || 'Devocional' }}
            </template>
          </div>
        </div>

        <div class="devo-player__controls">
          <v-btn icon size="x-small" variant="text" color="white" @click="prevDevo">
            <v-icon size="18">mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn icon size="small" variant="flat" color="white" @click="togglePause" class="mx-1">
            <v-icon color="primary">{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
          </v-btn>
          <v-btn icon size="x-small" variant="text" color="white" @click="nextDevo">
            <v-icon size="18">mdi-skip-next</v-icon>
          </v-btn>

          <!-- Velocidad -->
          <v-menu v-model="showSpeedMenu" location="top" :close-on-content-click="true">
            <template #activator="{ props: menuProps }">
              <v-btn v-bind="menuProps" size="x-small" variant="tonal" color="white" class="speed-btn">
                {{ playbackSpeed === 1 ? '1x' : `x${playbackSpeed.toFixed(2)}` }}
              </v-btn>
            </template>
            <v-card rounded="xl" elevation="8" class="speed-menu-card">
              <div class="speed-menu-title">Velocidad de reproducción</div>
              <div class="speed-menu-note">Solo aplica al devocional actual</div>
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

          <v-btn icon size="x-small" variant="text" color="white" @click="stopDevo">
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
import { activeAudioSource, registerStopCallback, stopAllExcept } from '@/utils/audioManager'

// ── Estado ───────────────────────────────────────────────────────
const search      = ref('')
const showFavOnly = ref(false)
const loading     = ref(true)
const devotionals = ref([])
const expandedId  = ref(null)
const playingId   = ref(null)
const isPaused    = ref(false)
const playingDevo = computed(() => devotionals.value.find(d => d.id === playingId.value))

// ── Favoritos ────────────────────────────────────────────────────
const favorites = reactive(new Set(JSON.parse(localStorage.getItem('devo_favorites') || '[]')))
const toggleFavorite = (id) => {
  if (favorites.has(id)) favorites.delete(id)
  else favorites.add(id)
  localStorage.setItem('devo_favorites', JSON.stringify([...favorites]))
}

// ── Descargas ────────────────────────────────────────────────────
const downloadedIds = reactive(new Set(JSON.parse(localStorage.getItem('devo_downloaded') || '[]')))
const downloadingId = ref(null)

const downloadDevo = async (d) => {
  if (downloadingId.value) return
  downloadingId.value = d.id
  try {
    const res  = await fetch(d.audioUrl)
    const blob = await res.blob()
    const ext  = d.audioUrl.includes('.mp3') ? 'mp3' : 'webm'
    const name = `${d.titulo}.${ext}`

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await showSaveFilePicker({
          suggestedName: name,
          startIn: 'music',
          types: [{ description: 'Audio', accept: { 'audio/*': ['.mp3', '.webm', '.ogg'] } }],
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
      } catch (e) {
        if (e.name === 'AbortError') { downloadingId.value = null; return }
        throw e
      }
    } else {
      const url = URL.createObjectURL(blob)
      const a   = Object.assign(document.createElement('a'), { href: url, download: name })
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 2000)
    }
    downloadedIds.add(d.id)
    localStorage.setItem('devo_downloaded', JSON.stringify([...downloadedIds]))
  } catch { /* fallo silencioso */ }
  finally { downloadingId.value = null }
}

// ── Selección / cola ─────────────────────────────────────────────
const selectionMode = ref(false)
const selectedIds   = reactive(new Set())
const queue         = ref([])
const queueIndex    = ref(-1)

const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) selectedIds.clear()
}

const onRowClick = (d) => {
  if (selectionMode.value) {
    if (selectedIds.has(d.id)) selectedIds.delete(d.id)
    else selectedIds.add(d.id)
    return
  }
  // Tap normal: si tiene audio reproduce/pausa, y siempre expande
  if (d.audioUrl) {
    if (playingId.value === d.id) { togglePause(); return }
    playDirect(d)
  }
  toggleExpand(d.id)
}

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id
}

const startQueue = () => {
  if (selectedIds.size === 0) return
  const withAudio = filtrados.value.filter(d => selectedIds.has(d.id) && d.audioUrl)
  if (withAudio.length === 0) return
  queue.value = withAudio
  queueIndex.value = 0
  selectionMode.value = false
  selectedIds.clear()
  playDirect(queue.value[0])
}

// ── Filtros ──────────────────────────────────────────────────────
const filtrados = computed(() => {
  let lista = devotionals.value
  if (showFavOnly.value) lista = lista.filter(d => favorites.has(d.id))
  if (search.value?.trim()) {
    const q = search.value.trim().toLowerCase()
    lista = lista.filter(d =>
      d.titulo?.toLowerCase().includes(q) ||
      d.versiculo?.toLowerCase().includes(q)
    )
  }
  return lista
})

// ── Fechas ───────────────────────────────────────────────────────
const shortDay = (ts) => {
  if (!ts) return '—'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.getDate()
}
const shortMonth = (ts) => {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('es', { month: 'short' }).replace('.', '').toUpperCase()
}

// ── Firestore ────────────────────────────────────────────────────
let unsubscribe = null
onMounted(() => {
  registerStopCallback('devocional', stopDevo)
  const q = query(collection(db, 'devotionals'), orderBy('createdAt', 'desc'))
  unsubscribe = onSnapshot(q, (snap) => {
    devotionals.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
})
onUnmounted(() => { unsubscribe?.(); stopDevo() })

// Detener si otra fuente toma el control
watch(activeAudioSource, (src) => { if (src && src !== 'devocional') stopDevo() })

// ── Velocidad ────────────────────────────────────────────────────
const SPEEDS      = [1, 1.15, 1.20, 1.25, 1.30]
const SPEED_LABELS = { 1: 'Normal', 1.15: 'Un poco más rápido', 1.20: 'Moderado', 1.25: 'Rápido', 1.30: 'Muy rápido' }
const playbackSpeed = ref(1)
const showSpeedMenu = ref(false)
const setSpeed = (sp) => {
  playbackSpeed.value = sp
  if (devoAudio) devoAudio.playbackRate = sp
}

// ── Audio ────────────────────────────────────────────────────────
let devoAudio = null

const playDirect = (d) => {
  if (!d.audioUrl) return
  stopAllExcept('devocional')           // detiene radio, himnario, spotify
  activeAudioSource.value = 'devocional'
  if (devoAudio) { devoAudio.pause(); devoAudio = null }
  playbackSpeed.value = 1
  devoAudio = new Audio(d.audioUrl)
  devoAudio.playbackRate = 1
  devoAudio.play()
  devoAudio.onended = () => nextDevo()
  playingId.value = d.id
  isPaused.value  = false
  // Auto-expandir para ver el texto
  expandedId.value = d.id
}

const togglePause = () => {
  if (!devoAudio) return
  if (isPaused.value) { devoAudio.play(); isPaused.value = false }
  else                { devoAudio.pause(); isPaused.value = true  }
}

const stopDevo = () => {
  if (devoAudio) { devoAudio.pause(); devoAudio = null }
  playingId.value  = null
  isPaused.value   = false
  queue.value      = []
  queueIndex.value = -1
  if (activeAudioSource.value === 'devocional') activeAudioSource.value = null
}

const nextDevo = () => {
  if (queue.value.length > 0) {
    const next = queueIndex.value + 1
    if (next < queue.value.length) { queueIndex.value = next; playDirect(queue.value[next]) }
    else { queue.value = []; queueIndex.value = -1; stopDevo() }
    return
  }
  const withAudio = filtrados.value.filter(d => d.audioUrl)
  const idx  = withAudio.findIndex(d => d.id === playingId.value)
  const next = withAudio[idx + 1]
  if (next) playDirect(next)
  else stopDevo()
}

const compartirWhatsApp = (d) => {
  if (!d) return
  const texto = `📖 *${d.titulo}*\n_${d.versiculo}_\n\n${d.reflexion?.slice(0, 200)}${d.reflexion?.length > 200 ? '...' : ''}\n\n— La Voz de Filadelfia`
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
}

const prevDevo = () => {
  if (queue.value.length > 0) {
    const prev = queueIndex.value - 1
    if (prev >= 0) { queueIndex.value = prev; playDirect(queue.value[prev]) }
    return
  }
  const withAudio = filtrados.value.filter(d => d.audioUrl)
  const idx  = withAudio.findIndex(d => d.id === playingId.value)
  const prev = withAudio[idx - 1]
  if (prev) playDirect(prev)
}
</script>

<style scoped>
/* ── Lista ── */
.devo-list {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.devo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.07);
  min-height: 52px;
}
.devo-row:hover       { background: rgba(var(--v-theme-primary), 0.06); }
.devo-row--active     { background: rgba(var(--v-theme-primary), 0.12) !important; }
.devo-row--selected   { background: rgba(var(--v-theme-primary), 0.10) !important; }
.devo-row--expanded   { background: rgba(var(--v-theme-primary), 0.05); }
.devo-row--active .devo-title   { color: rgb(var(--v-theme-primary)); font-weight: 600; }
.devo-row--selected .devo-title { color: rgb(var(--v-theme-primary)); }

/* Columna fecha */
.devo-date {
  width: 32px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.devo-day {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: rgb(var(--v-theme-primary));
}
.devo-month {
  font-size: 9px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.45);
  letter-spacing: 0.5px;
}

/* Info */
.devo-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.devo-title {
  font-size: 13px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.devo-sub {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Botón descargar */
.devo-dl-btn {
  background: none;
  border: none;
  padding: 4px 5px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.28);
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s;
}
.devo-dl-btn:hover  { color: rgb(var(--v-theme-primary)); }
.devo-dl-btn--done  { color: #4caf50 !important; }

/* Botón expandir */
.devo-expand-btn {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.3);
  flex-shrink: 0;
  transition: transform 0.2s, color 0.15s;
  line-height: 1;
}
.devo-expand-btn:hover       { color: rgb(var(--v-theme-primary)); }
.devo-expand-btn--open       { transform: rotate(180deg); color: rgb(var(--v-theme-primary)); }

/* Separador favorito */
.devo-fav-sep {
  width: 1px;
  height: 20px;
  background: rgba(var(--v-border-color), 0.2);
  flex-shrink: 0;
  margin: 0 2px;
}
.devo-fav-btn {
  background: none;
  border: none;
  padding: 4px 6px;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.25);
  flex-shrink: 0;
  line-height: 1;
  transition: color 0.15s, transform 0.15s;
}
.devo-fav-btn:hover       { color: #e91e63; transform: scale(1.2); }
.devo-fav-btn--active     { color: #e91e63 !important; }

/* Panel expandido */
.devo-expand-panel {
  background: rgba(var(--v-theme-primary), 0.04);
  border-bottom: 1px solid rgba(var(--v-border-color), 0.07);
  padding: 12px 14px;
}
.devo-reflexion {
  font-size: 13px;
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.85);
  margin: 0 0 10px;
}
.devo-reflexion :deep(strong) { font-weight: 700; }
.devo-reflexion :deep(em)     { font-style: italic; }
.devo-reflexion :deep(div)    { margin: 2px 0; }
.devo-reflexion :deep(p)      { margin: 4px 0; }
.devo-expand-actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* Barras animadas */
.devo-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}
.devo-bars span {
  display: block;
  width: 3px;
  background: rgb(var(--v-theme-primary));
  border-radius: 1px;
  animation: bar-bounce 0.8s ease-in-out infinite alternate;
}
.devo-bars span:nth-child(1) { height: 6px;  animation-delay: 0s; }
.devo-bars span:nth-child(2) { height: 12px; animation-delay: 0.2s; }
.devo-bars span:nth-child(3) { height: 8px;  animation-delay: 0.4s; }
@keyframes bar-bounce {
  from { transform: scaleY(0.4); }
  to   { transform: scaleY(1); }
}

/* Skeleton */
.devo-skeleton {
  height: 52px;
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

/* Barra selección */
.devo-selection-bar {
  display: flex;
  align-items: center;
  background: rgba(var(--v-theme-primary), 0.08);
  border: 1px dashed rgba(var(--v-theme-primary), 0.4);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
}

/* ── Mini reproductor ── */
.devo-player {
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
.devo-player__info { flex: 1; min-width: 0; }
.devo-player__title { font-size: 13px; font-weight: 600; color: white; line-height: 1.3; }
.devo-player__sub   { font-size: 11px; color: rgba(255,255,255,0.7); }
.devo-player__controls { display: flex; align-items: center; }

/* Velocidad */
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
.speed-menu-card  { padding: 8px 0 4px; min-width: 220px; }
.speed-menu-title { font-size: 12px; font-weight: 700; padding: 0 16px 2px; opacity: 0.9; }
.speed-menu-note  { font-size: 10px; padding: 0 16px 6px; opacity: 0.5; }
.speed-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.12s;
}
.speed-option:hover           { background: rgba(var(--v-theme-primary), 0.08); }
.speed-option--active         { background: rgba(var(--v-theme-primary), 0.1); }
.speed-option__label { font-size: 14px; font-weight: 700; min-width: 40px; color: rgb(var(--v-theme-primary)); }
.speed-option__desc  { font-size: 12px; opacity: 0.65; flex: 1; }
</style>
