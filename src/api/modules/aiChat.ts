/** OpenAI 兼容 Chat Completions（适用于 Ollama、硅基流动 SiliconFlow 等） */

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

function trimBase(url: string) {
  return url.replace(/\/+$/, '')
}

/** 接口 Base，不含尾部 /chat/completions。生产环境请在 .env 配置 VITE_AI_CHAT_API_BASE */
export function getAiChatApiBase(): string {
  const fromEnv = import.meta.env.VITE_AI_CHAT_API_BASE
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return trimBase(fromEnv.trim())
  }
  if (import.meta.env.DEV) {
    return '/ai-chat'
  }
  /** vite preview 等本地打开时同源走代理（需配置 preview.proxy） */
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location
    const local = hostname === 'localhost' || hostname === '127.0.0.1'
    if (local && (port === '4173' || port === '5173')) {
      return '/ai-chat'
    }
  }
  return ''
}

export function getAiChatModel(): string {
  const m = import.meta.env.VITE_AI_CHAT_MODEL
  return typeof m === 'string' && m.trim() ? m.trim() : 'qwen2.5:7b'
}

export function getAiChatApiKey(): string | undefined {
  const k = import.meta.env.VITE_AI_CHAT_API_KEY
  return typeof k === 'string' && k.trim() ? k.trim() : undefined
}

type ParseResult = { kind: 'chunk'; text: string } | { kind: 'done' } | { kind: 'skip' } | { kind: 'error'; message: string }

function parseStreamLine(raw: string): ParseResult {
  const line = raw.replace(/\r$/, '').trim()
  if (!line) {
    return { kind: 'skip' }
  }

  let payload = line
  if (line.startsWith('data:')) {
    payload = line.slice(5).trim()
  }
  if (payload === '[DONE]') {
    return { kind: 'done' }
  }
  if (!payload.startsWith('{')) {
    return { kind: 'skip' }
  }

  try {
    const json = JSON.parse(payload) as Record<string, unknown>

    const err = json.error
    if (err !== undefined) {
      const msg =
        typeof err === 'string'
          ? err
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message?: unknown }).message ?? err)
            : JSON.stringify(err)
      return { kind: 'error', message: msg || '接口返回错误' }
    }

    const choices = json.choices as Array<{ delta?: { content?: string } }> | undefined
    const deltaPiece = choices?.[0]?.delta?.content
    if (typeof deltaPiece === 'string' && deltaPiece.length > 0) {
      return { kind: 'chunk', text: deltaPiece }
    }

    /** Ollama NDJSON：每行含 message.content 增量片段 */
    const message = json.message as { content?: string } | undefined
    const msgPiece = message?.content
    if (typeof msgPiece === 'string' && msgPiece.length > 0) {
      return { kind: 'chunk', text: msgPiece }
    }

    return { kind: 'skip' }
  } catch {
    return { kind: 'skip' }
  }
}

export async function* streamChatCompletions(
  messages: ChatMessage[],
  options?: { signal?: AbortSignal },
): AsyncGenerator<string, void, unknown> {
  const base = getAiChatApiBase()
  if (!base) {
    throw new Error(
      '未配置对话接口：请在 .env 设置 VITE_AI_CHAT_API_BASE（生产），开发环境使用 npm run dev 并启动 Ollama，或本地 preview 使用 4173/5173 端口走 /ai-chat 代理',
    )
  }
  const url = `${base}/chat/completions`
  const key = getAiChatApiKey()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, application/x-ndjson;q=0.9, application/json;q=0.8',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model: getAiChatModel(),
      messages,
      stream: true,
    }),
    signal: options?.signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `请求失败 ${res.status}`)
  }

  const ct = (res.headers.get('content-type') || '').toLowerCase()
  if (ct.includes('application/json') && !ct.includes('ndjson') && !ct.includes('event-stream')) {
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
      error?: { message?: string }
    }
    if (json.error?.message) {
      throw new Error(json.error.message)
    }
    const full = json.choices?.[0]?.message?.content
    if (typeof full === 'string' && full.length) {
      yield full
    }
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    throw new Error('响应无正文流')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  const processLine = function* (raw: string): Generator<string, void, unknown> {
    const r = parseStreamLine(raw)
    if (r.kind === 'error') {
      throw new Error(r.message)
    }
    if (r.kind === 'chunk') {
      yield r.text
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const raw of lines) {
      for (const piece of processLine(raw)) {
        yield piece
      }
    }
  }

  if (buffer.trim()) {
    for (const piece of processLine(buffer)) {
      yield piece
    }
  }
}
