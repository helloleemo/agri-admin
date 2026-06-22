import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { GET, POST } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type {
  InventoryBalanceResponse,
  InventoryLedgerResponse,
  InventoryManualAdjustRequest,
} from '../types/inventory'

export const inventoriesService = {
  getBalances: async (params?: PaginationParams) => {
    return GET<InventoryBalanceResponse[]>(BASE_URL, API_ENDPOINT.INVENTORY_BALANCES, params)
  },
  getLedger: async (
    params?: PaginationParams & {
      product_id?: string
      unit_id?: string
      order_id?: string
    },
  ) => {
    return GET<InventoryLedgerResponse[]>(BASE_URL, API_ENDPOINT.INVENTORY_LEDGER, params)
  },
  createAdjustment: async (payload: InventoryManualAdjustRequest) => {
    return POST<InventoryBalanceResponse>(BASE_URL, API_ENDPOINT.INVENTORY_ADJUSTMENTS, payload)
  },
}
