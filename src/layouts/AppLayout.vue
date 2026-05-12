<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'
import { useMediaQuery } from '@/composables/useMediaQuery'
import AppSideMenu from '@/components/layout/AppSideMenu.vue'
import AppTabHistoryBar from '@/components/layout/AppTabHistoryBar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const tabsStore = useTabsStore()

const isMobile = useMediaQuery('(max-width: 991.98px)')
const drawerVisible = ref(false)

const contentViewKey = computed(() => tabsStore.viewKey(route.fullPath))

watch(
  () => route.fullPath,
  () => {
    tabsStore.syncFromRoute(route)
    if (isMobile.value) {
      drawerVisible.value = false
    }
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
    <el-aside v-if="!isMobile" width="220px" class="app-layout__aside">
      <div class="app-layout__logo">Enterprise Admin</div>
      <AppSideMenu />
    </el-aside>

    <el-container class="app-layout__body">
      <el-header class="app-layout__header">
        <div class="app-layout__header-top">
          <div class="app-layout__header-left">
            <el-button
              v-if="isMobile"
              class="app-layout__nav-toggle"
              text
              type="primary"
              aria-label="打开菜单"
              @click="drawerVisible = true"
            >
              <el-icon :size="22"><Menu /></el-icon>
            </el-button>
          </div>
          <div class="app-layout__user">
            <span class="app-layout__user-name">{{ userStore.userInfo?.name }}</span>
            <el-button text type="primary" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
        <!-- <div class="app-layout__breadcrumb-row">
          <el-breadcrumb class="app-layout__breadcrumb" separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in layoutBreadcrumbs"
              :key="`${item.title}-${index}`"
            >
              <router-link
                v-if="index < layoutBreadcrumbs.length - 1 && item.path"
                class="app-layout__crumb-link"
                :to="item.path"
              >
                {{ item.title }}
              </router-link>
              <span v-else class="app-layout__crumb-current">{{ item.title }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div> -->
        <AppTabHistoryBar class="app-layout__tabs" />
      </el-header>
      <el-main class="app-layout__main">
        <router-view :key="contentViewKey" />
      </el-main>
    </el-container>

    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      :size="280"
      :with-header="false"
      append-to-body
      class="app-layout__drawer"
      body-class="app-layout__drawer-body"
    >
      <div class="app-layout__drawer-inner">
        <div class="app-layout__logo">Enterprise Admin</div>
        <AppSideMenu />
      </div>
    </el-drawer>
  </el-container>
</template>

<style scoped>
.app-layout {
  height: 100%;
  min-height: 100vh;
  min-height: 100dvh;
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
  justify-content: space-between;
  flex-shrink: 0;
  padding: 0 16px;
  min-height: 48px;
}

.app-layout__tabs {
  flex-shrink: 0;
  padding: 0 12px;
}

.app-layout__breadcrumb-row {
  flex-shrink: 0;
  padding: 4px 16px 6px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.app-layout__breadcrumb {
  font-size: 13px;
  line-height: 1.5;
}

.app-layout__breadcrumb :deep(.el-breadcrumb__inner) {
  font-weight: 400;
}

.app-layout__crumb-link {
  color: var(--el-color-primary);
  text-decoration: none;
}

.app-layout__crumb-link:hover {
  opacity: 0.85;
}

.app-layout__crumb-current {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.app-layout__header-left {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  margin-right: 8px;
}

.app-layout__nav-toggle {
  flex-shrink: 0;
  padding: 8px;
  margin-right: 4px;
  min-width: 40px;
  min-height: 40px;
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-layout__user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 991.98px) {
  .app-layout__user-name {
    max-width: 72px;
  }
}

@media (max-width: 374.98px) {
  .app-layout__user-name {
    display: none;
  }
}
</style>

<style>
/* 抽屉内与侧栏一致，需非 scoped */
.app-layout__drawer .el-drawer__body.app-layout__drawer-body {
  padding: 0;
  background: #001529;
  overflow: hidden;
}

.app-layout__drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-layout__drawer-inner .menu-panel {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  border-right: none;
}
</style>
