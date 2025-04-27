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
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
// Light theme
const lightTheme = {
  dark: false,
  colors: {
    primary: '#002D72', // Navy
    secondary: '#FF7900', // Orange
    accent: '#8C9EFF',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    background: '#F5F7FA',
    surface: '#FFFFFF',
    'primary-darken-1': '#001D4D',
    'secondary-darken-1': '#CC6100',
    'surface-variant': '#F2F4F7',
    'on-surface-variant': '#1F2937',
  },
}

// Dark theme
const darkTheme = {
  dark: true,
  colors: {
    primary: '#3B82F6',
    secondary: '#F97316',
    accent: '#93C5FD',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#EF4444',
    background: '#111827',
    surface: '#1F2937',
    'primary-darken-1': '#2563EB',
    'secondary-darken-1': '#EA580C',
    'surface-variant': '#374151',
    'on-surface-variant': '#E5E7EB',
  },
}

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
      darkTheme,
    },
  },
})
