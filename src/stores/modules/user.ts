// src/store/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersApi, carsApi } from '@/api'
import type { CreateUserDto, UpdateUserDto, ChangePasswordDto } from '@/types/api'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户列表
    users: [] as Array<{
      id: number
      username: string
      realName: string
      phone: string
      email?: string
      gender?: string
      address?: string
      isActive: boolean
      roles: Array<{
        id: number
        roleName: string
        roleCode: string
      }>
      createdAt: string
    }>,
    
    // 当前选中用户
    currentUser: null as {
      id: number
      username: string
      realName: string
      phone: string
      email?: string
      gender?: string
      address?: string
      isActive: boolean
      roles: Array<{
        id: number
        roleName: string
        roleCode: string
      }>
      cars?: Array<{
        id: number
        licensePlate: string
        carType: string
        carStatus: string
        remark?: string
      }>
    } | null,
    
    // 分页信息
    pagination: {
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0
    },
    
    // 搜索条件
    searchParams: {
      search: '',
      sortBy: 'id',
      sortDesc: true
    },
    
    // 加载状态
    loading: false,
    
    // 当前用户的车辆列表
    myCars: [] as Array<{
      id: number
      licensePlate: string
      carType: string
      carStatus: string
      remark?: string
      ownerId?: number
      ownerName?: string
    }>
  }),
  
  getters: {
    // 获取用户总数
    totalUsers: (state) => state.pagination.totalCount,
    
    // 获取当前页码
    currentPage: (state) => state.pagination.pageNumber,
    
    // 获取总页数
    totalPages: (state) => state.pagination.totalPages,
    
    // 是否正在加载
    isLoading: (state) => state.loading,
    
    // 获取活跃用户数量
    activeUsersCount: (state) => state.users.filter(user => user.isActive).length,
    
    // 获取非活跃用户数量
    inactiveUsersCount: (state) => state.users.filter(user => !user.isActive).length
  },
  
  actions: {
    // 获取用户列表
    async fetchUsers(params?: {
      pageNumber?: number
      pageSize?: number
      search?: string
      sortBy?: string
      sortDesc?: boolean
    }) {
      this.loading = true
      
      try {
        const queryParams = {
          PageNumber: params?.pageNumber || this.pagination.pageNumber,
          PageSize: params?.pageSize || this.pagination.pageSize,
          Search: params?.search || this.searchParams.search,
          SortBy: params?.sortBy || this.searchParams.sortBy,
          SortDesc: params?.sortDesc || this.searchParams.sortDesc
        }
        
        const response = await usersApi.getUsers(queryParams)
        
        this.users = response.data.items || response.data
        this.pagination = {
          pageNumber: response.data.pageNumber || queryParams.PageNumber,
          pageSize: response.data.pageSize || queryParams.PageSize,
          totalCount: response.data.totalCount || 0,
          totalPages: response.data.totalPages || 1
        }
        
        // 更新搜索条件
        if (params?.search !== undefined) {
          this.searchParams.search = params.search
        }
        if (params?.sortBy !== undefined) {
          this.searchParams.sortBy = params.sortBy
        }
        if (params?.sortDesc !== undefined) {
          this.searchParams.sortDesc = params.sortDesc
        }
        
        return response
      } catch (error) {
        console.error('获取用户列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取单个用户
    async fetchUserById(id: number) {
      this.loading = true
      
      try {
        const response = await usersApi.getUser(id)
        this.currentUser = response.data
        
        // 获取用户的车辆
        await this.fetchUserCars(id)
        
        return response
      } catch (error) {
        console.error('获取用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 创建用户
    async createUser(userData: CreateUserDto) {
      this.loading = true
      
      try {
        const response = await usersApi.createUser(userData)
        
        // 添加到用户列表
        if (response.data) {
          this.users.unshift(response.data)
          this.pagination.totalCount += 1
        }
        
        return response
      } catch (error) {
        console.error('创建用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更新用户
    async updateUser(id: number, userData: UpdateUserDto) {
      this.loading = true
      
      try {
        const response = await usersApi.updateUser(id, userData)
        
        // 更新用户列表中的用户
        const index = this.users.findIndex(user => user.id === id)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...userData }
        }
        
        // 更新当前选中的用户
        if (this.currentUser?.id === id) {
          this.currentUser = { ...this.currentUser, ...userData }
        }
        
        return response
      } catch (error) {
        console.error('更新用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 删除用户
    async deleteUser(id: number) {
      this.loading = true
      
      try {
        const response = await usersApi.deleteUser(id)
        
        // 从用户列表中移除
        const index = this.users.findIndex(user => user.id === id)
        if (index !== -1) {
          this.users.splice(index, 1)
          this.pagination.totalCount -= 1
        }
        
        // 如果删除的是当前选中的用户，清空当前用户
        if (this.currentUser?.id === id) {
          this.currentUser = null
        }
        
        return response
      } catch (error) {
        console.error('删除用户失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更改用户密码
    async changePassword(id: number, passwordData: ChangePasswordDto) {
      this.loading = true
      
      try {
        const response = await usersApi.changePassword(id, passwordData)
        return response
      } catch (error) {
        console.error('更改密码失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取用户的车辆
    async fetchUserCars(userId: number) {
      try {
        const response = await usersApi.getUserCars(userId)
        
        if (this.currentUser?.id === userId) {
          this.currentUser.cars = response.data
        }
        
        return response
      } catch (error) {
        console.error('获取用户车辆失败:', error)
        throw error
      }
    },
    
    // 设置用户角色
    async setUserRoles(userId: number, roleIds: number[]) {
      this.loading = true
      
      try {
        const response = await usersApi.setUserRoles(userId, roleIds)
        
        // 更新用户列表中的角色
        const userIndex = this.users.findIndex(user => user.id === userId)
        if (userIndex !== -1) {
          // 这里需要重新获取用户信息或更新角色列表
        }
        
        // 更新当前用户的角色
        if (this.currentUser?.id === userId) {
          // 这里需要重新获取用户信息或更新角色列表
        }
        
        return response
      } catch (error) {
        console.error('设置用户角色失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 获取当前用户的车辆（我的车辆）
    async fetchMyCars() {
      const authStore = useAuthStore()
      const userId = authStore.userId
      
      if (!userId) return
      
      try {
        const response = await carsApi.getUserCars(userId)
        this.myCars = response.data
        return response
      } catch (error) {
        console.error('获取我的车辆失败:', error)
        throw error
      }
    },
    
    // 搜索用户
    async searchUsers(searchTerm: string) {
      return this.fetchUsers({ search: searchTerm, pageNumber: 1 })
    },
    
    // 更改页码
    async changePage(pageNumber: number) {
      return this.fetchUsers({ pageNumber })
    },
    
    // 更改每页数量
    async changePageSize(pageSize: number) {
      return this.fetchUsers({ pageSize, pageNumber: 1 })
    },
    
    // 排序用户
    async sortUsers(sortBy: string, sortDesc: boolean) {
      return this.fetchUsers({ sortBy, sortDesc })
    },
    
    // 清除当前选中的用户
    clearCurrentUser() {
      this.currentUser = null
    },
    
    // 重置搜索条件
    resetSearchParams() {
      this.searchParams = {
        search: '',
        sortBy: 'id',
        sortDesc: true
      }
    },
    
    // 重置 store
    $reset() {
      this.users = []
      this.currentUser = null
      this.pagination = {
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
      }
      this.searchParams = {
        search: '',
        sortBy: 'id',
        sortDesc: true
      }
      this.loading = false
      this.myCars = []
    }
  },
  
  // 持久化配置
  persist: {
    key: 'user-store',
    paths: ['searchParams']
  }
})