import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/products': 'Products',
  '/brands': 'Brands',
  '/categories': 'Categories',
  '/colors': 'Colors',
  '/sizes': 'Sizes',
}

function getTitle(pathname: string): string {
  if (pathname.includes('/variants')) return 'Variant Management'
  if (pathname.endsWith('/edit')) return 'Edit Product'
  if (pathname.endsWith('/new')) return 'New Product'
  for (const [key, val] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(key)) return val
  }
  return 'DiChay Admin'
}

export function TopBar() {
  const { pathname } = useLocation()

  return (
    <header className="flex items-center h-14 px-6 border-b border-gray-200 bg-white shrink-0">
      <h1 className="text-base font-semibold text-gray-900">{getTitle(pathname)}</h1>
    </header>
  )
}
