import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TableSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { SearchableSelect } from '@/components/shared/SearchableSelect'
import { useProducts, useProductListParams, useDeleteProduct } from '@/features/products/hooks/useProducts'
import { useBrands } from '@/features/brands/hooks/useBrands'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { useSelectionStore } from '@/store/selectionStore'
import type { ProductSummary } from '@/api/types'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function ProductListPage() {
  const navigate = useNavigate()
  const params = useProductListParams()
  const { data, isLoading } = useProducts(params)
  const { data: brands = [] } = useBrands()
  const { data: categories = [] } = useCategories()
  const deleteMut = useDeleteProduct()
  const { selectedIds, toggleOne, selectAll, clearSelection, isSelected } = useSelectionStore()
  const [deleteTarget, setDeleteTarget] = useState<ProductSummary | null>(null)

  const items = data?.items ?? []
  const allSelected = items.length > 0 && items.every((p) => isSelected(p.id))

  // Child categories only, with "child - parent" label
  const childCategories = categories.filter((c) => c.parentId !== null)
  const categoryOptions = childCategories.map((c) => {
    const parent = categories.find((p) => p.id === c.parentId)
    return { value: c.id, label: parent ? `${c.name} - ${parent.name}` : c.name }
  })
  const brandOptions = brands.map((b) => ({ value: b.id, label: b.name }))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search products…"
          value={params.search ?? ''}
          onChange={(e) => params.setParam('search', e.target.value)}
          className="w-56"
        />
        <SearchableSelect
          options={[{ value: '_all', label: 'All Brands' }, ...brandOptions]}
          value={params.brandId ?? '_all'}
          onChange={(v) => params.setParam('brandId', v === '_all' ? undefined : v)}
          placeholder="All Brands"
          className="w-44"
        />
        <SearchableSelect
          options={[{ value: '_all', label: 'All Categories' }, ...categoryOptions]}
          value={params.categoryId ?? '_all'}
          onChange={(v) => params.setParam('categoryId', v === '_all' ? undefined : v)}
          placeholder="All Categories"
          className="w-52"
        />
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                Promise.all(Array.from(selectedIds).map((id) => deleteMut.mutateAsync(id)))
                  .then(() => clearSelection())
              }}
            >
              Delete {selectedIds.size} selected
            </Button>
          )}
          <Button size="sm" asChild>
            <Link to="/products/new"><Plus className="w-4 h-4" /> New Product</Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No products found"
          action={<Button size="sm" asChild><Link to="/products/new">New Product</Link></Button>}
        />
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 w-8">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => v ? selectAll(items.map((p) => p.id)) : clearSelection()}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Brand</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">SKU</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Checkbox checked={isSelected(product.id)} onCheckedChange={() => toggleOne(product.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.brandName}</td>
                  <td className="px-4 py-3 text-gray-500">{product.categoryName}</td>
                  <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku ?? '—'}</td>
                  <td className="px-4 py-3">{product.totalStock}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={product.isActive ? 'success' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {product.isFeatured && <Badge>Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${product.id}`)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/products/${product.id}/edit`)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(product)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t">
            <Pagination
              page={data?.page ?? 1}
              totalPages={data?.totalPages ?? 1}
              totalCount={data?.totalCount ?? 0}
              pageSize={data?.pageSize ?? 20}
              onPageChange={(p) => params.setParam('page', String(p))}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will soft-delete the product."
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
