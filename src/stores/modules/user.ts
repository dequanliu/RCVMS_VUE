import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '@api/users'
import type { UserInfo, CarInfo } from '@types/api'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref<UserInfo | null>(null)
  const userCars = ref<CarInfo[]>([])
  const loading = ref(false)

  // Actions
  const fetchUserDetail = async (id: number) => {
    loading.value = true
    try {
      const res = await usersApi.getUserById(id)
      currentUser.value = res
      return res
    } finally {
      loading.value = false
    }
  }

  const fetchUserCars = async (id: number) => {
    const res = await usersApi.getUserCars(id)
    userCars.value = res
    return res
  }

  const updateUserStatus = async (id: number, isActive: boolean) => {
    await usersApi.updateUser(id, { IsActive: isActive })
    if (currentUser.value?.id === id) {
      currentUser.value.isActive = isActive
    }
  }

  return {
    currentUser,
    userCars,
    loading,
    fetchUserDetail,
    fetchUserCars,
    updateUserStatus
  }
})