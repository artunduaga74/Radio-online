<template>
    <v-dialog
        v-model="drawer"
        :fullscreen="$vuetify.display.smAndDown"
        :max-width="400"
        scrollable>

        <v-card>
            <!-- Cabecera -->
            <div class="d-flex align-center px-4 py-3">
                <v-icon color="primary" class="mr-3">mdi-shield-account</v-icon>
                <div class="flex-grow-1">
                    <div class="text-body-1 font-weight-bold">Panel de Administración</div>
                    <div class="text-caption text-medium-emphasis">La Voz de Filadelfia</div>
                </div>
                <v-btn icon variant="text" size="small" @click="closeDrawer">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>

            <!-- Usuario -->
            <div class="px-4 pb-2">
                <v-chip color="success" variant="tonal" prepend-icon="mdi-account-check" size="small">
                    {{ user?.email }}
                </v-chip>
            </div>

            <!-- Pestañas: sticky para que no desaparezcan al hacer scroll -->
            <v-tabs v-model="activeTab" color="primary" density="compact" grow
                style="position:sticky; top:0; z-index:10; background:rgb(var(--v-theme-surface))">
                <v-tab value="notif">
                    <v-icon size="16" class="mr-1">mdi-bell</v-icon>
                    Avisos
                </v-tab>
                <v-tab value="episodios">
                    <v-icon size="16" class="mr-1">mdi-spotify</v-icon>
                    Episodios
                </v-tab>
                <v-tab value="devocional">
                    <v-icon size="16" class="mr-1">mdi-book-open-variant</v-icon>
                    Devocional
                </v-tab>
                <v-tab value="himnario">
                    <v-icon size="16" class="mr-1">mdi-book-music</v-icon>
                    Himnario
                </v-tab>
            </v-tabs>
            <v-divider />

            <v-card-text ref="cardTextRef" class="pa-4" style="overflow-y:auto">
                <v-window v-model="activeTab">

                    <!-- ── PESTAÑA NOTIFICACIONES ── -->
                    <v-window-item value="notif">
                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">mdi-bell-ring</v-icon>
                            Notificación push
                        </h3>

                        <v-text-field
                            v-model="notifTitle"
                            label="Título"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-format-title"
                            class="mb-2" />

                        <v-text-field
                            v-model="notifBody"
                            label="Mensaje"
                            placeholder="¡Estamos en vivo!"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-message-text"
                            class="mb-3" />

                        <v-btn
                            color="primary" block rounded="lg"
                            prepend-icon="mdi-bell-ring"
                            :loading="sendingNotif"
                            :disabled="!notifTitle || !notifBody"
                            @click="sendPushNotification">
                            Enviar a todos
                        </v-btn>
                    </v-window-item>

                    <!-- ── PESTAÑA EPISODIOS ── -->
                    <v-window-item value="episodios">
                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">{{ editingId ? 'mdi-pencil' : 'mdi-plus-circle' }}</v-icon>
                            {{ editingId ? 'Editar episodio' : 'Agregar episodio' }}
                        </h3>

                        <v-form ref="formRef" @submit.prevent="saveEpisode">
                            <v-text-field
                                v-model="form.spotifyUrl"
                                label="URL del episodio en Spotify"
                                placeholder="https://open.spotify.com/episode/..."
                                variant="outlined" density="compact"
                                prepend-inner-icon="mdi-spotify"
                                :rules="[v => !!v || 'Requerido', v => toEmbedUrl(v) !== null || 'URL inválida']"
                                class="mb-2"
                                hint="··· → Compartir → Copiar enlace del episodio"
                                persistent-hint />

                            <v-text-field
                                v-model="form.title"
                                label="Título del episodio"
                                variant="outlined" density="compact"
                                prepend-inner-icon="mdi-format-title"
                                :rules="[v => !!v || 'Requerido']"
                                class="mb-2 mt-3" />

                            <v-textarea
                                v-model="form.description"
                                label="Descripción (opcional)"
                                variant="outlined" density="compact"
                                prepend-inner-icon="mdi-text"
                                rows="2" class="mb-3" />

                            <div class="d-flex ga-2">
                                <v-btn v-if="editingId" variant="tonal" rounded="lg"
                                    prepend-icon="mdi-close" @click="cancelEdit">
                                    Cancelar
                                </v-btn>
                                <v-btn type="submit" color="primary" :block="!editingId" rounded="lg"
                                    :prepend-icon="editingId ? 'mdi-check' : 'mdi-content-save'"
                                    :loading="saving">
                                    {{ editingId ? 'Actualizar' : 'Guardar episodio' }}
                                </v-btn>
                            </div>
                        </v-form>

                        <v-divider class="my-4" />

                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">mdi-format-list-bulleted</v-icon>
                            Episodios ({{ episodes.length }})
                        </h3>

                        <div v-if="loadingEpisodes" class="text-center py-4">
                            <v-progress-circular indeterminate color="primary" size="32" />
                        </div>

                        <v-list v-else density="compact" class="pa-0">
                            <v-list-item
                                v-for="ep in episodes" :key="ep.id"
                                :title="ep.title" :subtitle="ep.date"
                                rounded="lg" :active="editingId === ep.id"
                                color="primary" class="mb-1 px-2">
                                <template #append>
                                    <v-btn icon size="x-small" color="primary" variant="text" @click="startEdit(ep)">
                                        <v-icon size="16">mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon size="x-small" color="error" variant="text"
                                        :loading="deletingId === ep.id" @click="deleteEpisode(ep.id)">
                                        <v-icon size="16">mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-list-item>
                            <v-list-item v-if="episodes.length === 0">
                                <v-list-item-title class="text-caption text-medium-emphasis">
                                    No hay episodios aún.
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-window-item>

                    <!-- ── PESTAÑA HIMNARIO ── -->
                    <v-window-item value="himnario">
                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">{{ hymnEditingId ? 'mdi-pencil' : 'mdi-upload' }}</v-icon>
                            {{ hymnEditingId ? 'Editar himno' : 'Subir himno' }}
                        </h3>

                        <v-text-field
                            v-model="hymn.numero"
                            label="Número"
                            type="number"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-numeric"
                            class="mb-2" />

                        <v-text-field
                            v-model="hymn.titulo"
                            label="Título del himno"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-format-title"
                            class="mb-2" />

                        <!-- Categoría libre — escribe o elige una existente -->
                        <v-combobox
                            v-model="hymn.categoria"
                            label="Categoría (escribe o elige)"
                            :items="categoriasExistentes"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-tag"
                            class="mb-2" />

                        <!-- Barra de formato para la letra — @pointerdown.prevent preserva selección -->
                        <div class="format-toolbar mb-1" @pointerdown.prevent>
                            <span class="format-toolbar__label">Formato:</span>
                            <v-btn size="x-small" variant="tonal" @click="fmtBold(letraRef)">
                                <strong>N</strong>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" @click="fmtItalic(letraRef)">
                                <em>C</em>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" title="Centrar" @click="fmtCenter(letraRef)">
                                <v-icon size="14">mdi-format-align-center</v-icon>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" title="Justificar" @click="fmtJustify(letraRef)">
                                <v-icon size="14">mdi-format-align-justify</v-icon>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" title="Izquierda" @click="fmtLeft(letraRef)">
                                <v-icon size="14">mdi-format-align-left</v-icon>
                            </v-btn>
                        </div>

                        <div
                            ref="letraRef"
                            contenteditable="true"
                            class="rich-editor mb-3"
                            data-placeholder="Letra del himno (opcional)"
                            @input="hymn.letra = $event.target.innerHTML"
                            @mouseup="onEditorSelect(letraRef)"
                            @paste.prevent="onPaste($event, letraRef)"
                            @contextmenu.prevent="showCtxMenu($event, letraRef)" />

                        <v-file-input
                            v-model="hymnArchivo"
                            :label="hymnEditingId ? 'Nuevo MP3 (opcional, solo si reemplazas)' : 'Archivo MP3'"
                            accept="audio/mpeg,audio/mp3"
                            variant="outlined" density="compact"
                            prepend-icon=""
                            prepend-inner-icon="mdi-file-music"
                            class="mb-3" />

                        <!-- Barra de progreso -->
                        <v-progress-linear
                            v-if="uploadProgress > 0 && uploadProgress < 100"
                            :model-value="uploadProgress"
                            color="primary" rounded height="6"
                            class="mb-3" />

                        <div class="d-flex ga-2">
                            <v-btn v-if="hymnEditingId" variant="tonal" rounded="lg"
                                prepend-icon="mdi-close" @click="cancelEditHymn">
                                Cancelar
                            </v-btn>
                            <v-btn
                                color="primary" :block="!hymnEditingId" rounded="lg"
                                :prepend-icon="hymnEditingId ? 'mdi-check' : 'mdi-cloud-upload'"
                                :loading="uploadingHymn"
                                :disabled="!hymn.titulo || !hymn.categoria || (!hymnEditingId && !hymnArchivo)"
                                @click="uploadHymn">
                                {{ hymnEditingId ? 'Actualizar' : 'Subir himno' }}
                            </v-btn>
                        </div>

                        <v-divider class="my-4" />

                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">mdi-music-note-list</v-icon>
                            Himnos subidos ({{ hymns.length }})
                        </h3>

                        <div v-if="loadingHymns" class="text-center py-4">
                            <v-progress-circular indeterminate color="primary" size="32" />
                        </div>

                        <v-list v-else density="compact" class="pa-0">
                            <v-list-item
                                v-for="h in hymns" :key="h.id"
                                :title="`${h.numero ? '#'+h.numero+' — ' : ''}${h.titulo}`"
                                :subtitle="h.categoria"
                                rounded="lg" :active="hymnEditingId === h.id"
                                color="primary" class="mb-1 px-2">
                                <template #append>
                                    <v-btn icon size="x-small" color="primary" variant="text"
                                        @click="startEditHymn(h)">
                                        <v-icon size="16">mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon size="x-small" color="error" variant="text"
                                        :loading="deletingHymnId === h.id"
                                        @click="deleteHymn(h)">
                                        <v-icon size="16">mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-list-item>
                            <v-list-item v-if="hymns.length === 0">
                                <v-list-item-title class="text-caption text-medium-emphasis">
                                    No hay himnos subidos aún.
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-window-item>

                    <!-- ── PESTAÑA DEVOCIONAL ── -->
                    <v-window-item value="devocional">

                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">{{ devoEditingId ? 'mdi-pencil' : 'mdi-book-open-variant' }}</v-icon>
                            {{ devoEditingId ? 'Editar devocional' : 'Nuevo devocional' }}
                        </h3>

                        <v-text-field
                            v-model="devo.titulo"
                            label="Título"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-format-title"
                            class="mb-2" />

                        <v-text-field
                            v-model="devo.versiculo"
                            label="Versículo (ej: Juan 3:16)"
                            variant="outlined" density="compact"
                            prepend-inner-icon="mdi-book-cross"
                            class="mb-2" />

                        <!-- Barra de formato para la reflexión -->
                        <div class="format-toolbar mb-1" @pointerdown.prevent>
                            <span class="format-toolbar__label">Formato:</span>
                            <v-btn size="x-small" variant="tonal" @click="fmtBold(reflexionRef)">
                                <strong>N</strong>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" @click="fmtItalic(reflexionRef)">
                                <em>C</em>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" title="Centrar" @click="fmtCenter(reflexionRef)">
                                <v-icon size="14">mdi-format-align-center</v-icon>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" title="Justificar" @click="fmtJustify(reflexionRef)">
                                <v-icon size="14">mdi-format-align-justify</v-icon>
                            </v-btn>
                            <v-btn size="x-small" variant="tonal" title="Izquierda" @click="fmtLeft(reflexionRef)">
                                <v-icon size="14">mdi-format-align-left</v-icon>
                            </v-btn>
                        </div>

                        <div
                            ref="reflexionRef"
                            contenteditable="true"
                            class="rich-editor mb-3"
                            data-placeholder="Texto de la reflexión"
                            @input="devo.reflexion = $event.target.innerHTML"
                            @mouseup="onEditorSelect(reflexionRef)"
                            @paste.prevent="onPaste($event, reflexionRef)"
                            @contextmenu.prevent="showCtxMenu($event, reflexionRef)" />

                        <!-- Audio -->
                        <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">
                            AUDIO (OPCIONAL)
                        </div>

                        <!-- Audio existente al editar -->
                        <div v-if="devoEditingId && devoExistingUrl && !devoAudioUrl" class="mb-2">
                            <div class="text-caption text-medium-emphasis mb-1">Audio actual:</div>
                            <audio :src="devoExistingUrl" controls style="width:100%; height:40px" />
                            <v-btn size="small" variant="text" color="error" class="mt-1"
                                prepend-icon="mdi-delete" @click="devoExistingUrl = null">
                                Reemplazar audio
                            </v-btn>
                        </div>

                        <!-- Grabador con forma de onda -->
                        <div v-if="!devoEditingId || !devoExistingUrl || devoAudioUrl" class="recorder-box pa-3 rounded-lg mb-2">
                            <div class="d-flex align-center ga-2">

                                <!-- Botón micrófono (no grabando) -->
                                <v-btn v-if="!isRecording && !isPaused"
                                    color="primary" variant="tonal"
                                    rounded="xl" icon size="44"
                                    @click="startRecording">
                                    <v-icon size="22">mdi-microphone</v-icon>
                                </v-btn>

                                <!-- Grabando o en pausa: pausa/reanuda + detener -->
                                <template v-else>
                                    <v-btn
                                        :color="isPaused ? 'primary' : 'warning'"
                                        :variant="isPaused ? 'tonal' : 'flat'"
                                        rounded="xl" icon size="38"
                                        :title="isPaused ? 'Reanudar' : 'Pausar'"
                                        @click="isPaused ? resumeRecording() : pauseRecording()">
                                        <v-icon size="20">{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon>
                                    </v-btn>
                                    <v-btn
                                        color="error" variant="flat"
                                        rounded="xl" icon size="38"
                                        title="Detener y guardar"
                                        @click="stopRecording">
                                        <v-icon size="20">mdi-stop</v-icon>
                                    </v-btn>
                                </template>

                                <!-- Forma de onda -->
                                <div class="flex-grow-1">
                                    <div v-if="isRecording || isPaused" class="d-flex align-center ga-1 mb-1">
                                        <v-icon v-if="!isPaused" size="9" color="error" class="blink">mdi-circle</v-icon>
                                        <v-icon v-else size="9" color="warning">mdi-pause-circle</v-icon>
                                        <span class="text-caption font-weight-medium"
                                            :class="isPaused ? 'text-warning' : 'text-error'">
                                            {{ isPaused ? 'EN PAUSA — ' : '' }}{{ formatRecordingTime }}
                                        </span>
                                    </div>
                                    <div class="waveform d-flex align-center" style="height:28px; gap:2px">
                                        <div
                                            v-for="(h, i) in waveformBars" :key="i"
                                            class="wave-bar"
                                            :style="{
                                                height: h + 'px',
                                                background: isRecording
                                                    ? 'rgb(var(--v-theme-primary))'
                                                    : (devoAudioUrl ? 'rgb(var(--v-theme-primary))' : '#bbb'),
                                                opacity: h < 3 ? 0.3 : 1
                                            }" />
                                    </div>
                                    <div v-if="!isRecording && !isPaused && !devoAudioUrl" class="text-caption text-medium-emphasis mt-1">
                                        Toca el micrófono para grabar
                                    </div>
                                    <div v-if="!isRecording && devoAudioUrl" class="text-caption text-success mt-1">
                                        ✓ Listo — dale play para escuchar
                                    </div>
                                </div>

                                <v-btn v-if="devoAudioUrl && !isRecording && !isPaused"
                                    icon size="small" variant="text" color="error" @click="clearAudio">
                                    <v-icon size="18">mdi-delete</v-icon>
                                </v-btn>
                            </div>

                            <audio v-if="devoAudioUrl" :src="devoAudioUrl"
                                controls style="width:100%; height:36px; margin-top:8px" />
                        </div>

                        <!-- Ajustes de audio -->
                        <v-btn
                            variant="text" density="compact" size="small"
                            :prepend-icon="showAudioSettings ? 'mdi-chevron-up' : 'mdi-tune-variant'"
                            color="primary" class="mb-1"
                            @click="showAudioSettings = !showAudioSettings">
                            {{ showAudioSettings ? 'Ocultar ajustes' : 'Ajustes de audio' }}
                        </v-btn>

                        <v-expand-transition>
                            <div v-show="showAudioSettings" class="audio-settings pa-3 rounded-lg mb-2"
                                @touchstart.stop @touchmove.stop>

                                <!-- Ecualizador -->
                                <div class="text-caption font-weight-bold mb-1 text-medium-emphasis">
                                    <v-icon size="13" class="mr-1">mdi-equalizer</v-icon>
                                    ECUALIZADOR (MIC)
                                </div>
                                <div class="text-caption text-medium-emphasis mb-2" style="font-size:10px">
                                    Se aplica a la grabación — usa audífonos para escucharlo en vivo
                                </div>

                                <div class="d-flex align-center mb-1">
                                    <span class="text-caption eq-label">Graves</span>
                                    <v-slider
                                        v-model="eqValues.bass"
                                        :min="-10" :max="10" step="1"
                                        density="compact" hide-details
                                        color="primary" thumb-size="14"
                                        class="flex-grow-1"
                                        @update:model-value="applyEQ" />
                                    <span class="text-caption ml-2 eq-value">{{ eqValues.bass > 0 ? '+' : '' }}{{ eqValues.bass }}</span>
                                </div>

                                <div class="d-flex align-center mb-1">
                                    <span class="text-caption eq-label">Medios</span>
                                    <v-slider
                                        v-model="eqValues.mid"
                                        :min="-10" :max="10" step="1"
                                        density="compact" hide-details
                                        color="primary" thumb-size="14"
                                        class="flex-grow-1"
                                        @update:model-value="applyEQ" />
                                    <span class="text-caption ml-2 eq-value">{{ eqValues.mid > 0 ? '+' : '' }}{{ eqValues.mid }}</span>
                                </div>

                                <div class="d-flex align-center mb-3">
                                    <span class="text-caption eq-label">Brillo</span>
                                    <v-slider
                                        v-model="eqValues.treble"
                                        :min="-10" :max="10" step="1"
                                        density="compact" hide-details
                                        color="primary" thumb-size="14"
                                        class="flex-grow-1"
                                        @update:model-value="applyEQ" />
                                    <span class="text-caption ml-2 eq-value">{{ eqValues.treble > 0 ? '+' : '' }}{{ eqValues.treble }}</span>
                                </div>

                                <!-- Música de fondo -->
                                <v-divider class="mb-2" />
                                <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">
                                    <v-icon size="13" class="mr-1">mdi-music-note</v-icon>
                                    MÚSICA DE FONDO
                                </div>

                                <div @touchstart.stop @touchmove.stop @touchend.stop>
                                <v-select
                                    v-model="selectedHymn"
                                    :items="hymns.filter(h => h.url)"
                                    item-title="titulo"
                                    return-object
                                    label="Himno de fondo (opcional)"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                    hide-details
                                    class="mb-2" />
                                </div>

                                <div v-if="selectedHymn" class="d-flex align-center mt-2">
                                    <v-icon size="16" class="mr-2 text-medium-emphasis">mdi-volume-medium</v-icon>
                                    <v-slider
                                        v-model="musicVolume"
                                        :min="0" :max="1" step="0.05"
                                        density="compact" hide-details
                                        color="primary" thumb-size="14"
                                        class="flex-grow-1"
                                        @update:model-value="applyMusicVolume" />
                                    <span class="text-caption ml-2 eq-value">{{ Math.round(musicVolume * 100) }}%</span>
                                </div>

                                <div v-if="musicLoading" class="d-flex align-center ga-2 mt-1">
                                    <v-progress-circular indeterminate size="12" width="2" color="primary" />
                                    <span class="text-caption text-medium-emphasis">Cargando himno...</span>
                                </div>
                                <div v-else-if="selectedHymn && !isRecording" class="text-caption text-medium-emphasis mt-1">
                                    Escucharás la música al grabar — quedará mezclada en el audio
                                </div>
                            </div>
                        </v-expand-transition>

                        <!-- O subir MP3 -->
                        <v-file-input
                            v-if="!devoAudioUrl && !(devoEditingId && devoExistingUrl)"
                            v-model="devo.archivo"
                            label="O sube un MP3"
                            accept="audio/*"
                            variant="outlined" density="compact"
                            prepend-icon="" prepend-inner-icon="mdi-file-music"
                            class="mb-3" />

                        <v-progress-linear
                            v-if="devoUploadProgress > 0 && devoUploadProgress < 100"
                            :model-value="devoUploadProgress"
                            color="primary" rounded height="6" class="mb-3" />

                        <div class="d-flex ga-2">
                            <v-btn v-if="devoEditingId" variant="tonal" rounded="lg"
                                prepend-icon="mdi-close" @click="cancelEditDevo">
                                Cancelar
                            </v-btn>
                            <v-btn
                                color="primary" :block="!devoEditingId" rounded="lg"
                                :prepend-icon="devoEditingId ? 'mdi-check' : 'mdi-publish'"
                                :loading="savingDevo"
                                :disabled="!devo.titulo || !devo.versiculo"
                                @click="saveDevo">
                                {{ devoEditingId ? 'Actualizar' : 'Publicar' }}
                            </v-btn>
                        </div>

                        <v-divider class="my-4" />

                        <h3 class="text-body-1 font-weight-bold mb-3">
                            <v-icon size="18" class="mr-1">mdi-format-list-bulleted</v-icon>
                            Publicados ({{ devotionals.length }})
                        </h3>

                        <div v-if="loadingDevo" class="text-center py-4">
                            <v-progress-circular indeterminate color="primary" size="32" />
                        </div>

                        <v-list v-else density="compact" class="pa-0">
                            <v-list-item
                                v-for="d in devotionals" :key="d.id"
                                :title="d.titulo" :subtitle="d.fecha"
                                rounded="lg" :active="devoEditingId === d.id"
                                color="primary" class="mb-1 px-2">
                                <template #append>
                                    <v-btn icon size="x-small" color="primary" variant="text"
                                        @click="startEditDevo(d)">
                                        <v-icon size="16">mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon size="x-small" color="error" variant="text"
                                        :loading="deletingDevoId === d.id"
                                        @click="deleteDevo(d)">
                                        <v-icon size="16">mdi-delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-list-item>
                            <v-list-item v-if="devotionals.length === 0">
                                <v-list-item-title class="text-caption text-medium-emphasis">
                                    No hay devocionales publicados.
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>

                    </v-window-item>

                </v-window>

                <v-divider class="my-4" />

                <v-btn color="error" variant="tonal" block rounded="lg"
                    prepend-icon="mdi-logout" @click="handleLogout">
                    Cerrar sesión
                </v-btn>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="bottom">
        {{ snackbarMsg }}
    </v-snackbar>

    <!-- Barra flotante (aparece al seleccionar texto) -->
    <teleport to="body">
        <div v-if="floatBar.visible"
            class="admin-float-bar"
            :style="{ top: floatBar.y + 'px', left: floatBar.x + 'px' }"
            @click.stop
            @mousedown.prevent>
            <button class="fb-btn" title="Negrita" @click="execFloatFmt('bold')"><strong>N</strong></button>
            <button class="fb-btn" title="Cursiva" @click="execFloatFmt('italic')"><em>C</em></button>
            <div class="fb-sep" />
            <button class="fb-btn" title="Izquierda" @click="execFloatFmt('justifyLeft')">
                <v-icon size="13">mdi-format-align-left</v-icon>
            </button>
            <button class="fb-btn" title="Centrar" @click="execFloatFmt('justifyCenter')">
                <v-icon size="13">mdi-format-align-center</v-icon>
            </button>
            <button class="fb-btn" title="Justificar" @click="execFloatFmt('justifyFull')">
                <v-icon size="13">mdi-format-align-justify</v-icon>
            </button>
            <div class="fb-sep" />
            <button class="fb-btn fb-btn--clear" title="Quitar formato" @click="execFloatFmt('removeFormat')">
                <v-icon size="13">mdi-format-clear</v-icon>
            </button>
        </div>
    </teleport>

    <!-- Menú contextual (clic derecho en editores) -->
    <teleport to="body">
        <div v-if="ctxMenu.visible"
            class="admin-ctx-menu"
            :style="{ top: ctxMenu.y + 'px', left: ctxMenu.x + 'px' }"
            @click.stop>
            <button class="ctx-item" @mousedown.prevent @click="execCtxFmt('bold')">
                <strong>Negrita</strong>
            </button>
            <button class="ctx-item" @mousedown.prevent @click="execCtxFmt('italic')">
                <em>Cursiva</em>
            </button>
            <div class="ctx-divider" />
            <button class="ctx-item" @mousedown.prevent @click="execCtxFmt('justifyLeft')">
                Izquierda
            </button>
            <button class="ctx-item" @mousedown.prevent @click="execCtxFmt('justifyCenter')">
                Centrar
            </button>
            <button class="ctx-item" @mousedown.prevent @click="execCtxFmt('justifyFull')">
                Justificar
            </button>
            <div class="ctx-divider" />
            <button class="ctx-item ctx-item--remove" @mousedown.prevent @click="execCtxFmt('removeFormat')">
                Quitar formato
            </button>
        </div>
    </teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
    collection, addDoc, deleteDoc, doc, updateDoc,
    onSnapshot, orderBy, query, serverTimestamp
} from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db, storage, app } from '@/firebase'
import { useAuth } from '@/utils/useAuth'

