export const GenderEnum = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other'
} as const

export type Gender = typeof GenderEnum[keyof typeof GenderEnum]

export const GenderOptions = [
  { label: '男', value: 'Male' },
  { label: '女', value: 'Female' },
  { label: '其他', value: 'Other' }
]