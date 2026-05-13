<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { checkLargeUpload, mergeLargeUpload, uploadLargeChunk } from '@/api/modules/largeUpload'
import { compressImageFile, shouldCompressFile } from '@/utils/fileCompress'
import type { UploadedFileRecord } from '@/types/upload'
import { mimeFromFilename } from '@/utils/mimeFromFilename'

type UploadStatus =
  | 'idle'
  | 'hashing'
  | 'compressing'
  | 'uploading'
  | 'paused'
  | 'done'
  | 'error'

type ChunkTask = {
  index: number
  chunkHash: string
  blob: Blob
}

const props = withDefaults(
  defineProps<{
    accept?: string
    maxSize?: number
    chunkSize?: number
    concurrency?: number
    autoUpload?: boolean
    enableCompress?: boolean
    compressThreshold?: number
    buttonText?: string
    /** 是否展示已上传文件列表 */
    showUploadedList?: boolean
    /** 最多保留条数 */
    maxHistory?: number
  }>(),
  {
    accept: '',
    maxSize: 1024 * 1024 * 1024 * 2,
    chunkSize: 5 * 1024 * 1024,
    concurrency: 3,
    autoUpload: true,
    enableCompress: true,
    compressThreshold: 1024 * 1024,
    buttonText: '选择文件',
    showUploadedList: true,
    maxHistory: 50,
  },
)

const emit = defineEmits<{
  success: [{ fileUrl?: string; fileHash: string; filename: string }]
  error: [message: string]
  'update:uploadedList': [UploadedFileRecord[]]
}>()

const selectedFile = ref<File | null>(null)
const runtimeFile = ref<File | null>(null)
const status = ref<UploadStatus>('idle')
const hashProgress = ref(0)
const uploadProgress = ref(0)
const currentHash = ref('')
const uploadedSet = ref(new Set<number>())
const abortFlag = ref(false)
const compressed = ref(false)

const uploadedList = ref<UploadedFileRecord[]>([])

const previewVisible = ref(false)
const previewKind = ref<'image' | 'pdf' | 'none'>('none')
const previewTitle = ref('')
const previewSrc = ref('')

const isWorking = computed(() => ['hashing', 'compressing', 'uploading'].includes(status.value))
const canPause = computed(() => status.value === 'uploading')
const canResume = computed(() => status.value === 'paused')
const canRetry = computed(() => status.value === 'error')
const canStart = computed(() => selectedFile.value && !isWorking.value && status.value !== 'done')

const shortHash = (hash: string) => (hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash)

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const revokeRecordUrl = (item: UploadedFileRecord) => {
  if (item.objectUrl) {
    URL.revokeObjectURL(item.objectUrl)
    item.objectUrl = undefined
  }
}

const buildObjectUrlIfNeeded = (file: File, fileUrl?: string): string | undefined => {
  if (fileUrl) {
    return undefined
  }
  const name = file.name.toLowerCase()
  const isImg =
    file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  if (isImg || isPdf) {
    const type =
      file.type && file.type.length > 0 ? file.type : mimeFromFilename(file.name)
    return URL.createObjectURL(new Blob([file], { type }))
  }
  return undefined
}

const pushUploadedRecord = (payload: { file: File; fileHash: string; fileUrl?: string }) => {
  const objectUrl = buildObjectUrlIfNeeded(payload.file, payload.fileUrl)
  const row: UploadedFileRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    filename: payload.file.name,
    fileHash: payload.fileHash,
    fileUrl: payload.fileUrl,
    size: payload.file.size,
    mimeType:
      payload.file.type && payload.file.type.length > 0
        ? payload.file.type
        : mimeFromFilename(payload.file.name),
    finishedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    objectUrl,
  }
  uploadedList.value = [row, ...uploadedList.value].slice(0, props.maxHistory)
  emit('update:uploadedList', [...uploadedList.value])
}

const previewKindOf = (item: UploadedFileRecord): 'image' | 'pdf' | 'none' => {
  const name = item.filename.toLowerCase()
  if (item.mimeType.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)) {
    return 'image'
  }
  if (item.mimeType === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf'
  }
  return 'none'
}

