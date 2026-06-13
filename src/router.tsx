import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from '@/components/layout/Layout'

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
const ProductPage    = lazy(() => import('@/pages/ProductPage'))
const WholesalePage  = lazy(() => import('@/pages/WholesalePage'))
const NotFoundPage   = lazy(() => import('@/pages/NotFoundPage'))

const AdminLoginPage        = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage    = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminProductsPage     = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminDropsPage        = lazy(() => import('@/pages/admin/AdminDropsPage'))
const AdminSettingsPage     = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminReservationsPage = lazy(() => import('@/pages/admin/AdminReservationsPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,               element: withSuspense(HomePage) },
      { path: 'colecciones',       element: withSuspense(CatalogPage) },
      { path: 'colecciones/:slug', element: withSuspense(DropPage) },
      { path: 'productos/:slug',   element: withSuspense(ProductPage) },
      { path: 'wholesale',         element: withSuspense(WholesalePage) },
      { path: '*',                 element: withSuspense(NotFoundPage) },
    ],
  },
  {
    path: '/admin/login',
    element: withSuspense(AdminLoginPage),
  },
  {
    path: '/admin',
    children: [
      { index: true,           element: withSuspense(AdminDashboardPage) },
      { path: 'productos',     element: withSuspense(AdminProductsPage) },
      { path: 'drops',         element: withSuspense(AdminDropsPage) },
      { path: 'ajustes',       element: withSuspense(AdminSettingsPage) },
      { path: 'reservaciones', element: withSuspense(AdminReservationsPage) },
    ],
  },
])
