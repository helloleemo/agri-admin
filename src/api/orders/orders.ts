import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, PATCH, POST } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type {
  OrderBankTransferLast5Payload,
  OrderCreatePayload,
  OrderResponse,
  OrderStatusEmailTemplateUpdatePayload,
  OrderStatusResponse,
  OrderUpdatePayload,
} from '../types/order'

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
  updateAdminNote: async (id: string, admin_note: string | null) => {
    return PATCH<OrderResponse>(BASE_URL, API_ENDPOINT.ORDERS_ADMIN_NOTE(id), { admin_note })
  },
  updateBankTransferLast5: async (id: string, payload: OrderBankTransferLast5Payload) => {
    return PATCH<OrderResponse>(BASE_URL, API_ENDPOINT.ORDERS_BANK_TRANSFER_LAST5(id), payload)
  },
  listOrderStatuses: async () => {
    return GET<OrderStatusResponse[]>(BASE_URL, API_ENDPOINT.ORDER_STATUSES)
  },
  updateOrderStatusEmailTemplate: async (
    code: number,
    payload: OrderStatusEmailTemplateUpdatePayload,
  ) => {
    return PATCH<OrderStatusResponse>(BASE_URL, API_ENDPOINT.ORDER_STATUSES_EMAIL_TEMPLATE(code), payload)
  },
  delete: async (id: string) => {
    return DELETE<DeletedData>(BASE_URL, API_ENDPOINT.ORDERS_ID(id))
  },
}
