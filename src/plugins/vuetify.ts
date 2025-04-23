/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

const lightThemeColors = {
  primary: '#3F51B5',
  'primary-darken-1': '#303F9F',
  secondary: '#009688',
  'secondary-darken-1': '#00796B',
  accent: '#FFC107',
  error: '#B00020',
  info: '#2196F3',
  success: '#4CAF50',
  warning: '#FB8C00',
  userMessageBg: '#E3F2FD',
  agentMessageBg: '#E8F5E9',
}

const darkThemeColors = {
  primary: '#7986CB',
  'primary-darken-1': '#5C6BC0',
  secondary: '#4DB6AC',
  'secondary-darken-1': '#26A69A',
  accent: '#FFCA28',
  error: '#CF6679',
  info: '#64B5F6',
  success: '#81C784',
  warning: '#FFB74D',
  userMessageBg: '#1E295A',
  agentMessageBg: '#1B3E1E',
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        dark: false,
        colors: lightThemeColors,
      },
      dark: {
        dark: true,
        colors: darkThemeColors,
      },
    },
  },
})