const resolvePreviewSrc = (item: UploadedFileRecord): string | undefined => {
  return item.fileUrl || item.objectUrl
}

const openPreview = (item: UploadedFileRecord) => {
  const src = resolvePreviewSrc(item)
  if (!src) {
    ElMessage.info('当前文件无预览地址，请从服务端返回 fileUrl 后重试')
    return
  }
  const kind = previewKindOf(item)
  previewTitle.value = item.filename
  previewSrc.value = src
  if (kind === 'none') {
    window.open(src, '_blank', 'noopener,noreferrer')
    return
  }
  previewKind.value = kind
  previewVisible.value = true
}

const removeRecord = (item: UploadedFileRecord) => {
  revokeRecordUrl(item)
  uploadedList.value = uploadedList.value.filter((r) => r.id !== item.id)
  emit('update:uploadedList', [...uploadedList.value])
}

const clearHistory = () => {
  uploadedList.value.forEach(revokeRecordUrl)
  uploadedList.value = []
  emit('update:uploadedList', [])
}

const resetRuntime = () => {
  runtimeFile.value = null
  hashProgress.value = 0
  uploadProgress.value = 0
  currentHash.value = ''
  uploadedSet.value = new Set<number>()
  abortFlag.value = false
  compressed.value = false
}

const parseAccept = () => {
  return props.accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const isFileTypeAllowed = (file: File) => {
  const rules = parseAccept()
  if (rules.length === 0) {
    return true
  }
  return rules.some((rule) => {
    if (rule.endsWith('/*')) {
      const prefix = rule.replace('/*', '/')
      return file.type.startsWith(prefix)
    }
    if (rule.startsWith('.')) {
      return file.name.toLowerCase().endsWith(rule.toLowerCase())
    }
    return file.type === rule
  })
}

const onFileChange = (uploadFile: { raw?: File }) => {
  const file = uploadFile.raw
  if (!file) {
    return
  }
  if (!isFileTypeAllowed(file)) {
    ElMessage.error('文件类型不符合限制')
    return
  }
  if (file.size > props.maxSize) {
    ElMessage.error(`文件大小不能超过 ${(props.maxSize / 1024 / 1024).toFixed(2)}MB`)
    return
  }
  selectedFile.value = file
  status.value = 'idle'
  resetRuntime()
  if (props.autoUpload) {
    void startUpload()
  }
}

const ensureWorkerHash = (file: File): Promise<{ hash: string; chunkCount: number }> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../../workers/fileHash.worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<{ type: string; progress?: number; hash?: string; chunkCount?: number; message?: string }>) => {
      const payload = event.data
      if (payload.type === 'progress') {
        hashProgress.value = payload.progress ?? 0
      }
      if (payload.type === 'done' && payload.hash && payload.chunkCount !== undefined) {
        resolve({ hash: payload.hash, chunkCount: payload.chunkCount })
        worker.terminate()
      }
      if (payload.type === 'error') {
        reject(new Error(payload.message || '哈希计算失败'))
        worker.terminate()
      }
    }
    worker.onerror = () => {
      reject(new Error('Worker 执行失败'))
      worker.terminate()
    }
    worker.postMessage({
      file,
      chunkSize: props.chunkSize,
    })
  })

const createChunks = (file: File, fileHash: string): ChunkTask[] => {
  const chunkCount = Math.ceil(file.size / props.chunkSize)
  const tasks: ChunkTask[] = []
  for (let index = 0; index < chunkCount; index += 1) {
    const start = index * props.chunkSize
    const end = Math.min(file.size, start + props.chunkSize)
    tasks.push({
      index,
      chunkHash: `${fileHash}-${index}`,
      blob: file.slice(start, end),
    })
  }
  return tasks
}

