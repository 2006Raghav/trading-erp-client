import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PackageSearch, ArrowLeft, Plus } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { useToast } from '../auth/ToastContext'
import { marketplaceApi, type CatalogueType, type CatalogueCategory } from './marketplace.api'

export function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [category, setCategory] = useState<CatalogueCategory | null>(null)
  const [types, setTypes] = useState<CatalogueType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categoryId) return

    setLoading(true)
    // We fetch all categories to find the current category's metadata,
    // and then fetch its types. In a real app we might have a getCategory(id) endpoint.
    Promise.all([marketplaceApi.getCategories(), marketplaceApi.getTypesByCategory(categoryId)])
      .then(([catsRes, typesRes]) => {
        if (catsRes.success && typesRes.success) {
          const currentCat = catsRes.data.find((c) => c.id === categoryId) || null
          setCategory(currentCat)
          setTypes(typesRes.data)
        }
      })
      .catch(() => {
        toast.error('Failed to load category details')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [categoryId, toast])

  const handleRequestType = (type: CatalogueType) => {
    // Navigate to request form with the type preselected
    navigate('/marketplace/request/new', {
      state: {
        prefill: {
          categoryId: type.category_id,
          categoryName: type.category_name || category?.name || '',
          typeId: type.id,
          typeName: type.name,
          standardUnit: type.standard_unit
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2 -ml-3 text-muted-foreground hover:text-foreground"
        onClick={() => navigate('/marketplace')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Catalogue
      </Button>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            {loading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {category?.name || 'Category Types'}
              </CardTitle>
            )}

            {loading ? (
              <Skeleton className="h-4 w-96 mt-2" />
            ) : (
              <CardDescription>
                {category?.description || 'Select a commodity type to create a sourcing request.'}
              </CardDescription>
            )}
          </div>
          <div>
            <Button
              variant="outline"
              className="bg-muted hover:bg-muted/80"
              onClick={() => navigate('/marketplace/request/custom')}
            >
              Can't find what you need? Request Others
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : types.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <PackageSearch className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No types found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No commodity types have been added to this category yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {types.map((type) => (
            <Card
              key={type.id}
              className="group overflow-hidden transition-all hover:shadow-md border-border/60 hover:border-border flex flex-col"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted/50 border-b border-border/30">
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
              <CardContent className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {type.name}
                </h3>
                {type.description && (
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {type.description}
                  </p>
                )}

                <div className="mt-auto pt-6 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Base Unit: {type.standard_unit}
                  </span>
                  <Button
                    size="sm"
                    className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] transition-all"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRequestType(type)
                    }}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Request Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
