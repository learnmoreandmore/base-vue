/** 大文件上传完成后的列表项（与 LargeFileUploader 一致） */
export type UploadedFileRecord = {
  id: string
  filename: string
  fileHash: string
  fileUrl?: string
  size: number
  mimeType: string
  finishedAt: string
  /** 无服务端 URL 时，图片/PDF 可用本地 Blob 地址预览 */
  objectUrl?: string
}
