<script lang="ts" setup>
  import { useRouter } from 'vue-router'
  import { useThemeStore } from '@/stores/theme'
  import { useAuthStore } from '@/stores/auth'
  import ThemeToggle from '@/components/ThemeToggle.vue'

  const router = useRouter()
  const themeStore = useThemeStore()
  const authStore = useAuthStore() // Instantiate Auth Store
  watchEffect(() => {
    if (authStore.user) {
      console.log('Firebase User Object:', authStore.user);
    // 可以更具体地检查 providerData
    }
  });

  const handleLogout = async () => {
    await authStore.logout();
    router.push('/');
  }

  const goToProfile = () => {
    router.push('/user/profile');
  }

</script>
<template>
  <v-app-bar :color="themeStore.isDark ? 'surface' : 'primary'" :dark="themeStore.isDark">
    <v-container class="d-flex align-center">
      <v-btn class="mr-2" icon @click="router.push('/')">
        <v-icon class="mr-2" icon="mdi-shield" />

        <v-app-bar-title>AI Agent Hub</v-app-bar-title>
      </v-btn>
      <v-spacer />

      <ThemeToggle class="mr-4" />

      <template v-if="authStore.isAuthenticated">
        <v-menu offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" class="mr-2" icon>
              <v-avatar v-if="authStore.user?.picture" :image="authStore.user.picture" size="36" />
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="goToProfile">
              <template #prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleLogout">
              <template #prepend>
                <v-icon color="error">mdi-logout</v-icon>
              </template>
              <v-list-item-title class="text-error">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn
          class="text-none mr-2"
          variant="outlined"
          @click="router.push('/chat')"
        >
          Chat
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          class="text-none mr-2"
          variant="outlined"
          @click="router.push('/auth/login')"
        >
          Login
        </v-btn>
      </template>

    </v-container>
  </v-app-bar>
</template>
