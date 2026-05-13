<script setup lang="ts">
const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

defineProps<{
  total: number
}>()

const emit = defineEmits<{
  change: []
}>()

const handleChange = () => {
  emit('change')
}
</script>

<template>
  <div class="pagination-wrap">
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      :pager-count="7"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.pagination-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
