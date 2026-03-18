import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/endpoints/brands'
import type { CreateBrandRequest, UpdateBrandRequest } from '@/api/types'
import { toast } from '@/hooks/use-toast'
import { ConcurrencyError, ValidationError } from '@/api/client'

export const BRANDS_KEY = ['brands'] as const

export function useBrands() {
  return useQuery({ queryKey: BRANDS_KEY, queryFn: api.getBrands })
}

export function useBrand(id: string) {
  return useQuery({ queryKey: [...BRANDS_KEY, id], queryFn: () => api.getBrand(id) })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBrandRequest) => api.createBrand(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BRANDS_KEY })
      toast({ title: 'Brand created', variant: 'success' })
    },
    onError: (err) => {
      if (err instanceof ValidationError) return
      toast({ title: 'Brand create failed', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    },
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) =>
      api.updateBrand(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BRANDS_KEY })
      toast({ title: 'Brand updated', variant: 'success' })
    },
    onError: (err) => {
      if (err instanceof ConcurrencyError) return // caller handles
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteBrand,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BRANDS_KEY })
      toast({ title: 'Brand deleted', variant: 'success' })
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
