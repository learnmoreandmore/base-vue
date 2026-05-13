<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import { getFirstAccessibleMenuPath } from '@/router/firstMenuPath'

const router = useRouter()
const permissionStore = usePermissionStore()

const homePath = computed(() => getFirstAccessibleMenuPath(permissionStore.menus))

const goHome = () => {
  void router.push(homePath.value)
}
</script>

<template>
  <div class="error-page">
    <el-result icon="info" title="404" sub-title="页面不存在或链接已失效">
      <template #extra>
        <el-button type="primary" @click="goHome">返回工作台</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.error-page {
  padding: 120px 16px 0;
}
</style>
