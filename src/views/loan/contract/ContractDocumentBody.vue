<script setup lang="ts">
import { computed } from 'vue'
import type { LoanContract } from '@/types/loan'
import { formatCurrency } from '@/utils/formatCurrency'

const props = defineProps<{
  contract: LoanContract
}>()

const lenderSealed = computed(() => props.contract.seals?.some((s) => s.party === 'lender'))
const borrowerSealed = computed(() => props.contract.seals?.some((s) => s.party === 'borrower'))
const borrowerHandwriting = computed(
  () => props.contract.seals?.find((s) => s.party === 'borrower' && s.handwritingDataUrl)?.handwritingDataUrl,
)
</script>

<template>
  <div class="contract-doc">
    <h2 class="contract-doc__title">个人经营性贷款合同</h2>
    <p class="contract-doc__meta">合同编号：{{ contract.id }} · 模板：{{ contract.templateCode }}</p>

    <section class="contract-doc__section">
      <h3>第一条 借款基本信息</h3>
      <p>借款人（甲方）：<strong>{{ contract.applicantName }}</strong></p>
      <p>贷款人（乙方）：<strong>某某银行股份有限公司信贷中心</strong></p>
      <p>借款金额：<strong>{{ formatCurrency(contract.amount) }}</strong>，用途为合法经营活动资金周转。</p>
      <p>关联进件申请号：{{ contract.applicationId }}</p>
    </section>

    <section class="contract-doc__section">
      <h3>第二条 利率与还款</h3>
      <p>本合同项下贷款执行年化利率以审批通知书为准，按月等额本息还款。</p>
      <p>借款人应按期足额偿还本息，逾期将按合同约定计收罚息。</p>
    </section>

    <section class="contract-doc__section">
      <h3>第三条 电子签章效力</h3>
      <p>双方同意采用符合《电子签名法》要求的电子签章方式签署本合同，电子签章与手写签名或盖章具有同等法律效力。</p>
    </section>

    <div class="contract-doc__sign-area">
      <div class="sign-block">
        <p>贷款人（盖章）</p>
        <div class="sign-zone">
          <div v-if="lenderSealed" class="eseal">
            <span class="eseal__ring">某某银行</span>
            <span class="eseal__center">合同专用章</span>
          </div>
          <span v-else class="sign-placeholder">待加盖机构章</span>
        </div>
      </div>
      <div class="sign-block">
        <p>借款人（签章）</p>
        <div class="sign-zone">
          <div v-if="borrowerSealed && borrowerHandwriting" class="esign esign--img">
            <img class="esign__img" :src="borrowerHandwriting" alt="手写签名" />
            <span class="esign__hint">手写签名</span>
          </div>
          <div v-else-if="borrowerSealed" class="esign">
            <span class="esign__name">{{ contract.applicantName }}</span>
            <span class="esign__hint">电子签名</span>
          </div>
          <span v-else class="sign-placeholder">待客户签署</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contract-doc {
  padding: 24px 32px;
  background: #fff;
  color: #303133;
  font-size: 14px;
  line-height: 1.8;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.contract-doc__title {
  margin: 0 0 8px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
}

.contract-doc__meta {
  margin: 0 0 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.contract-doc__section {
  margin-bottom: 16px;
}

.contract-doc__section h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.contract-doc__section p {
  margin: 4px 0;
}

.contract-doc__sign-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}

.sign-block p {
  margin: 0 0 8px;
  font-weight: 500;
}

.sign-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  background: #fafafa;
}

.sign-placeholder {
  color: #c0c4cc;
  font-size: 13px;
}

.eseal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border: 3px solid #c03639;
  border-radius: 50%;
  color: #c03639;
  transform: rotate(-12deg);
  user-select: none;
}

.eseal__ring {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

.eseal__center {
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
}

.esign {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 2px solid #303133;
  transform: rotate(-8deg);
  user-select: none;
}

.esign__name {
  font-family: "KaiTi", "STKaiti", serif;
  font-size: 18px;
  font-weight: 600;
}

.esign__hint {
  margin-top: 2px;
  font-size: 10px;
  color: #909399;
}

.esign--img {
  transform: rotate(-4deg);
  border-bottom: none;
  padding: 4px 0;
}

.esign__img {
  max-height: 72px;
  max-width: 160px;
  object-fit: contain;
}
</style>
