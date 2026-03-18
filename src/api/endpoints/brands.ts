import apiClient from '../client'
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from '../types'

export async function getBrands(): Promise<Brand[]> {
  const { data } = await apiClient.get<Brand[]>('/brands')
  return data
}

export async function getBrand(id: string): Promise<Brand> {
  const { data } = await apiClient.get<Brand>(`/brands/${id}`)
  return data
}

export async function createBrand(body: CreateBrandRequest): Promise<Brand> {
  const { data } = await apiClient.post<Brand>('/brands', body)
  return data
}

export async function updateBrand(id: string, body: UpdateBrandRequest): Promise<Brand> {
  const { data } = await apiClient.put<Brand>(`/brands/${id}`, body)
  return data
}

export async function deleteBrand(id: string): Promise<void> {
  await apiClient.delete(`/brands/${id}`)
}
