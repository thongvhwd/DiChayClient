import { z } from 'zod'

// ─── Common ──────────────────────────────────────────────────────────────────

export type PagedResult<T> = {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export type ProblemDetails = {
  status: number
  title: string
  instance?: string
  errors?: Record<string, string[]>
}

// ─── Brand ───────────────────────────────────────────────────────────────────

export type Brand = {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  xMin: number
}

export const CreateBrandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})
export type CreateBrandRequest = z.infer<typeof CreateBrandSchema>

export const UpdateBrandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  isActive: z.boolean(),
})
export type UpdateBrandRequest = z.infer<typeof UpdateBrandSchema>

// ─── Category ────────────────────────────────────────────────────────────────

export type Category = {
  id: string
  name: string
  slug: string
  parentId: string | null
  displayOrder: number
  isActive: boolean
}

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  parentId: z.string().uuid().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
})
export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  parentId: z.string().uuid().nullable().optional(),
  displayOrder: z.number().int(),
  isActive: z.boolean(),
})
export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>

// ─── Size ────────────────────────────────────────────────────────────────────

export type Size = {
  id: string
  euSize: number
}

// ─── Product Stock ────────────────────────────────────────────────────────────

export type ProductStock = {
  id: string
  euSize: number
  stockQuantity: number
  reservedQuantity: number
  availableQuantity: number
}

export type ProductStockRequest = {
  sizeId: string
  stockQuantity: number
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductSummary = {
  id: string
  name: string
  slug: string
  brandName: string
  categoryName: string
  basePrice: number
  sku: string | null
  totalStock: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

export type ProductDetail = {
  id: string
  name: string
  slug: string
  brand: Brand
  category: Category
  description: string | null
  basePrice: number
  sku: string | null
  images: string[]
  stocks: ProductStock[]
  attributes: Record<string, unknown> | null
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  xMin: number
}

const ProductStockSchema = z.object({
  sizeId: z.string().min(1, 'Size is required'),
  stockQuantity: z.number().int().min(0),
})

export const CreateProductSchema = z.object({
  brandId: z.string().uuid('Brand is required'),
  categoryId: z.string().uuid('Category is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  basePrice: z.number().positive('Must be > 0').max(100_000_000),
  sku: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  images: z.array(z.string()).optional(),
  stocks: z.array(ProductStockSchema).optional(),
})
export type CreateProductRequest = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = z.object({
  brandId: z.string().uuid('Brand is required'),
  categoryId: z.string().uuid('Category is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().optional(),
  basePrice: z.number().positive('Must be > 0').max(100_000_000),
  sku: z.string().max(100).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  attributes: z.record(z.string(), z.unknown()).nullable().optional(),
  images: z.array(z.string()).optional(),
  stocks: z.array(ProductStockSchema).optional(),
})
export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>

export interface ProductSearchQuery {
  brandId?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  search?: string
  page?: number
  pageSize?: number
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string
}
