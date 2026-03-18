import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AdminShell } from '@/components/layout/AdminShell'
import ErrorPage from '@/pages/ErrorPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { Skeleton } from '@/components/ui/skeleton'

function PageLoader() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function withLazy<T extends object>(factory: () => Promise<{ default: React.ComponentType<T> }>) {
  const Comp = lazy(factory)
  return function LazyPage(props: T) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Comp {...props} />
      </Suspense>
    )
  }
}

const ProductListPage = withLazy(() => import('@/pages/products/ProductListPage'))
const ProductCreatePage = withLazy(() => import('@/pages/products/ProductCreatePage'))
const ProductEditPage = withLazy(() => import('@/pages/products/ProductEditPage'))
const ProductDetailPage = withLazy(() => import('@/pages/products/ProductDetailPage'))
const BrandsPage = withLazy(() => import('@/pages/brands/BrandsPage'))
const CategoriesPage = withLazy(() => import('@/pages/categories/CategoriesPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminShell />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/products" replace /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/new', element: <ProductCreatePage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'products/:productId/edit', element: <ProductEditPage /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'categories', element: <CategoriesPage /> },      
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
