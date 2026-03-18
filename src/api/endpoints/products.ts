import apiClient from '../client'
import type {
  ProductDetail, ProductSummary, PagedResult,
  CreateProductRequest, UpdateProductRequest,
  ProductSearchQuery,
} from '../types'

export async function getProducts(query: ProductSearchQuery = {}): Promise<PagedResult<ProductSummary>> {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  )
  const { data } = await apiClient.get<PagedResult<ProductSummary>>('/products', { params })
  return data
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<ProductDetail>(`/products/${id}`)
  return data
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const { data } = await apiClient.get<ProductDetail>(`/products/slug/${slug}`)
  return data
}

export async function createProduct(body: CreateProductRequest): Promise<ProductDetail> {
  const { data } = await apiClient.post<ProductDetail>('/products', body)
  return data
}

export async function updateProduct(id: string, body: UpdateProductRequest): Promise<ProductDetail> {
  const { data } = await apiClient.put<ProductDetail>(`/products/${id}`, body)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
