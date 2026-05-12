<script setup lang="ts">
import { reactive } from 'vue'
import BaseSearchBar from '@/components/common/BaseSearchBar.vue'

const filters = reactive({
  code: '',
  status: '',
})

const list = [
  { code: 'AP20260425001', applicant: '陈经理', status: '待审批' },
  { code: 'AP20260425002', applicant: '王主管', status: '已通过' },
]
</script>

<template>
  <BaseSearchBar>
    <el-form-item label="审批单号">
      <el-input v-model="filters.code" />
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="filters.status" clearable>
        <el-option label="待审批" value="待审批" />
        <el-option label="已通过" value="已通过" />
      </el-select>
    </el-form-item>
  </BaseSearchBar>

  <el-card>
    <div class="table-responsive">
      <el-table :data="list" border>
        <el-table-column prop="code" label="单号" min-width="120" />
        <el-table-column prop="applicant" label="申请人" min-width="100" />
        <el-table-column prop="status" label="状态" min-width="88" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default>
            <el-button type="primary" link>审批</el-button>
            <el-button type="danger" link>驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
</template>
