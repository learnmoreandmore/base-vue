/** 信贷域核心实体（与后端契约对齐的 TypeScript 形状） */

export type LoanProductStatus = 'draft' | 'published' | 'offline'

export interface LoanProduct {
  id: string
  name: string
  rateYear: number
  termMonths: number
  maxAmount: number
  status: LoanProductStatus
  updatedAt: string
}

export type ApplicationStatus = 'draft' | 'submitted' | 'credit_review' | 'approved' | 'rejected' | 'disbursed'

export interface LoanApplication {
  id: string
  applicantName: string
  idNoMasked: string
  amount: number
  termMonths: number
  status: ApplicationStatus
  channel: string
  createdAt: string
}

export type ContractStatus = 'pending_sign' | 'signed' | 'void'

export interface LoanContract {
  id: string
  applicationId: string
  templateCode: string
  status: ContractStatus
  signedAt?: string
}

export type DisburseStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface LoanDisburseRecord {
  id: string
  applicationId: string
  amount: number
  status: DisburseStatus
  bankRef?: string
  createdAt: string
}

export interface RepayPlanRow {
  id: string
  applicationId: string
  period: number
  dueDate: string
  principal: number
  interest: number
  status: 'pending' | 'paid' | 'overdue'
}

export interface OverdueCase {
  id: string
  applicationId: string
  dpd: number
  overdueAmount: number
  collector: string
  lastAction: string
}
