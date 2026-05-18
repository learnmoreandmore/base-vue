<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LOAN_PERMISSION } from '@/constants/loan'
import { fetchLoanWorkbenchStats } from '@/api/modules/loan'

const LP = LOAN_PERMISSION
const router = useRouter()

const loading = ref(false)
const stats = ref({
  products: 0,
  inReview: 0,
  pendingDisburse: 0,
  overdue: 0,
})
const updatedAt = ref('')

const shortcuts = [
  { title: '进件管理', path: '/loan/application', code: LP.application.view },
  { title: '授信审批', path: '/loan/approval', code: LP.approval.view },
  { title: '放款执行', path: '/loan/disburse', code: LP.disburse.view },
  { title: '信贷大屏', path: '/home', code: LP.screen.view },
]

const load = async () => {
  loading.value = true
  try {
    const s = await fetchLoanWorkbenchStats()
    stats.value.products = s.products
    stats.value.inReview = s.inReview
    stats.value.pendingDisburse = s.pendingDisburse
    stats.value.overdue = s.overdue
    updatedAt.value = new Date(s.updatedAt).toLocaleString()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="wb-head">
    <span class="muted">指标聚合自 Mock 服务</span>
    <el-button size="small" :loading="loading" @click="load">刷新</el-button>
  </div>
  <el-row v-loading="loading" :gutter="12">
    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover">
        <div class="stat-label">在架产品</div>
        <div class="stat-value">{{ stats.products }}</div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover">
        <div class="stat-label">评审中进件</div>
        <div class="stat-value warn">{{ stats.inReview }}</div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover">
        <div class="stat-label">待放款</div>
        <div class="stat-value">{{ stats.pendingDisburse }}</div>
      </el-card>
    </el-col>
    <el-col :xs="24" :sm="12" :md="6">
      <el-card shadow="hover">
        <div class="stat-label">逾期案件</div>
        <div class="stat-value danger">{{ stats.overdue }}</div>
      </el-card>
    </el-col>
  </el-row>

  <el-card class="mt" shadow="never">
    <template #header>快捷入口</template>
    <el-space wrap>
      <el-button
        v-for="item in shortcuts"
        :key="item.path"
        v-permission="item.code"
        type="primary"
        plain
        @click="router.push(item.path)"
      >
        {{ item.title }}
      </el-button>
    </el-space>
    <p v-if="updatedAt" class="muted mt8">最近刷新：{{ updatedAt }}</p>
  </el-card>
</template>

<style scoped>
.wb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}
.stat-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.stat-value {
  margin-top: 8px;
  font-size: 28px;
  font-weight: 600;
}
.stat-value.warn {
  color: var(--el-color-warning);
}
.stat-value.danger {
  color: var(--el-color-danger);
}
.mt {
  margin-top: 12px;
}
.mt8 {
  margin-top: 8px;
}
.muted {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
