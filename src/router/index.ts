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
router.beforeEach(async (to, from, next) => {
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

    if (authStore.isInternalTokenExpired) {
      console.log('路由守卫: 内部token已过期，尝试刷新...');
      const refreshed = await authStore.refreshInternalToken();
      if (refreshed) {
        // 刷新成功，继续导航
        return next();
      } else {
        // 刷新失败，重定向到登录页
        console.log('路由守卫: token刷新失败，重定向到登录页');
        return next('/auth/login');
      }
    }
    next('/auth/login')
  } else {
    next()
  }
  // 处理已登录用户访问登录/注册页的情况
  if (to.path.startsWith('/auth/login') && authStore.isAuthenticated) {
    console.log('路由守卫: 已登录用户尝试访问登录页，重定向到仪表盘');
    return next('/chat');
  }

  // 对于不需要认证的路由，直接通过
  return next();
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
