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
      avatar: 'https://dummyimage.com/120x120/409eff/ffffff&text=Admin',
      role,
    },
    routes: getRoleRoutes(role),
    buttonPermissions: getButtonPermissions(role),
  })
}