const { user, isAdmin, logout } = useAuth()

const drawer      = ref(false)
const activeTab   = ref('episodios')
const cardTextRef = ref(null)
const openDrawer  = () => { drawer.value = true }
const closeDrawer = () => { drawer.value = false }

// Scroll al tope del contenido al cambiar de pestaña
watch(activeTab, () => {
    nextTick(() => {
        const el = cardTextRef.value?.$el ?? cardTextRef.value
        if (el) el.scrollTop = 0
    })
})

defineExpose({ openDrawer })

// ── Snackbar ──
const snackbar      = ref(false)
const snackbarMsg   = ref('')
const snackbarColor = ref('success')
const notify = (msg, color = 'success') => {
    snackbarMsg.value   = msg
    snackbarColor.value = color
    snackbar.value      = true
}

// ── EPISODIOS ──
const saving          = ref(false)
const deletingId      = ref(null)
const editingId       = ref(null)
const loadingEpisodes = ref(true)
const episodes        = ref([])
const formRef         = ref(null)
const form            = reactive({ spotifyUrl: '', title: '', description: '' })

const toEmbedUrl = (url) => {
    if (!url) return null
    const match = url.split('?')[0].match(/open\.spotify\.com\/episode\/([A-Za-z0-9]+)/)
    return match ? `https://open.spotify.com/embed/episode/${match[1]}` : null
}

