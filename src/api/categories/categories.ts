import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, POST, PUT } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type { CategoryCreatePayload, CategoryResponse, CategoryUpdatePayload } from '../types/category'

export const categoriesService = {
  getList: async (params?: PaginationParams) => {
    return GET<CategoryResponse[]>(BASE_URL, API_ENDPOINT.CATEGORIES, params)
  },
  getById: async (id: string) => {
    return GET<CategoryResponse>(BASE_URL, API_ENDPOINT.CATEGORIES_ID(id))
  },
  create: async (payload: CategoryCreatePayload) => {
    return POST<CategoryResponse>(BASE_URL, API_ENDPOINT.CATEGORIES, payload)
  },
  update: async (id: string, payload: CategoryUpdatePayload) => {
    return PUT<CategoryResponse>(BASE_URL, API_ENDPOINT.CATEGORIES_ID(id), payload)
  },
  delete: async (id: string) => {
    return DELETE<null>(BASE_URL, API_ENDPOINT.CATEGORIES_ID(id))
  },
}
