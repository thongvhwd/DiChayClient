import { Link, useParams, useNavigate } from 'react-router-dom'
import { Pencil, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useProduct } from '@/features/products/hooks/useProducts'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading } = useProduct(productId!)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Product not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Products
          </Button>
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-sm text-gray-500">{product.slug}</p>
        </div>
        <Button size="sm" asChild>
          <Link to={`/products/${productId}/edit`}>
            <Pencil className="w-4 h-4" /> Edit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Details */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Brand</span>
              <span>{product.brand.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Category</span>
              <span>{product.category.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">SKU</span>
              <span className="font-mono text-xs">{product.sku ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Base Price</span>
              <span className="font-medium">{formatPrice(product.basePrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Status</span>
              <div className="flex gap-1">
                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {product.isFeatured && <Badge>Featured</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meta */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Meta</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span>{new Date(product.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Updated</span>
              <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock by Size */}
      {product.stocks.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Stock by Size</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">EU Size</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Reserved</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-600">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {product.stocks.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2">EU {s.euSize}</td>
                    <td className="px-4 py-2 text-right">{s.stockQuantity}</td>
                    <td className="px-4 py-2 text-right text-amber-600">{s.reservedQuantity}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-700">{s.availableQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {product.images.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Images</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {product.images.map((url, i) => (
                <img key={i} src={url} alt={`${product.name} ${i + 1}`} className="w-24 h-24 object-cover rounded-md border" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {product.description && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Attributes */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Attributes</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.attributes).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-gray-500 capitalize">{k}:</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
