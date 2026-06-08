import type { StatusCode } from './shared'

export interface ProductImageResponse {
  id: string
  product_id: string
  stored_filename: string
  file_url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ProductUnitResponse {
  unit_id: string
  unit_name: string | null
  price: number
  stock: number
}

export interface ProductUnitCreatePayload {
  unit_id: string
  price: number
  stock: number
}

export interface ProductUnitUpdatePayload {
  unit_id: string
  price: number
  stock: number
}

export interface ProductResponse {
  id: string
  name: string
  category_id: string
  category_name: string | null
  origin: string | null
  description: string | null
  images: ProductImageResponse[] | null
  units: ProductUnitResponse[]
  status_code: StatusCode
  created_at: string
  updated_at: string
}

export interface ProductCreatePayload {
  name: string
  category_id: string
  category_name?: string | null
  origin?: string | null
  description?: string | null
  images?: ProductImageResponse[] | null
  status_code?: StatusCode
  units: ProductUnitCreatePayload[]
}

export interface ProductUpdatePayload {
  name?: string
  category_id?: string
  category_name?: string | null
  origin?: string | null
  description?: string | null
  images?: ProductImageResponse[] | null
  status_code?: StatusCode
  units?: ProductUnitUpdatePayload[]
}
