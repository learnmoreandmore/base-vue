<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Connection, EdgeMouseEvent, NodeMouseEvent } from '@vue-flow/core'
import { MarkerType, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

import FlowStartNode from './flow-designer/FlowStartNode.vue'
import FlowEndNode from './flow-designer/FlowEndNode.vue'
import FlowTaskNode from './flow-designer/FlowTaskNode.vue'
import FlowDecisionNode from './flow-designer/FlowDecisionNode.vue'
import {
  createEdgeId,
  createNodeId,
  STORAGE_KEY,
  type FlowDefinition,
  type FlowEdgeData,
  type FlowNodeData,
} from './flow-designer/flowTypes'

/** 合并默认字段，兼容旧版已存 localStorage 的流程图 */
function normalizeNodeData(raw: Record<string, unknown>): FlowNodeData {
  return {
    label: String(raw.label ?? ''),
    description: String(raw.description ?? ''),
    hint: String(raw.hint ?? ''),
    roleName: String(raw.roleName ?? ''),
    roleId: String(raw.roleId ?? ''),
    conditionExpression: String(raw.conditionExpression ?? ''),
  }
}

const nodeTypes = {
  flowStart: markRaw(FlowStartNode),
  flowEnd: markRaw(FlowEndNode),
  flowTask: markRaw(FlowTaskNode),
  flowDecision: markRaw(FlowDecisionNode),
}

const flowName = ref('默认审批流')
const nodes = ref<any[]>([])
const edges = ref<any[]>([])

const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

const selectedNode = computed((): any | null => {
  const id = selectedNodeId.value
  if (!id) return null
  return nodes.value.find((n: { id: string }) => n.id === id) ?? null
})
const selectedEdge = computed((): any | null => {
  const id = selectedEdgeId.value
  if (!id) return null
  return edges.value.find((e: { id: string }) => e.id === id) ?? null
})

let placeCursor = { x: 200, y: 120 }

function defaultDefinition(): FlowDefinition {
  const startId = 'n-start'
  const t1 = 'n-task-1'
  const d1 = 'n-dec-1'
  const t2 = 'n-task-2'
  const endId = 'n-end'
  return {
    name: '示例：部门审批 + 金额分支',
    nodes: [
      {
        id: startId,
        type: 'flowStart',
        position: { x: 200, y: 20 },
        data: normalizeNodeData({
          label: '提交申请',
          roleName: '',
          roleId: '',
        }),
      },
      {
        id: t1,
        type: 'flowTask',
        position: { x: 170, y: 140 },
        data: normalizeNodeData({
          label: '直属上级审批',
          description: '单人审批即可向下',
          roleName: '部门经理',
          roleId: 'ROLE_DEPT_MANAGER',
        }),
      },
      {
        id: d1,
        type: 'flowDecision',
        position: { x: 150, y: 280 },
        data: normalizeNodeData({
          label: '金额是否 ≥ 1 万',
          hint: '从「是 / 否」句柄拖出连线；节点表达式描述本步判定依据',
          conditionExpression: 'Number(context.amount) >= 10000',
        }),
      },
      {
        id: t2,
        type: 'flowTask',
        position: { x: 380, y: 400 },
        data: normalizeNodeData({
          label: '财务复核',
          description: '高额走财务',
          roleName: '财务专员',
          roleId: 'ROLE_FINANCE',
        }),
      },
      {
        id: endId,
        type: 'flowEnd',
        position: { x: 200, y: 520 },
        data: normalizeNodeData({
          label: '归档',
          roleName: '',
          roleId: '',
        }),
      },
    ],
    edges: [
      {
        id: createEdgeId(startId, t1),
        source: startId,
        target: t1,
        type: 'smoothstep',
        markerEnd: MarkerType.ArrowClosed,
        data: { branchLabel: '', expression: '' },
      },
      {
        id: createEdgeId(t1, d1),
        source: t1,
        target: d1,
        type: 'smoothstep',
        markerEnd: MarkerType.ArrowClosed,
        data: { branchLabel: '', expression: '' },
      },
      {
        id: createEdgeId(d1, t2, 'yes'),
        source: d1,
        target: t2,
        sourceHandle: 'yes',
        type: 'smoothstep',
        markerEnd: MarkerType.ArrowClosed,
        data: { branchLabel: '是', expression: 'context.amount >= 10000' },
      },
      {
        id: createEdgeId(d1, endId, 'no'),
        source: d1,
        target: endId,
        sourceHandle: 'no',
        type: 'smoothstep',
        markerEnd: MarkerType.ArrowClosed,
        data: { branchLabel: '否', expression: 'context.amount < 10000' },
      },
      {
        id: createEdgeId(t2, endId),
        source: t2,
        target: endId,
        type: 'smoothstep',
        markerEnd: MarkerType.ArrowClosed,
        data: { branchLabel: '', expression: '' },
      },
    ],
  } as FlowDefinition
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    applyDefinition(defaultDefinition())
    return
  }
  try {
    const parsed = JSON.parse(raw) as FlowDefinition
    if (!parsed?.nodes || !parsed?.edges) throw new Error('invalid shape')
    applyDefinition(parsed)
  } catch {
    applyDefinition(defaultDefinition())
  }
}