const fromEmbedUrl = (embedUrl) => {
    const match = embedUrl?.match(/open\.spotify\.com\/embed\/episode\/([A-Za-z0-9]+)/)
    return match ? `https://open.spotify.com/episode/${match[1]}` : ''
}

const startEdit = (ep) => {
    editingId.value   = ep.id
    form.spotifyUrl   = fromEmbedUrl(ep.embedUrl)
    form.title        = ep.title
    form.description  = ep.description || ''
}

const cancelEdit = () => {
    editingId.value = null
    formRef.value?.reset()
}

let unsubscribeEpisodes = null
onMounted(() => {
    const q = query(collection(db, 'episodes'), orderBy('createdAt', 'desc'))
    unsubscribeEpisodes = onSnapshot(q, (snap) => {
        episodes.value        = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loadingEpisodes.value = false
    })
})

const saveEpisode = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return
    const embedUrl = toEmbedUrl(form.spotifyUrl)
    if (!embedUrl) return
    saving.value = true
    try {
        if (editingId.value) {
            await updateDoc(doc(db, 'episodes', editingId.value), {
                title: form.title.trim(), description: form.description.trim(), embedUrl
            })
            notify('Episodio actualizado ✓')
            editingId.value = null
        } else {
            await addDoc(collection(db, 'episodes'), {
                title: form.title.trim(), description: form.description.trim(), embedUrl,
                date: new Date().toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }),
                createdAt: serverTimestamp()
            })
            notify('Episodio publicado ✓')
        }
        formRef.value.reset()
    } catch (e) {
        notify('Error: ' + e.message, 'error')
    } finally {
        saving.value = false
    }
}

