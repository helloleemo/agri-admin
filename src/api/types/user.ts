import type { RoleCode, StatusCode } from './shared'

export interface UserOrderItemResponse {
  product_id: string
  product_name: string | null
  quantity: number
}

export interface UserOrderResponse {
  order_id: string
  order_no: string | null
  items: UserOrderItemResponse[]
}

export interface UserResponse {
  id: string
  email: string
  user_name: string
  role_code: RoleCode
  status_code: StatusCode
  email_verified_at: string | null
  orders: UserOrderResponse[]
  created_at: string
  updated_at: string
}

export interface UserCreatePayload {
  email: string
  user_name: string
  password: string
  role_code?: RoleCode
}

export interface UserUpdatePayload {
  email?: string
  user_name?: string
  password?: string
  role_code?: RoleCode
}
