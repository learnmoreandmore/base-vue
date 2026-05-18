<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

defineProps<NodeProps>()
</script>

<template>
  <div class="flow-node flow-node--end">
    <Handle class="flow-handle" type="target" :position="Position.Top" />
    <span class="flow-node__badge">结束</span>
    <div class="flow-node__title">{{ data.label }}</div>
    <p v-if="data.roleName || data.roleId" class="flow-node__role">
      <span class="flow-node__role-name">{{ data.roleName || '未填岗位名' }}</span>
      <span v-if="data.roleId" class="flow-node__role-id">{{ data.roleId }}</span>
    </p>
  </div>
</template>

<style scoped>
.flow-node {
  min-width: 120px;
  padding: 18px 12px 10px;
  border-radius: 10px;
  border: 2px solid var(--el-color-info);
  background: var(--el-fill-color-blank);
  box-shadow: var(--el-box-shadow-light);
  text-align: center;
}
.flow-node--end {
  border-color: var(--el-color-info);
}
.flow-node__badge {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.flow-node__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.flow-node__role {
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 1.35;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.flow-node__role-name {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.flow-node__role-id {
  font-family: ui-monospace, monospace;
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  word-break: break-all;
}
.flow-handle {
  width: 10px;
  height: 10px;
  border: 2px solid var(--el-color-info);
  background: #fff;
}
</style>
