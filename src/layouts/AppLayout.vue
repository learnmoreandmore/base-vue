<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'
import AppSideMenu from '@/components/layout/AppSideMenu.vue'
import AppTabHistoryBar from '@/components/layout/AppTabHistoryBar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()

const contentViewKey = computed(() => tabsStore.viewKey(route.fullPath))

watch(
  () => route.fullPath,
  () => {
    tabsStore.syncFromRoute(route)
  },
  { immediate: true },
)

const handleLogout = async () => {
  await userStore.logout()
  await router.replace('/login')
}
</script>

<template>
  <el-container class="app-layout">
    <el-aside width="220px" class="app-layout__aside">
      <div class="app-layout__logo">Enterprise Admin</div>
      <AppSideMenu />
    </el-aside>

    <el-container class="app-layout__body">
      <el-header class="app-layout__header">
        <div class="app-layout__header-top">
          <div class="app-layout__user">
            <span class="app-layout__user-name">{{ userStore.userInfo?.name }}</span>
            <el-button text type="primary" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
        <AppTabHistoryBar class="app-layout__tabs" />
      </el-header>
      <el-main class="app-layout__main">
        <router-view :key="contentViewKey" />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-layout {
  height: 100%;
  min-height: 100vh;
}

.app-layout__body.el-container {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.app-layout__main {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  background: var(--el-bg-color-page);
}

.app-layout__header {
  height: auto !important;
  min-height: 56px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.app-layout__header-top {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  padding: 0 16px;
  min-height: 48px;
}

.app-layout__tabs {
  flex-shrink: 0;
  padding: 0 12px;
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-layout__user-name {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
