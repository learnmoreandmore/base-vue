/**
 * 大文件分片上传 — 纯前端模拟（不请求真实接口）。
 * 恢复真实接口时：改回使用 @/api/http 调用 /upload/check、/upload/chunk、/upload/merge，
 * 或通过环境变量 VITE_MOCK_LARGE_UPLOAD=false 切换（需自行接回 http 实现）。
 */

import { mimeFromFilename } from '@/utils/mimeFromFilename'

export type UploadCheckPayload = {
  fileHash: string
  filename: string
}

export type UploadChunkPayload = {
  fileHash: string
  filename: string
  chunkHash: string
  chunkIndex: number
  totalChunks: number
  chunk: Blob
}

export type UploadMergePayload = {
  fileHash: string
  filename: string
  totalChunks: number
  size: number
}

export type CheckUploadResult = {
  uploaded: boolean
  uploadedChunks: number[]
  fileUrl?: string
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const storeKey = (fileHash: string, filename: string) => `${fileHash}::${filename}`

/** 已收到的分片 index -> Blob */
const chunkParts = new Map<string, Map<number, Blob>>()
/** 已合并完成的 fileKey -> 模拟访问地址（blob:） */
const mergedFiles = new Map<string, string>()

export async function checkLargeUpload(payload: UploadCheckPayload): Promise<CheckUploadResult> {
  await delay(120 + Math.floor(Math.random() * 80))
  const key = storeKey(payload.fileHash, payload.filename)
  const doneUrl = mergedFiles.get(key)
  if (doneUrl) {
    return {
      uploaded: true,
      uploadedChunks: [],
      fileUrl: doneUrl,
    }
  }
  const parts = chunkParts.get(key)
  const uploadedChunks = parts ? [...parts.keys()].sort((a, b) => a - b) : []
  return {
    uploaded: false,
    uploadedChunks,
  }
}

export async function uploadLargeChunk(payload: UploadChunkPayload): Promise<unknown> {
  await delay(60 + Math.floor(Math.random() * 100))
  const key = storeKey(payload.fileHash, payload.filename)
  if (!chunkParts.has(key)) {
    chunkParts.set(key, new Map())
  }
  chunkParts.get(key)!.set(payload.chunkIndex, payload.chunk)
  return { ok: true }
}

export async function mergeLargeUpload(payload: UploadMergePayload): Promise<{ fileUrl?: string }> {
  await delay(180 + Math.floor(Math.random() * 120))
  const key = storeKey(payload.fileHash, payload.filename)
  const partsMap = chunkParts.get(key)
  const blobs: Blob[] = []
  for (let i = 0; i < payload.totalChunks; i += 1) {
    const part = partsMap?.get(i)
    if (!part) {
      throw new Error(`模拟合并失败：缺少分片 ${i}，请重新上传`)
    }
    blobs.push(part)
  }
  const mime = mimeFromFilename(payload.filename)
  const merged = new Blob(blobs, { type: mime })
  const prev = mergedFiles.get(key)
  if (prev?.startsWith('blob:')) {
    URL.revokeObjectURL(prev)
  }
  const fileUrl = URL.createObjectURL(merged)
  mergedFiles.set(key, fileUrl)
  chunkParts.delete(key)
  return { fileUrl }
}

/** 开发调试用：清空模拟存储 */
export function resetLargeUploadMock() {
  mergedFiles.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
  mergedFiles.clear()
  chunkParts.clear()
}
