import type { ContractSignatoryRole, ContractStatus, LoanContract } from '@/types/loan'

export const CONTRACT_STATUS_LABEL: Record<ContractStatus, string> = {
  pending_sign: '待签署',
  signed: '已签署',
  void: '作废',
}

export const contractStatusText = (s: ContractStatus) => CONTRACT_STATUS_LABEL[s]

export const contractTagType = (s: ContractStatus): 'success' | 'warning' | 'info' => {
  if (s === 'signed') return 'success'
  if (s === 'pending_sign') return 'warning'
  return 'info'
}

export const SIGNATORY_ROLE_LABEL: Record<ContractSignatoryRole, string> = {
  lender: '贷款机构',
  borrower: '借款人',
  guarantor: '担保人',
}

export const signProgress = (row: LoanContract) => {
  const total = row.signatories.length
  const done = row.signatories.filter((s) => s.status === 'signed').length
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 }
}
