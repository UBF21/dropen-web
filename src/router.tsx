import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/components/layout/Layout'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminLayout from '@/components/admin/AdminLayout'
import ErrorPage from '@/pages/ErrorPage'

function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}

const HomePage       = lazy(() => import('@/pages/HomePage'))
const CatalogPage    = lazy(() => import('@/pages/CatalogPage'))
const DropPage       = lazy(() => import('@/pages/DropPage'))
const ProductsPage   = lazy(() => import('@/pages/ProductsPage'))
const ProductPage    = lazy(() => import('@/pages/ProductPage'))
const WholesalePage   = lazy(() => import('@/pages/WholesalePage'))
const CheckoutPage    = lazy(() => import('@/pages/CheckoutPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const NotFoundPage    = lazy(() => import('@/pages/NotFoundPage'))

const AdminLoginPage        = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage    = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminProductsPage     = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminDropsPage        = lazy(() => import('@/pages/admin/AdminDropsPage'))
const AdminSettingsPage     = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage'))
const AdminInventoryPage    = lazy(() => import('@/pages/admin/AdminInventoryPage'))
const AdminBarcodePrintPage = lazy(() => import('@/pages/admin/AdminBarcodePrintPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true,               element: withSuspense(HomePage) },
      { path: 'colecciones',       element: withSuspense(CatalogPage) },
      { path: 'colecciones/:slug', element: withSuspense(DropPage) },
      { path: 'productos',         element: withSuspense(ProductsPage) },
      { path: 'productos/:slug',   element: withSuspense(ProductPage) },
      { path: 'wholesale',         element: withSuspense(WholesalePage) },
      { path: 'checkout',          element: withSuspense(CheckoutPage) },
      { path: 'pedido/:id',        element: withSuspense(OrderDetailPage) },
      { path: '*',                 element: withSuspense(NotFoundPage) },
    ],
  },
  {
    path: '/admin/login',
    element: withSuspense(AdminLoginPage),
    errorElement: <ErrorPage />,
  },
  {
    path: '/admin',
    element: <AdminGuard><AdminLayout /></AdminGuard>,
    errorElement: <ErrorPage />,
    children: [
      { index: true,           element: withSuspense(AdminDashboardPage) },
      { path: 'productos',     element: withSuspense(AdminProductsPage) },
      { path: 'drops',         element: withSuspense(AdminDropsPage) },
      { path: 'ajustes',       element: withSuspense(AdminSettingsPage) },
      { path: 'reservaciones', element: withSuspense(AdminReservationsPage) },
      { path: 'inventario',    element: withSuspense(AdminInventoryPage) },
      { path: 'inventario/etiquetas', element: withSuspense(AdminBarcodePrintPage) },
    ],
  },
])
