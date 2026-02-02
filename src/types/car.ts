export const CarTypeEnum = {
  OWNER: 'Owner',
  TEMPORARY: 'Temporary'
} as const

export const CarStatusEnum = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  BLACKLISTED: 'Blacklisted'
} as const

export type CarType = typeof CarTypeEnum[keyof typeof CarTypeEnum]
export type CarStatus = typeof CarStatusEnum[keyof typeof CarStatusEnum]

export const CarTypeOptions = [
  { label: '业主车辆', value: 'Owner' },
  { label: '临时车辆', value: 'Temporary' }
]

export const CarStatusOptions = [
  { label: '正常', value: 'Active' },
  { label: '停用', value: 'Inactive' },
  { label: '黑名单', value: 'Blacklisted' }
]