<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { LOAN_PERMISSION } from '@/constants/loan'
import { fetchLoanDisburses } from '@/api/modules/loan'
import type { LoanDisburseRecord } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'
import { auditLog } from '@/utils/auditLog'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<LoanDisburseRecord[]>([])

const statusLabel: Record<LoanDisburseRecord['status'], string> = {
  pending: '待处理',
  processing: '处理中',
  success: '成功',
  failed: '失败',
}

const disburseStatusText = (s: LoanDisburseRecord['status']) => statusLabel[s]

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchLoanDisburses()
  } finally {
    loading.value = false
  }
}

const execute = () => {
  auditLog('loan.disburse.execute', { channel: 'mock' })
  ElMessage.success('演示：已提交核心放款指令（Mock）')
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card>
    <template #header>放款执行</template>
    <div class="table-responsive table-responsive--min">
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column prop="id" label="放款单号" width="120" />
        <el-table-column prop="applicationId" label="申请号" width="150" />
        <el-table-column prop="amount" label="金额" width="140">
          <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">{{ disburseStatusText(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="bankRef" label="银行流水号" min-width="140" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              v-permission="LP.disburse.execute"
              type="primary"
              link
              @click="execute"
            >
              执行放款
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>