function applyDefinition(def: FlowDefinition) {
  flowName.value = def.name || '未命名流程'
  nodes.value = def.nodes.map((n) => {
    const node = n as { id: string; type?: string; position?: object; data?: Record<string, unknown>; [k: string]: unknown }
    return {
      ...node,
      data: normalizeNodeData((node.data ?? {}) as Record<string, unknown>),
    }
  })
  edges.value = def.edges.map((e) => {
    const edge = e as { data?: { branchLabel?: string; expression?: string }; [k: string]: unknown }
    return {
      ...edge,
      data: {
        branchLabel: edge.data?.branchLabel ?? '',
        expression: edge.data?.expression ?? '',
      },
    }
  })
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

function persist() {
  const def: FlowDefinition = {
    name: flowName.value,
    nodes: nodes.value as unknown[],
    edges: edges.value as unknown[],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(def))
  ElMessage.success('已保存到浏览器本地')
}

function resetDemo() {
  applyDefinition(defaultDefinition())
  persist()
}

function exportJson() {
  const def: FlowDefinition = {
    name: flowName.value,
    nodes: nodes.value as unknown[],
    edges: edges.value as unknown[],
  }
  const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${flowName.value || 'flow'}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出 JSON')
}

function onImportFile(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result)) as FlowDefinition
      if (!parsed?.nodes || !parsed?.edges) throw new Error('invalid')
      applyDefinition(parsed)
      persist()
      ElMessage.success('已导入并保存')
    } catch {
      ElMessage.error('JSON 格式不正确')
    }
  }
  reader.readAsText(file)
}

function bumpPlace() {
  placeCursor.y += 90
  if (placeCursor.y > 480) {
    placeCursor.y = 120
    placeCursor.x += 40
  }
}

function addStart() {
  const id = createNodeId()
  nodes.value = [
    ...nodes.value,
    {
      id,
      type: 'flowStart',
      position: { ...placeCursor },
      data: normalizeNodeData({ label: '开始' }),
    },
  ]
  bumpPlace()
}

function addTask() {
  const id = createNodeId()
  nodes.value = [
    ...nodes.value,
    {
      id,
      type: 'flowTask',
      position: { ...placeCursor },
      data: normalizeNodeData({
        label: '审批任务',
        description: '',
        roleName: '',
        roleId: '',
      }),
    },
  ]
  bumpPlace()
}

function addDecision() {
  const id = createNodeId()
  nodes.value = [
    ...nodes.value,
    {
      id,
      type: 'flowDecision',
      position: { ...placeCursor },
      data: normalizeNodeData({
        label: '条件判断',
        hint: '',
        conditionExpression: '',
      }),
    },
  ]
  bumpPlace()
}

function addEnd() {
  const id = createNodeId()
  nodes.value = [
    ...nodes.value,
    {
      id,
      type: 'flowEnd',
      position: { ...placeCursor },
      data: normalizeNodeData({ label: '结束' }),
    },
  ]
  bumpPlace()
}

