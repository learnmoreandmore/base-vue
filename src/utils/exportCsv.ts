function escapeCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

/** 浏览器导出 UTF-8 CSV（Excel 兼容 BOM） */
export function exportToCsv(filename: string, headers: string[], rows: Record<string, unknown>[]) {
  const keys = headers.map((h) => h.trim())
  const lines = [
    keys.map(escapeCell).join(','),
    ...rows.map((row) => keys.map((k) => escapeCell(row[k])).join(',')),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
