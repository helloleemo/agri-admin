export interface OrderItemCreatePayload {
  product_id: string
  unit: string
  quantity: number
}

export interface OrderItemUpdatePayload {
  product_id: string
  unit: string
  quantity: number
}

export interface OrderCreatePayload {
  user_id: string
  status_code?: number
  items: OrderItemCreatePayload[]
}

export interface OrderUpdatePayload {
  items?: OrderItemUpdatePayload[]
}

export interface OrderItemResponse {
  id: string
  order_id: string
  product_id: string
  product_name: string | null
  unit: string
  quantity: number
}

export interface OrderResponse {
  id: string
  order_no: string
  user_id: string
  user_name: string | null
  status_code: number
  created_at: string
  updated_at: string
  items: OrderItemResponse[]
}
