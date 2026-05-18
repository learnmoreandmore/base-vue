<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import { LOAN_PERMISSION } from '@/constants/loan'
import { createLoanApplication, fetchLoanApplications } from '@/api/modules/loan'
import {
  APPLICATION_STATUS_FILTER_OPTIONS,
  applicationStatusLabel,
  applicationStatusTagType,
} from '@/constants/loan'
import type { LoanApplication } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'
import { exportToCsv } from '@/utils/exportCsv'
import { auditLog } from '@/utils/auditLog'

const LP = LOAN_PERMISSION

const loading = ref(false)
const rows = ref<LoanApplication[]>([])
const filters = reactive({ keyword: '', status: '' })
const debouncedKeyword = ref('')

const syncKeyword = debounce(() => {
  debouncedKeyword.value = filters.keyword
}, 280)

watch(
  () => filters.keyword,
  () => {
    syncKeyword()
  },
  { immediate: true },
)

const statusLabelOf = (s: LoanApplication['status']) => applicationStatusLabel(s)
const statusTypeOf = (s: LoanApplication['status']) => applicationStatusTagType(s)

const filteredRows = computed(() => {
  const kw = debouncedKeyword.value.trim()
  return rows.value.filter((r) => {
    const hitKw = !kw || r.id.includes(kw) || r.applicantName.includes(kw)
    const hitSt = !filters.status || r.status === filters.status
    return hitKw && hitSt
  })
})

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  applicantName: '',
  amount: 100_000,
  termMonths: 12,
})

const rules: FormRules = {
  applicantName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  amount: [{ required: true, type: 'number', min: 1, message: '请输入有效金额', trigger: 'change' }],
  termMonths: [{ required: true, type: 'number', min: 1, max: 360, message: '期限 1–360 月', trigger: 'change' }],
}

const load = async () => {
  loading.value = true
  try {
    rows.value = await fetchLoanApplications()
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  form.applicantName = ''
  form.amount = 100_000
  form.termMonths = 12
  dialogVisible.value = true
}

const submitForm = async () => {
  await formRef.value?.validate()
  await createLoanApplication({
    applicantName: form.applicantName,
    amount: form.amount,
    termMonths: form.termMonths,
  })
  auditLog('loan.application.create', { name: form.applicantName, amount: form.amount })
  ElMessage.success('进件已创建')
  dialogVisible.value = false
  await load()
}

const exportCsv = () => {
  const data = filteredRows.value.map((r) => ({
    申请号: r.id,
    客户: r.applicantName,
    证件号: r.idNoMasked,
    申请金额: r.amount,
    期限月: r.termMonths,
    状态: applicationStatusLabel(r.status),
    渠道: r.channel,
    创建时间: r.createdAt,
  }))
  exportToCsv(`loan-applications-${Date.now()}`, ['申请号', '客户', '证件号', '申请金额', '期限月', '状态', '渠道', '创建时间'], data)
  auditLog('loan.application.export', { rows: data.length })
  ElMessage.success('已导出 CSV')
}

onMounted(() => {
  void load()
})
</script>

<template>
  <el-card class="mb">
    <el-form inline class="filter-form">
      <el-form-item label="关键字">
        <el-input v-model="filters.keyword" clearable placeholder="申请号 / 客户名" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="filters.status" clearable placeholder="全部" style="width: 160px">
          <el-option v-for="opt in APPLICATION_STATUS_FILTER_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
    </el-form>
  </el-card>
  <el-card>
    <template #header>
      <div class="hdr">
        <span>进件列表</span>
        <el-space wrap>
          <el-button type="success" plain size="small" @click="exportCsv">导出 CSV</el-button>
          <el-button v-permission="LP.application.edit" type="primary" size="small" @click="openDialog">
            新建进件
          </el-button>
        </el-space>
      </div>
    </template>
    <div class="table-responsive table-responsive--min">
      <el-table v-loading="loading" :data="filteredRows" border stripe>
        <el-table-column prop="id" label="申请号" width="150" />
        <el-table-column prop="applicantName" label="客户" min-width="160" />
        <el-table-column prop="idNoMasked" label="证件号" width="160" />
        <el-table-column prop="amount" label="申请金额" width="140">
          <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
        </el-table-column>
        <el-table-column prop="termMonths" label="期限(月)" width="100" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTypeOf(row.status)" size="small">{{ statusLabelOf(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="110" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
      </el-table>
    </div>
  </el-card>

  <el-dialog v-model="dialogVisible" title="新建进件" width="520px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item label="客户名称" prop="applicantName">
        <el-input v-model="form.applicantName" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="申请金额" prop="amount">
        <el-input-number v-model="form.amount" :min="1" :max="50_000_000" :step="10_000" style="width: 100%" />
      </el-form-item>
      <el-form-item label="期限(月)" prop="termMonths">
        <el-input-number v-model="form.termMonths" :min="1" :max="360" style="width: 100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.mb {
  margin-bottom: 12px;
}
.hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
