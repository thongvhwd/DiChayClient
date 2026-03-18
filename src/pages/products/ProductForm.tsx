import { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { FileUploader } from '@/components/shared/FileUploader'
import { useBrands } from '@/features/brands/hooks/useBrands'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useSizes } from '@/features/sizes/hooks/useSizes'
import { CreateProductSchema, UpdateProductSchema } from '@/api/types'
import type { CreateProductRequest, UpdateProductRequest, ProductDetail } from '@/api/types'

type FormValues = (CreateProductRequest | UpdateProductRequest) & {
  _attrs: { key: string; value: string }[]
}

interface ProductFormProps {
  defaultValues?: Partial<ProductDetail>
  isEdit?: boolean
  isPending: boolean
  serverErrors?: Record<string, string[]>
  onSubmit: (data: CreateProductRequest | UpdateProductRequest, pendingFiles: File[]) => void
  onCancel: () => void
}

export function ProductForm({
  defaultValues,
  isEdit = false,
  isPending,
  serverErrors,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { data: brands = [] } = useBrands()
  const { data: categories = [] } = useCategories()
  const { data: sizes = [] } = useSizes()

  const childCategories = categories.filter((c) => c.parentId !== null)
  const categoryOptions = childCategories.map((c) => {
    const parent = categories.find((p) => p.id === c.parentId)
    return { value: c.id, label: parent ? `${c.name} - ${parent.name}` : c.name }
  })
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }))
  const sizeOptions = sizes.map((s) => ({ value: s.id, label: `EU ${s.euSize}` }))

  const schema = isEdit ? UpdateProductSchema : CreateProductSchema

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      brandId: defaultValues?.brand?.id ?? '',
      categoryId: defaultValues?.category?.id ?? '',
      basePrice: defaultValues?.basePrice ?? 0,
      sku: defaultValues?.sku ?? '',
      isActive: defaultValues?.isActive ?? true,
      isFeatured: defaultValues?.isFeatured ?? false,
      images: defaultValues?.images ?? [],
      stocks: [],
      _attrs: defaultValues?.attributes
        ? Object.entries(defaultValues.attributes).map(([k, v]) => ({ key: k, value: String(v) }))
        : [],
    },
  })

  const { fields: stockFields, append: appendStock, remove: removeStock } = useFieldArray({
    control,
    name: 'stocks' as any,
  })

  const { fields: attrFields, append: appendAttr, remove: removeAttr } = useFieldArray({
    control,
    name: '_attrs',
  })

  useEffect(() => {
    if (!isEdit || !defaultValues?.stocks?.length || !sizes.length) return
    setValue(
      'stocks' as any,
      defaultValues.stocks.map((s) => ({
        sizeId: sizes.find((sz) => sz.euSize === s.euSize)?.id ?? '',
        stockQuantity: s.stockQuantity,
      }))
    )
  }, [sizes, isEdit, defaultValues?.stocks, setValue])

  useEffect(() => {
    if (!serverErrors) return
    Object.entries(serverErrors).forEach(([field, messages]) => {
      const key = field.charAt(0).toLowerCase() + field.slice(1)
      setError(key as keyof FormValues, { type: 'server', message: messages[0] })
    })
  }, [serverErrors, setError])

  function handleFormSubmit(values: FormValues) {
    if (duplicateAttrKeys.size > 0) return
    const attrs = (values._attrs ?? []).reduce(
      (acc, { key, value }) => (key ? { ...acc, [key]: value } : acc),
      {} as Record<string, string>
    )
    const { _attrs, images, stocks, ...rest } = values as any
    const imageList: string[] = images ?? []
    const stockList = (stocks ?? []).filter((s: any) => s.sizeId)
    onSubmit(
      { ...rest, attributes: Object.keys(attrs).length ? attrs : null, images: imageList, stocks: stockList },
      pendingFiles
    )
  }

  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const images = (watch('images') as string[] | undefined) ?? []
  const watchedStocks = (watch('stocks' as any) as { sizeId: string }[] | undefined) ?? []
  const watchedAttrs = (watch('_attrs') as { key: string; value: string }[] | undefined) ?? []

  function getAvailableSizeOptions(currentIndex: number) {
    const usedIds = new Set(
      watchedStocks.filter((_, i) => i !== currentIndex).map((s) => s.sizeId).filter(Boolean)
    )
    return sizeOptions.filter((o) => !usedIds.has(o.value))
  }

  const duplicateAttrKeys = (() => {
    const seen = new Set<string>()
    const dupes = new Set<string>()
    for (const { key } of watchedAttrs) {
      const k = key.trim()
      if (!k) continue
      if (seen.has(k)) dupes.add(k)
      else seen.add(k)
    }
    return dupes
  })()

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Name *</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Brand *</Label>
          <Controller
            control={control}
            name="brandId"
            render={({ field }) => (
              <SearchableSelect
                options={brandOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                placeholder="Search brand…"
              />
            )}
          />
          {errors.brandId && <p className="text-xs text-red-500">{errors.brandId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Category *</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <SearchableSelect
                options={categoryOptions}
                value={field.value || undefined}
                onChange={field.onChange}
                placeholder="Search category…"
              />
            )}
          />
          {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Base Price *</Label>
          <Input type="number" step="0.01" {...register('basePrice', { valueAsNumber: true })} />
          {errors.basePrice && <p className="text-xs text-red-500">{errors.basePrice.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>SKU</Label>
          <Input placeholder="Optional" {...register('sku')} />
          {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Description</Label>
          <Textarea rows={3} {...register('description')} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
            )}
          />
          Active
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <Controller
            control={control}
            name="isFeatured"
            render={({ field }) => (
              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
            )}
          />
          Featured
        </label>
      </div>

      {/* Stock by Size */}
      <div className="space-y-2">
        <Label>Stock by Size</Label>
        {stockFields.length === 0 && (
          <p className="text-xs text-gray-400">No sizes added. Click "Add Size" to track stock per size.</p>
        )}
        {stockFields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-center">
            <Controller
              control={control}
              name={`stocks.${i}.sizeId` as any}
              render={({ field: f }) => (
                <SearchableSelect
                  options={getAvailableSizeOptions(i)}
                  value={f.value || undefined}
                  onChange={f.onChange}
                  placeholder="EU size…"
                  className="w-40"
                />
              )}
            />
            <Input
              type="number"
              placeholder="Qty"
              className="w-24"
              {...register(`stocks.${i}.stockQuantity` as any, { valueAsNumber: true })}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeStock(i)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendStock({ sizeId: '', stockQuantity: 0 } as any)}
        >
          <Plus className="w-3 h-3" /> Add Size
        </Button>
      </div>

      {/* Dynamic Attributes */}
      <div className="space-y-2">
        <Label>Attributes</Label>
        {attrFields.map((field, i) => {
          const attrKey = watchedAttrs[i]?.key?.trim()
          const isDupe = !!attrKey && duplicateAttrKeys.has(attrKey)
          return (
            <div key={field.id} className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <Input placeholder="Key" {...register(`_attrs.${i}.key`)} className="flex-1" />
                <Input placeholder="Value" {...register(`_attrs.${i}.value`)} className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeAttr(i)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              {isDupe && (
                <p className="text-xs text-red-500">{attrKey} is duplicated</p>
              )}
            </div>
          )
        })}
        {attrFields.length === 0 && (
          <p className="text-xs text-gray-400">No attributes added. Click "Add Attribute" to add an attribute.</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendAttr({ key: '', value: '' })}
        >
          <Plus className="w-3 h-3" /> Add Attribute
        </Button>
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>Images</Label>
        <FileUploader
          value={images}
          onChange={(urls) => setValue('images', urls)}
          onPendingFilesChange={setPendingFiles}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending || duplicateAttrKeys.size > 0}>{isPending ? 'Saving…' : 'Save Product'}</Button>
      </div>
    </form>
  )
}
