export interface UnitResponse {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface UnitCreatePayload {
  name: string
}

export interface UnitUpdatePayload {
  name: string
}