const deleteEpisode = async (id) => {
    if (editingId.value === id) cancelEdit()
    deletingId.value = id
    try {
        await deleteDoc(doc(db, 'episodes', id))
        notify('Episodio eliminado')
    } catch (e) {
        notify('Error al eliminar', 'error')
    } finally {
        deletingId.value = null
    }
}

// ── Editores enriquecidos (contenteditable WYSIWYG) ─────────────
const letraRef     = ref(null)   // editor letra del himno
const reflexionRef = ref(null)   // editor reflexión del devocional

// Sincroniza el HTML con la variable reactiva tras execCommand
const syncEditor = (el) => {
    if (el === letraRef.value)     hymn.letra      = el.innerHTML
    else if (el === reflexionRef.value) devo.reflexion = el.innerHTML
}

// Aplica formato al editor activo con focus preservado
const execFmt = (editorRef, cmd) => {
    editorRef.value?.focus()
    document.execCommand(cmd, false, null)
    syncEditor(editorRef.value)
}

const fmtBold    = (r) => execFmt(r, 'bold')
const fmtItalic  = (r) => execFmt(r, 'italic')
const fmtCenter  = (r) => execFmt(r, 'justifyCenter')
const fmtJustify = (r) => execFmt(r, 'justifyFull')
const fmtLeft    = (r) => execFmt(r, 'justifyLeft')

