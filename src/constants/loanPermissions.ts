/**
 * 信贷模块权限码单一来源（路由 meta、按钮、指令 v-permission 共用）
 */
export const LOAN_PERMISSION = {
  workbench: { view: 'loan:workbench:view' },
  product: { view: 'loan:product:view', edit: 'loan:product:edit' },
  application: { view: 'loan:application:view', edit: 'loan:application:edit' },
  approval: { view: 'loan:approval:view', approve: 'loan:approval:approve' },
  contract: { view: 'loan:contract:view', sign: 'loan:contract:sign' },
  disburse: { view: 'loan:disburse:view', execute: 'loan:disburse:execute' },
  repay: { view: 'loan:repay:view', operate: 'loan:repay:operate' },
  overdue: { view: 'loan:overdue:view', edit: 'loan:overdue:edit' },
  risk: { view: 'loan:risk:view' },
  media: { view: 'loan:media:view' },
  screen: { view: 'loan:screen:view' },
} as const

function flattenPermissionCodes(obj: typeof LOAN_PERMISSION): string[] {
  const set = new Set<string>()
  for (const group of Object.values(obj)) {
    for (const code of Object.values(group)) {
      set.add(code)
    }
  }
  return [...set]
}

export const loanButtonsFull = flattenPermissionCodes(LOAN_PERMISSION)

export const loanButtonsOps = loanButtonsFull.filter((c) => c !== LOAN_PERMISSION.product.edit)

export const loanButtonsAuditor = [
  LOAN_PERMISSION.risk.view,
  LOAN_PERMISSION.overdue.view,
  LOAN_PERMISSION.overdue.edit,
  LOAN_PERMISSION.screen.view,
]
