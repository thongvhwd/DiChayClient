import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface PendingFile {
  id: string
  file: File
  preview: string
}

interface ValidationError {
  name: string
  reason: string
}

interface FileUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  onPendingFilesChange: (files: File[]) => void
  maxFiles?: number
}

export function FileUploader({
  value,
  onChange,
  onPendingFilesChange,
  maxFiles = 10,
}: FileUploaderProps) {
  const [pending, setPending] = useState<PendingFile[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const previewUrls = useRef<string[]>([])

  // Sync pending state → parent File[] whenever pending changes
  useEffect(() => {
    onPendingFilesChange(pending.map((p) => p.file))
  }, [pending]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const onDrop = useCallback(
    (accepted: File[]) => {
      const totalSlots = maxFiles - value.length - pending.length
      if (totalSlots <= 0) return

      const errors: ValidationError[] = []
      const valid: PendingFile[] = []

      for (const file of accepted.slice(0, totalSlots + accepted.length)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push({ name: file.name, reason: 'Type not allowed (JPEG, PNG, WebP only)' })
          continue
        }
        if (file.size > MAX_SIZE) {
          errors.push({ name: file.name, reason: 'Exceeds 5 MB limit' })
          continue
        }
        if (valid.length >= totalSlots) {
          errors.push({ name: file.name, reason: `Max ${maxFiles} files allowed` })
          continue
        }
        const preview = URL.createObjectURL(file)
        previewUrls.current.push(preview)
        valid.push({ id: Math.random().toString(36).slice(2), file, preview })
      }

      setValidationErrors(errors)
      if (valid.length) setPending((prev) => [...prev, ...valid])
    },
    [value.length, pending.length, maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_SIZE,
    multiple: true,
    noClick: false,
  })

  const removeUploaded = (url: string) => onChange(value.filter((u) => u !== url))

  const removePending = (id: string) => {
    setPending((prev) => {
      const item = prev.find((p) => p.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((p) => p.id !== id)
    })
  }

  const total = value.length + pending.length

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Drop files here' : 'Drag & drop or click to select'}
        </p>
        <p className="text-xs text-gray-400">JPEG, PNG, WebP · max 5 MB · {total}/{maxFiles}</p>
      </div>

      {validationErrors.length > 0 && (
        <ul className="space-y-1">
          {validationErrors.map((e, i) => (
            <li key={i} className="text-xs text-red-500">
              <span className="font-medium">{e.name}</span>: {e.reason}
            </li>
          ))}
        </ul>
      )}

      {total > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url) => (
            <div key={url} className="relative group rounded-md overflow-hidden border">
              <img src={url} alt="" className="w-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUploaded(url)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {pending.map((item) => (
            <div key={item.id} className="relative group rounded-md overflow-hidden border border-dashed border-blue-300">
              <img src={item.preview} alt={item.file.name} className="w-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePending(item.id)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
