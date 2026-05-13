<script setup lang="ts">
interface MaterialRow {
  id: string
  code: string
  name: string
  stock: number
}

const rows = defineModel<MaterialRow[]>('rows', { default: [] })

const tableHeight = 360
</script>

<template>
  <div class="table-responsive table-responsive--min">
    <el-table :data="rows" border :height="tableHeight">
      <el-table-column type="index" width="60" label="#" />
      <el-table-column prop="code" label="物料编码" min-width="160" />
      <el-table-column prop="name" label="物料名称" min-width="220" />
      <el-table-column label="库存" min-width="140">
        <template #default="{ row }">
          <el-input-number v-model="row.stock" :min="0" :step="1" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
