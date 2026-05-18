<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  applyLenderSeal,
  borrowerSignWithHandwriting,
  pushContractSign,
  simulateBorrowerSign,
} from '@/api/modules/loan'
import type { LoanContract } from '@/types/loan'
import ContractDocumentBody from '@/views/loan/contract/ContractDocumentBody.vue'
import HandwritingSignaturePad from '@/views/loan/contract/HandwritingSignaturePad.vue'
import { SIGNATORY_ROLE_LABEL } from '@/views/loan/contract/contractUi'
import { auditLog } from '@/utils/auditLog'

export type ContractDialogMode = 'preview' | 'esign'

type SignaturePadExpose = {
  clear: () => void
  isEmpty: () => boolean
  toDataUrl: () => string
  relayout: () => Promise<void>
}

const props = defineProps<{
  mode: ContractDialogMode
  contract: LoanContract | null
}>()

const emit = defineEmits<{
  updated: [contract: LoanContract]
}>()

const visible = defineModel<boolean>('visible', { default: false })

const isPreview = computed(() => props.mode === 'preview')
const dialogTitle = computed(() => (isPreview.value ? '合同预览' : '电子签章'))
const dialogWidth = computed(() => (isPreview.value ? '720px' : '800px'))

const localContract = ref<LoanContract | null>(null)
const sealing = ref(false)
const pushing = ref(false)
const simulating = ref(false)
const submittingHandwriting = ref(false)
const padRef = ref<SignaturePadExpose | null>(null)

watch(
  () => props.contract,
  (c) => {
    if (c) {
      localContract.value = {
        ...c,
        signatories: c.signatories.map((s) => ({ ...s })),
        seals: c.seals?.map((s) => ({ ...s })),
      }
    } else {
      localContract.value = null
    }
  },
  { immediate: true },
)

const lenderSigned = computed(
  () => localContract.value?.signatories.find((s) => s.role === 'lender')?.status === 'signed',
)
const borrowerSigned = computed(
  () => localContract.value?.signatories.find((s) => s.role === 'borrower')?.status === 'signed',
)
const allSigned = computed(() => lenderSigned.value && borrowerSigned.value)

watch([visible, () => props.mode, lenderSigned, borrowerSigned], async ([vis, mode, l, b]) => {
  if (!vis || mode !== 'esign' || !l || b) return
  await nextTick()
  await padRef.value?.relayout()
})

const handleSeal = async () => {
  if (!localContract.value) return
  sealing.value = true
  try {
    const row = await applyLenderSeal(localContract.value.id)
    if (!row) {
      ElMessage.error('加盖机构章失败')
      return
    }
    localContract.value = row
    auditLog('loan.contract.lenderSeal', { contractId: row.id })
    ElMessage.success('已加盖机构电子印章')
    emit('updated', row)
  } finally {
    sealing.value = false
  }
}

const handlePush = async () => {
  if (!localContract.value) return
  pushing.value = true
  try {
    const row = await pushContractSign(localContract.value.id)
    if (!row) {
      ElMessage.error('推送签署失败')
      return
    }
    localContract.value = row
    auditLog('loan.contract.pushSign', { contractId: row.id })
    ElMessage.success('已推送签署链接至客户手机')
    emit('updated', row)
  } finally {
    pushing.value = false
  }
}

const handleSimulateBorrower = async () => {
  if (!localContract.value) return
  simulating.value = true
  try {
    const row = await simulateBorrowerSign(localContract.value.id)
    if (!row) {
      ElMessage.warning('请先完成机构盖章')
      return
    }
    localContract.value = row
    auditLog('loan.contract.borrowerSign', { contractId: row.id, demo: true })
    ElMessage.success('演示：已一键完成签署（无手写笔迹）')
    emit('updated', row)
  } finally {
    simulating.value = false
  }
}

const confirmHandwriting = async () => {
  if (!localContract.value || !padRef.value) return
  if (padRef.value.isEmpty()) {
    ElMessage.warning('请先在手写板中签名')
    return
  }
  submittingHandwriting.value = true
  try {
    const png = padRef.value.toDataUrl()
    const row = await borrowerSignWithHandwriting(localContract.value.id, png)
    if (!row) {
      ElMessage.warning('请先完成机构盖章')
      return
    }
    localContract.value = row
    auditLog('loan.contract.borrowerHandwriting', { contractId: row.id })
    ElMessage.success('手写签名已确认，合同签署完毕')
    emit('updated', row)
  } finally {
    submittingHandwriting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="dialogTitle" :width="dialogWidth" destroy-on-close>
    <template v-if="isPreview && contract">
      <ContractDocumentBody :contract="contract" />
    </template>

    <template v-else-if="localContract">
      <el-steps :active="allSigned ? 3 : lenderSigned ? 2 : 1" finish-status="success" align-center class="esign-steps">
        <el-step title="机构盖章" description="加盖合同专用章" />
        <el-step title="推送签署" description="发送客户签署链接" />
        <el-step title="客户签章" description="手写签名确认" />
      </el-steps>

      <div class="esign-signatories">
        <div v-for="s in localContract.signatories" :key="s.role" class="esign-signatory">
          <span class="esign-signatory__role">{{ SIGNATORY_ROLE_LABEL[s.role] }}</span>
          <span class="esign-signatory__name">{{ s.name }}</span>
          <el-tag :type="s.status === 'signed' ? 'success' : 'info'" size="small">
            {{ s.status === 'signed' ? `已签署 ${s.signedAt ?? ''}` : '待签署' }}
          </el-tag>
        </div>
      </div>

      <div v-if="lenderSigned && !borrowerSigned" class="handwriting-block">
        <p class="handwriting-block__title">借款人手写签名</p>
        <p class="handwriting-block__hint">支持鼠标、触控笔或触摸屏；完成后点击「确认手写签名」。</p>
        <HandwritingSignaturePad ref="padRef" />
      </div>

      <div class="esign-doc-wrap">
        <ContractDocumentBody :contract="localContract" />
      </div>
    </template>

    <template #footer>
      <el-button @click="visible = false">{{ isPreview || allSigned ? '关闭' : '取消' }}</el-button>
      <template v-if="!isPreview">
        <el-button
          v-if="!lenderSigned"
          type="primary"
          :loading="sealing"
          @click="handleSeal"
        >
          加盖机构章
        </el-button>
        <template v-else-if="!borrowerSigned">
          <el-button v-if="!localContract?.pushedAt" :loading="pushing" @click="handlePush">推送客户签署</el-button>
          <el-button type="primary" :loading="submittingHandwriting" @click="confirmHandwriting">确认手写签名</el-button>
          <el-button type="info" plain :loading="simulating" @click="handleSimulateBorrower">演示：一键签署</el-button>
        </template>
      </template>
    </template>
  </el-dialog>
</template>

<style scoped>
.esign-steps {
  margin-bottom: 20px;
}

.esign-signatories {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.esign-signatory {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.esign-signatory__role {
  color: #909399;
}

.esign-signatory__name {
  font-weight: 500;
}

.handwriting-block {
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafcff;
}

.handwriting-block__title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.handwriting-block__hint {
  margin: 0 0 10px;
  font-size: 12px;
  color: #909399;
}

.esign-doc-wrap {
  max-height: 420px;
  overflow-y: auto;
}
</style>
