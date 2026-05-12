<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  search: []
  reset: []
}>()
</script>

<template>
  <div class="card-panel search-bar">
    <el-form inline>
      <slot />
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.search-bar {
  margin-bottom: 12px;
}

@media (max-width: 991.98px) {
  .search-bar :deep(.el-form--inline) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .search-bar :deep(.el-form-item) {
    margin-right: 0;
  }

  .search-bar :deep(.el-form-item__content) {
    flex-wrap: wrap;
  }
}
</style>
