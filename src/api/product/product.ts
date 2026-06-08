import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, POST, PUT } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type { ProductCreatePayload, ProductResponse, ProductUpdatePayload } from '../types/product'

interface DeletedData {
  id: string
}

export const productService = {
  getList: async (params?: PaginationParams) => {
    return GET<ProductResponse[]>(BASE_URL, API_ENDPOINT.PRODUCTS, params)
  },
  getById: async (id: string) => {
    return GET<ProductResponse>(BASE_URL, API_ENDPOINT.PRODUCTS_ID(id))
  },
  create: async (payload: ProductCreatePayload) => {
    return POST<ProductResponse>(BASE_URL, API_ENDPOINT.PRODUCTS, payload)
  },
  update: async (id: string, payload: ProductUpdatePayload) => {
    return PUT<ProductResponse>(BASE_URL, API_ENDPOINT.PRODUCTS_ID(id), payload)
  },
  delete: async (id: string) => {
    return DELETE<DeletedData>(BASE_URL, API_ENDPOINT.PRODUCTS_ID(id))
  },
}
