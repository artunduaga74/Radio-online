// src/utils/useThemeSettings.js
// Estado global de tema — persiste en localStorage

import { ref } from 'vue'

export const PALETAS = [
  { nombre: 'Índigo',  valor: '#283593' },
  { nombre: 'Azul',    valor: '#1565C0' },
  { nombre: 'Morado',  valor: '#6A1B9A' },
  { nombre: 'Verde',   valor: '#2E7D32' },
  { nombre: 'Granate', valor: '#B71C1C' },
  { nombre: 'Teal',    valor: '#00695C' },
]

export const isDark      = ref(localStorage.getItem('darkMode')    === 'true')
export const activeColor = ref(localStorage.getItem('themeColor')  || '#283593')
