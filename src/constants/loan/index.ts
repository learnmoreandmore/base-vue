import type { ApplicationStatus } from '@/types/loan'

/**
 * 信贷模块常量（权限码、进件状态展示等）
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

export type ApplicationStatusTagType = 'info' | 'success' | 'warning' | 'danger'

export const APPLICATION_STATUS_UI: Record<ApplicationStatus, { label: string; type: ApplicationStatusTagType }> = {
  draft: { label: '草稿', type: 'info' },
  submitted: { label: '已提交', type: 'info' },
  credit_review: { label: '信审中', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' },
  disbursed: { label: '已放款', type: 'success' },
}

export const applicationStatusLabel = (s: ApplicationStatus) => APPLICATION_STATUS_UI[s].label

export const applicationStatusTagType = (s: ApplicationStatus) => APPLICATION_STATUS_UI[s].type

export const APPLICATION_STATUS_FILTER_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: '信审中', value: 'credit_review' },
  { label: '已提交', value: 'submitted' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已放款', value: 'disbursed' },
]
