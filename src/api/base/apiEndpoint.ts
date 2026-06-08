export const API_ENDPOINT = {
  // auth
  TOKEN: '/auth/token',
  LOGIN: '/auth/login',
  GET_USER_INFO: '/auth/me',
  REGISTER: '/auth/register',

  // products
  PRODUCTS: '/products',
  PRODUCTS_ID: (id: string) => `/products/${id}`,

  // users
  USERS: '/users',
  USERS_ID: (id: string) => `/users/${id}`,

  // orders
  ORDERS: '/orders',
  ORDERS_ID: (id: string) => `/orders/${id}`,

  // categories
  CATEGORIES: '/categories',
  CATEGORIES_ID: (id: string) => `/categories/${id}`,

  // images
  IMAGES_PRODUCT_ID: (productId: string) => `/images/${productId}`,
  IMAGES_ID: (imageId: string) => `/images/${imageId}`,
}
