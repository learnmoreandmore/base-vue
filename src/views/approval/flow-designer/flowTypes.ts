export interface FlowEdgeData {
  branchLabel?: string
  expression?: string
}

export interface FlowNodeData {
  label?: string
  description?: string
  hint?: string
  /** 岗位名称（任务 / 开始 / 结束等节点可配置，供引擎解析） */
  roleName?: string
  /** 岗位 ID */
  roleId?: string
  /**
   * 判断节点：节点级自定义判断表达式（与后端约定 DSL，如 `context.amount >= 10000`）。
   * 出口连线上的表达式可表示在节点表达式成立时的细分分支。
   */
  conditionExpression?: string
}

export interface FlowDefinition {
  name: string
  /** 使用 JSON 存取，避免与 @vue-flow/core 的 Node 泛型产生 TS 深度实例化问题 */
  nodes: unknown[]
  edges: unknown[]
}

export const STORAGE_KEY = 'approval-flow-designer-v1'

export function createNodeId() {
  return `n-${crypto.randomUUID().slice(0, 8)}`
}

export function createEdgeId(source: string, target: string, sourceHandle?: string | null) {
  const h = sourceHandle ? `-${sourceHandle}` : ''
  return `e-${source}-${target}${h}`
}
