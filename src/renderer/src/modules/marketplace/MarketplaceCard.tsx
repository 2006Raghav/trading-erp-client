// src/renderer/src/modules/marketplace/MarketplaceCard.tsx

import { ArrowRight, Globe, MapPin, Package, ShieldCheck } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'

import type { MarketplaceProduct } from './marketplace.api'

import { formatCurrency, formatQuantity } from '../../lib/utils'

interface MarketplaceCardProps {
  product: MarketplaceProduct
  onView: () => void
  onRequest: () => void
}

export function MarketplaceCard({ product, onView, onRequest }: MarketplaceCardProps) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-slate-500)] hover:shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{product.productName}</CardTitle>

            <CardDescription className="mt-1">
              {product.grade || product.categoryName}
            </CardDescription>
          </div>

          <Badge variant="secondary" className="shrink-0">
            {product.categoryName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <InfoItem
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Purity"
            value={product.purity || '—'}
          />

          <InfoItem
            icon={<Globe className="h-4 w-4" />}
            label="Origin"
            value={product.origin || '—'}
          />

          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Warehouse"
            value={product.warehouseCountry || '—'}
          />

          <InfoItem
            icon={<Package className="h-4 w-4" />}
            label="Available"
            value={formatQuantity(product.availableQuantity, product.quantityUnit)}
          />
        </div>

        <Separator />
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={onView}>
          View Details
        </Button>

        <Button
          onClick={onRequest}
          className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
        >
          Request
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}

        <span>{label}</span>
      </div>

      <p className="font-medium break-words">{value}</p>
    </div>
  )
}
