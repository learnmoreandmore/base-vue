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

export type ContractSignatoryRole = 'borrower' | 'lender' | 'guarantor'

export type ContractSignatoryStatus = 'pending' | 'signed'

export interface ContractSignatory {
  role: ContractSignatoryRole
  name: string
  status: ContractSignatoryStatus
  signedAt?: string
}

export type ContractSealType = 'seal' | 'signature'

export interface ContractSeal {
  party: 'borrower' | 'lender'
  type: ContractSealType
  label: string
  signedAt: string
  /** 手写签名 PNG（Data URL，用于合同回显） */
  handwritingDataUrl?: string
}

export interface LoanContract {
  id: string
  applicationId: string
  applicantName: string
  amount: number
  templateCode: string
  status: ContractStatus
  signatories: ContractSignatory[]
  seals?: ContractSeal[]
  signedAt?: string
  pushedAt?: string
  voidReason?: string
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
