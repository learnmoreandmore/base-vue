<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

defineProps<{
  total: number
}>()

const emit = defineEmits<{
  change: []
}>()

const isNarrow = useMediaQuery('(max-width: 991.98px)')
const paginationLayout = computed(() =>
  isNarrow.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next, jumper',
)

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
      :layout="paginationLayout"
      :pager-count="isNarrow ? 5 : 7"
      :small="isNarrow"
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

@media (max-width: 991.98px) {
  .pagination-wrap {
    justify-content: center;
  }
}
</style>
