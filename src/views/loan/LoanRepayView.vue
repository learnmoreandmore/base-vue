<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { LOAN_PERMISSION } from '@/constants/loan'
import { fetchRepayPlan } from '@/api/modules/loan'
import type { RepayPlanRow } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<RepayPlanRow[]>([])

const summary = computed(() => {
  const principal = rows.value.reduce((s, r) => s + r.principal, 0)
  const interest = rows.value.reduce((s, r) => s + r.interest, 0)
  return { principal, interest, total: principal + interest, count: rows.value.length }
})

const statusLabel: Record<RepayPlanRow['status'], string> = {
  pending: '待还',
  paid: '已还',
  overdue: '逾期',
}

const repayStatusText = (s: RepayPlanRow['status']) => statusLabel[s]

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchRepayPlan()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card>
    <template #header>还款计划</template>
    <el-descriptions v-if="rows.length" class="mb" :column="3" border size="small">
      <el-descriptions-item label="期数">{{ summary.count }}</el-descriptions-item>
      <el-descriptions-item label="应还本金合计">{{ formatCurrency(summary.principal) }}</el-descriptions-item>
      <el-descriptions-item label="应还利息合计">{{ formatCurrency(summary.interest) }}</el-descriptions-item>
      <el-descriptions-item label="本息合计" :span="3">{{ formatCurrency(summary.total) }}</el-descriptions-item>
    </el-descriptions>
    <div class="table-responsive">
      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="applicationId" label="申请号" width="150" />
        <el-table-column prop="period" label="期次" width="80" />
        <el-table-column prop="dueDate" label="应还日" width="120" />
        <el-table-column prop="principal" label="应还本金" width="130">
          <template #default="{ row }">{{ formatCurrency(row.principal) }}</template>
        </el-table-column>
        <el-table-column prop="interest" label="应还利息" width="130">
          <template #default="{ row }">{{ formatCurrency(row.interest) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">{{ repayStatusText(row.status) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button v-permission="LP.repay.operate" type="primary" link>代扣</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<style scoped>
.mb {
  margin-bottom: 12px;
}
</style>
