<script setup lang="ts">
import { ref } from 'vue'
import { usePermission } from '@/composables/usePermission'

const { hasPermission } = usePermission()
const users = ref([
  { name: '张三', role: '运营', status: '启用' },
  { name: '李四', role: '审计', status: '启用' },
  { name: '王五', role: '仓储', status: '停用' },
])
</script>

<template>
  <el-card>
    <el-space wrap class="mb12">
      <el-button type="primary">新增角色</el-button>
      <el-button v-if="hasPermission('system:permission:edit')">保存权限配置</el-button>
    </el-space>
    <div class="table-responsive">
      <el-table :data="users" border>
        <el-table-column prop="name" label="用户" min-width="100" />
        <el-table-column prop="role" label="角色" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="88" />
      </el-table>
    </div>
  </el-card>
</template>

<style scoped>
.mb12 {
  margin-bottom: 12px;
}
</style>
