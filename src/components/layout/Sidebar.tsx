import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Tag, FolderTree, Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { to: '/products', label: 'Products', icon: Package },
  { to: '/brands', label: 'Brands', icon: Tag },
  { to: '/categories', label: 'Categories', icon: FolderTree },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-gray-900 text-gray-100 transition-all duration-200 shrink-0',
        sidebarCollapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 h-14 border-b border-gray-700">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-md shrink-0">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-lg tracking-tight truncate">DiChay</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Catalog
          </p>
        )}
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 mx-2 px-2 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-gray-700" />

      {/* Collapse toggle */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  )
}
