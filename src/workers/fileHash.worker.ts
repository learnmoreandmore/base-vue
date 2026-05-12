/// <reference lib="webworker" />
import SparkMD5 from 'spark-md5'

type HashWorkerMessage = {
  file: File
  chunkSize: number
}

type ProgressMessage = {
  type: 'progress'
  progress: number
}

type DoneMessage = {
  type: 'done'
  hash: string
  chunkCount: number
}

type ErrorMessage = {
  type: 'error'
  message: string
}

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope

ctx.onmessage = async (event: MessageEvent<HashWorkerMessage>) => {
  try {
    const { file, chunkSize } = event.data
    const total = Math.ceil(file.size / chunkSize)
    const spark = new SparkMD5.ArrayBuffer()

    for (let index = 0; index < total; index += 1) {
      const start = index * chunkSize
      const end = Math.min(file.size, start + chunkSize)
      const chunk = file.slice(start, end)
      const buffer = await chunk.arrayBuffer()
      spark.append(buffer)
      const progress = Math.round(((index + 1) / total) * 100)
      ctx.postMessage({
        type: 'progress',
        progress,
      } satisfies ProgressMessage)
    }

    ctx.postMessage({
      type: 'done',
      hash: spark.end(),
      chunkCount: total,
    } satisfies DoneMessage)
  } catch (error) {
    const message = error instanceof Error ? error.message : '计算文件哈希失败'
    ctx.postMessage({
      type: 'error',
      message,
    } satisfies ErrorMessage)
  }
}