function onConnect(conn: Connection) {
  const dup = edges.value.some(
    (e) =>
      e.source === conn.source &&
      e.target === conn.target &&
      (e.sourceHandle ?? '') === (conn.sourceHandle ?? ''),
  )
  if (dup) {
    ElMessage.warning('已存在相同连线')
    return
  }
  const branch =
    conn.sourceHandle === 'yes' ? '是' : conn.sourceHandle === 'no' ? '否' : ''
  const next = {
    id: createEdgeId(conn.source, conn.target, conn.sourceHandle),
    source: conn.source,
    target: conn.target,
    sourceHandle: conn.sourceHandle ?? undefined,
    targetHandle: conn.targetHandle ?? undefined,
    type: 'smoothstep',
    markerEnd: MarkerType.ArrowClosed,
    data: { branchLabel: branch, expression: '' },
  }
  edges.value = [...edges.value, next]
}

function onNodeClick(ev: NodeMouseEvent) {
  selectedEdgeId.value = null
  selectedNodeId.value = ev.node.id
}

function onEdgeClick(ev: EdgeMouseEvent) {
  selectedNodeId.value = null
  selectedEdgeId.value = ev.edge.id
}

function onPaneClick() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

function patchNode(id: string, patch: Partial<FlowNodeData>) {
  nodes.value = nodes.value.map((n) =>
    n.id === id
      ? { ...n, data: normalizeNodeData({ ...(n.data as Record<string, unknown>), ...patch }) }
      : n,
  )
}

function patchEdge(id: string, patch: Partial<FlowEdgeData>) {
  edges.value = edges.value.map((e) =>
    e.id === id ? { ...e, data: { ...(e.data ?? {}), ...patch } } : e,
  )
}

onMounted(() => {
  loadFromStorage()
})
</script>

