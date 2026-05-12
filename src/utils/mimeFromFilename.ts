/** 根据扩展名推断 MIME，用于 Blob / 预览（部分浏览器对空 type 的 PDF blob 会乱码） */
export function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    zip: 'application/zip',
    txt: 'text/plain;charset=utf-8',
  }
  return map[ext] ?? 'application/octet-stream'
}
