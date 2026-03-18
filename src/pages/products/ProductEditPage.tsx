import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductForm } from './ProductForm'
import { useProduct, useUpdateProduct, useValidationErrors } from '@/features/products/hooks/useProducts'
import { ConcurrencyError } from '@/api/client'
import { uploadImages } from '@/api/endpoints/uploads'
import { ConcurrencyDialog } from '@/components/shared/ConcurrencyDialog'
import { FormSkeleton } from '@/components/shared/LoadingSkeleton'
import type { CreateProductRequest, UpdateProductRequest } from '@/api/types'
import { useQueryClient } from '@tanstack/react-query'
import { PRODUCTS_KEY } from '@/features/products/hooks/useProducts'

export default function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: product, isLoading } = useProduct(productId!)
  const updateMut = useUpdateProduct()

  const [mutError, setMutError] = useState<unknown>(null)
  const [concurrencyOpen, setConcurrencyOpen] = useState(false)
  const serverErrors = useValidationErrors(mutError)

  async function handleSubmit(data: CreateProductRequest | UpdateProductRequest, pendingFiles: File[]) {
    setMutError(null)
    try {
      const uploadedUrls = await uploadImages(pendingFiles)
      const allImages = [...(data.images ?? []), ...uploadedUrls]
      await updateMut.mutateAsync({ id: productId!, data: { ...(data as UpdateProductRequest), images: allImages } })
      navigate(`/products/${productId}`)
    } catch (err) {
      if (err instanceof ConcurrencyError) {
        setConcurrencyOpen(true)
      } else {
        setMutError(err)
      }
    }
  }

  function handleReload() {
    qc.invalidateQueries({ queryKey: [...PRODUCTS_KEY, productId] })
    setConcurrencyOpen(false)
  }

  if (isLoading) return <FormSkeleton />

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">Edit Product</h2>
      <ProductForm
        defaultValues={product}
        isEdit
        isPending={updateMut.isPending}
        serverErrors={serverErrors ?? undefined}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/products/${productId}`)}
      />
      <ConcurrencyDialog open={concurrencyOpen} onReload={handleReload} />
    </div>
  )
}
