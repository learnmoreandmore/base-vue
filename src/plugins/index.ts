import type { App } from 'vue'
import { permissionDirective } from '@/plugins/permission-directive'

/**
 * 应用级插件注册入口（组件库、指令、全局 provide 等统一由此装配）。
 */
export function registerAppPlugins(app: App) {
  app.directive('permission', permissionDirective)
}
