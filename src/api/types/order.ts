export interface OrderItemCreatePayload {
  product_id: string
  unit_id?: string | null
  unit: string
  quantity: number
}

export interface OrderItemUpdatePayload {
  id?: string
  product_id: string
  unit_id?: string | null
  unit: string
  quantity: number
}

export interface OrderCreatePayload {
  user_id?: string | null
  customer_email: string
  customer_name?: string | null
  address?: string | null
  coupon_code?: string | null
  delivery_method?: number
  payment_method?: number
  orderer_name?: string | null
  orderer_phone?: string | null
  orderer_email?: string | null
  status_code?: number
  order_status_code?: number
  items: OrderItemCreatePayload[]
}

export interface OrderUpdatePayload {
  customer_email?: string
  customer_name?: string | null
  address?: string | null
  delivery_method?: number
  payment_method?: number
  orderer_name?: string | null
  orderer_phone?: string | null
  orderer_email?: string | null
  subtotal_amount?: number
  discount_amount?: number
  shipping_fee?: number
  total_amount?: number
  status_code?: number
  order_status_code?: number
  items?: OrderItemUpdatePayload[]
}

export interface OrderBankTransferLast5Payload {
  bank_transfer_last5: string
  customer_email?: string
}

export interface OrderStatusEmailTemplateUpdatePayload {
  customer_email_subject_template?: string | null
  customer_email_body_template?: string | null
  admin_email_subject_template?: string | null
  admin_email_body_template?: string | null
}

export interface OrderStatusResponse {
  id: string
  code: number
  name: string
  customer_email_subject_template: string | null
  customer_email_body_template: string | null
  admin_email_subject_template: string | null
  admin_email_body_template: string | null
}

export interface OrderItemResponse {
  id: string
  order_id: string
  product_id: string
  unit_id?: string | null
  product_name: string | null
  unit: string
  quantity: number
}

export interface OrderResponse {
  id: string
  order_no: string
  user_id: string
  user_name: string | null
  customer_email: string
  customer_name: string | null
  address: string | null
  coupon_code: string | null
  delivery_method: number
  payment_method: number
  orderer_name: string | null
  orderer_phone: string | null
  orderer_email: string | null
  subtotal_amount: number
  discount_amount: number
  shipping_fee: number
  total_amount: number
  bank_transfer_last5: string | null
  status_code: number
  order_status_code: number
  order_status_name: string | null
  delivery_method_label: string | null
  payment_method_label: string | null
  admin_note: string | null
  created_at: string
  updated_at: string
  items: OrderItemResponse[]
}
