import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'

export function usePermission() {
  const permissionStore = usePermissionStore()
  const permissions = computed(() => permissionStore.buttonPermissions)

  const hasPermission = (code: string) => permissionStore.hasPermission(code)

  return {
    permissions,
    hasPermission,
  }
}
