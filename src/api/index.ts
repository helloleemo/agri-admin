export { authService } from './auth'
export { authEmailTemplatesService } from './auth'
export { productService } from './product'
export { usersService } from './users'
export { ordersService } from './orders'
export { categoriesService } from './categories'
export { unitsService } from './units'
export { inventoriesService } from './inventories'
export { imagesService } from './images'
export { couponsService } from './coupons'

export { API_ENDPOINT } from './base/apiEndpoint'
export { setApiErrorHandler } from './base/apiMethods'

export type { API_RESPONSE, RequestParams } from './types/api'
export type {
	LoginRequest,
	RegisterRequest,
	RegisterResponse,
	LoginResponse,
	AuthUser,
	TokenResponse,
	VerifyEmailRequest,
	VerifyEmailResponse,
	ResendVerificationEmailRequest,
} from './types/auth'
export type { AuthEmailTemplateResponse } from './auth/email-templates'
export type { ProductResponse, ProductCreatePayload, ProductUpdatePayload } from './types/product'
export type { UserResponse, UserCreatePayload, UserUpdatePayload } from './types/user'
export type {
	OrderResponse,
	OrderCreatePayload,
	OrderUpdatePayload,
	OrderStatusResponse,
	OrderStatusEmailTemplateUpdatePayload,
	OrderBankTransferLast5Payload,
} from './types/order'
export type { CategoryResponse, CategoryCreatePayload, CategoryUpdatePayload } from './types/category'
export type { UnitResponse, UnitCreatePayload, UnitUpdatePayload } from './types/unit'
export type {
	InventoryBalanceResponse,
	InventoryLedgerResponse,
	InventoryManualAdjustRequest,
} from './types/inventory'
export type { ImageResponse, CreateImagePayload, CreateImageBatchPayload, ImageUpdatePayload } from './types/image'
export type { CouponResponse, CouponCreatePayload, CouponUpdatePayload } from './types/coupon'
export type { StatusCode, RoleCode, PaginationParams } from './types/shared'
