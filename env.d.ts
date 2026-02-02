/// <reference types="vite/client" />

// 关键：扩展 Element-Plus 语言包模块类型声明
declare module 'element-plus/dist/locale/zh-cn.mjs' {
  // 声明模块导出内容的类型（匹配 Element-Plus 语言包的实际导出）
  const zhCn: import('element-plus').Locale
  export default zhCn
}

// 可选：通用写法（支持所有 Element-Plus 语言包，如 en.mjs/ja.mjs 等）
// declare module 'element-plus/dist/locale/*.mjs' {
//   const locale: import('element-plus').Locale
//   export default locale
// }