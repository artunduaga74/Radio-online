import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const colores = {
  primary:   '#283593',
  secondary: '#455a64',
  error:     '#B00020',
  info:      '#2196F3',
  success:   '#4CAF50',
  warning:   '#FB8C00',
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: { ...colores },
      },
      dark: {
        dark: true,
        colors: { ...colores },
      },
    },
  },
})
