<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { LOAN_PERMISSION } from '@/constants/loanPermissions'
import { fetchLoanProducts } from '@/api/modules/loan'
import type { LoanProduct } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<LoanProduct[]>([])

const statusLabel: Record<LoanProduct['status'], string> = {
  draft: '草稿',
  published: '已发布',
  offline: '已下线',
}

const productStatusText = (s: LoanProduct['status']) => statusLabel[s]

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchLoanProducts()
  } finally {
    loading.value = false
  }
}

const onSaveDraft = () => {
  ElMessage.info('演示环境：已记录「保存草稿」动作')
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="hdr">
        <span>产品工厂</span>
        <el-button v-permission="LP.product.edit" type="primary" @click="onSaveDraft">新建产品</el-button>
      </div>
    </template>
    <div class="table-responsive table-responsive--min">
      <el-empty v-if="!loading && rows.length === 0" description="暂无产品数据" />
      <el-table v-else v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="id" label="产品编码" width="120" />
        <el-table-column prop="name" label="产品名称" min-width="180" />
        <el-table-column prop="rateYear" label="年化利率%" width="120" />
        <el-table-column prop="termMonths" label="最长期限(月)" width="130" />
        <el-table-column prop="maxAmount" label="额度上限" min-width="120">
          <template #default="{ row }">{{ formatCurrency(row.maxAmount) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">{{ productStatusText(row.status) }}</template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default>
            <el-button v-permission="LP.product.edit" type="primary" link>编辑</el-button>
            <el-button v-permission="LP.product.edit" type="danger" link>下线</el-button>
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
  gap: 12px;
  flex-wrap: wrap;
}
</style>
