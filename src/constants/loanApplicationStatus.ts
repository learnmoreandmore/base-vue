import type { ApplicationStatus } from '@/types/loan'

export type ApplicationStatusTagType = 'info' | 'success' | 'warning' | 'danger'

/** 进件状态 → 展示（与列表、筛选、导出共用） */
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

/** 列表筛选常用状态 */
export const APPLICATION_STATUS_FILTER_OPTIONS: { label: string; value: ApplicationStatus }[] = [
  { label: '信审中', value: 'credit_review' },
  { label: '已提交', value: 'submitted' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已放款', value: 'disbursed' },
]
