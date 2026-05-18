<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { LOAN_PERMISSION } from '@/constants/loan'
import {
  fetchLoanContractDetail,
  fetchLoanContracts,
  voidLoanContract,
} from '@/api/modules/loan'
import type { LoanContract } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'
import { auditLog } from '@/utils/auditLog'
import ContractDialog from '@/views/loan/contract/ContractDialog.vue'
import type { ContractDialogMode } from '@/views/loan/contract/ContractDialog.vue'
import { contractStatusText, contractTagType, signProgress } from '@/views/loan/contract/contractUi'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<LoanContract[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<ContractDialogMode>('preview')
const activeContract = ref<LoanContract | null>(null)

const pendingCount = computed(() => rows.value.filter((r) => r.status === 'pending_sign').length)

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchLoanContracts()
  } finally {
    loading.value = false
  }
}

const openContract = async (id: string, mode: ContractDialogMode) => {
  const detail = await fetchLoanContractDetail(id)
  if (!detail) {
    ElMessage.error('合同不存在')
    return
  }
  activeContract.value = detail
  dialogMode.value = mode
  dialogVisible.value = true
}

const onContractUpdated = (contract: LoanContract) => {
  const idx = rows.value.findIndex((r) => r.id === contract.id)
  if (idx >= 0) {
    rows.value[idx] = contract
  }
  activeContract.value = contract
}

const handleVoid = async (row: LoanContract) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入作废原因', '作废合同', {
      confirmButtonText: '确认作废',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '请填写作废原因',
    })
    const updated = await voidLoanContract(row.id, value)
    if (!updated) {
      ElMessage.error('作废失败')
      return
    }
    auditLog('loan.contract.void', { contractId: row.id, reason: value })
    ElMessage.warning(`合同 ${row.id} 已作废`)
    await load()
  } catch {
    /* 用户取消 */
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="header-row">
        <span>电子合同</span>
        <el-tag v-if="pendingCount > 0" type="warning" size="small">{{ pendingCount }} 份待签署</el-tag>
      </div>
    </template>

    <div class="table-responsive">
      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="id" label="合同号" width="100" />
        <el-table-column prop="applicationId" label="关联申请" width="140" />
        <el-table-column prop="applicantName" label="借款人" min-width="140" show-overflow-tooltip />
        <el-table-column prop="amount" label="金额" width="130">
          <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="templateCode" label="模板" width="140" />
        <el-table-column label="签章进度" width="140">
          <template #default="{ row }">
            <el-progress
              :percentage="signProgress(row).percent"
              :status="row.status === 'signed' ? 'success' : undefined"
              :stroke-width="6"
            />
            <span class="progress-text">{{ signProgress(row).done }}/{{ signProgress(row).total }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="contractTagType(row.status)" size="small">{{ contractStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="signedAt" label="签署时间" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openContract(row.id, 'preview')">预览</el-button>
            <el-button
              v-if="row.status === 'pending_sign'"
              v-permission="LP.contract.sign"
              type="primary"
              link
              @click="openContract(row.id, 'esign')"
            >
              电子签章
            </el-button>
            <el-button
              v-if="row.status !== 'void' && row.status !== 'signed'"
              v-permission="LP.contract.sign"
              type="danger"
              link
              @click="handleVoid(row)"
            >
              作废
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <ContractDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :contract="activeContract"
      @updated="onContractUpdated"
    />
  </el-card>
</template>

<style scoped>
.header-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}
</style>
