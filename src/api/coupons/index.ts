import { GET, POST, PATCH, DELETE } from '../base/apiMethods'
import BASE_URL from '../base/apiBaseUrl'
import { type CouponResponse, type CouponCreatePayload, type CouponUpdatePayload } from '../types/coupon'

const couponsService = {
  async list(): Promise<CouponResponse[]> {
    return GET<CouponResponse[]>(BASE_URL, '/coupons')
  },

  async getById(id: string): Promise<CouponResponse> {
    return GET<CouponResponse>(BASE_URL, `/coupons/${id}`)
  },

  async create(payload: CouponCreatePayload): Promise<CouponResponse> {
    return POST<CouponResponse>(BASE_URL, '/coupons', payload)
  },

  async update(id: string, payload: CouponUpdatePayload): Promise<CouponResponse> {
    return PATCH<CouponResponse>(BASE_URL, `/coupons/${id}`, payload)
  },

  async delete(id: string): Promise<void> {
    return DELETE<void>(BASE_URL, `/coupons/${id}`)
  },
}

export { couponsService }
