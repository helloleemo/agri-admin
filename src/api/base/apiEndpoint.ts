export const API_ENDPOINT = {
  // auth
  TOKEN: '/auth/token',
  LOGIN: '/auth/login',
  GET_USER_INFO: '/auth/me',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION_EMAIL: '/auth/resend-verification-email',
  AUTH_EMAIL_TEMPLATES: '/auth/email-templates',
  AUTH_EMAIL_TEMPLATE_BY_TYPE: (templateType: number) => `/auth/email-templates/${templateType}`,

  // products
  PRODUCTS: '/products',
  PRODUCTS_ID: (id: string) => `/products/${id}`,

  // users
  USERS: '/users',
  USERS_ID: (id: string) => `/users/${id}`,
  USERS_VERIFY_EMAIL: (id: string) => `/users/${id}/verify-email`,

  // orders
  ORDERS: '/orders',
  ORDERS_ID: (id: string) => `/orders/${id}`,
  ORDERS_ADMIN_NOTE: (id: string) => `/orders/${id}/admin-note`,
  ORDERS_BANK_TRANSFER_LAST5: (id: string) => `/orders/${id}/bank-transfer-last5`,
  ORDER_STATUSES: '/order-statuses',
  ORDER_STATUSES_EMAIL_TEMPLATE: (code: number) => `/order-statuses/${code}/email-template`,
  // categories
  CATEGORIES: '/categories',
  CATEGORIES_ID: (id: string) => `/categories/${id}`,

  // units
  UNITS: '/units',
  UNITS_ID: (id: string) => `/units/${id}`,

  // inventories
  INVENTORY_BALANCES: '/inventories/balances',
  INVENTORY_LEDGER: '/inventories/ledger',
  INVENTORY_ADJUSTMENTS: '/inventories/adjustments',

  // images
  IMAGES_BATCH: '/images/batch',
  IMAGES_PRODUCT_ID: (productId: string) => `/images/${productId}`,
  IMAGES_ID: (imageId: string) => `/images/${imageId}`,

  // site contents
  SITE_CONTENTS_BY_PAGE: (pageKey: string) => `/site-contents/${pageKey}`,
  SITE_CONTENTS_ASSETS: (pageKey: string) => `/site-contents/${pageKey}/assets`,
}
