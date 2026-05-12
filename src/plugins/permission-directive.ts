import type { Directive, DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/stores/permission'

/**
 * 元素级权限：无权限则移除 DOM（企业内管常见简化实现）。
 * 用法：<el-button v-permission="'loan:product:edit'">编辑</el-button>
 */
function apply(el: HTMLElement, binding: DirectiveBinding<string | undefined>) {
  const code = binding.value
  if (!code) {
    return
  }
  const store = usePermissionStore()
  if (!store.hasPermission(code)) {
    el.style.display = 'none'
  } else {
    el.style.display = ''
  }
}

export const permissionDirective: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    apply(el, binding)
  },
  updated(el, binding) {
    apply(el, binding)
  },
}
