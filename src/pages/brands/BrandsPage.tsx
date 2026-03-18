import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '@/features/brands/hooks/useBrands'
import { CreateBrandSchema, UpdateBrandSchema, type Brand, type CreateBrandRequest, type UpdateBrandRequest } from '@/api/types'

export default function BrandsPage() {
  const { data: brands = [], isLoading } = useBrands()
  const createMut = useCreateBrand()
  const updateMut = useUpdateBrand()
  const deleteMut = useDeleteBrand()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null)

  const isEdit = !!editing

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBrandRequest | UpdateBrandRequest>({
    resolver: zodResolver(isEdit ? UpdateBrandSchema : CreateBrandSchema) as any,
  })

  function openCreate() {
    setEditing(null)
    reset({ name: '' })
    setFormOpen(true)
  }

  function openEdit(brand: Brand) {
    setEditing(brand)
    reset({ name: brand.name, isActive: brand.isActive })
    setFormOpen(true)
  }

  async function onSubmit(data: CreateBrandRequest | UpdateBrandRequest) {
    if (isEdit && editing) {
      await updateMut.mutateAsync({ id: editing.id, data: data as UpdateBrandRequest })
    } else {
      await createMut.mutateAsync(data as CreateBrandRequest)
    }
    setFormOpen(false)
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{brands.length} brands</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Brand
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : brands.length === 0 ? (
        <EmptyState title="No brands yet" action={<Button size="sm" onClick={openCreate}>Add Brand</Button>} />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{brand.name}</td>
                  <td className="px-4 py-3 text-gray-500">{brand.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant={brand.isActive ? 'success' : 'secondary'}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(brand)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Brand' : 'New Brand'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...register('name')} autoFocus />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            {isEdit && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="brandActive" {...register('isActive' as keyof (CreateBrandRequest | UpdateBrandRequest))} />
                <Label htmlFor="brandActive">Active</Label>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteMut.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMut.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
      />
    </div>
  )
}
