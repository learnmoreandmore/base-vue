<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

defineProps<NodeProps>()
</script>

<template>
  <div class="flow-node flow-node--start">
    <span class="flow-node__badge">开始</span>
    <div class="flow-node__title">{{ data.label }}</div>
    <p v-if="data.roleName || data.roleId" class="flow-node__role">
      <span class="flow-node__role-name">{{ data.roleName || '未填岗位名' }}</span>
      <span v-if="data.roleId" class="flow-node__role-id">{{ data.roleId }}</span>
    </p>
    <Handle class="flow-handle" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node {
  min-width: 120px;
  padding: 10px 12px 18px;
  border-radius: 10px;
  border: 2px solid var(--el-color-success);
  background: var(--el-fill-color-blank);
  box-shadow: var(--el-box-shadow-light);
  text-align: center;
}
.flow-node--start {
  border-color: var(--el-color-success);
}
.flow-node__badge {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
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
  border: 2px solid var(--el-color-success);
  background: #fff;
}
</style>
