// 手机号验证
export const validatePhone = (phone: string): boolean => {
  const regex = /^1[3-9]\d{9}$/
  return regex.test(phone)
}

// 邮箱验证
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// 车牌号验证（中国标准）
export const validateLicensePlate = (plate: string): boolean => {
  // 普通车牌：京A12345
  // 新能源：京AD12345
  // 使馆车：使123456
  const regex = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4,5}[A-Z0-9挂学警港澳]{1}$/
  return regex.test(plate)
}

// 表单验证规则生成器
export const createRules = (rules: Record<string, any[]>) => {
  return rules
}

// 必填项
export const required = (message: string, trigger = 'blur') => ({
  required: true,
  message,
  trigger
})

// 长度限制
export const lengthRange = (min: number, max: number, message?: string, trigger = 'blur') => ({
  min,
  max,
  message: message || `长度应在${min}到${max}个字符之间`,
  trigger
})

// 自定义验证器
export const validator = (fn: (value: any) => boolean | string, trigger = 'blur') => ({
  validator: (_rule: any, value: any, callback: Function) => {
    const result = fn(value)
    if (result === true) {
      callback()
    } else {
      callback(new Error(typeof result === 'string' ? result : '验证失败'))
    }
  },
  trigger
})