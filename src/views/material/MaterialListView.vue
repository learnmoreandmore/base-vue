<script setup lang="ts">
import { reactive, ref } from 'vue'
import * as XLSX from 'xlsx'
import BaseSearchBar from '@/components/common/BaseSearchBar.vue'
import BaseEditableTable from '@/components/common/BaseEditableTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import { usePermission } from '@/composables/usePermission'

interface MaterialRow {
  id: string
  code: string
  name: string
  stock: number
}

const { hasPermission } = usePermission()
const query = reactive({ keyword: '' })
const page = ref(1)
const pageSize = ref(10)

const rows = ref<MaterialRow[]>([
  { id: '1', code: 'MAT-1001', name: '主板组件', stock: 35 },
  { id: '2', code: 'MAT-1002', name: '显示屏组件', stock: 28 },
  { id: '3', code: 'MAT-1003', name: '电源模块', stock: 11 },
])

const handleExport = () => {
  const sheet = XLSX.utils.json_to_sheet(rows.value)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'materials')
  XLSX.writeFile(workbook, 'materials.xlsx')
}
</script>

<template>
  <BaseSearchBar>
    <el-form-item label="关键字">
      <el-input v-model="query.keyword" placeholder="请输入编码/名称" />
    </el-form-item>
  </BaseSearchBar>

  <el-card>
    <el-space wrap class="mb12">
      <el-button type="primary" :disabled="!hasPermission('material:list:edit')">新增物料</el-button>
      <el-button :disabled="!hasPermission('material:list:export')" @click="handleExport">
        导出 Excel
      </el-button>
    </el-space>

    <BaseEditableTable v-model:rows="rows" />
    <BasePagination v-model:page="page" v-model:page-size="pageSize" :total="56" />
  </el-card>
</template>

<style scoped>
.mb12 {
  margin-bottom: 12px;
}
</style>
