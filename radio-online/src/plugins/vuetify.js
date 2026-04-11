/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles

import '@mdi/font/css/materialdesignicons.css' // 👈 esto trae solo los iconos
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'system',
  },
    defaultAssets: {
    font: false, // ❌ no cargar Roboto automático
    icons: 'mdi'
    }
})
