export interface InventoryBalanceResponse {
  id: string
  product_id: string
  product_name: string | null
  unit_id: string
  unit_name: string | null
  initial_stock: number
  actual_stock: number
  reserved_stock: number
  available_stock: number
  manual_adjustment_stock: number
  updated_at: string
}

export interface InventoryManualAdjustRequest {
  product_id: string
  unit_id: string
  delta: number
  note?: string | null
}

export interface InventoryLedgerResponse {
  id: string
  product_id: string
  product_name: string | null
  unit_id: string
  unit_name: string | null
  order_id: string | null
  order_item_id: string | null
  action: string
  quantity: number
  delta_actual: number
  delta_reserved: number
  actual_after: number
  reserved_after: number
  available_after: number
  from_order_status_code: number | null
  to_order_status_code: number | null
  operator_user_id: string | null
  note: string | null
  created_at: string
}
