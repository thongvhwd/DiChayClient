import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
    ? error.message
    : 'Something went wrong'

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
      <p className="text-6xl font-bold text-red-200">Error</p>
      <p className="text-lg font-medium text-gray-700">{message}</p>
      <Button asChild variant="outline">
        <Link to="/products">Back to Products</Link>
      </Button>
    </div>
  )
}