// Actualiza el innerHTML del editor (al editar/cancelar/guardar)
const setEditorContent = (editorRef, html) => {
    nextTick(() => { if (editorRef.value) editorRef.value.innerHTML = html || '' })
}

// ── Pegado sin formato ────────────────────────────────────────────
const onPaste = (e, editorRef) => {
    e.preventDefault()
    const text = (e.clipboardData || window.clipboardData).getData('text/plain')
    document.execCommand('insertText', false, text)
    syncEditor(editorRef.value)
}

// ── Barra flotante (aparece al seleccionar texto con mouse) ───────
const floatBar = reactive({ visible: false, x: 0, y: 0 })
let floatBarEl    = null
let floatBarRange = null

const onEditorSelect = (editorRef) => {
    requestAnimationFrame(() => {
        const sel = window.getSelection()
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
            floatBar.visible = false
            return
        }
        const rect = sel.getRangeAt(0).getBoundingClientRect()
        if (!rect.width) { floatBar.visible = false; return }
        floatBarRange    = sel.getRangeAt(0).cloneRange()
        floatBarEl       = editorRef.value
        // Centrada sobre la selección, con margen para no salir de pantalla
        floatBar.x = Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90)
        floatBar.y = rect.top - 4
        floatBar.visible = true
    })
}

const execFloatFmt = (cmd) => {
    if (floatBarEl && floatBarRange) {
        floatBarEl.focus()
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(floatBarRange)
        document.execCommand(cmd, false, null)
        syncEditor(floatBarEl)
    }
    floatBar.visible = false
}

const closeFloatBar = () => { floatBar.visible = false }

// ── Menú contextual (clic derecho PC) ─────────────────────────────
const ctxMenu    = reactive({ visible: false, x: 0, y: 0, el: null })
let   savedRange = null

const showCtxMenu = (e, editorRef) => {
    const sel = window.getSelection()
    savedRange = sel?.rangeCount > 0 ? sel.getRangeAt(0).cloneRange() : null
    const margin = 10
    ctxMenu.x  = Math.min(e.clientX, window.innerWidth  - 170 - margin)
    ctxMenu.y  = Math.min(e.clientY, window.innerHeight - 220 - margin)
    ctxMenu.el = editorRef.value
    ctxMenu.visible = true
}

const execCtxFmt = (cmd) => {
    if (ctxMenu.el && savedRange) {
        ctxMenu.el.focus()
        const sel = window.getSelection()
        sel.removeAllRanges()
        sel.addRange(savedRange)
        document.execCommand(cmd, false, null)
        syncEditor(ctxMenu.el)
    }
    ctxMenu.visible = false
}

const closeCtxMenu = () => { ctxMenu.visible = false }

// ── HIMNARIO ──
// hymnArchivo usa ref propio — v-file-input no funciona bien en reactive()
const hymnArchivo = ref(null)

const hymn = reactive({
    numero:    '',
    titulo:    '',
    autor:     '',
    categoria: '',
    letra:     '',
})

