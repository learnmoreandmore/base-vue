export type UserRole = 'super-admin' | 'ops' | 'auditor' | 'warehouse'

export interface UserInfo {
  id: string
  name: string
  avatar: string
  role: UserRole
}

export interface PermissionMeta extends Record<string, unknown> {
  title: string
  icon?: string
  hidden?: boolean
  keepAlive?: boolean
  permissionCode?: string
  /** 固定在标签栏左侧且不可关闭（如首页） */
  affix?: boolean
  /** 不在侧栏作为子菜单展示（用于首页等仅一层菜单入口） */
  hideInMenu?: boolean
}

export interface BackendRoute {
  path: string
  name: string
  component: string
  redirect?: string
  meta: PermissionMeta
  children?: BackendRoute[]
}
