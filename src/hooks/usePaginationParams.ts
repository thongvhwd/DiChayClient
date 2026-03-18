import { useSearchParams } from 'react-router-dom'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export function usePaginationParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE))

  const setPage = (p: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
  }

  const setPageSize = (s: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('pageSize', String(s))
      next.set('page', '1')
      return next
    })
  }

  return { page, pageSize, setPage, setPageSize }
}