const uploadProgress  = ref(0)
const uploadingHymn   = ref(false)
const deletingHymnId  = ref(null)
const hymnEditingId   = ref(null)
const loadingHymns    = ref(true)
const hymns           = ref([])

// Categorías dinámicas — se derivan de los himnos ya subidos
const categoriasExistentes = computed(() => {
    const set = new Set(hymns.value.map(h => h.categoria).filter(Boolean))
    return [...set].sort()
})

let unsubscribeHymns = null
onMounted(() => {
    const q = query(collection(db, 'hymns'), orderBy('numero', 'asc'))
    unsubscribeHymns = onSnapshot(q, (snap) => {
        hymns.value        = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loadingHymns.value = false
    })
})

const startEditHymn = (h) => {
    hymnEditingId.value = h.id
    hymn.numero    = h.numero || ''
    hymn.titulo    = h.titulo
    hymn.autor     = h.autor || ''
    hymn.categoria = h.categoria
    hymn.letra     = h.letra || ''
    hymnArchivo.value = null
    setEditorContent(letraRef, h.letra || '')
}

const cancelEditHymn = () => {
    hymnEditingId.value = null
    hymnArchivo.value = null
    Object.assign(hymn, { numero: '', titulo: '', autor: '', categoria: '', letra: '' })
    setEditorContent(letraRef, '')
}

const uploadHymn = async () => {
    if (!hymn.titulo || !hymn.categoria) return
    uploadingHymn.value  = true
    uploadProgress.value = 0

    try {
        let url         = null
        let storagePath = null

        // Solo sube archivo si se seleccionó uno nuevo
        const archivoRaw = hymnArchivo.value
        const fileObj    = Array.isArray(archivoRaw) ? archivoRaw[0] : archivoRaw
        if (fileObj) {
            const file       = fileObj
            const fileName   = `${Date.now()}-${file.name}`
            storagePath      = `hymns/${fileName}`
            const fileRef    = storageRef(storage, storagePath)
            const uploadTask = uploadBytesResumable(fileRef, file)

            await new Promise((resolve, reject) => {
                uploadTask.on('state_changed',
                    (snap) => {
                        uploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                    },
                    reject, resolve
                )
            })
            url = await getDownloadURL(uploadTask.snapshot.ref)
        }

        if (hymnEditingId.value) {
            // Editar: solo actualiza los campos, el audio solo si subió uno nuevo
            const updates = {
                numero:    Number(hymn.numero) || 0,
                titulo:    hymn.titulo.trim(),
                autor:     hymn.autor.trim(),
                categoria: hymn.categoria,
                letra:     hymn.letra.trim(),
            }
            if (url) {
                // Borrar archivo viejo de Storage antes de reemplazar
                const old = hymns.value.find(h => h.id === hymnEditingId.value)
                if (old?.storagePath) {
                    await deleteObject(storageRef(storage, old.storagePath)).catch(() => {})
                }
                updates.url         = url
                updates.storagePath = storagePath
            }
            await updateDoc(doc(db, 'hymns', hymnEditingId.value), updates)
            notify('Himno actualizado ✓')
            cancelEditHymn()
        } else {
            await addDoc(collection(db, 'hymns'), {
                numero:    Number(hymn.numero) || 0,
                titulo:    hymn.titulo.trim(),
                autor:     hymn.autor.trim(),
                categoria: hymn.categoria,
                letra:     hymn.letra.trim(),
                url, storagePath,
                createdAt: serverTimestamp(),
            })
            notify('Himno subido ✓')
            hymnArchivo.value = null
            Object.assign(hymn, { numero: '', titulo: '', autor: '', categoria: '', letra: '' })
            setEditorContent(letraRef, '')
        }

        uploadProgress.value = 0
    } catch (e) {
        notify('Error: ' + e.message, 'error')
    } finally {
        uploadingHymn.value = false
    }
}

const deleteHymn = async (h) => {
    if (hymnEditingId.value === h.id) cancelEditHymn()
    deletingHymnId.value = h.id
    try {
        if (h.storagePath) {
            await deleteObject(storageRef(storage, h.storagePath)).catch(() => {})
        }
        await deleteDoc(doc(db, 'hymns', h.id))
        notify('Himno eliminado')
    } catch (e) {
        notify('Error al eliminar: ' + e.message, 'error')
    } finally {
        deletingHymnId.value = null
    }
}

// ── NOTIFICACIONES ──
const notifTitle   = ref('La Voz de Filadelfia')
const notifBody    = ref('¡Estamos en vivo!')
const sendingNotif = ref(false)

const sendPushNotification = async () => {
    sendingNotif.value = true
    try {
        const functions        = getFunctions(app)
        const sendNotification = httpsCallable(functions, 'sendNotification')
        const result           = await sendNotification({
            title: notifTitle.value,
            body:  notifBody.value,
        })
        notify(`Notificación enviada a ${result.data.sent} dispositivos ✓`)
    } catch (e) {
        notify('Error al enviar: ' + e.message, 'error')
    } finally {
        sendingNotif.value = false
    }
}

// ── DEVOCIONAL ──
const devo = reactive({ titulo: '', versiculo: '', reflexion: '', archivo: null })
const devoAudioUrl       = ref(null)
const devoAudioBlob      = ref(null)
const devoExistingUrl    = ref(null)  // audio existente al editar
const devoEditingId      = ref(null)
const isRecording        = ref(false)
const recordingSeconds   = ref(0)
const devoUploadProgress = ref(0)
const savingDevo         = ref(false)
const deletingDevoId     = ref(null)
const loadingDevo        = ref(true)
const devotionals        = ref([])

// Forma de onda — 32 barras independientes
const BARS = 32
const waveformBars = ref(new Array(BARS).fill(2))

// Ajustes de audio
const showAudioSettings = ref(false)
const eqValues          = reactive({ bass: 0, mid: 0, treble: 0 })
const selectedHymn      = ref(null)
const musicVolume       = ref(0.3)

const formatRecordingTime = computed(() => {
    const m = Math.floor(recordingSeconds.value / 60).toString().padStart(2, '0')
    const s = (recordingSeconds.value % 60).toString().padStart(2, '0')
    return `${m}:${s}`
})

let mediaRecorder    = null
let audioChunks      = []
let recordingTimer   = null
let audioContext     = null
let analyser         = null
let levelInterval    = null
let bassFilter       = null
let midFilter        = null
let trebleFilter     = null
let micGainNode      = null
let musicGainNode    = null
let destinationNode  = null
let musicBufferSource = null

