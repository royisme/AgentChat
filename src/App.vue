<script setup lang="ts">
  import { useAuthStore } from '@/stores/auth'
  import { useThemeStore } from '@/stores/theme'
  const themeStore = useThemeStore()
  const authStore = useAuthStore()

  authStore.initializeAuth()
  themeStore.initializeTheme()

</script>

<template>
  <v-app>
    <router-view v-slot="{ Component }">
      <transition mode="out-in" name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </v-app>
</template>
<style>
#app {
  width: 100%;
  height: 100%;
}
</style>
