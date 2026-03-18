import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
      <p className="text-6xl font-bold text-gray-200">404</p>
      <p className="text-lg font-medium text-gray-700">Page not found</p>
      <Button asChild variant="outline">
        <Link to="/products">Back to Products</Link>
      </Button>
    </div>
  )
}
