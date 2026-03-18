import { useQuery } from '@tanstack/react-query'
import { getSizes } from '@/api/endpoints/sizes'

export const SIZES_KEY = ['sizes'] as const

export function useSizes() {
  return useQuery({ queryKey: SIZES_KEY, queryFn: getSizes, staleTime: 60 * 60 * 1000 })
}
