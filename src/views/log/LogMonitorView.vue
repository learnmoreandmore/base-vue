<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@/composables/useMediaQuery'

const logs = Array.from({ length: 200 }, (_, i) => ({
  id: `log-${i + 1}`,
  level: i % 15 === 0 ? 'ERROR' : 'INFO',
  message: i % 15 === 0 ? '网关超时告警' : '业务接口调用成功',
  time: `2026-04-25 12:${String(i % 60).padStart(2, '0')}:00`,
}))

const isNarrow = useMediaQuery('(max-width: 991.98px)')
const tableHeight = computed(() => (isNarrow.value ? 360 : 520))
</script>

<template>
  <el-card>
    <div class="table-responsive table-responsive--min">
      <el-table :data="logs" border :height="tableHeight">
        <el-table-column prop="id" label="日志 ID" width="120" />
        <el-table-column prop="level" label="级别" width="120" />
        <el-table-column prop="message" label="描述" min-width="220" />
        <el-table-column prop="time" label="时间" width="220" />
      </el-table>
    </div>
  </el-card>
</template>
