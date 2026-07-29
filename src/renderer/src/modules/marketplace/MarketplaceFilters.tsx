// src/renderer/src/modules/marketplace/MarketplaceFilters.tsx

import { RotateCcw, Search } from 'lucide-react'

import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import type {
  MarketplaceCategory,
  MarketplaceFilters as MarketplaceFilterValues
} from './marketplace.api'

interface MarketplaceFiltersProps {
  filters: MarketplaceFilterValues
  categories: MarketplaceCategory[]
  activeFilters: number

  onChange: (values: Partial<MarketplaceFilterValues>) => void

  onReset: () => void
}

export function MarketplaceFilters({
  filters,
  categories,
  activeFilters,
  onChange,
  onReset
}: MarketplaceFiltersProps) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {/* Category */}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Category
            </label>

            <Select
              value={filters.categoryId || 'all'}
              onValueChange={(value) =>
                onChange({
                  categoryId: value === 'all' ? '' : value
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Purity Min */}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Min Purity
            </label>

            <Input
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="e.g. 99.99"
              value={filters.purity ?? ''}
              onChange={(e) => {
                const value = e.target.value

                onChange({
                  purity:
                    value === ''
                      ? undefined
                      : Math.min(100, Math.max(0, Number(Number(value).toFixed(2))))
                })
              }}
            />
          </div>
          <div className="w-44">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Minimum Quantity
            </label>

            <Input
              type="number"
              min={0}
              placeholder="0"
              step={0.01}
              value={filters.minQuantity ?? ''}
              onChange={(e) => {
                const value = e.target.value

                onChange({
                  minQuantity:
                    value === '' ? undefined : Math.max(0, Number(Number(value).toFixed(0)))
                })
              }}
            />
          </div>
          <div className="mt-6 flex justify-end xl:col-span-3">
            <Button variant="outline" onClick={onReset} disabled={activeFilters === 0}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