const runUploadPool = async (tasks: ChunkTask[], fileHash: string, filename: string) => {
  const pending = tasks.filter((task) => !uploadedSet.value.has(task.index))
  const total = tasks.length

  const workerTask = async () => {
    while (pending.length > 0) {
      if (abortFlag.value) {
        return
      }
      const task = pending.shift()
      if (!task) {
        return
      }
      await uploadLargeChunk({
        fileHash,
        filename,
        chunkHash: task.chunkHash,
        chunkIndex: task.index,
        totalChunks: total,
        chunk: task.blob,
      })
      uploadedSet.value.add(task.index)
      uploadProgress.value = Math.round((uploadedSet.value.size / total) * 100)
    }
  }

  const size = Math.max(1, props.concurrency)
  await Promise.all(Array.from({ length: size }, () => workerTask()))
}

const startUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  try {
    abortFlag.value = false
    status.value = 'compressing'
    let file = selectedFile.value
    if (props.enableCompress && shouldCompressFile(file, props.compressThreshold)) {
      file = await compressImageFile(file)
      compressed.value = file.size < selectedFile.value.size
    }

    runtimeFile.value = file
    status.value = 'hashing'
    const { hash } = await ensureWorkerHash(file)
    currentHash.value = hash

    const check = await checkLargeUpload({
      fileHash: hash,
      filename: file.name,
    })
    const uploadedChunks = Array.isArray(check?.uploadedChunks) ? check.uploadedChunks : []
    uploadedSet.value = new Set<number>(uploadedChunks)

    if (check?.uploaded) {
      status.value = 'done'
      uploadProgress.value = 100
      emit('success', { fileHash: hash, filename: file.name, fileUrl: check.fileUrl })
      if (props.showUploadedList) {
        pushUploadedRecord({ file, fileHash: hash, fileUrl: check.fileUrl })
      }
      ElMessage.success('文件已秒传')
      return
    }

    const tasks = createChunks(file, hash)
    uploadProgress.value = Math.round((uploadedSet.value.size / Math.max(1, tasks.length)) * 100)
    status.value = 'uploading'
    await runUploadPool(tasks, hash, file.name)

    if (abortFlag.value) {
      status.value = 'paused'
      return
    }

    const mergeResult = await mergeLargeUpload({
      fileHash: hash,
      filename: file.name,
      totalChunks: tasks.length,
      size: file.size,
    })

    status.value = 'done'
    uploadProgress.value = 100
    emit('success', { fileHash: hash, filename: file.name, fileUrl: mergeResult?.fileUrl })
    if (props.showUploadedList) {
      pushUploadedRecord({ file, fileHash: hash, fileUrl: mergeResult?.fileUrl })
    }
    ElMessage.success('上传成功')
  } catch (error) {
    status.value = 'error'
    const message = error instanceof Error ? error.message : '上传失败'
    emit('error', message)
    ElMessage.error(message)
  }
}

const pauseUpload = () => {
  if (status.value !== 'uploading') {
    return
  }
  abortFlag.value = true
  status.value = 'paused'
}

const resumeUpload = async () => {
  if (!selectedFile.value) {
    return
  }
  status.value = 'paused'
  await startUpload()
}

const retryUpload = async () => {
  if (!selectedFile.value) {
    return
  }
  status.value = 'idle'
  hashProgress.value = 0
  uploadProgress.value = 0
  uploadedSet.value = new Set<number>()
  currentHash.value = ''
  await startUpload()
}

const clearFile = () => {
  selectedFile.value = null
  status.value = 'idle'
  resetRuntime()
}

const closePreview = () => {
  previewVisible.value = false
  previewSrc.value = ''
  previewKind.value = 'none'
}

const pdfDownloadName = computed(() => {
  const name = previewTitle.value?.trim() || 'document.pdf'
  return /\.pdf$/i.test(name) ? name : `${name}.pdf`
})

/** 必须在用户点击等手势内同步调用，避免移动端拦截弹窗 */
const openPdfNewTab = () => {
  const src = previewSrc.value
  if (!src) {
    return
  }
  const opened = window.open(src, '_blank', 'noopener,noreferrer')
  if (!opened) {
    ElMessage.warning('无法打开新窗口，请使用「保存到本机」')
  }
}

