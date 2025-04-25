/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!authStore.appToken) {
    authStore.initializeAuth()
  }
  // 定义需要认证的路由路径列表
  const authRequiredRoutes = ['/chat', '/user'] // 添加所有需要认证的路径

  // 检查当前路由是否需要认证
  const requiresAuth = authRequiredRoutes.some(route => to.path.startsWith(route));
  // --- 添加详细日志 ---
  console.log(
    `Router Guard: Navigating to '${to.path}'. Requires Auth: ${requiresAuth}. Store isAuthenticated: ${authStore.isAuthenticated}. Token exists: ${!!authStore.appToken}`
  );
  // --- 结束添加日志 ---

  console.log('路由:', to.path, '需要认证:', requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {

    /*
    //If the token is expired, try refreshing it silently before redirecting
    if (authStore.isInternalTokenExpired && authStore.internalRefreshToken) {
        authStore.refreshInternalToken().then(success => {
            if (success) {
                next(); // Allow navigation if refresh succeeded
            } else {
                next('/auth/login'); // Redirect if refresh failed
            }
        });
    } else {
        next('/auth/login'); // Redirect if not authenticated or no refresh token
    }
    */
    next('/auth/login')
  } else {
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})


export default router
