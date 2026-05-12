<script setup lang="ts">
const visible = defineModel<boolean>('visible', { default: false })

defineProps<{
  title: string
  width?: string | number
}>()
</script>

<template>
  <el-dialog v-model="visible" :title="title" :width="width || '520px'" destroy-on-close>
    <slot />
    <template #footer>
      <slot name="footer" />
    </template>
  </el-dialog>
</template>
