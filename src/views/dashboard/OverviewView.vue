<script setup lang="ts">
const metrics = [
  { label: '今日审批量', value: 128 },
  { label: '在线用户', value: 863 },
  { label: '库存预警', value: 19 },
  { label: 'API 异常', value: 2 },
]
</script>

<template>
  <el-row :gutter="12">
    <el-col v-for="item in metrics" :key="item.label" :xs="24" :sm="12" :md="6" :lg="6">
      <el-card>
        <div class="metric">{{ item.label }}</div>
        <h2>{{ item.value }}</h2>
      </el-card>
    </el-col>
  </el-row>
  <el-card class="mt12">
    <p>统一技术栈 + 动态权限 + 通用组件体系，支撑企业内部多部门业务协同。</p>
  </el-card>
</template>

<style scoped>
.metric {
  color: #909399;
}

.mt12 {
  margin-top: 12px;
}
</style>
