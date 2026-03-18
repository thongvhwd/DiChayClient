import apiClient from '../client'
import type { Size } from '../types'

export async function getSizes(): Promise<Size[]> {
  const { data } = await apiClient.get<Size[]>('/sizes')
  return data
}