const musicLoading = ref(false)
const isPaused     = ref(false)

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioChunks  = []

        audioContext    = new AudioContext()
        destinationNode = audioContext.createMediaStreamDestination()

        // ── EQ chain ──
        bassFilter = audioContext.createBiquadFilter()
        bassFilter.type = 'lowshelf'
        bassFilter.frequency.value = 200
        bassFilter.gain.value = eqValues.bass

        midFilter = audioContext.createBiquadFilter()
        midFilter.type = 'peaking'
        midFilter.frequency.value = 1000
        midFilter.Q.value = 1
        midFilter.gain.value = eqValues.mid

        trebleFilter = audioContext.createBiquadFilter()
        trebleFilter.type = 'highshelf'
        trebleFilter.frequency.value = 4000
        trebleFilter.gain.value = eqValues.treble

        micGainNode = audioContext.createGain()
        micGainNode.gain.value = 1.0

        analyser = audioContext.createAnalyser()
        analyser.fftSize = BARS * 4
        analyser.smoothingTimeConstant = 0.75

        // mic → bass → mid → treble → gain → analyser  (waveform only — mic not to speakers to avoid feedback)
        //                                    gain → destinationNode  (goes into recording)
        const micSource = audioContext.createMediaStreamSource(stream)
        micSource.connect(bassFilter)
        bassFilter.connect(midFilter)
        midFilter.connect(trebleFilter)
        trebleFilter.connect(micGainNode)
        micGainNode.connect(analyser)
        micGainNode.connect(destinationNode)

        // ── Background music: fetch → decode → BufferSource (no CORS issues) ──
        if (selectedHymn.value?.url) {
            musicLoading.value = true
            try {
                const res         = await fetch(selectedHymn.value.url)
                const arrayBuf    = await res.arrayBuffer()
                const audioBuffer = await audioContext.decodeAudioData(arrayBuf)

                musicGainNode     = audioContext.createGain()
                musicGainNode.gain.value = musicVolume.value

                musicBufferSource = audioContext.createBufferSource()
                musicBufferSource.buffer = audioBuffer
                musicBufferSource.loop   = true
                musicBufferSource.connect(musicGainNode)

                // → recording stream AND → speakers so admin can hear it
                musicGainNode.connect(destinationNode)
                musicGainNode.connect(audioContext.destination)
                musicBufferSource.start(0)
            } catch (err) {
                notify('No se pudo cargar la música — grabando sin fondo', 'warning')
            } finally {
                musicLoading.value = false
            }
        }

        // ── MediaRecorder on the mixed stream ──
        const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', '']
            .find(t => !t || MediaRecorder.isTypeSupported(t)) || ''
        mediaRecorder = new MediaRecorder(destinationNode.stream, mimeType ? { mimeType } : {})

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data) }
        mediaRecorder.onstop = () => {
            const type          = mediaRecorder.mimeType || 'audio/webm'
            devoAudioBlob.value = new Blob(audioChunks, { type })
            devoAudioUrl.value  = URL.createObjectURL(devoAudioBlob.value)
            stream.getTracks().forEach(t => t.stop())
            clearInterval(levelInterval)
            if (musicBufferSource) { try { musicBufferSource.stop() } catch {} musicBufferSource = null }
            if (audioContext) { audioContext.close(); audioContext = null }
        }

        // ── Waveform (reads from mic after EQ) ──
        const data = new Uint8Array(analyser.frequencyBinCount)
        levelInterval = setInterval(() => {
            analyser.getByteFrequencyData(data)
            const binSize = Math.floor(data.length / BARS)
            waveformBars.value = Array.from({ length: BARS }, (_, i) => {
                const slice = data.slice(i * binSize, (i + 1) * binSize)
                const avg   = slice.reduce((a, b) => a + b, 0) / slice.length
                return Math.max(2, Math.round(Math.pow(avg / 255, 0.7) * 26))
            })
        }, 60)

        mediaRecorder.start(100)
        isRecording.value      = true
        recordingSeconds.value = 0
        recordingTimer = setInterval(() => recordingSeconds.value++, 1000)
    } catch {
        notify('No se pudo acceder al micrófono — verifica los permisos', 'error')
    }
}

const pauseRecording = () => {
    mediaRecorder?.pause()
    // Congelar temporizador y forma de onda
    clearInterval(recordingTimer); recordingTimer = null
    clearInterval(levelInterval);  levelInterval  = null
    // Silenciar música (no la detenemos para no perder la posición)
    if (musicGainNode) musicGainNode.gain.value = 0
    isPaused.value = true
}

const resumeRecording = () => {
    mediaRecorder?.resume()
    // Restaurar música
    if (musicGainNode) musicGainNode.gain.value = musicVolume.value
    // Reactivar forma de onda
    if (analyser) {
        const data = new Uint8Array(analyser.frequencyBinCount)
        levelInterval = setInterval(() => {
            analyser.getByteFrequencyData(data)
            const binSize = Math.floor(data.length / BARS)
            waveformBars.value = Array.from({ length: BARS }, (_, i) => {
                const slice = data.slice(i * binSize, (i + 1) * binSize)
                const avg   = slice.reduce((a, b) => a + b, 0) / slice.length
                return Math.max(2, Math.round(Math.pow(avg / 255, 0.7) * 26))
            })
        }, 60)
    }
    // Reactivar temporizador
    recordingTimer = setInterval(() => recordingSeconds.value++, 1000)
    isPaused.value = false
}

const stopRecording = () => {
    if (musicBufferSource) { try { musicBufferSource.stop() } catch {} musicBufferSource = null }
    mediaRecorder?.stop()
    isRecording.value = false
    isPaused.value    = false
    clearInterval(recordingTimer)
}

// EQ applied in real-time to the active audio nodes
const applyEQ = () => {
    if (bassFilter)   bassFilter.gain.value   = eqValues.bass
    if (midFilter)    midFilter.gain.value    = eqValues.mid
    if (trebleFilter) trebleFilter.gain.value = eqValues.treble
}

// Music volume applied in real-time
const applyMusicVolume = () => {
    if (musicGainNode) musicGainNode.gain.value = musicVolume.value
}

const clearAudio = () => {
    devoAudioUrl.value  = null
    devoAudioBlob.value = null
    devo.archivo        = null
    isPaused.value      = false
    waveformBars.value  = new Array(BARS).fill(2)
}

// Edición de devocionales
const startEditDevo = (d) => {
    devoEditingId.value  = d.id
    devo.titulo          = d.titulo
    devo.versiculo       = d.versiculo
    devo.reflexion       = d.reflexion || ''
    devo.archivo         = null
    devoExistingUrl.value = d.audioUrl || null
    devoAudioUrl.value   = null
    devoAudioBlob.value  = null
    waveformBars.value   = new Array(BARS).fill(2)
    setEditorContent(reflexionRef, d.reflexion || '')
}