const downloadPdfBlob = () => {
  const src = previewSrc.value
  if (!src) {
    return
  }
  const a = document.createElement('a')
  a.href = src
  a.download = pdfDownloadName.value
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onUnmounted(() => {
  uploadedList.value.forEach(revokeRecordUrl)
})

defineExpose({
  startUpload,
  pauseUpload,
  resumeUpload,
  retryUpload,
  clearFile,
  clearHistory,
  uploadedList,
})
</script>

<template>
  <div class="large-uploader">
    <el-upload
      :show-file-list="false"
      :auto-upload="false"
      :accept="accept"
      :on-change="onFileChange"
    >
      <el-button type="primary">{{ buttonText }}</el-button>
    </el-upload>

    <div v-if="selectedFile" class="upload-panel">
      <div class="file-meta">
        <span class="name">{{ selectedFile.name }}</span>
        <span class="size">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB</span>
        <el-tag v-if="compressed" size="small" type="success">已压缩</el-tag>
      </div>

      <el-progress v-if="status === 'hashing'" :percentage="hashProgress" status="success">
        <span>MD5 计算中</span>
      </el-progress>
      <el-progress v-else :percentage="uploadProgress">
        <span>上传进度</span>
      </el-progress>

      <div class="actions">
        <el-button v-if="canStart" type="primary" @click="startUpload">开始上传</el-button>
        <el-button v-if="canPause" @click="pauseUpload">暂停</el-button>
        <el-button v-if="canResume" type="warning" @click="resumeUpload">继续</el-button>
        <el-button v-if="canRetry" type="danger" @click="retryUpload">重传</el-button>
        <el-button @click="clearFile">清空</el-button>
      </div>

      <div class="status-text">状态：{{ status }}</div>
    </div>

    <div v-if="showUploadedList && uploadedList.length" class="history-panel">
      <div class="history-head">
        <span class="history-title">已上传文件</span>
        <el-button text type="danger" size="small" @click="clearHistory">清空列表</el-button>
      </div>
      <div class="table-responsive table-responsive--min">
        <el-table :data="uploadedList" border stripe size="small">
          <el-table-column prop="filename" label="文件名" min-width="140" show-overflow-tooltip />
          <el-table-column label="MD5" width="140">
            <template #default="{ row }">
              <el-tooltip :content="row.fileHash" placement="top">
                <span class="mono">{{ shortHash(row.fileHash) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatSize(row.size) }}</template>
          </el-table-column>
          <el-table-column prop="finishedAt" label="完成时间" width="160" />
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openPreview(row)">预览</el-button>
              <el-button type="danger" link @click="removeRecord(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog
      v-model="previewVisible"
      :title="previewTitle"
      width="90%"
      destroy-on-close
      append-to-body
      class="preview-dialog"
      @closed="closePreview"
    >
      <div v-if="previewKind === 'image'" class="preview-body">
        <el-image
          :src="previewSrc"
          fit="contain"
          class="preview-image"
          :preview-src-list="[previewSrc]"
          preview-teleported
        />
      </div>
      <div v-else-if="previewKind === 'pdf'" class="preview-pdf">
        <div class="preview-pdf-toolbar">
          <el-button type="primary" size="small" @click="openPdfNewTab">新窗口打开</el-button>
          <el-button type="primary" plain size="small" @click="downloadPdfBlob">保存到本机</el-button>
        </div>
        <p class="preview-pdf-hint">
          若下方预览空白（如部分环境不支持 blob 内嵌 PDF），请使用「新窗口打开」或「保存到本机」。
        </p>
        <iframe
          v-if="previewSrc"
          :key="previewSrc"
          title="PDF 预览"
          :src="previewSrc"
          class="preview-pdf-frame"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.large-uploader {
  width: 100%;
}

.upload-panel {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.history-panel {
  margin-top: 16px;
  padding: 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}

.history-title {
  font-weight: 600;
  font-size: 14px;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.file-meta .name {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta .size {
  color: var(--el-text-color-secondary);
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-text {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.preview-body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  max-height: 560px;
}

.preview-image {
  max-width: 100%;
  max-height: 520px;
}

.preview-pdf {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 420px;
}

.preview-pdf-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  flex-shrink: 0;
}

.preview-pdf-hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.preview-pdf-frame {
  width: 100%;
  flex: 1;
  min-height: 560px;
  border: none;
  border-radius: 4px;
  background: var(--el-fill-color-light);
}
</style>
