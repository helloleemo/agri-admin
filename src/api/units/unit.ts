import BASE_URL from '../base/apiBaseUrl'
import { API_ENDPOINT } from '../base/apiEndpoint'
import { DELETE, GET, POST, PUT } from '../base/apiMethods'
import type { PaginationParams } from '../types/shared'
import type { UnitCreatePayload, UnitResponse, UnitUpdatePayload } from '../types/unit'

export const unitsService = {
  getList: async (params?: PaginationParams) => {
    return GET<UnitResponse[]>(BASE_URL, API_ENDPOINT.UNITS, params)
  },
  getById: async (id: string) => {
    return GET<UnitResponse>(BASE_URL, API_ENDPOINT.UNITS_ID(id))
  },
  create: async (payload: UnitCreatePayload) => {
    return POST<UnitResponse>(BASE_URL, API_ENDPOINT.UNITS, payload)
  },
  update: async (id: string, payload: UnitUpdatePayload) => {
    return PUT<UnitResponse>(BASE_URL, API_ENDPOINT.UNITS_ID(id), payload)
  },
  delete: async (id: string) => {
    return DELETE<null>(BASE_URL, API_ENDPOINT.UNITS_ID(id))
  },
}
