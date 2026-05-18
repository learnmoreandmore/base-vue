/** 是否微信内置浏览器（X5 / WKWebView） */
export function isWeixinBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  return /MicroMessenger/i.test(navigator.userAgent)
}

const IMAGE_EXT = '.jpg,.jpeg,.png,.gif,.webp,.bmp,.svg'
const VIDEO_EXT = '.mp4,.mov,.webm,.m4v,.mkv,.avi,.ogv,.mpeg,.mpg'
const AUDIO_EXT = '.mp3,.wav,.m4a,.aac,.ogg,.flac'

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/quicktime': '.mov',
  'video/webm': '.webm',
}

function addTokens(set: Set<string>, csv: string) {
  csv.split(',').forEach((x) => {
    const t = x.trim()
    if (t) {
      set.add(t)
    }
  })
}

function imageExtLast(a: string, b: string): number {
  const isImg = (x: string) => /^\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(x)
  if (isImg(a) === isImg(b)) {
    return a.localeCompare(b)
  }
  return isImg(a) ? 1 : -1
}

/**
 * 传给原生 file 控件的 `accept`。
 * 非微信原样返回；微信内展开 `image/*` / `video/*` 并映射 MIME，减少只能选相册的情况。
 */
export function weixinUploadAccept(userAccept: string): string {
  const raw = userAccept.trim()
  if (!isWeixinBrowser()) {
    return raw
  }
  const set = new Set<string>()
  if (!raw) {
    addTokens(
      set,
      `${IMAGE_EXT},${VIDEO_EXT},${AUDIO_EXT},.pdf,.zip,.doc,.docx,.xls,.xlsx,.txt,.csv`,
    )
    return [...set].sort(imageExtLast).join(',')
  }
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean)
  for (const p of parts) {
    if (p === 'image/*') {
      addTokens(set, IMAGE_EXT)
    } else if (p === 'video/*') {
      addTokens(set, VIDEO_EXT)
    } else if (p === 'audio/*') {
      addTokens(set, AUDIO_EXT)
    } else if (p.endsWith('/*')) {
      const base = p.slice(0, -2)
      const mapped = MIME_TO_EXT[base]
      if (mapped) {
        addTokens(set, mapped)
      }
    } else if (MIME_TO_EXT[p]) {
      addTokens(set, MIME_TO_EXT[p])
    } else {
      set.add(p)
    }
  }
  return [...set].sort(imageExtLast).join(',')
}
