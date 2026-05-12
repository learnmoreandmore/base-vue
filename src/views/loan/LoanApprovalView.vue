<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { LOAN_PERMISSION } from '@/constants/loanPermissions'
import { approveLoanApplication, fetchLoanApplications, rejectLoanApplication } from '@/api/modules/loan'
import type { LoanApplication } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'
import { auditLog } from '@/utils/auditLog'

const LP = LOAN_PERMISSION

const loading = ref(false)
const queue = ref<LoanApplication[]>([])
const step = ref(2)

const load = async () => {
  loading.value = true
  try {
    const all = await fetchLoanApplications()
    queue.value = all.filter((a) => a.status === 'credit_review' || a.status === 'submitted')
  } finally {
    loading.value = false
  }
}

const approve = async (id: string) => {
  const row = await approveLoanApplication(id)
  if (!row) {
    ElMessage.error('未找到申请单')
    return
  }
  auditLog('loan.approval.approve', { applicationId: id })
  ElMessage.success(`已通过：${id}`)
  await load()
}

const reject = async (id: string) => {
  const row = await rejectLoanApplication(id)
  if (!row) {
    ElMessage.error('未找到申请单')
    return
  }
  auditLog('loan.approval.reject', { applicationId: id })
  ElMessage.warning(`已驳回：${id}`)
  await load()
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card>
    <template #header>授信审批队列</template>
    <el-steps :active="step" finish-status="success" align-center class="steps">
      <el-step title="进件" description="材料齐全" />
      <el-step title="自动风控" description="规则+评分" />
      <el-step title="人工授信" description="审批官" />
      <el-step title="合同放款" description="签约执行" />
    </el-steps>
    <el-timeline>
      <el-timeline-item timestamp="信审规则引擎" placement="top">
        <el-tag size="small">反欺诈</el-tag>
        <el-tag size="small" type="warning" class="ml">人行征信</el-tag>
        <el-tag size="small" type="success" class="ml">工商司法</el-tag>
      </el-timeline-item>
    </el-timeline>
    <div v-if="!loading && queue.length === 0" class="empty-wrap">
      <el-empty description="暂无待审批进件" />
    </div>
    <div v-else class="table-responsive table-responsive--min">
      <el-table v-loading="loading" :data="queue" border>
        <el-table-column prop="id" label="申请号" width="150" />
        <el-table-column prop="applicantName" label="客户" min-width="140" />
        <el-table-column prop="amount" label="金额" width="140">
          <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="LP.approval.approve" type="success" link @click="approve(row.id)">通过</el-button>
            <el-button v-permission="LP.approval.approve" type="danger" link @click="reject(row.id)">驳回</el-button>
            <el-button type="primary" link>详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<style scoped>
.steps {
  margin-bottom: 16px;
}
.ml {
  margin-left: 6px;
}

.empty-wrap {
  padding: 32px 0;
}
</style>
