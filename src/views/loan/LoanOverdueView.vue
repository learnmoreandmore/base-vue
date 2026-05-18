<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { LOAN_PERMISSION } from '@/constants/loan'
import { fetchOverdueCases } from '@/api/modules/loan'
import type { OverdueCase } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'
import { exportToCsv } from '@/utils/exportCsv'
import { auditLog } from '@/utils/auditLog'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<OverdueCase[]>([])

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchOverdueCases()
  } finally {
    loading.value = false
  }
}

const exportCsv = () => {
  const data = rows.value.map((r) => ({
    案件号: r.id,
    申请号: r.applicationId,
    逾期天数: r.dpd,
    逾期金额: r.overdueAmount,
    催收员: r.collector,
    最近动作: r.lastAction,
  }))
  exportToCsv(`overdue-${Date.now()}`, ['案件号', '申请号', '逾期天数', '逾期金额', '催收员', '最近动作'], data)
  auditLog('loan.overdue.export', { rows: data.length })
  ElMessage.success('已导出 CSV')
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="hdr">
        <span>逾期催收工作台</span>
        <el-button type="success" plain size="small" @click="exportCsv">导出 CSV</el-button>
      </div>
    </template>
    <div class="table-responsive">
      <el-table v-loading="loading" :data="rows" border>
        <el-table-column prop="id" label="案件号" width="120" />
        <el-table-column prop="applicationId" label="申请号" width="150" />
        <el-table-column prop="dpd" label="逾期天数" width="100" />
        <el-table-column prop="overdueAmount" label="逾期金额" width="140">
          <template #default="{ row }">{{ formatCurrency(row.overdueAmount) }}</template>
        </el-table-column>
        <el-table-column prop="collector" label="催收员" width="100" />
        <el-table-column prop="lastAction" label="最近动作" min-width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button v-permission="LP.overdue.edit" type="primary" link>记录跟进</el-button>
            <el-button type="warning" link>协商还款</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>

<style scoped>
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
