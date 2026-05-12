import type {
  LoanApplication,
  LoanContract,
  LoanDisburseRecord,
  LoanProduct,
  OverdueCase,
  RepayPlanRow,
} from '@/types/loan'

const delay = <T>(data: T, ms = 220) => new Promise<T>((resolve) => setTimeout(() => resolve(data), ms))

const products: LoanProduct[] = [
  {
    id: 'P001',
    name: '经营快贷·标准版',
    rateYear: 7.2,
    termMonths: 36,
    maxAmount: 2_000_000,
    status: 'published',
    updatedAt: '2026-05-08 10:00:00',
  },
  {
    id: 'P002',
    name: '供应链金融·保理',
    rateYear: 6.5,
    termMonths: 12,
    maxAmount: 5_000_000,
    status: 'published',
    updatedAt: '2026-05-07 16:20:00',
  },
]

let applications: LoanApplication[] = [
  {
    id: 'A20260508001',
    applicantName: '上海某某贸易有限公司',
    idNoMasked: '310***********1234',
    amount: 800_000,
    termMonths: 24,
    status: 'credit_review',
    channel: '客户经理',
    createdAt: '2026-05-08 09:12:00',
  },
  {
    id: 'A20260507002',
    applicantName: '李某',
    idNoMasked: '330***********5678',
    amount: 200_000,
    termMonths: 12,
    status: 'approved',
    channel: '线上进件',
    createdAt: '2026-05-07 14:40:00',
  },
  {
    id: 'A20260509003',
    applicantName: '杭州某某科技有限公司',
    idNoMasked: '330***********9012',
    amount: 350_000,
    termMonths: 18,
    status: 'submitted',
    channel: '线上进件',
    createdAt: '2026-05-09 08:30:00',
  },
]

const contracts: LoanContract[] = [
  { id: 'C001', applicationId: 'A20260507002', templateCode: 'STD-LOAN-2026', status: 'signed', signedAt: '2026-05-08 11:00:00' },
  { id: 'C002', applicationId: 'A20260508001', templateCode: 'STD-LOAN-2026', status: 'pending_sign' },
]

const disburses: LoanDisburseRecord[] = [
  { id: 'D001', applicationId: 'A20260507002', amount: 200_000, status: 'success', bankRef: 'BK2026050800001', createdAt: '2026-05-08 11:30:00' },
  { id: 'D002', applicationId: 'A20260508001', amount: 800_000, status: 'pending', createdAt: '2026-05-08 12:00:00' },
]

const repayPlan: RepayPlanRow[] = [
  { id: 'R1', applicationId: 'A20260507002', period: 1, dueDate: '2026-06-08', principal: 16000, interest: 1200, status: 'pending' },
  { id: 'R2', applicationId: 'A20260507002', period: 2, dueDate: '2026-07-08', principal: 16200, interest: 1180, status: 'pending' },
]

const overdue: OverdueCase[] = [
  { id: 'O001', applicationId: 'A20260101088', dpd: 18, overdueAmount: 42000, collector: '王强', lastAction: '电话催收' },
]

export type LoanWorkbenchStats = {
  products: number
  inReview: number
  pendingDisburse: number
  overdue: number
  updatedAt: string
}

export const fetchLoanProducts = () => delay([...products])
export const fetchLoanApplications = () => delay([...applications])

export const updateLoanApplicationStatus = (id: string, status: LoanApplication['status']) => {
  const index = applications.findIndex((a) => a.id === id)
  if (index < 0) {
    return delay<LoanApplication | null>(null, 180)
  }
  applications[index] = { ...applications[index], status }
  return delay(applications[index], 180)
}

export const approveLoanApplication = (id: string) => updateLoanApplicationStatus(id, 'approved')

export const rejectLoanApplication = (id: string) => updateLoanApplicationStatus(id, 'rejected')

export const createLoanApplication = (payload: {
  applicantName: string
  amount: number
  termMonths: number
  channel?: string
}) => {
  const id = `A${Date.now()}`
  const row: LoanApplication = {
    id,
    applicantName: payload.applicantName,
    idNoMasked: '*** 待联网核查',
    amount: payload.amount,
    termMonths: payload.termMonths,
    status: 'submitted',
    channel: payload.channel ?? '后台进件',
    createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  }
  applications = [row, ...applications]
  return delay(row, 400)
}

export const fetchLoanWorkbenchStats = async (): Promise<LoanWorkbenchStats> => {
  const [p, a, d, o] = await Promise.all([
    fetchLoanProducts(),
    fetchLoanApplications(),
    fetchLoanDisburses(),
    fetchOverdueCases(),
  ])
  return {
    products: p.length,
    inReview: a.filter((x) => x.status === 'credit_review').length,
    pendingDisburse: d.filter((x) => x.status === 'pending' || x.status === 'processing').length,
    overdue: o.length,
    updatedAt: new Date().toISOString(),
  }
}

export const fetchLoanContracts = () => delay([...contracts])
export const fetchLoanDisburses = () => delay([...disburses])
export const fetchRepayPlan = () => delay([...repayPlan])
export const fetchOverdueCases = () => delay([...overdue])
