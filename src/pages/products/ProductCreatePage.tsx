import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductForm } from './ProductForm'
import { useCreateProduct, useValidationErrors } from '@/features/products/hooks/useProducts'
import { uploadImages } from '@/api/endpoints/uploads'
import type { CreateProductRequest, UpdateProductRequest } from '@/api/types'

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const createMut = useCreateProduct()
  const [mutError, setMutError] = useState<unknown>(null)
  const serverErrors = useValidationErrors(mutError)

  async function handleSubmit(data: CreateProductRequest | UpdateProductRequest, pendingFiles: File[]) {
    setMutError(null)
    try {
      const uploadedUrls = await uploadImages(pendingFiles)
      const allImages = [...(data.images ?? []), ...uploadedUrls]
      const product = await createMut.mutateAsync({ ...(data as CreateProductRequest), images: allImages })
      navigate(`/products/${product.id}`)
    } catch (err) {
      setMutError(err)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Create New Product</h2>
      <ProductForm
        isPending={createMut.isPending}
        serverErrors={serverErrors ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/products')}
      />
    </div>
  )
}
