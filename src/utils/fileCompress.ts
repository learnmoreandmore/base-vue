export type CompressOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片读取失败'))
    image.src = URL.createObjectURL(file)
  })

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('图片压缩失败'))
        return
      }
      resolve(blob)
    }, type, quality)
  })

export const compressImageFile = async (
  file: File,
  options: CompressOptions = {},
): Promise<File> => {
  const image = await loadImage(file)
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.82 } = options
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1)
  const targetWidth = Math.round(image.width * scale)
  const targetHeight = Math.round(image.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('浏览器不支持 Canvas 2D')
  }

  context.drawImage(image, 0, 0, targetWidth, targetHeight)
  URL.revokeObjectURL(image.src)

  const blob = await canvasToBlob(canvas, file.type || 'image/jpeg', quality)
  if (blob.size >= file.size) {
    return file
  }

  return new File([blob], file.name, {
    type: blob.type,
    lastModified: Date.now(),
  })
}

export const shouldCompressFile = (file: File, threshold = 1 * 1024 * 1024): boolean => {
  if (!file.type.startsWith('image/')) {
    return false
  }
  return file.size >= threshold
}
