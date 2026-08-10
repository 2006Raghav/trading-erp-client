// src/renderer/src/modules/marketplace/MarketplacePage.tsx

import { useCallback, useEffect, useMemo, useState } from 'react'

import { RefreshCw, PackageSearch, Plus, Loader2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '../../components/ui/sheet'
import { Skeleton } from '../../components/ui/skeleton'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'

import { Pagination } from '../../components/ui/Pagination'

import { useToast } from '../auth/ToastContext'

import {
  marketplaceApi,
  type MarketplaceFilters,
  type MarketplaceProduct,
  type MarketplaceCategory,
  type CommodityRequestPrefill
} from './marketplace.api'

import { MarketplaceCard } from './MarketplaceCard'
import { MarketplaceFilters as MarketplaceFiltersBar } from './MarketplaceFilters'
import { CommodityRequestSheet } from '../commodity-requests/CommodityRequestSheet'
import type { PaginationMeta } from '../../lib/types'
import { formatCurrency, formatQuantity } from '../../lib/utils'

export function MarketplacePage() {
  const toast = useToast()

  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [categories, setCategories] = useState<MarketplaceCategory[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)

  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<MarketplaceFilters>({
    categoryId: '',
    minQuantity: undefined,
    purity: undefined
  })

  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)

  const [requestDialogOpen, setRequestDialogOpen] = useState(false)

  const [requestPrefill, setRequestPrefill] = useState<CommodityRequestPrefill | null>(null)

  //-----------------------------------------------------------------------
  // Categories
  //-----------------------------------------------------------------------

  useEffect(() => {
    marketplaceApi
      .getCategories()
      .then((res) => {
        if (res.success) {
          setCategories(res.data)
        }
      })
      .catch(() => {
        toast.error('Failed to load categories')
      })
  }, [])

  //-----------------------------------------------------------------------
  // Marketplace
  //-----------------------------------------------------------------------

  const fetchMarketplace = useCallback(async () => {
    setLoading(true)

    try {
      const res = await marketplaceApi.getAll({
        ...filters,
        page,
        pageSize: 24
      })

      if (res.success) {
        setProducts(res.data)
        setMeta(res.meta)
      }
    } catch {
      toast.error('Unable to load marketplace')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    fetchMarketplace()
  }, [fetchMarketplace])

  //-----------------------------------------------------------------------
  // Search debounce
  //-----------------------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [filters.purity])

  //-----------------------------------------------------------------------
  // Filters
  //-----------------------------------------------------------------------

  function updateFilters(values: Partial<MarketplaceFilters>) {
    setPage(1)

    setFilters((prev) => ({
      ...prev,
      ...values
    }))
  }

  function resetFilters() {
    setPage(1)

    setFilters({
      categoryId: '',
      minQuantity: undefined,
      purity: undefined
    })
  }

  //-----------------------------------------------------------------------
  // Actions
  //-----------------------------------------------------------------------

  function handleViewProduct(product: MarketplaceProduct) {
    setSelectedProduct(product)
    setDetailOpen(true)
  }

  function handleRequestCommodity(product?: MarketplaceProduct) {
    if (product) {
      setRequestPrefill({
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        productName: product.productName,
        quantityUnit: product.quantityUnit,
        purity: product.purity,
        grade: product.grade,
        currency: product.currency ?? 'USD'
      })
      setSelectedProduct(product)
    } else {
      setRequestPrefill(null)
    }

    setRequestDialogOpen(true)
  }

  //-----------------------------------------------------------------------
  // Derived values
  //-----------------------------------------------------------------------

  const activeFilters = useMemo(() => {
    return Object.values(filters).filter(Boolean).length
  }, [filters])

  //-----------------------------------------------------------------------
  // Render
  //-----------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* =======================================================
          Header
      ======================================================== */}

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Commodity Marketplace
            </CardTitle>

            <CardDescription className="mt-1">
              Browse verified commodity listings from approved suppliers across the global exchange.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchMarketplace} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>

            <Button
              onClick={() => handleRequestCommodity()}
              className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Request Commodity
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* =======================================================
          Filters
      ======================================================== */}

      <MarketplaceFiltersBar
        filters={filters}
        categories={categories}
        activeFilters={activeFilters}
        onChange={updateFilters}
        onReset={resetFilters}
      />

      {/* =======================================================
          Summary
      ======================================================== */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PackageSearch className="h-4 w-4" />

          <span>{meta?.total ?? products.length} commodities available</span>
        </div>

        {meta && (
          <Badge variant="secondary">
            Page {meta.page} of {meta.totalPages}
          </Badge>
        )}
      </div>

      {/* =======================================================
          Marketplace Grid
      ======================================================== */}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-5 w-2/3" />

                <Skeleton className="h-4 w-24" />

                <Separator />

                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />

                <Separator />

                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <PackageSearch className="mb-4 h-12 w-12 text-muted-foreground" />

            <h3 className="text-lg font-semibold">No commodities found</h3>

            <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
              Try changing your filters, or submit a commodity request if you can't find what you're
              looking for.
            </p>

            <Button
              className="mt-6 bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
              onClick={() => handleRequestCommodity()}
            >
              Request Commodity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <MarketplaceCard
                key={product.id}
                product={product}
                onView={() => handleViewProduct(product)}
                onRequest={() => handleRequestCommodity(product)}
              />
            ))}
          </div>

          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      {/* =======================================================
          Product Detail Sheet
      ======================================================== */}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedProduct?.productName}</SheetTitle>

            <SheetDescription>Commodity information available to buyers.</SheetDescription>
          </SheetHeader>

          {selectedProduct && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Badge variant="secondary">{selectedProduct.categoryName}</Badge>

                <h2 className="text-2xl font-semibold tracking-tight">
                  {selectedProduct.productName}
                </h2>

                {selectedProduct.grade && (
                  <p className="text-sm text-muted-foreground">{selectedProduct.grade}</p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Category</p>

                  <p className="mt-1 font-medium">{selectedProduct.categoryName}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Purity</p>

                  <p className="mt-1 font-medium">{selectedProduct.purity || '—'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Grade</p>

                  <p className="mt-1 font-medium">{selectedProduct.grade || '—'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Origin</p>

                  <p className="mt-1 font-medium">{selectedProduct.origin || '—'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Warehouse Country
                  </p>

                  <p className="mt-1 font-medium">{selectedProduct.warehouseCountry || '—'}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Available Quantity
                  </p>

                  <p className="mt-1 font-medium">
                    {formatQuantity(
                      selectedProduct.availableQuantity,
                      selectedProduct.quantityUnit
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="rounded-xl border bg-muted/30 p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Price</p>

                {selectedProduct.pricePerUnit ? (
                  <p className="mt-1 text-lg font-medium text-foreground">
                    {formatCurrency(
                      selectedProduct.pricePerUnit,
                      selectedProduct.currency || 'USD'
                    )}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      / {selectedProduct.quantityUnit}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Price upon request (Per {selectedProduct.quantityUnit})
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"

                onClick={() => {
                  if (!selectedProduct) return

                  setDetailOpen(false)

                  handleRequestCommodity(selectedProduct)
                }}
              >
                Request Commodity
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* =======================================================
          Request Commodity Placeholder
      ======================================================== */}

      <CommodityRequestSheet
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        categories={categories}
        product={requestPrefill ?? undefined}
        onSuccess={() => {
          setRequestDialogOpen(false)
          toast.success('Commodity request submitted successfully.')
        }}
      />
    </div>
  )
}
