<template>
  <div class="default-layout">
    <AppBar />
    <v-main class="main-content">
      <router-view />
    </v-main>
    <AppFooter class="app-footer" />
  </div>

</template>

<script lang="ts" setup>
  import AppBar from '@/components/AppBar.vue'
  import AppFooter from '@/components/AppFooter.vue';

  import { onMounted, onUnmounted, ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useRouter } from 'vue-router';

  const authStore = useAuthStore();
  const router = useRouter();
  const tokenCheckInterval = ref<number | null>(null);
  const userActivityTimeout = ref<number | null>(null);
  const isUserActive = ref(true);

  // 默认设置
  const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5分钟检查一次
  const USER_INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30分钟无活动视为不活跃

  /**
   * 验证token的有效性
   * 如果token无效或过期，尝试刷新或重定向到登录页
   */
  const validateToken = async () => {
    // 如果用户未登录或不活跃，跳过验证
    if (!authStore.isAuthenticated || !isUserActive.value) {
      return;
    }

    try {
      // 首先检查内存中token是否已过期
      if (authStore.isInternalTokenExpired) {
        console.log('内部token已过期，尝试刷新...');
        const refreshed = await authStore.refreshInternalToken();
        if (!refreshed) {
          console.log('Token刷新失败，重定向到登录页');
          router.push('/login');
        }
        return;
      }

      // 调用后端API验证token
      const isValid = await authStore.verifyToken();
      if (isValid ) {
        console.log('Token验证成功');
      } else {
        console.log('Token验证失败，尝试刷新...');
        const refreshed = await authStore.refreshInternalToken();
        if (!refreshed) {
          console.log('Token刷新失败，重定向到登录页');
          router.push('/auth/login');
        }
      }

    } catch (error) {
      console.error('Token验证过程中出错:', error);
      router.push('/auth/login');

    }
  };

  /**
   * 重置用户活动状态
   * 每当用户有交互时调用此函数
   */
  const resetUserActivity = () => {
    isUserActive.value = true;

    // 清除之前的定时器
    if (userActivityTimeout.value) {
      clearTimeout(userActivityTimeout.value);
    }

    // 设置新的不活跃定时器
    userActivityTimeout.value = setTimeout(() => {
      isUserActive.value = false;
    }, USER_INACTIVITY_TIMEOUT);
  };

  // 组件挂载时的初始化
  onMounted(() => {
    // 添加用户活动监听
    document.addEventListener('mousemove', resetUserActivity);
    document.addEventListener('keydown', resetUserActivity);
    document.addEventListener('click', resetUserActivity);
    document.addEventListener('touchstart', resetUserActivity);

    // 初始化用户活动状态
    resetUserActivity();

    // 立即进行一次token验证
    validateToken();

    // 设置定期验证token的定时器
    tokenCheckInterval.value = setInterval(validateToken, TOKEN_CHECK_INTERVAL);

    // 当用户从离开页面后回来时，也验证一次token
    window.addEventListener('focus', validateToken);
  });

  // 组件卸载时的清理
  onUnmounted(() => {
    // 移除所有事件监听
    document.removeEventListener('mousemove', resetUserActivity);
    document.removeEventListener('keydown', resetUserActivity);
    document.removeEventListener('click', resetUserActivity);
    document.removeEventListener('touchstart', resetUserActivity);
    window.removeEventListener('focus', validateToken);

    // 清除所有定时器
    if (tokenCheckInterval.value) {
      clearInterval(tokenCheckInterval.value);
    }

    if (userActivityTimeout.value) {
      clearTimeout(userActivityTimeout.value);
    }
  });
</script>

<style scoped>
.default-layout {
  min-height: 100vh; /* 至少占满视口高度 */
  display: flex;
  flex-direction: column;
}
.app-footer {
  width: 100%;
  max-height: fit-content;
  z-index: 1;
}
</style>
