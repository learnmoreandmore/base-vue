<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const form = reactive({
  username: 'admin',
  password: '123456',
})

const afterLoginPath = computed(() => {
  const raw = route.query.redirect
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return '/home'
  }
  const pathPart = raw.split('?')[0]
  if (pathPart.includes('..')) {
    return '/home'
  }
  return raw
})

const onSubmit = async () => {
  loading.value = true
  try {
    await userStore.loginByAccount(form.username, form.password)
    ElMessage.success('登录成功')
    await router.replace(afterLoginPath.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>企业级后台管理平台</h2>
      <p class="tips">演示账号：admin / ops / audit / wh（密码任意）</p>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="账号">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  background: linear-gradient(135deg, #409eff 10%, #7f8c8d 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
}

.tips {
  color: #909399;
}

.submit-btn {
  width: 100%;
  margin-top: 10px;
}
</style>
