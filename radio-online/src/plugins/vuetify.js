import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const colores = {
  primary:   '#283593',
  secondary: '#455a64',
  error:     '#B00020',
  info:      '#2196F3',
  success:   '#4CAF50',
  warning:   '#FB8C00',
}

export default createVuetify({
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
  defaultAssets: {
    font:  false,
    icons: 'mdi',
  },
})
