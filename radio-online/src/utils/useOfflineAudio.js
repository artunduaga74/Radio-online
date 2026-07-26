/**
 * useOfflineAudio.js
 * Almacena audio (himnos y devocionales) en IndexedDB para reproducción offline.
 *
 * Claves:  hymn_{id}   →  himno
 *          devo_{id}   →  devocional
 *
 * Cada registro: { key, blob, titulo, type, savedAt }
 */

const DB_NAME    = 'filadelfia_offline'
const DB_VERSION = 1
const STORE      = 'audio'

let _db = null

// ── Abrir / crear la base de datos ──────────────────────────────
const openDB = () => new Promise((resolve, reject) => {
  if (_db) { resolve(_db); return }
  const req = indexedDB.open(DB_NAME, DB_VERSION)
  req.onupgradeneeded = (e) => {
    const db = e.target.result
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: 'key' })
    }
  }
  req.onsuccess = (e) => { _db = e.target.result; resolve(_db) }
  req.onerror   = (e) => reject(e.target.error)
})

// ── Guardar blob de audio ────────────────────────────────────────
export const saveAudio = async (key, blob, meta = {}) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ key, blob, ...meta, savedAt: Date.now() })
    tx.oncomplete = resolve
    tx.onerror    = (e) => reject(e.target.error)
  })
}

// ── Recuperar registro (incluye el blob) ────────────────────────
export const getAudio = async (key) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = (e) => resolve(e.target.result ?? null)
    req.onerror   = (e) => reject(e.target.error)
  })
}

// ── Eliminar un registro ─────────────────────────────────────────
export const deleteAudio = async (key) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = resolve
    tx.onerror    = (e) => reject(e.target.error)
  })
}

// ── Obtener todas las claves guardadas ───────────────────────────
export const getAllKeys = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAllKeys()
    req.onsuccess = (e) => resolve(e.target.result ?? [])
    req.onerror   = (e) => reject(e.target.error)
  })
}

// ── Crear URL reproducible desde IndexedDB ───────────────────────
// Devuelve { url, revoke } — llama revoke() al terminar de reproducir
// para liberar memoria.
export const getBlobUrl = async (key) => {
  const record = await getAudio(key)
  if (!record?.blob) return null
  const url = URL.createObjectURL(record.blob)
  return { url, revoke: () => URL.revokeObjectURL(url) }
}
