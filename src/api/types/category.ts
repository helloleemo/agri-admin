export interface CategoryResponse {
  id: string
  name: string
  meta_data: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CategoryCreatePayload {
  name: string
}

export interface CategoryUpdatePayload {
  name: string
}
