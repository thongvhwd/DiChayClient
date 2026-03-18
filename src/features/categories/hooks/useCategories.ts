import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/endpoints/categories'
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/api/types'
import { toast } from '@/hooks/use-toast'
import { ValidationError } from '@/api/client'

export const CATEGORIES_KEY = ['categories'] as const

export function useCategories() {
  return useQuery({ queryKey: CATEGORIES_KEY, queryFn: api.getCategories })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => api.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast({ title: 'Category created', variant: 'success' })
    },
    onError: (err) => {
      if (err instanceof ValidationError) return
      toast({ title: 'Category create failed', description: 'Something went wrong. Please try again.', variant: 'destructive' })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      api.updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast({ title: 'Category updated', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIES_KEY })
      toast({ title: 'Category deleted', variant: 'success' })
    },
    onError: (err) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' })
    },
  })
}
