export const statusCode = {
  STATUS_CODE_ENABLED: 1,
  STATUS_CODE_DISABLED: 2,
  STATUS_CODE_DELETED: 3,
} as const

type StatusCode = (typeof statusCode)[keyof typeof statusCode]

export const roleCode = {
  ROLE_ADMIN: 1,
  ROLE_STAFF: 2,
  ROLE_MEMBER: 3,
} as const

type RoleCode = (typeof roleCode)[keyof typeof roleCode]

export interface PaginationParams {
  [key: string]: unknown
  skip?: number
  limit?: number
}

export type { StatusCode, RoleCode }
