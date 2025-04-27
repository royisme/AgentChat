<template>
  <div class="auth-page">
    <v-card class="auth-card mx-auto" max-width="450">
      <v-card-title class="text-center pt-5">
        <div class="logo-container mb-4">
          <v-icon color="primary" size="x-large">mdi-shield</v-icon>
        </div>
        <h1 class="text-h4 font-weight-bold">Welcome Back</h1>
        <p class="text-subtitle-1 text-medium-emphasis mt-2">
          Sign in to continue to your account
        </p>
      </v-card-title>

      <v-card-text>
        <v-alert
          v-if="error"
          class="mb-4"
          closable
          type="error"
          variant="tonal"
          @click:close="clearError"
        >
          {{ error }}
        </v-alert>
        <div v-if="isLoading" class="text-center my-4">
          <v-progress-circular color="primary" indeterminate />
          <p>Verifying...</p>
        </div>
        <!-- Firebase UI 容器 -->
        <div id="firebaseui-auth-container" class="mt-4" />
      </v-card-text>

      <v-card-text class="text-center text-caption pt-0">
        <p class="text-medium-emphasis">
          By signing in, you agree to our
          <a class="text-decoration-none" href="#">Terms of Service</a> and
          <a class="text-decoration-none" href="#">Privacy Policy</a>
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/auth';
  import { useThemeStore } from '@/stores/theme';
  import { auth } from '@/plugins/firebase';
  import * as firebaseui from 'firebaseui';
  import 'firebaseui/dist/firebaseui.css';
  import { GoogleAuthProvider } from 'firebase/auth';
  import { authService } from '@/services/authService';
  import 'firebaseui/dist/firebaseui.css';

  const authStore = useAuthStore();
  const themeStore = useThemeStore();
  const router = useRouter();
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  let ui: firebaseui.auth.AuthUI | null = null;

  onMounted(() => {
    // 初始化FirebaseUI
    ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    // 配置FirebaseUI
    const uiConfig = {
      signInFlow: 'popup',
      signInSuccessUrl: '/chat',
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult (authResult) {
          isLoading.value = true; // Indicate backend processing
          error.value = null;

          // Get the Firebase ID token from the AuthResult
          authResult.user.getIdToken()
            .then(async idToken => {
              // Send the ID token to your backend
              try {
                const backendResponse = await authService.googleLogin(idToken);
                if (backendResponse.data) {
                  // Login using your auth store with data from YOUR backend response
                  await authStore.login(backendResponse.data);
                  // Navigate programmatically AFTER your backend confirms and sends internal token
                  router.push('/chat'); // Or the intended destination
                } else {
                  throw new Error(backendResponse.message || 'Backend login failed.');
                }
              } catch (err: any) {
                console.error('Backend Login Error:', err);
                error.value = err.message || 'Login with backend failed.';
                isLoading.value = false;

              }
            })
            .catch(tokenError => {
              console.error('Error getting ID token:', tokenError);
              error.value = 'Could not get authentication token.';
              isLoading.value = false;
            });
          return false;
        },
        uiShown: () => {
        },
        signInFailure (uiError) {
          console.error('FirebaseUI Error:', uiError);
          if (!error.value) {
            error.value = uiError.message || 'Sign in failed. Please try again.';
          }
          isLoading.value = false;
        },
      },
      tosUrl: '#',
      privacyPolicyUrl: '#',
    };

    // 启动FirebaseUI
    ui.start('#firebaseui-auth-container', uiConfig);
  });

  onUnmounted(() => {
    // 清理UI实例
    if (ui) {
      ui.delete();
    }
  });

  const clearError = () => {
    error.value = null;
  };
</script>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 85vh;
  padding: 16px;
}

.auth-card {
  width: 100%;
  border-radius: 12px;
}

.logo-container {
  width: 64px;
  height: 64px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind("themeStore.isDark ? 'var(--v-theme-surface-variant)' : 'var(--v-theme-primary-lighten-5)'");
  border-radius: 50%;
}

/* Firebase UI 定制样式覆盖 */
:deep(.firebaseui-container) {
  max-width: 100%;
  background: transparent;
}

:deep(.firebaseui-card-content) {
  padding: 0;
}

:deep(.firebaseui-idp-button) {
  border-radius: 8px;
  padding: 8px 12px;
}

:deep(.firebaseui-idp-text) {
  font-size: 16px;
}
</style>
