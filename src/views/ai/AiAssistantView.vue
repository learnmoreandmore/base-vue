<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { nextTick, onUnmounted, ref } from 'vue'
import {
  getAiChatApiBase,
  getAiChatModel,
  streamChatCompletions,
  type ChatMessage,
} from '@/api/modules/aiChat'

const input = ref('')
const sending = ref(false)
const messages = ref<ChatMessage[]>([
  {
    role: 'system',
    content:
      '你是企业信贷管理后台的智能助手，回答简洁专业，涉及敏感操作时提醒用户以系统权限与审计为准。',
  },
])
const listRef = ref<HTMLElement | null>(null)
let abort: AbortController | null = null

const visibleMessages = () => messages.value.filter((m) => m.role !== 'system')

const scrollBottom = async () => {
  await nextTick()
  const el = listRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

const clearChat = () => {
  abort?.abort()
  abort = null
  messages.value = messages.value.filter((m) => m.role === 'system')
}

const send = async () => {
  const text = input.value.trim()
  if (!text || sending.value) {
    return
  }
  if (!getAiChatApiBase()) {
    ElMessage.warning('未配置对话 API：请设置环境变量或启动本地 Ollama（见 .env 注释）')
    return
  }

  input.value = ''
  messages.value.push({ role: 'user', content: text })
  messages.value.push({ role: 'assistant', content: '' })
  sending.value = true
  abort?.abort()
  abort = new AbortController()
  const assistantIndex = messages.value.length - 1

  await scrollBottom()

  try {
    const history = messages.value.slice(0, -1)
    for await (const chunk of streamChatCompletions(history, { signal: abort.signal })) {
      const cur = messages.value[assistantIndex]
      if (cur && cur.role === 'assistant') {
        cur.content += chunk
      }
      await scrollBottom()
    }
  } catch (e: unknown) {
    if ((e as Error)?.name === 'AbortError') {
      return
    }
    const msg = e instanceof Error ? e.message : '对话请求失败'
    ElMessage.error(msg)
    const cur = messages.value[assistantIndex]
    if (cur?.role === 'assistant' && !cur.content) {
      cur.content = `（错误）${msg}`
    }
  } finally {
    sending.value = false
    abort = null
    await scrollBottom()
  }
}

onUnmounted(() => {
  abort?.abort()
})
</script>

<template>
  <div class="ai-assistant-page">
    <el-card shadow="never" class="ai-assistant-page__card">
      <template #header>
        <div class="ai-assistant-page__head">
          <span class="ai-assistant-page__title">智能对话</span>
          <span class="ai-assistant-page__meta">当前模型：{{ getAiChatModel() }}</span>
        </div>
      </template>

      <div class="ai-assistant-page__body">
        <div ref="listRef" class="ai-assistant-page__list">
          <div
            v-for="(m, i) in visibleMessages()"
            :key="i"
            class="ai-assistant-page__msg"
            :class="`ai-assistant-page__msg--${m.role}`"
          >
            <div class="ai-assistant-page__bubble">
              {{ m.content || (m.role === 'assistant' && sending ? '…' : '') }}
            </div>
          </div>
        </div>
        <div class="ai-assistant-page__input-row">
          <el-input
            v-model="input"
            type="textarea"
            :rows="4"
            maxlength="4000"
            show-word-limit
            placeholder="输入问题，Enter 发送（Shift+Enter 换行）"
            :disabled="sending"
            @keydown.enter.exact.prevent="send"
          />
          <div class="ai-assistant-page__actions">
            <el-button text type="danger" :disabled="sending" @click="clearChat">清空会话</el-button>
            <el-button type="primary" :loading="sending" @click="send">发送</el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.ai-assistant-page {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ai-assistant-page__card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.ai-assistant-page__card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px;
}

.ai-assistant-page__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.ai-assistant-page__title {
  font-size: 16px;
  font-weight: 600;
}

.ai-assistant-page__meta {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ai-assistant-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.ai-assistant-page__list {
  flex: 1;
  min-height: 240px;
  max-height: min(560px, calc(100vh - 320px));
  overflow-y: auto;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-assistant-page__msg {
  display: flex;
}
.ai-assistant-page__msg--user {
  justify-content: flex-end;
}
.ai-assistant-page__msg--assistant {
  justify-content: flex-start;
}

.ai-assistant-page__bubble {
  max-width: min(720px, 92%);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.ai-assistant-page__msg--user .ai-assistant-page__bubble {
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  color: var(--el-text-color-primary);
}
.ai-assistant-page__msg--assistant .ai-assistant-page__bubble {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-primary);
}

.ai-assistant-page__input-row {
  flex-shrink: 0;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.ai-assistant-page__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
