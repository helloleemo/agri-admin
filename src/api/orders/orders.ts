import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, PATCH, POST } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type { OrderCreatePayload, OrderResponse, OrderUpdatePayload } from '../types/order'

interface DeletedData {
  id: string
}

export const ordersService = {
  getList: async (params?: PaginationParams) => {
    return GET<OrderResponse[]>(BASE_URL, API_ENDPOINT.ORDERS, params)
  },
  getById: async (id: string) => {
    return GET<OrderResponse>(BASE_URL, API_ENDPOINT.ORDERS_ID(id))
  },
  create: async (payload: OrderCreatePayload) => {
    return POST<OrderResponse>(BASE_URL, API_ENDPOINT.ORDERS, payload)
  },
  update: async (id: string, payload: OrderUpdatePayload) => {
    return PATCH<OrderResponse>(BASE_URL, API_ENDPOINT.ORDERS_ID(id), payload)
  },
  delete: async (id: string) => {
    return DELETE<DeletedData>(BASE_URL, API_ENDPOINT.ORDERS_ID(id))
  },
}
