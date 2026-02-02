// 导出CSV
export const exportToCSV = (data: any[], filename: string, headers?: Record<string, string>) => {
  if (data.length === 0) {
    return
  }
  
  // 如果没有提供headers，使用数据对象的key
  const columns = headers || Object.keys(data[0]).reduce((acc, key) => {
    acc[key] = key
    return acc
  }, {} as Record<string, string>)
  
  // 创建CSV内容
  const headerRow = Object.values(columns).join(',')
  const rows = data.map(item => {
    return Object.keys(columns).map(key => {
      const value = item[key]
      // 处理包含逗号或换行符的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  })
  
  const csvContent = '\ufeff' + [headerRow, ...rows].join('\n')
  
  // 下载文件
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// 导出JSON
export const exportToJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

// 打印
export const printContent = (content: string, title: string = '打印') => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}