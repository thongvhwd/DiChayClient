import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import * as api from '@/api/endpoints/products'
import type { CreateProductRequest, UpdateProductRequest, ProductSearchQuery } from '@/api/types'
import { toast } from '@/hooks/use-toast'
import { ConcurrencyError, ValidationError } from '@/api/client'
import { useDebounce } from '@/hooks/useDebounce'

export const PRODUCTS_KEY = ['products'] as const

export function useProductListParams(): ProductSearchQuery & { setParam: (k: string, v: string | undefined) => void } {
  const [searchParams, setSearchParams] = useSearchParams()

  const setParam = (k: string, v: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (v === undefined || v === '') {
        next.delete(k)
      } else {
        next.set(k, v)
        if (k !== 'page') next.set('page', '1')
      }
      return next
    })
  }

  return {
    search: searchParams.get('search') ?? undefined,
    brandId: searchParams.get('brandId') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
    page: Number(searchParams.get('page') ?? '1'),
    pageSize: Number(searchParams.get('pageSize') ?? '20'),
    setParam,
  }
}

export function useProducts(query: ProductSearchQuery) {
  const debouncedSearch = useDebounce(query.search, 400)
  const effectiveQuery = { ...query, search: debouncedSearch }

  return useQuery({
    queryKey: [...PRODUCTS_KEY, effectiveQuery],
    queryFn: () => api.getProducts(effectiveQuery),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductRequest) => api.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast({ title: 'Product created', variant: 'success' })
    },
    onError: (err) => {
      if (err instanceof ValidationError) return
      toast({ title: 'Product create failed', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      api.updateProduct(id, data),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      qc.setQueryData([...PRODUCTS_KEY, product.id], product)
      toast({ title: 'Product updated', variant: 'success' })
    },
    onError: (err) => {
      if (err instanceof ConcurrencyError) return // caller handles
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      toast({ title: 'Product deleted', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useValidationErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof ValidationError) return error.errors
  return null
}
