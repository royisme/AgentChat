<template>
  <div class="chat-page">
    <Chat />
  </div>
</template>

  <script setup lang="ts">
  import Chat from '@/components/Chat.vue';
  </script>
<style scoped>
.chat-page {
  /* 精确控制聊天页面高度 */
  height: calc(100vh - var(--app-bar-height) - var(--app-footer-height));
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: top;
  padding: 0;
  overflow: hidden; /* 禁止此页面滚动 */

  /* 使用CSS变量方便适应不同设备 */
  --app-bar-height: 64px; /* AppBar的高度 */
  --app-footer-height: 56px; /* AppFooter的高度 */
}

/* 在大屏幕上调整 */
@media (min-width: 960px) {
  .chat-page {
    --app-bar-height: 64px;
    --app-footer-height: 56px;
  }
}

/* 在小屏幕上调整 */
@media (max-width: 959px) {
  .chat-page {
    --app-bar-height: 56px;
    --app-footer-height: 48px;
  }
}
</style>
