<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import type { BackendRoute } from '@/types/auth'

const route = useRoute()
const permissionStore = usePermissionStore()

const menuRoutes = computed(() => permissionStore.menus)
const activePath = computed(() => route.path)

/** 仅一个子项且标记 hideInMenu 时，侧栏用一级「父级标题」直达子路由（如首页、AI 助手） */
const isFlattenedSingleHiddenChild = (menu: BackendRoute) =>
  Boolean(menu.children?.length === 1 && menu.children[0].meta?.hideInMenu)
</script>

<template>
  <el-menu :default-active="activePath" router class="menu-panel">
    <template v-for="menu in menuRoutes" :key="menu.path">
      <el-menu-item
        v-if="isFlattenedSingleHiddenChild(menu) && menu.children?.[0]"
        :index="menu.children[0].path"
      >
        {{ menu.meta.title }}
      </el-menu-item>
      <el-sub-menu v-else-if="menu.children?.length" :index="menu.path">
        <template #title>{{ menu.meta.title }}</template>
        <el-menu-item
          v-for="child in menu.children.filter((c) => !c.meta?.hideInMenu)"
          :key="child.path"
          :index="child.path"
        >
          {{ child.meta.title }}
        </el-menu-item>
      </el-sub-menu>
      <el-menu-item v-else :index="menu.path">
        {{ menu.meta.title }}
      </el-menu-item>
    </template>
  </el-menu>
</template>
