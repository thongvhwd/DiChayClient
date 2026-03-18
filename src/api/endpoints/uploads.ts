import apiClient from '../client'

export async function uploadImages(files: File[]): Promise<string[]> {
  if (!files.length) return []
  const form = new FormData()
  for (const file of files) form.append('files', file)
  const { data } = await apiClient.post<{ urls: string[] }>('/uploads/batch', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.urls
}
