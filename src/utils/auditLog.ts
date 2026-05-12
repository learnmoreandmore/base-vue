/** 前端审计打点：开发环境打印；生产可改为上报埋点/审计服务 */
export function auditLog(action: string, payload?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), action, payload }
  if (import.meta.env.DEV) {
    console.info('[audit]', entry)
  }
}
