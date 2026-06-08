import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, PATCH, POST } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type { UserCreatePayload, UserResponse, UserUpdatePayload } from '../types/user'

interface DeletedData {
  id: string
}

export const usersService = {
  getList: async (params?: PaginationParams) => {
    return GET<UserResponse[]>(BASE_URL, API_ENDPOINT.USERS, params)
  },
  getById: async (id: string) => {
    return GET<UserResponse>(BASE_URL, API_ENDPOINT.USERS_ID(id))
  },
  create: async (payload: UserCreatePayload) => {
    return POST<UserResponse>(BASE_URL, API_ENDPOINT.USERS, payload)
  },
  update: async (id: string, payload: UserUpdatePayload) => {
    return PATCH<UserResponse>(BASE_URL, API_ENDPOINT.USERS_ID(id), payload)
  },
  delete: async (id: string) => {
    return DELETE<DeletedData>(BASE_URL, API_ENDPOINT.USERS_ID(id))
  },
}
