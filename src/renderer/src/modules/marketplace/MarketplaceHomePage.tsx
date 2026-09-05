import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageSearch, ArrowRight } from 'lucide-react'


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Skeleton } from '../../components/ui/skeleton'
import { useToast } from '../auth/ToastContext'
import { marketplaceApi, type CatalogueCategory } from './marketplace.api'

export function MarketplaceHomePage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [categories, setCategories] = useState<CatalogueCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    marketplaceApi
      .getCategories()
      .then((res) => {
        if (res.success) {
          setCategories(res.data)
        }
      })
      .catch(() => {
        toast.error('Failed to load commodity categories')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [toast])

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Commodity Marketplace
            </CardTitle>
            <CardDescription className="mt-1">
              Select a commodity family to browse available types and submit a request.
            </CardDescription>
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <PackageSearch className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No categories found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The marketplace catalogue is currently empty.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-md border-border/60 hover:border-border"
              onClick={() => navigate(`/marketplace/${category.id}`)}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/50">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <PackageSearch className="h-10 w-10 opacity-20" />
                  </div>
                )}

                {/* Subtle gradient overlay for premium feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-[var(--color-cobalt-600)]">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <div className="mt-6 flex items-center text-sm font-medium text-[var(--color-cobalt-600)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  View types <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
