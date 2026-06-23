import { lazy, Suspense, type ReactNode } from 'react'
import { Box, CircularProgress } from '@mui/material'
import { createHashRouter, Navigate } from 'react-router-dom'
import PATHS from '@/routes/paths'
import AdminLayout from '@/components/layout/AdminLayout'
import RequireAuth from '@/components/auth/RequireAuth'

const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'))
const UnitsPage = lazy(() => import('@/pages/UnitsPage'))
const InventoriesPage = lazy(() => import('@/pages/InventoriesPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const EmailTemplatesPage = lazy(() => import('@/pages/EmailTemplatesPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const CouponsPage = lazy(() => import('@/pages/CouponsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))

const RouteLoadingFallback = () => (
  <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
    <CircularProgress size={28} />
  </Box>
)

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteLoadingFallback />}>
    {element}
  </Suspense>
)

const router = createHashRouter([
  {
    path: PATHS.root,
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: withSuspense(<LoginPage />),
  },
  {
    path: PATHS.root,
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: PATHS.dashboard,
            element: withSuspense(<DashboardPage />),
          },
          {
            path: PATHS.products,
            element: withSuspense(<ProductsPage />),
          },
          {
            path: PATHS.categories,
            element: withSuspense(<CategoriesPage />),
          },
          {
            path: PATHS.units,
            element: withSuspense(<UnitsPage />),
          },
          {
            path: PATHS.inventories,
            element: withSuspense(<InventoriesPage />),
          },
          {
            path: PATHS.orders,
            element: withSuspense(<OrdersPage />),
          },
          {
            path: PATHS.emailTemplates,
            element: withSuspense(<EmailTemplatesPage />),
          },
          {
            path: PATHS.users,
            element: withSuspense(<UsersPage />),
          },
          {
            path: PATHS.coupons,
            element: withSuspense(<CouponsPage />),
          },
        ],
      },
    ],
  },
  {
    path: PATHS.notfound,
    element: withSuspense(<NotFoundPage />),
  },
])

export default router
