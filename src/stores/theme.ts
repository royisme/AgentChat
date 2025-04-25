import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', () => {
  const vuetifyTheme = useTheme()
  const isDark = ref(false)
  const THEME_KEY = 'preferred_theme'

  // Initialize theme from localStorage or system preference
  function initializeTheme () {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme) {
      isDark.value = savedTheme === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  }

  // Update Vuetify theme
  function updateTheme () {
    vuetifyTheme.global.name.value = isDark.value ? 'darkTheme' : 'lightTheme'
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }

  // Toggle theme
  function toggleTheme () {
    isDark.value = !isDark.value
    updateTheme()
  }

  // Watch for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) {
      isDark.value = e.matches
      updateTheme()
    }
  })

  return {
    isDark,
    toggleTheme,
    initializeTheme,
  }
})
