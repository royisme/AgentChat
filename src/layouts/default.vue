<template>
  <div class="default-layout">
    <v-app-bar :color="themeStore.isDark ? 'surface' : 'primary'" :dark="themeStore.isDark">
      <v-container class="d-flex align-center">
        <v-icon class="mr-2" icon="mdi-shield" />
        <v-app-bar-title>Insurance AI Assistant</v-app-bar-title>
        <v-spacer />
        <ThemeToggle class="mr-4" />
        <v-btn
          class="text-none"
          color="secondary"
          @click="router.push('/chat')"
        >
          Get Started
        </v-btn>
      </v-container>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router'
  import { useThemeStore } from '@/stores/theme'
  import ThemeToggle from '@/components/ThemeToggle.vue'

  const router = useRouter()
  const themeStore = useThemeStore()
// 可选：添加布局相关逻辑（如导航栏状态）
</script>
