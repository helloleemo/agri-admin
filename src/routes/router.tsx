import { createBrowserRouter, Navigate } from 'react-router-dom'
import PATHS from '@/routes/paths'
import AdminLayout from '@/components/layout/AdminLayout'
import RequireAuth from '@/components/auth/RequireAuth'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import CategoriesPage from '@/pages/CategoriesPage'
import UnitsPage from '@/pages/UnitsPage'
import OrdersPage from '@/pages/OrdersPage'
import UsersPage from '@/pages/UsersPage'
import NotFoundPage from '@/pages/NotFoundPage'
import LoginPage from '@/pages/LoginPage'

const router = createBrowserRouter([
  {
    path: PATHS.root,
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
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
            element: <DashboardPage />,
          },
          {
            path: PATHS.products,
            element: <ProductsPage />,
          },
          {
            path: PATHS.categories,
            element: <CategoriesPage />,
          },
          {
            path: PATHS.units,
            element: <UnitsPage />,
          },
          {
            path: PATHS.orders,
            element: <OrdersPage />,
          },
          {
            path: PATHS.users,
            element: <UsersPage />,
          },
        ],
      },
    ],
  },
  {
    path: PATHS.notfound,
    element: <NotFoundPage />,
  },
])

export default router
