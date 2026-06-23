export interface CouponResponse {
  id: string
  code: string
  name: string
  discount_type: 1 | 2 // 1: FIXED, 2: PERCENT
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  starts_at: string | null
  ends_at: string | null
  status_code: number
  created_at: string
  updated_at: string
}

export interface CouponCreatePayload {
  code: string
  name: string
  discount_type: 1 | 2
  discount_value: number
  min_order_amount?: number | null
  max_discount_amount?: number | null
  usage_limit?: number | null
  starts_at?: string | null
  ends_at?: string | null
  status_code?: number
}

export interface CouponUpdatePayload {
  name?: string
  discount_type?: 1 | 2
  discount_value?: number
  min_order_amount?: number | null
  max_discount_amount?: number | null
  usage_limit?: number | null
  starts_at?: string | null
  ends_at?: string | null
  status_code?: number
}
