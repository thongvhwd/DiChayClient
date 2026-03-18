import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  title = 'No items found',
  description = 'Try adjusting your filters or create a new item.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <PackageOpen className="w-12 h-12 text-gray-300" />
      <p className="font-medium text-gray-600">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
      {action}
    </div>
  )
}
