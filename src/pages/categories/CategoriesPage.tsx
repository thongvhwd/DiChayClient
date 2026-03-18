import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/categories/hooks/useCategories'
import { CreateCategorySchema, UpdateCategorySchema, type Category, type CreateCategoryRequest, type UpdateCategoryRequest } from '@/api/types'
import { Checkbox } from '@/components/ui/checkbox'

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const createMut = useCreateCategory()
  const updateMut = useUpdateCategory()
  const deleteMut = useDeleteCategory()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [hasParent, setHasParent] = useState(false)
  const [parentId, setParentId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [formKey, setFormKey] = useState(0)

  const isEdit = !!editing

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<UpdateCategoryRequest>({
    resolver: zodResolver(isEdit ? UpdateCategorySchema : CreateCategorySchema) as any,
  })

  // Root categories available as parents (exclude self when editing)
  const rootCategories = categories.filter((c) => !c.parentId && (!isEdit || c.id !== editing?.id))

  function getParentName(id: string | null) {
    return categories.find((c) => c.id === id)?.name ?? '—'
  }

  function openCreate() {
    setEditing(null)
    setHasParent(false)
    setParentId(null)
    setFormKey((k) => k + 1)
    reset({ name: '', displayOrder: 0 })
    setFormOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setHasParent(!!cat.parentId)
    setParentId(cat.parentId)
    setFormKey((k) => k + 1)
    reset({ name: cat.name, parentId: cat.parentId, displayOrder: cat.displayOrder, isActive: cat.isActive })
    setFormOpen(true)
  }

  async function onSubmit(data: CreateCategoryRequest | UpdateCategoryRequest) {
    const payload = { ...data, parentId: hasParent ? parentId : null }
    if (isEdit && editing) {
      await updateMut.mutateAsync({ id: editing.id, data: payload as UpdateCategoryRequest })
    } else {
      await createMut.mutateAsync(payload as CreateCategoryRequest)
    }
    setFormOpen(false)
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categories</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Category
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" action={<Button size="sm" onClick={openCreate}>Add Category</Button>} />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Parent</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Order</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{getParentName(cat.parentId)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={cat.isActive ? 'success' : 'secondary'}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat.displayOrder ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}>
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
            <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name *</Label>
              <Input {...register('name')} autoFocus />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Display Order</Label>
              <Input type="number" {...register('displayOrder', { valueAsNumber: true })} placeholder="0" min={0} />
              {errors.displayOrder && <p className="text-xs text-red-500">{errors.displayOrder.message}</p>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasParent"
                checked={hasParent}
                onChange={(e) => {
                  setHasParent(e.target.checked)
                  if (!e.target.checked) setParentId(null)
                }}
              />
              <Label htmlFor="hasParent">Has parent category</Label>
            </div>

            {hasParent && (
              <div className="space-y-1">
                <Label>Parent *</Label>
                <SearchableSelect
                  options={rootCategories.map((c) => ({ value: c.id, label: c.name }))}
                  value={parentId ?? undefined}
                  onChange={setParentId}
                  placeholder="Select parent…"
                />
              </div>
            )}

            {isEdit && (
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Checkbox id="catActive" checked={!!field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="catActive">Active</Label>
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
