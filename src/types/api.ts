// 通用分页响应
export interface PaginationParams {
  PageNumber?: number
  PageSize?: number
  Search?: string
  SortBy?: string
  SortDesc?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// API 统一响应格式
export interface ApiResponse<T> {
  code: number
  data: T
  message: string
  success: boolean
}

// 认证相关
export interface LoginDto {
  Username: string
  Password: string
}

export interface RegisterDto {
  Username: string
  Password: string
  RealName: string
  Phone: string
}

export interface ChangePasswordDto {
  CurrentPassword: string
  NewPassword: string
}

// 用户相关
export interface CreateUserDto {
  Username: string
  Password: string
  RealName: string
  Phone: string
  Email?: string
  Gender?: string
  Address?: string
  RoleIds?: number[]
}

export interface UpdateUserDto {
  RealName?: string
  Phone?: string
  Email?: string
  Gender?: string
  Address?: string
  IsActive?: boolean
  RoleIds?: number[]
}

export interface UserInfo {
  id: number
  username: string
  realName: string
  phone: string
  email?: string
  gender?: string
  address?: string
  isActive: boolean
  createdAt: string
  roles: Role[]
}

// 角色权限
export interface CreateRoleDto {
  RoleName: string
  RoleCode: string
  Description?: string
  PermissionIds?: number[]
}

export interface Role {
  id: number
  roleName: string
  roleCode: string
  description?: string
  permissions: Permission[]
}

export interface CreatePermissionDto {
  PermissionName: string
  PermissionCode: string
  Description?: string
}

export interface Permission {
  id: number
  permissionName: string
  permissionCode: string
  description?: string
}

// 车辆相关
export interface CreateCarDto {
  LicensePlate: string
  CarType: string
  OwnerId?: number
  Remark?: string
}

export interface UpdateCarDto {
  CarStatus?: string
  Remark?: string
}

export interface SelfRegisterCarDto {
  LicensePlate: string
  Brand?: string
  Model?: string
  Color?: string
  Remark?: string
  VehiclePhoto?: string
  DrivingLicensePhoto?: string
}

export interface CarInfo {
  id: number
  licensePlate: string
  carType: string
  carStatus: string
  ownerId?: number
  ownerName?: string
  remark?: string
  createdAt: string
  updatedAt: string
}

// 停车记录
export interface EnterDto {
  LicensePlate: string
  EntryGate?: string
  EnterTime?: string
  Remark?: string
}

export interface ExitDto {
  LicensePlate: string
  ExitGate?: string
  LeaveTime?: string
  Remark?: string
}

export interface ManualRecordDto {
  LicensePlate: string
  CarId?: number
  EnterTime: string
  LeaveTime?: string
  EntryGate?: string
  ExitGate?: string
  ParkingDuration?: number
  Fee: number
  FeePaid: boolean
  IsAllowed: boolean
  Remark?: string
  OperatorId?: number
  OperatorName?: string
}

export interface CarInOutRecord {
  id: number
  licensePlate: string
  carId?: number
  enterTime: string
  leaveTime?: string
  entryGate?: string
  exitGate?: string
  parkingDuration?: number
  fee: number
  feePaid: boolean
  isAllowed: boolean
  operatorName?: string
  status: string
}

// 费用相关
export interface CreateFeeRuleDto {
  RuleName: string
  CarType: string
  ChargeInterval: number
  UnitFee: number
  DailyMaxFee?: number
  FreeMinutes: number
}

export interface FeeRule {
  id: number
  ruleName: string
  carType: string
  chargeInterval: number
  unitFee: number
  dailyMaxFee?: number
  freeMinutes: number
  isActive: boolean
}

export interface CalculateFeeDto {
  CarType: string
  ParkingDuration: number
  CarId?: number
  LicensePlate?: string
  ApplyFreeTime?: boolean
  ApplyDailyCap?: boolean
  CalculationDate?: string
  RuleId?: number
}

export interface CreatePaymentDto {
  RecordId: number
  PaymentMethod: string
  TransactionId?: string
  InvoiceNumber?: string
  Remark?: string
  CustomAmount?: number
  PaymentProof?: string
}

export interface FeeRecord {
  id: number
  licensePlate: string
  enterTime: string
  leaveTime?: string
  parkingDuration: number
  feeAmount: number
  paidAmount?: number
  paymentStatus: string
  paymentMethod?: string
  paymentTime?: string
  transactionId?: string
}

// 停车位
export interface CreateParkingSpaceDto {
  SpaceNumber: string
  SpaceType: string
  OwnerId?: number
}

export interface UpdateParkingSpaceDto {
  Status?: string
  OwnerId?: number
}

export interface ParkingSpace {
  id: number
  spaceNumber: string
  spaceType: string
  status: string
  ownerId?: number
  ownerName?: string
  currentCarId?: number
  licensePlate?: string
}

// 操作日志
export interface CreateLogDto {
  UserId?: number
  UserName?: string
  OperationType: string
  OperationContent: string
  OperationDetails?: string
  Module?: string
  IpAddress?: string
  UserAgent?: string
  Status?: string
  ErrorMessage?: string
  OperationTime?: string
  RelatedRecordId?: number
  RelatedRecordType?: string
}

export interface OperationLog {
  id: number
  userName?: string
  operationType: string
  operationContent: string
  module?: string
  ipAddress?: string
  status: string
  operationTime: string
}

// 系统配置
export interface UpdateConfigDto {
  ConfigValue: string
  Description?: string
}

// 仪表盘
export interface DashboardStats {
  totalCars: number
  todayEnterCount: number
  todayExitCount: number
  currentParkingCount: number
  todayRevenue: number
  unpaidCount: number
}

export interface DailyStats {
  date: string
  enterCount: number
  exitCount: number
  revenue: number
}

export interface CarTypeDistribution {
  carType: string
  count: number
}

export interface RealtimeMonitorData {
  recentRecords: CarInOutRecord[]
  currentParking: CarInOutRecord[]
  availableSpaces: number
  totalSpaces: number
}