const cancelEditDevo = () => {
    devoEditingId.value  = null
    devoExistingUrl.value = null
    Object.assign(devo, { titulo: '', versiculo: '', reflexion: '', archivo: null })
    setEditorContent(reflexionRef, '')
    clearAudio()
}

let unsubscribeDevo = null
onMounted(() => {
    const q = query(collection(db, 'devotionals'), orderBy('createdAt', 'desc'))
    unsubscribeDevo = onSnapshot(q, (snap) => {
        devotionals.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        loadingDevo.value = false
    })
})

const saveDevo = async () => {
    if (!devo.titulo || !devo.versiculo) return
    savingDevo.value         = true
    devoUploadProgress.value = 0

    try {
        let audioUrl  = null
        let audioPath = null

        const audioSource = devoAudioBlob.value
            || (devo.archivo ? (Array.isArray(devo.archivo) ? devo.archivo[0] : devo.archivo) : null)

        if (audioSource) {
            const ext     = devoAudioBlob.value ? 'webm' : 'mp3'
            audioPath     = `devotionals/${Date.now()}.${ext}`
            const fileRef = storageRef(storage, audioPath)
            const task    = uploadBytesResumable(fileRef, audioSource)

            await new Promise((resolve, reject) => {
                task.on('state_changed',
                    (snap) => {
                        devoUploadProgress.value = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                    },
                    reject, resolve
                )
            })
            audioUrl = await getDownloadURL(task.snapshot.ref)
        }

        if (devoEditingId.value) {
            // Actualizar existente
            const updates = {
                titulo:    devo.titulo.trim(),
                versiculo: devo.versiculo.trim(),
                reflexion: devo.reflexion.trim(),
            }
            // Si subió audio nuevo, reemplazar
            if (audioUrl) {
                const old = devotionals.value.find(d => d.id === devoEditingId.value)
                if (old?.audioPath) await deleteObject(storageRef(storage, old.audioPath)).catch(() => {})
                updates.audioUrl  = audioUrl
                updates.audioPath = audioPath
            } else if (devoExistingUrl.value === null) {
                // El usuario borró el audio existente sin poner uno nuevo
                updates.audioUrl  = null
                updates.audioPath = null
            }
            await updateDoc(doc(db, 'devotionals', devoEditingId.value), updates)
            notify('Devocional actualizado ✓')
            cancelEditDevo()
        } else {
            await addDoc(collection(db, 'devotionals'), {
                titulo:    devo.titulo.trim(),
                versiculo: devo.versiculo.trim(),
                reflexion: devo.reflexion.trim(),
                audioUrl,
                audioPath,
                fecha: new Date().toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                }),
                createdAt: serverTimestamp(),
            })
            notify('Devocional publicado ✓')
            Object.assign(devo, { titulo: '', versiculo: '', reflexion: '', archivo: null })
            setEditorContent(reflexionRef, '')
            clearAudio()
        }
        devoUploadProgress.value = 0
    } catch (e) {
        notify('Error: ' + e.message, 'error')
    } finally {
        savingDevo.value = false
    }
}

const deleteDevo = async (d) => {
    deletingDevoId.value = d.id
    try {
        if (d.audioPath) {
            await deleteObject(storageRef(storage, d.audioPath)).catch(() => {})
        }
        await deleteDoc(doc(db, 'devotionals', d.id))
        notify('Devocional eliminado')
    } catch (e) {
        notify('Error: ' + e.message, 'error')
    } finally {
        deletingDevoId.value = null
    }
}

// ── LOGOUT ──
const handleLogout = async () => {
    await logout()
    closeDrawer()
    cancelEdit()
    notify('Sesión cerrada')
}

onMounted(() => {
    document.addEventListener('click', closeCtxMenu)
    document.addEventListener('click', closeFloatBar)
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCtxMenu(); closeFloatBar() } })
})

onUnmounted(() => {
    document.removeEventListener('click', closeCtxMenu)
    document.removeEventListener('click', closeFloatBar)
    unsubscribeEpisodes?.()
    unsubscribeHymns?.()
    unsubscribeDevo?.()
    if (mediaRecorder?.state === 'recording') mediaRecorder.stop()
    clearInterval(recordingTimer)
    clearInterval(levelInterval)
    if (musicBufferSource) { try { musicBufferSource.stop() } catch {} musicBufferSource = null }
    if (audioContext) audioContext.close()
})
</script>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
.blink { animation: blink 1s step-start infinite; }

.recorder-box {
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.wave-bar {
  width: 3px;
  min-height: 2px;
  border-radius: 2px;
  transition: height 0.06s ease;
  flex-shrink: 0;
}

.format-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.format-toolbar__label {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin-right: 2px;
}

/* Editor enriquecido (contenteditable) */
.rich-editor {
  border: 1px solid rgba(var(--v-border-color), 0.3);
  border-radius: 8px;
  padding: 10px 12px;
  min-height: 90px;
  max-height: 280px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  cursor: text;
  transition: border-color 0.2s, box-shadow 0.2s;
  word-break: break-word;
}
.rich-editor:focus {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.25);
}
.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: rgba(var(--v-theme-on-surface), 0.38);
  pointer-events: none;
  display: block;
}

/* Barra flotante de formato (aparece al seleccionar texto) */
.admin-float-bar {
  position: fixed;
  transform: translateX(-50%) translateY(-100%);
  z-index: 9999;
  background: #1e1e2e;
  border-radius: 8px;
  padding: 3px 5px;
  display: flex;
  align-items: center;
  gap: 1px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.35);
  pointer-events: all;
}
.admin-float-bar::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #1e1e2e;
  border-bottom: none;
}
.fb-btn {
  background: none;
  border: none;
  color: #e0e0e0;
  padding: 4px 7px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  transition: background 0.12s;
}
.fb-btn:hover { background: rgba(255,255,255,0.15); }
.fb-btn--clear { color: #ff8a80; }
.fb-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.15); margin: 0 2px; }

/* Menú contextual clic derecho */
.admin-ctx-menu {
  position: fixed;
  z-index: 9999;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.18);
  padding: 4px 0;
  min-width: 148px;
  font-size: 13px;
  user-select: none;
}
.ctx-item {
  display: block;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 7px 14px;
  cursor: pointer;
  color: rgb(var(--v-theme-on-surface));
  transition: background 0.12s;
}
.ctx-item:hover { background: rgba(var(--v-theme-primary), 0.08); }
.ctx-item--remove { color: rgba(var(--v-theme-on-surface), 0.5); font-size: 12px; }
.ctx-divider {
  height: 1px;
  background: rgba(var(--v-border-color), 0.15);
  margin: 3px 0;
}

.audio-settings {
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px dashed rgba(var(--v-theme-primary), 0.2);
}

.eq-label {
  width: 52px;
  flex-shrink: 0;
}

.eq-value {
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
