//收费规则接口
import { http } from '@utils/request'
import type { 
  CreateFeeRuleDto, 
  CalculateFeeDto,
  FeeRule 
} from '@types/api'

export const feeRulesApi = {
  // 获取收费规则列表
  getFeeRules: () => 
    http.get<FeeRule[]>('/fee-rules'),
  
  // 创建收费规则
  createFeeRule: (data: CreateFeeRuleDto) => 
    http.post<FeeRule>('/fee-rules', data),
  
  // 根据类型获取规则
  getFeeRuleByType: (carType: string) => 
    http.get<FeeRule>(`/fee-rules/by-type/${carType}`),
  
  // 获取有效规则
  getActiveRules: () => 
    http.get<FeeRule[]>('/fee-rules/active'),
  
  // 更新收费规则
  updateFeeRule: (id: number, data: CreateFeeRuleDto) => 
    http.put<FeeRule>(`/fee-rules/${id}`, data),
  
  // 切换规则状态
  toggleActive: (id: number) => 
    http.put(`/fee-rules/${id}/toggle-active`),
  
  // 计算费用
  calculateFee: (data: CalculateFeeDto) => 
    http.post<number>('/fee-rules/calculate', data)
}