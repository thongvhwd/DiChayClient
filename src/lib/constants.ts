export const GENDERS = ['Men', 'Women', 'Unisex', 'Kids'] as const
export type Gender = (typeof GENDERS)[number]

export const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt', dir: 'desc' as const },
  { label: 'Oldest', value: 'createdAt', dir: 'asc' as const },
  { label: 'Price: Low to High', value: 'basePrice', dir: 'asc' as const },
  { label: 'Price: High to Low', value: 'basePrice', dir: 'desc' as const },
  { label: 'Name A–Z', value: 'name', dir: 'asc' as const },
  { label: 'Name Z–A', value: 'name', dir: 'desc' as const },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 50]
export const DEFAULT_PAGE_SIZE = 20
