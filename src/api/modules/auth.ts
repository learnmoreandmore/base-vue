import { getButtonPermissions, getRoleRoutes } from '@/constants/permission'
import type { BackendRoute, UserInfo, UserRole } from '@/types/auth'

interface LoginPayload {
  username: string
  password: string
}

interface LoginResult {
  token: string
}

interface UserProfileResult {
  userInfo: UserInfo
  routes: BackendRoute[]
  buttonPermissions: string[]
}

const roleMap: Record<string, UserRole> = {
  admin: 'super-admin',
  ops: 'ops',
  audit: 'auditor',
  wh: 'warehouse',
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const role = roleMap[payload.username] ?? 'ops'
  const token = `${role}-token`
  return Promise.resolve({ token })
}

export async function fetchUserProfile(token: string): Promise<UserProfileResult> {
  const role = (token?.slice(0, -6) as UserRole) || 'ops'
  return Promise.resolve({
    userInfo: {
      id: 'U10001',
      name: `${role} 用户`,
      /** 避免外链占位图在审计/弱网下拖慢请求链；需要头像时可换成本地资源或业务 CDN */
      avatar: '',
      role,
    },
    routes: getRoleRoutes(role),
    buttonPermissions: getButtonPermissions(role),
  })
}
