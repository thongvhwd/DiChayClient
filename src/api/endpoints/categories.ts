import apiClient from '../client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}

export async function getCategory(id: string): Promise<Category> {
  const { data } = await apiClient.get<Category>(`/categories/${id}`)
  return data
}

export async function createCategory(body: CreateCategoryRequest): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', body)
  return data
}

export async function updateCategory(id: string, body: UpdateCategoryRequest): Promise<Category> {
  const { data } = await apiClient.put<Category>(`/categories/${id}`, body)
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
