import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  Edit,
  FolderTree,
  Image as ImageIcon,
  ListTree,
  Loader2,
  Plus,
  Trash2,
  XCircle,
  PackageSearch
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import { useToast } from '../auth/ToastContext'
import {
  catalogueApi,
  type CommodityRequestOthers,
  type PromoteCategoryPayload
} from './catalogue.api'

import type { CatalogueCategory, CatalogueType } from '../marketplace/marketplace.api'

type ViewMode = 'families' | 'family'

type FamilyWithMeta = CatalogueCategory & {
  isOthers?: boolean
  othersCount?: number
}

export function CategoriesPage() {
  const toast = useToast()

  // ─────────────────────────────────────────────────────────────
  // DATA
  // ─────────────────────────────────────────────────────────────

  const [categories, setCategories] = useState<CatalogueCategory[]>([])
  const [types, setTypes] = useState<CatalogueType[]>([])
  const [pendingTypes, setPendingTypes] = useState<CatalogueType[]>([])
  const [othersRequests, setOthersRequests] = useState<CommodityRequestOthers[]>([])

  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────

  const [view, setView] = useState<ViewMode>('families')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  )

  const selectedTypes = useMemo(
    () =>
      selectedCategoryId ? types.filter((type) => type.category_id === selectedCategoryId) : [],
    [types, selectedCategoryId]
  )

  const selectedPendingTypes = useMemo(
    () =>
      selectedCategoryId
        ? pendingTypes.filter((type) => type.category_id === selectedCategoryId)
        : [],
    [pendingTypes, selectedCategoryId]
  )

  const isOthersSelected = selectedCategoryId === '__others__'

  // ─────────────────────────────────────────────────────────────
  // CATEGORY DIALOG
  // ─────────────────────────────────────────────────────────────

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [categorySaving, setCategorySaving] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    displayOrder: '0',
    image: null as File | null
  })

  // ─────────────────────────────────────────────────────────────
  // TYPE DIALOG
  // ─────────────────────────────────────────────────────────────

  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [typeSaving, setTypeSaving] = useState(false)
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)

  const [typeForm, setTypeForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    standardUnit: 'MT',
    displayOrder: '0',
    image: null as File | null
  })

  // ─────────────────────────────────────────────────────────────
  // OTHERS PROMOTION
  // ─────────────────────────────────────────────────────────────

  const [promoteOpen, setPromoteOpen] = useState(false)
  const [keepOpen, setKeepOpen] = useState(false)
  const [activeRequest, setActiveRequest] = useState<CommodityRequestOthers | null>(null)

  const [promotionSaving, setPromotionSaving] = useState(false)
  const [keepNote, setKeepNote] = useState('')

  const [l1Mode, setL1Mode] = useState<'existing' | 'new'>('existing')

  const [l2Mode, setL2Mode] = useState<'existing' | 'new'>('new')

  const [promoteForm, setPromoteForm] = useState<PromoteCategoryPayload>({
    categoryId: '',
    newCategoryName: '',
    typeId: '',
    newTypeName: '',
    description: '',
    standardUnit: 'MT'
  })

  const filteredPromotionTypes = useMemo(
    () => types.filter((type) => type.category_id === promoteForm.categoryId),
    [types, promoteForm.categoryId]
  )

  // ─────────────────────────────────────────────────────────────
  // LOAD EVERYTHING
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)

    try {
      const [categoriesRes, typesRes, pendingTypesRes, othersRes] = await Promise.all([
        catalogueApi.getCategories(),
        catalogueApi.getTypes(),
        catalogueApi.getPendingTypes(),
        catalogueApi.getOthersRequests()
      ])

      if (categoriesRes.success) {
        setCategories(categoriesRes.data)
      }

      if (typesRes.success) {
        setTypes(typesRes.data)
      }

      if (pendingTypesRes.success) {
        setPendingTypes(pendingTypesRes.data)
      }

      if (othersRes.success) {
        setOthersRequests(othersRes.data)
      }
    } catch {
      toast.error('Failed to load catalogue')
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FAMILY NAVIGATION
  // ─────────────────────────────────────────────────────────────

  function openFamily(categoryId: string) {
    setSelectedCategoryId(categoryId)
    setView('family')
  }

  function openOthers() {
    setSelectedCategoryId('__others__')
    setView('family')
  }

  function backToFamilies() {
    setSelectedCategoryId(null)
    setView('families')
  }

  // ─────────────────────────────────────────────────────────────
  // CATEGORY CRUD
  // ─────────────────────────────────────────────────────────────

  function openCategoryDialog(category?: CatalogueCategory) {
    if (category) {
      setEditingCategoryId(category.id)

      setCategoryForm({
        name: category.name,
        description: category.description || '',
        displayOrder: String(category.display_order),
        image: null
      })
    } else {
      setEditingCategoryId(null)

      setCategoryForm({
        name: '',
        description: '',
        displayOrder: '0',
        image: null
      })
    }

    setCategoryDialogOpen(true)
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault()

    if (!categoryForm.name.trim()) {
      toast.error('Family name is required')
      return
    }

    setCategorySaving(true)

    try {
      const data = new FormData()

      data.append('name', categoryForm.name.trim())

      if (categoryForm.description.trim()) {
        data.append('description', categoryForm.description.trim())
      }

      data.append('displayOrder', categoryForm.displayOrder)

      if (categoryForm.image) {
        data.append('image', categoryForm.image)
      }

      if (editingCategoryId) {
        await catalogueApi.updateCategory(editingCategoryId, data)

        toast.success('Commodity family updated')
      } else {
        await catalogueApi.createCategory(data)

        toast.success('Commodity family created')
      }

      setCategoryDialogOpen(false)
      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save family')
    } finally {
      setCategorySaving(false)
    }
  }


  // ─────────────────────────────────────────────────────────────
  // TYPE CRUD
  // ─────────────────────────────────────────────────────────────

  function openTypeDialog(type?: CatalogueType) {
    if (type) {
      setEditingTypeId(type.id)

      setTypeForm({
        categoryId: type.category_id,
        name: type.name,
        description: type.description || '',
        standardUnit: type.standard_unit,
        displayOrder: String(type.display_order),
        image: null
      })
    } else {
      setEditingTypeId(null)

      setTypeForm({
        categoryId: selectedCategoryId || '',
        name: '',
        description: '',
        standardUnit: 'MT',
        displayOrder: '0',
        image: null
      })
    }

    setTypeDialogOpen(true)
  }

  async function saveType(e: React.FormEvent) {
    e.preventDefault()

    if (!typeForm.categoryId || !typeForm.name.trim()) {
      toast.error('Family and type name are required')
      return
    }

    setTypeSaving(true)

    try {
      const data = new FormData()

      data.append('categoryId', typeForm.categoryId)
      data.append('name', typeForm.name.trim())

      if (typeForm.description.trim()) {
        data.append('description', typeForm.description.trim())
      }

      data.append('standardUnit', typeForm.standardUnit)
      data.append('displayOrder', typeForm.displayOrder)

      if (typeForm.image) {
        data.append('image', typeForm.image)
      }

      if (editingTypeId) {
        await catalogueApi.updateType(editingTypeId, data)

        toast.success('Commodity type updated')
      } else {
        await catalogueApi.createType(data)

        toast.success('Commodity type created')
      }

      setTypeDialogOpen(false)
      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save type')
    } finally {
      setTypeSaving(false)
    }
  }

  async function deleteType(id: string) {
    if (!confirm('Are you sure you want to delete this commodity type?')) {
      return
    }

    try {
      await catalogueApi.deleteType(id)

      toast.success('Commodity type deleted')

      await fetchAll()
    } catch {
      toast.error('Failed to delete type')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TYPE APPROVAL
  // ─────────────────────────────────────────────────────────────

  async function approveType(id: string, status: 'approved' | 'rejected') {
    if (!confirm(`Are you sure you want to ${status} this proposed type?`)) {
      return
    }

    try {
      await catalogueApi.approveType(id, status)

      toast.success(status === 'approved' ? 'Type approved' : 'Type rejected')

      await fetchAll()
    } catch {
      toast.error('Failed to update approval')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // OTHERS PROMOTION
  // ─────────────────────────────────────────────────────────────

  function openPromote(request: CommodityRequestOthers) {
    setActiveRequest(request)

    setPromoteForm({
      categoryId: categories.length > 0 ? categories[0].id : '',
      newCategoryName: request.custom_family_name || '',
      typeId: '',
      newTypeName: request.custom_type_name || '',
      description: request.description || '',
      standardUnit: request.quantity_unit || 'MT'
    })

    setL1Mode('new')
    setL2Mode('new')

    setPromoteOpen(true)
  }

  function openKeep(request: CommodityRequestOthers) {
    setActiveRequest(request)
    setKeepNote('')
    setKeepOpen(true)
  }

  async function submitPromotion(e: React.FormEvent) {
    e.preventDefault()

    if (!activeRequest) return

    if (l1Mode === 'existing' && !promoteForm.categoryId) {
      toast.error('Select a commodity family')
      return
    }

    if (l1Mode === 'new' && !promoteForm.newCategoryName?.trim()) {
      toast.error('Enter the new family name')
      return
    }

    if (l2Mode === 'existing' && !promoteForm.typeId) {
      toast.error('Select an existing type')
      return
    }

    if (l2Mode === 'new' && !promoteForm.newTypeName.trim()) {
      toast.error('Enter the new type name')
      return
    }

    setPromotionSaving(true)

    try {
      const payload: PromoteCategoryPayload = {
        newTypeName: l2Mode === 'new' ? promoteForm.newTypeName.trim() : '',

        standardUnit: promoteForm.standardUnit,

        description: promoteForm.description
      }

      if (l1Mode === 'existing') {
        payload.categoryId = promoteForm.categoryId
      } else {
        payload.newCategoryName = promoteForm.newCategoryName?.trim()
      }

      if (l2Mode === 'existing') {
        payload.typeId = promoteForm.typeId
      }

      await catalogueApi.promoteCategory(activeRequest.id, payload)

      toast.success('Request successfully promoted to catalogue')

      setPromoteOpen(false)

      await fetchAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Promotion failed')
    } finally {
      setPromotionSaving(false)
    }
  }

  async function submitKeep(e: React.FormEvent) {
    e.preventDefault()

    if (!activeRequest) return

    setPromotionSaving(true)

    try {
      await catalogueApi.keepAsOthers(activeRequest.id, {
        note: keepNote
      })

      toast.success('Request kept as Others')

      setKeepOpen(false)

      await fetchAll()
    } catch {
      toast.error('Failed to keep request as Others')
    } finally {
      setPromotionSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FAMILY COUNTS
  // ─────────────────────────────────────────────────────────────

  const families: FamilyWithMeta[] = categories.map((category) => ({
    ...category,
    isOthers: false,
    othersCount: 0
  }))

  
  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // FAMILY LIST
  // ─────────────────────────────────────────────────────────────

  if (view === 'families') {
    return (
      <>
        <div className="space-y-6">
          {/* HEADER */}

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Catalogue</h1>

              <p className="mt-1 text-muted-foreground">
                Manage commodity families, tradeable forms, approvals and custom requests from one
                place.
              </p>
            </div>

            <Button
              onClick={() => openCategoryDialog()}
              className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Family
            </Button>
          </div>

          {/* PENDING ALERT */}

          {pendingTypes.length > 0 && (
            <Card className="border-amber-300">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-amber-600" />

                  <div>
                    <p className="font-medium">
                      {pendingTypes.length} type
                      {pendingTypes.length !== 1 ? 's' : ''} awaiting approval
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Open the relevant commodity family to review them.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAMILIES */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {families.map((family) => {
              const familyTypeCount = types.filter((type) => type.category_id === family.id).length

              const pendingCount = pendingTypes.filter(
                (type) => type.category_id === family.id
              ).length

              return (
                <Card
                  key={family.id}
                  className="group cursor-pointer overflow-hidden border-border transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
                  onClick={() => openFamily(family.id)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {family.imageUrl ? (
                      <img
                        src={family.imageUrl}
                        alt={family.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <PackageSearch className="h-10 w-10 opacity-20" />
                      </div>
                    )}

                    {pendingCount > 0 && (
                      <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
                        {pendingCount} pending
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold">{family.name}</h3>

                        {family.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {family.description}
                          </p>
                        )}

                        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {familyTypeCount} {familyTypeCount === 1 ? 'type' : 'types'}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          openCategoryDialog(family)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* OTHERS FAMILY */}

            <Card
              className="group cursor-pointer overflow-hidden border-dashed border-2 transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
              onClick={openOthers}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
                <div className="flex h-full items-center justify-center">
                  <FolderTree className="h-12 w-12 text-muted-foreground opacity-30" />
                </div>

                {othersRequests.length > 0 && (
                  <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow">
                    {othersRequests.length} pending
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">Others</h3>

                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  Custom commodity requests that are not yet part of the catalogue.
                </p>

                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {othersRequests.length} {othersRequests.length === 1 ? 'request' : 'requests'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {renderCategoryDialog()}
      </>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // FAMILY DETAIL
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6">
        {/* BACK */}

        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 text-muted-foreground"
          onClick={backToFamilies}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalogue
        </Button>

        {/* FAMILY HEADER */}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {!isOthersSelected && selectedCategory?.imageUrl ? (
                    <img
                      src={selectedCategory.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <PackageSearch className="h-7 w-7 opacity-40" />
                    </div>
                  )}
                </div>

                <div>
                  <CardTitle className="text-2xl">
                    {isOthersSelected ? 'Others' : selectedCategory?.name}
                  </CardTitle>

                  <CardDescription className="mt-1">
                    {isOthersSelected
                      ? 'Review uncatalogued commodity requests.'
                      : selectedCategory?.description ||
                        'Manage the tradeable commodity forms within this family.'}
                  </CardDescription>
                </div>
              </div>

              {!isOthersSelected && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => selectedCategory && openCategoryDialog(selectedCategory)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Family
                  </Button>

                  <Button
                    onClick={() => openTypeDialog()}
                    className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Type
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* OTHERS */}

        {isOthersSelected ? (
          renderOthers()
        ) : (
          <>
            {/* PENDING TYPES */}

            {selectedPendingTypes.length > 0 && (
              <Card className="border-amber-300">
                <CardHeader>
                  <CardTitle className="text-lg">Pending Type Approvals</CardTitle>

                  <CardDescription>Seller-proposed types awaiting review.</CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="divide-y">
                    {selectedPendingTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{type.name}</h4>

                          {type.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
                          )}

                          <p className="mt-2 text-xs text-muted-foreground">
                            Unit: {type.standard_unit}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveType(type.id, 'approved')}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <CheckCircle className="mr-1.5 h-4 w-4" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={() => approveType(type.id, 'rejected')}
                          >
                            <XCircle className="mr-1.5 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TYPES */}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tradeable Forms</CardTitle>

                <CardDescription>
                  {selectedTypes.length} {selectedTypes.length === 1 ? 'type' : 'types'} in this
                  commodity family.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {selectedTypes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground opacity-30" />

                    <h3 className="font-semibold">No tradeable forms yet</h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Add the first commodity type to this family.
                    </p>

                    <Button className="mt-5" onClick={() => openTypeDialog()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Type
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {selectedTypes.map((type) => (
                      <Card key={type.id} className="group overflow-hidden">
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          {type.imageUrl ? (
                            <img
                              src={type.imageUrl}
                              alt={type.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <PackageSearch className="h-10 w-10 opacity-20" />
                            </div>
                          )}
                        </div>

                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{type.name}</h3>

                              {type.description && (
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                  {type.description}
                                </p>
                              )}

                              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Unit: {type.standard_unit}
                              </p>
                            </div>

                            <div className="flex shrink-0 gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openTypeDialog(type)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteType(type.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {renderCategoryDialog()}
      {renderTypeDialog()}
      {renderPromotionDialog()}
      {renderKeepDialog()}
    </>
  )

  // ─────────────────────────────────────────────────────────────
  // CATEGORY DIALOG
  // ─────────────────────────────────────────────────────────────

  function renderCategoryDialog() {
    return (
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId ? 'Edit Commodity Family' : 'Create Commodity Family'}
            </DialogTitle>

            <DialogDescription>
              Manage the L1 commodity family shown in the catalogue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveCategory} className="space-y-4 pt-4">
            <div>
              <Label>Name</Label>

              <Input
                className="mt-1.5"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    name: e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <Label>Description</Label>

              <Textarea
                className="mt-1.5"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value
                  })
                }
              />
            </div>

            <div>
              <Label>Display Order</Label>

              <Input
                type="number"
                className="mt-1.5"
                value={categoryForm.displayOrder}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    displayOrder: e.target.value
                  })
                }
              />
            </div>

            <div>
              <Label>Cover Image</Label>

              <Input
                type="file"
                accept="image/*"
                className="mt-1.5"
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    image: e.target.files?.[0] || null
                  })
                }
              />

              <p className="mt-1 text-xs text-muted-foreground">
                JPG/PNG. Use the catalogue-approved imagery.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={categorySaving}>
                {categorySaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // TYPE DIALOG
  // ─────────────────────────────────────────────────────────────

  function renderTypeDialog() {
    return (
      <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTypeId ? 'Edit Commodity Type' : 'Create Commodity Type'}
            </DialogTitle>

            <DialogDescription>Manage an L2 tradeable commodity form.</DialogDescription>
          </DialogHeader>

          <form onSubmit={saveType} className="space-y-4 pt-4">
            <div>
              <Label>Commodity Family</Label>

              <Select
                value={typeForm.categoryId}
                onValueChange={(value) =>
                  setTypeForm({
                    ...typeForm,
                    categoryId: value
                  })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select family..." />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Name</Label>

              <Input
                className="mt-1.5"
                value={typeForm.name}
                onChange={(e) =>
                  setTypeForm({
                    ...typeForm,
                    name: e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <Label>Description</Label>

              <Textarea
                className="mt-1.5"
                value={typeForm.description}
                onChange={(e) =>
                  setTypeForm({
                    ...typeForm,
                    description: e.target.value
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Standard Unit</Label>

                <Input
                  className="mt-1.5"
                  value={typeForm.standardUnit}
                  onChange={(e) =>
                    setTypeForm({
                      ...typeForm,
                      standardUnit: e.target.value
                    })
                  }
                  placeholder="MT, KG, etc."
                />
              </div>

              <div>
                <Label>Display Order</Label>

                <Input
                  type="number"
                  className="mt-1.5"
                  value={typeForm.displayOrder}
                  onChange={(e) =>
                    setTypeForm({
                      ...typeForm,
                      displayOrder: e.target.value
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Image</Label>

              <Input
                type="file"
                accept="image/*"
                className="mt-1.5"
                onChange={(e) =>
                  setTypeForm({
                    ...typeForm,
                    image: e.target.files?.[0] || null
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setTypeDialogOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={typeSaving}>
                {typeSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // OTHERS CONTENT
  // ─────────────────────────────────────────────────────────────

  function renderOthers() {
    if (othersRequests.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle className="mb-4 h-12 w-12 text-muted-foreground opacity-30" />

            <h3 className="text-lg font-semibold">No Others requests</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              There are currently no uncatalogued commodity requests awaiting review.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Custom Commodity Requests</CardTitle>

          <CardDescription>
            Review requests that do not currently exist in the catalogue.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {othersRequests.map((request) => (
              <div key={request.id} className="p-5 transition-colors hover:bg-muted/50">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {request.custom_family_name}

                        <span className="mx-2 text-muted-foreground">/</span>

                        {request.custom_type_name}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Requested by{' '}
                        <span className="font-medium text-foreground">
                          {request.buyer_company_name}
                        </span>{' '}
                        on {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="inline-flex rounded-md border bg-muted/30 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Quantity
                        </p>

                        <p className="mt-1 font-medium">
                          {request.quantity} {request.quantity_unit}
                        </p>
                      </div>
                    </div>

                    {request.description && (
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                          Buyer Notes
                        </p>

                        <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">
                          {request.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:w-48 xl:flex-col">
                    <Button
                      onClick={() => openPromote(request)}
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <ListTree className="mr-2 h-4 w-4" />
                      Map to Catalogue
                    </Button>

                    <Button variant="outline" onClick={() => openKeep(request)} className="w-full">
                      Keep as Others
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // PROMOTION DIALOG
  // ─────────────────────────────────────────────────────────────

  function renderPromotionDialog() {
    return (
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Map to Catalogue</DialogTitle>

            <DialogDescription>
              Convert this custom request into a catalogue family/type or map it to an existing
              entry.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitPromotion} className="space-y-6 pt-2">
            {/* L1 */}

            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <h4 className="flex items-center font-medium text-[var(--color-cobalt-700)]">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-cobalt-100)] text-xs">
                  1
                </span>
                Commodity Family
              </h4>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={l1Mode === 'existing' ? 'default' : 'outline'}
                  onClick={() => setL1Mode('existing')}
                >
                  Existing Family
                </Button>

                <Button
                  type="button"
                  variant={l1Mode === 'new' ? 'default' : 'outline'}
                  onClick={() => {
                    setL1Mode('new')
                    setL2Mode('new')
                  }}
                >
                  New Family
                </Button>
              </div>

              {l1Mode === 'existing' ? (
                <Select
                  value={promoteForm.categoryId}
                  onValueChange={(value) =>
                    setPromoteForm({
                      ...promoteForm,
                      categoryId: value,
                      typeId: ''
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select family..." />
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={promoteForm.newCategoryName || ''}
                  onChange={(e) =>
                    setPromoteForm({
                      ...promoteForm,
                      newCategoryName: e.target.value
                    })
                  }
                  placeholder="New family name"
                  required
                />
              )}
            </div>

            {/* L2 */}

            <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
              <h4 className="flex items-center font-medium text-[var(--color-cobalt-700)]">
                <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-cobalt-100)] text-xs">
                  2
                </span>
                Tradeable Form
              </h4>

              {l1Mode === 'existing' && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={l2Mode === 'existing' ? 'default' : 'outline'}
                    onClick={() => setL2Mode('existing')}
                  >
                    Existing Type
                  </Button>

                  <Button
                    type="button"
                    variant={l2Mode === 'new' ? 'default' : 'outline'}
                    onClick={() => setL2Mode('new')}
                  >
                    New Type
                  </Button>
                </div>
              )}

              {l2Mode === 'existing' ? (
                <Select
                  value={promoteForm.typeId}
                  onValueChange={(value) =>
                    setPromoteForm({
                      ...promoteForm,
                      typeId: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>

                  <SelectContent>
                    {filteredPromotionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <>
                  <div>
                    <Label>New Type Name</Label>

                    <Input
                      className="mt-1.5"
                      value={promoteForm.newTypeName}
                      onChange={(e) =>
                        setPromoteForm({
                          ...promoteForm,
                          newTypeName: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Standard Unit</Label>

                    <Input
                      className="mt-1.5"
                      value={promoteForm.standardUnit}
                      onChange={(e) =>
                        setPromoteForm({
                          ...promoteForm,
                          standardUnit: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Description</Label>

                    <Textarea
                      className="mt-1.5"
                      value={promoteForm.description}
                      onChange={(e) =>
                        setPromoteForm({
                          ...promoteForm,
                          description: e.target.value
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setPromoteOpen(false)}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={promotionSaving}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {promotionSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ListTree className="mr-2 h-4 w-4" />
                )}
                Map & Promote
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // KEEP AS OTHERS DIALOG
  // ─────────────────────────────────────────────────────────────

  function renderKeepDialog() {
    return (
      <Dialog open={keepOpen} onOpenChange={setKeepOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keep as Others</DialogTitle>

            <DialogDescription>
              Keep this request as an uncatalogued custom commodity and allow it to continue through
              the normal workflow.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submitKeep} className="space-y-4 pt-4">
            <div>
              <Label>Internal Note</Label>

              <Textarea
                className="mt-1.5"
                placeholder="Optional internal note..."
                value={keepNote}
                onChange={(e) => setKeepNote(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setKeepOpen(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={promotionSaving}>
                {promotionSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
}
