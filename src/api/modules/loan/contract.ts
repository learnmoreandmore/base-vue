import type { LoanContract } from '@/types/loan'
import { mockDelay } from '@/api/modules/loan/delay'

const nowStr = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const contracts: LoanContract[] = [
  {
    id: 'C001',
    applicationId: 'A20260507002',
    applicantName: '李某',
    amount: 200_000,
    templateCode: 'STD-LOAN-2026',
    status: 'signed',
    signedAt: '2026-05-08 11:00:00',
    pushedAt: '2026-05-08 10:30:00',
    signatories: [
      { role: 'lender', name: '某某银行信贷中心', status: 'signed', signedAt: '2026-05-08 10:45:00' },
      { role: 'borrower', name: '李某', status: 'signed', signedAt: '2026-05-08 11:00:00' },
    ],
    seals: [
      { party: 'lender', type: 'seal', label: '合同专用章', signedAt: '2026-05-08 10:45:00' },
      { party: 'borrower', type: 'signature', label: '借款人签章', signedAt: '2026-05-08 11:00:00' },
    ],
  },
  {
    id: 'C002',
    applicationId: 'A20260508001',
    applicantName: '上海某某贸易有限公司',
    amount: 800_000,
    templateCode: 'STD-LOAN-2026',
    status: 'pending_sign',
    signatories: [
      { role: 'lender', name: '某某银行信贷中心', status: 'pending' },
      { role: 'borrower', name: '上海某某贸易有限公司', status: 'pending' },
    ],
  },
  {
    id: 'C003',
    applicationId: 'A20260509003',
    applicantName: '杭州某某科技有限公司',
    amount: 350_000,
    templateCode: 'STD-LOAN-2026',
    status: 'pending_sign',
    pushedAt: '2026-05-09 09:00:00',
    signatories: [
      { role: 'lender', name: '某某银行信贷中心', status: 'signed', signedAt: '2026-05-09 09:15:00' },
      { role: 'borrower', name: '杭州某某科技有限公司', status: 'pending' },
    ],
    seals: [{ party: 'lender', type: 'seal', label: '合同专用章', signedAt: '2026-05-09 09:15:00' }],
  },
]

const cloneContract = (row: LoanContract): LoanContract => ({
  ...row,
  signatories: row.signatories.map((s) => ({ ...s })),
  seals: row.seals?.map((s) => ({ ...s })),
})

const findContract = (id: string) => contracts.find((c) => c.id === id)

const allSigned = (c: LoanContract) => c.signatories.every((s) => s.status === 'signed')

const syncContractSignedState = (c: LoanContract) => {
  if (allSigned(c)) {
    c.status = 'signed'
    const times = c.signatories.map((s) => s.signedAt).filter(Boolean) as string[]
    c.signedAt = times.sort().at(-1)
  }
}

export const fetchLoanContracts = () =>
  mockDelay(contracts.map((c) => cloneContract(c)))

export const fetchLoanContractDetail = (id: string) => {
  const row = findContract(id)
  if (!row) return mockDelay<LoanContract | null>(null, 180)
  return mockDelay(cloneContract(row))
}

export const pushContractSign = (id: string) => {
  const row = findContract(id)
  if (!row || row.status !== 'pending_sign') return mockDelay<LoanContract | null>(null, 180)
  row.pushedAt = nowStr()
  return mockDelay(cloneContract(row), 400)
}

export const applyLenderSeal = (id: string) => {
  const row = findContract(id)
  if (!row || row.status !== 'pending_sign') return mockDelay<LoanContract | null>(null, 180)
  const lender = row.signatories.find((s) => s.role === 'lender')
  if (!lender || lender.status === 'signed') return mockDelay<LoanContract | null>(null, 180)
  const ts = nowStr()
  lender.status = 'signed'
  lender.signedAt = ts
  row.seals = [...(row.seals ?? []), { party: 'lender', type: 'seal', label: '合同专用章', signedAt: ts }]
  syncContractSignedState(row)
  return mockDelay(cloneContract(row), 500)
}

export const borrowerSignWithHandwriting = (id: string, handwritingPng: string) => {
  const row = findContract(id)
  if (!row || row.status !== 'pending_sign') return mockDelay<LoanContract | null>(null, 180)
  const lender = row.signatories.find((s) => s.role === 'lender')
  const borrower = row.signatories.find((s) => s.role === 'borrower')
  if (!borrower || borrower.status === 'signed') return mockDelay<LoanContract | null>(null, 180)
  if (lender?.status !== 'signed') return mockDelay<LoanContract | null>(null, 180)
  if (!handwritingPng.startsWith('data:image/')) return mockDelay<LoanContract | null>(null, 180)
  const ts = nowStr()
  borrower.status = 'signed'
  borrower.signedAt = ts
  row.seals = [
    ...(row.seals ?? []),
    {
      party: 'borrower',
      type: 'signature',
      label: '借款人手写签名',
      signedAt: ts,
      handwritingDataUrl: handwritingPng,
    },
  ]
  syncContractSignedState(row)
  return mockDelay(cloneContract(row), 600)
}

export const simulateBorrowerSign = (id: string) => {
  const row = findContract(id)
  if (!row || row.status !== 'pending_sign') return mockDelay<LoanContract | null>(null, 180)
  const lender = row.signatories.find((s) => s.role === 'lender')
  const borrower = row.signatories.find((s) => s.role === 'borrower')
  if (!borrower || borrower.status === 'signed') return mockDelay<LoanContract | null>(null, 180)
  if (lender?.status !== 'signed') return mockDelay<LoanContract | null>(null, 180)
  const ts = nowStr()
  borrower.status = 'signed'
  borrower.signedAt = ts
  row.seals = [...(row.seals ?? []), { party: 'borrower', type: 'signature', label: '借款人签章', signedAt: ts }]
  syncContractSignedState(row)
  return mockDelay(cloneContract(row), 600)
}

export const voidLoanContract = (id: string, reason: string) => {
  const row = findContract(id)
  if (!row || row.status === 'void') return mockDelay<LoanContract | null>(null, 180)
  row.status = 'void'
  row.voidReason = reason
  return mockDelay(cloneContract(row), 300)
}
