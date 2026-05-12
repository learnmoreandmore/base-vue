/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
  readonly VITE_API_BASE_URL?: string
  /** OpenAI 兼容 Chat API 的 Base（不含路径），如 https://api.siliconflow.cn/v1；开发环境可不配，走 /ai-chat 代理至 Ollama */
  readonly VITE_AI_CHAT_API_BASE?: string
  /** 如硅基流动等需要 Bearer；本地 Ollama 可留空 */
  readonly VITE_AI_CHAT_API_KEY?: string
  /** 模型名，如 qwen2.5:7b（Ollama）或 Qwen/Qwen2.5-7B-Instruct（硅基流动） */
  readonly VITE_AI_CHAT_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
