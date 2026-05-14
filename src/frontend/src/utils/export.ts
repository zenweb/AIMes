/** 将表格数据导出为 CSV 文件并下载 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]): void {
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => {
        if (cell == null) return ''
        const str = String(cell)
        // 转义引号和逗号
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }).join(',')
    ),
  ].join('\n')

  const BOM = '﻿' // Excel UTF-8 BOM
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