<template>
  <div class="flow-designer">
    <el-card shadow="never" class="flow-designer__header">
      <div class="flow-designer__header-row">
        <div class="flow-designer__title">
          <h2 class="flow-designer__heading">流程配置</h2>
          <p class="flow-designer__sub">
            拖拽节点摆放，从句柄拖线连接；判断节点请从「是 / 否」分别连线。选中连线可配置分支名与表达式。
          </p>
        </div>
        <div class="flow-designer__actions">
          <el-input v-model="flowName" placeholder="流程名称" style="width: 200px" clearable />
          <el-button type="primary" @click="persist">保存到本地</el-button>
          <el-button @click="resetDemo">重置示例</el-button>
          <el-button @click="exportJson">导出 JSON</el-button>
          <el-upload
            :show-file-list="false"
            accept="application/json,.json"
            :before-upload="
              (file) => {
                onImportFile(file)
                return false
              }
            "
          >
            <el-button>导入 JSON</el-button>
          </el-upload>
        </div>
      </div>
      <div class="flow-designer__toolbar">
        <span class="flow-designer__toolbar-label">添加节点：</span>
        <el-button size="small" @click="addStart">开始</el-button>
        <el-button size="small" type="primary" plain @click="addTask">任务</el-button>
        <el-button size="small" type="warning" plain @click="addDecision">判断</el-button>
        <el-button size="small" @click="addEnd">结束</el-button>
        <el-divider direction="vertical" />
        <span class="flow-designer__hint">删除：选中节点或连线后按 Delete</span>
      </div>
    </el-card>

    <div class="flow-designer__body">
      <div class="flow-designer__canvas">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :default-edge-options="{
            type: 'smoothstep',
            markerEnd: MarkerType.ArrowClosed,
          }"
          :snap-to-grid="true"
          :snap-grid="[16, 16]"
          fit-view-on-init
          class="flow-designer__vue-flow"
          @connect="onConnect"
          @node-click="onNodeClick"
          @edge-click="onEdgeClick"
          @pane-click="onPaneClick"
        >
          <Background :gap="16" pattern-color="#e4e7ec" />
          <Controls />
        </VueFlow>
      </div>

      <el-card shadow="never" class="flow-designer__panel">
        <template v-if="selectedNode?.data">
          <h3 class="flow-designer__panel-title">节点属性</h3>
          <p class="flow-designer__panel-meta">类型：{{ selectedNode.type }}</p>
          <el-form label-position="top" class="flow-designer__form">
            <el-form-item label="显示名称">
              <el-input
                :model-value="String(selectedNode.data.label ?? '')"
                @update:model-value="patchNode(selectedNode.id, { label: $event })"
              />
            </el-form-item>

            <template v-if="['flowStart', 'flowTask', 'flowEnd'].includes(String(selectedNode.type))">
              <el-divider content-position="left">岗位</el-divider>
              <el-form-item label="岗位名称">
                <el-input
                  :model-value="String(selectedNode.data.roleName ?? '')"
                  placeholder="例：部门经理、财务专员"
                  clearable
                  @update:model-value="patchNode(selectedNode.id, { roleName: $event })"
                />
              </el-form-item>
              <el-form-item label="岗位 ID">
                <el-input
                  :model-value="String(selectedNode.data.roleId ?? '')"
                  placeholder="例：ROLE_DEPT_MANAGER（与权限/组织系统对齐）"
                  clearable
                  @update:model-value="patchNode(selectedNode.id, { roleId: $event })"
                />
              </el-form-item>
            </template>

            <el-form-item v-if="selectedNode.type === 'flowTask'" label="说明（可选）">
              <el-input
                type="textarea"
                :rows="3"
                :model-value="String(selectedNode.data.description ?? '')"
                @update:model-value="patchNode(selectedNode.id, { description: $event })"
              />
            </el-form-item>

            <template v-if="selectedNode.type === 'flowDecision'">
              <el-divider content-position="left">判断</el-divider>
              <el-form-item label="判断提示（可选）">
                <el-input
                  type="textarea"
                  :rows="2"
                  :model-value="String(selectedNode.data.hint ?? '')"
                  @update:model-value="patchNode(selectedNode.id, { hint: $event })"
                />
              </el-form-item>
              <el-form-item label="节点判断表达式">
                <el-input
                  type="textarea"
                  :rows="5"
                  :model-value="String(selectedNode.data.conditionExpression ?? '')"
                  placeholder="例：Number(context.amount) >= 10000 或调用 DSL：fn.greaterThan(context.amount, 10000)"
                  @update:model-value="patchNode(selectedNode.id, { conditionExpression: $event })"
                />
              </el-form-item>
              <p class="flow-designer__tip">
                此处配置本判断步骤的主表达式；从「是 / 否」拉出的连线上可再填分支表达式（如与 context 子字段组合），由执行引擎约定优先级。
              </p>
            </template>
          </el-form>
        </template>
        <template v-else-if="selectedEdge">
          <h3 class="flow-designer__panel-title">连线 / 分支逻辑</h3>
          <p class="flow-designer__panel-meta">{{ selectedEdge.source }} → {{ selectedEdge.target }}</p>
          <el-form label-position="top" class="flow-designer__form">
            <el-form-item label="分支名称（展示）">
              <el-input
                :model-value="selectedEdge.data?.branchLabel ?? ''"
                placeholder="例：是、否、金额超限"
                @update:model-value="patchEdge(selectedEdge.id, { branchLabel: $event })"
              />
            </el-form-item>
            <el-form-item label="分支表达式（与后端约定）">
              <el-input
                type="textarea"
                :rows="4"
                :model-value="selectedEdge.data?.expression ?? ''"
                placeholder="例：context.amount >= 10000；可与判断节点上的「节点判断表达式」组合使用"
                @update:model-value="patchEdge(selectedEdge.id, { expression: $event })"
              />
            </el-form-item>
            <p class="flow-designer__tip">
              从判断节点拖出的两条线建议填写「是 / 否」对应的分支表达式；普通任务连线可留空，仅表示流转。
            </p>
          </el-form>
        </template>
        <template v-else>
          <h3 class="flow-designer__panel-title">属性面板</h3>
          <p class="flow-designer__empty">点击画布上的节点或连线进行编辑。</p>
        </template>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.flow-designer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}
.flow-designer__header {
  flex-shrink: 0;
}
.flow-designer__header-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.flow-designer__title {
  min-width: 200px;
}
.flow-designer__heading {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.flow-designer__sub {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  max-width: 640px;
}
.flow-designer__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.flow-designer__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.flow-designer__toolbar-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.flow-designer__hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.flow-designer__body {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.flow-designer__canvas {
  flex: 1 1 480px;
  min-height: 520px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
}
.flow-designer__vue-flow {
  width: 100%;
  height: 520px;
}
.flow-designer__panel {
  flex: 0 0 300px;
  width: 300px;
  max-width: 100%;
  align-self: stretch;
}
.flow-designer__panel-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
}
.flow-designer__panel-meta {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
.flow-designer__form {
  margin-top: 4px;
}
.flow-designer__tip {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}
.flow-designer__empty {
  margin: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}
</style>
