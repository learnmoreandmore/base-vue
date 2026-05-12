<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { LOAN_PERMISSION } from '@/constants/loanPermissions'
import { fetchLoanContracts } from '@/api/modules/loan'
import type { LoanContract } from '@/types/loan'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<LoanContract[]>([])

const statusLabel: Record<LoanContract['status'], string> = {
  pending_sign: '待签署',
  signed: '已签署',
  void: '作废',
}

const contractStatusText = (s: LoanContract['status']) => statusLabel[s]

const contractTagType = (s: LoanContract['status']): 'success' | 'warning' | 'info' => {
  if (s === 'signed') return 'success'
  if (s === 'pending_sign') return 'warning'
  return 'info'
}

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchLoanContracts()
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
    <template #header>电子合同</template>
    <div class="table-responsive">
      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="id" label="合同号" width="120" />
        <el-table-column prop="applicationId" label="关联申请" width="150" />
        <el-table-column prop="templateCode" label="模板" min-width="140" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="contractTagType(row.status)" size="small">{{ contractStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="signedAt" label="签署时间" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button v-permission="LP.contract.sign" type="primary" link>推送签署</el-button>
            <el-button type="primary" link>预览</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>
