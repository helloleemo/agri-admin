export interface ImageResponse {
  id: string
  product_id: string
  stored_filename: string
  file_url: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface ImageUpdatePayload {
  is_primary?: boolean
  sort_order?: number
}

export interface CreateImagePayload {
  product_id: string
  file: File
  is_primary?: boolean
  sort_order?: number
}
