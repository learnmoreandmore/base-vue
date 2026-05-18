<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

defineProps<NodeProps>()
</script>

<template>
  <div class="flow-node flow-node--decision">
    <Handle class="flow-handle flow-handle--target" type="target" :position="Position.Top" />
    <span class="flow-node__badge">判断</span>
    <div class="flow-node__title">{{ data.label }}</div>
    <p v-if="data.hint" class="flow-node__hint">{{ data.hint }}</p>
    <p v-if="data.conditionExpression" class="flow-node__expr">
      {{ String(data.conditionExpression).length > 90 ? String(data.conditionExpression).slice(0, 90) + '…' : data.conditionExpression }}
    </p>
    <div class="flow-node__branch-labels">
      <span>是</span>
      <span>否</span>
    </div>
    <Handle
      id="yes"
      class="flow-handle flow-handle--yes"
      type="source"
      :position="Position.Bottom"
      :style="{ left: '28%' }"
    />
    <Handle
      id="no"
      class="flow-handle flow-handle--no"
      type="source"
      :position="Position.Bottom"
      :style="{ left: '72%' }"
    />
  </div>
</template>

<style scoped>
.flow-node {
  position: relative;
  min-width: 160px;
  padding: 14px 12px 22px;
  border-radius: 10px;
  border: 2px dashed var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  box-shadow: var(--el-box-shadow-light);
  text-align: center;
}
.flow-node--decision {
  border-color: var(--el-color-warning);
}
.flow-node__badge {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--el-color-warning-light-7);
  color: var(--el-color-warning-dark-2);
  margin-bottom: 6px;
}
.flow-node__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.flow-node__hint {
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  line-height: 1.35;
}
.flow-node__expr {
  margin: 6px 0 0;
  padding: 6px 8px;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  text-align: left;
  line-height: 1.35;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  word-break: break-all;
  max-height: 4.2em;
  overflow: hidden;
}
.flow-node__branch-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 12px 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.flow-handle {
  width: 10px;
  height: 10px;
}
.flow-handle--target {
  border-color: var(--el-color-warning);
  background: #fff;
}
.flow-handle--yes {
  border-color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}
.flow-handle--no {
  border-color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
</style>
