<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

defineProps<NodeProps>()
</script>

<template>
  <div class="flow-node flow-node--task">
    <Handle class="flow-handle flow-handle--target" type="target" :position="Position.Top" />
    <span class="flow-node__badge">任务</span>
    <div class="flow-node__title">{{ data.label }}</div>
    <p v-if="data.roleName || data.roleId" class="flow-node__role">
      <span class="flow-node__role-name">{{ data.roleName || '未填岗位名' }}</span>
      <span v-if="data.roleId" class="flow-node__role-id">{{ data.roleId }}</span>
    </p>
    <p v-if="data.description" class="flow-node__desc">{{ data.description }}</p>
    <Handle class="flow-handle flow-handle--source" type="source" :position="Position.Bottom" />
  </div>
</template>

<style scoped>
.flow-node {
  min-width: 140px;
  max-width: 220px;
  padding: 14px 12px 20px;
  border-radius: 10px;
  border: 2px solid var(--el-color-primary);
  background: var(--el-fill-color-blank);
  box-shadow: var(--el-box-shadow-light);
  text-align: center;
}
.flow-node--task {
  border-color: var(--el-color-primary);
}
.flow-node__badge {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  margin-bottom: 6px;
}
.flow-node__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  word-break: break-word;
}
.flow-node__role {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.35;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
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
.flow-node__desc {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  text-align: left;
}
.flow-handle {
  width: 10px;
  height: 10px;
  border: 2px solid var(--el-color-primary);
  background: #fff;
}
</style>
