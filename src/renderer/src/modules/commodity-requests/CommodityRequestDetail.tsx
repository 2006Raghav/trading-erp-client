// src/modules/commodity-requests/CommodityRequestDetail.tsx

import { Package, Truck, Calendar, FileText, ShieldCheck, Clock3, DollarSign } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '../../components/ui/sheet'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { Label } from '../../components/ui/label'
import type { CommodityRequestDetailModel } from './commodityRequests.api'
import { formatCurrency, formatDate, formatQuantity } from '../../lib/utils'

interface CommodityRequestDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request?: CommodityRequestDetailModel
}

function statusVariant(status: CommodityRequestDetailModel['status']) {
  switch (status) {
    case 'open':
      return 'default'

    case 'assigned':
      return 'secondary'

    case 'inquiry_created':
      return 'outline'

    case 'closed':
      return 'default'

    case 'cancelled':
      return 'destructive'

    default:
      return 'secondary'
  }
}

function statusLabel(status: CommodityRequestDetailModel['status']) {
  switch (status) {
    case 'open':
      return 'Open'

    case 'assigned':
      return 'Assigned'

    case 'inquiry_created':
      return 'Inquiry Created'

    case 'closed':
      return 'Closed'

    case 'cancelled':
      return 'Cancelled'

    default:
      return status
  }
}

export function CommodityRequestDetail({
  open,
  onOpenChange,
  request
}: CommodityRequestDetailProps) {
  if (!request) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2 text-2xl">
                <Package className="h-6 w-6 text-[var(--color-cobalt-600)]" />
                Commodity Request
              </SheetTitle>

              <SheetDescription className="mt-2">
                View your submitted procurement requirement.
              </SheetDescription>
            </div>

            <Badge variant={statusVariant(request.status)}>{statusLabel(request.status)}</Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Commodity */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Commodity
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Commodity</Label>

                <p className="mt-1 font-semibold">{request.categoryName}</p>
              </div>

              <div>
                <Label>Category</Label>

                <p className="mt-1">{request.categoryName}</p>
              </div>

              <div>
                <Label>Quantity</Label>

                <p className="mt-1">{formatQuantity(request.quantity, request.quantityUnit)}</p>
              </div>

              <div>
                <Label>Required Purity</Label>

                <p className="mt-1">{request.purityRequired || '—'}</p>
              </div>

              <div>
                <Label>Required Grade</Label>

                <p className="mt-1">{request.gradeRequired || '—'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Pricing Preference
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Minimum Target Price</Label>

                <p className="mt-1 font-medium">
                  {request.targetPriceMin != null
                    ? formatCurrency(request.targetPriceMin, request.currency)
                    : '—'}
                </p>
              </div>

              <div>
                <Label>Maximum Target Price</Label>

                <p className="mt-1 font-medium">
                  {request.targetPriceMax != null
                    ? formatCurrency(request.targetPriceMax, request.currency)
                    : '—'}
                </p>
              </div>
              <div>
                <Label>Currency</Label>

                <p className="mt-1 font-medium">{request.currency}</p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Delivery Requirements
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>Delivery Country</Label>

                <p className="mt-1">{request.deliveryCountry || '—'}</p>
              </div>

              <div>
                <Label>Delivery Terms</Label>

                <p className="mt-1">{request.deliveryTerms || '—'}</p>
              </div>

              <div>
                <Label>Required By</Label>

                <p className="mt-1">
                  {request.requiredByDate ? formatDate(request.requiredByDate) : '—'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Requirements */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Additional Requirements
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="rounded-lg border bg-muted/30 p-4 min-h-28 whitespace-pre-wrap leading-7">
                {request.notes?.trim()
                  ? request.notes
                  : 'No additional procurement instructions were provided.'}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Timeline
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex gap-4">
                <div className="mt-1 rounded-full bg-[var(--color-cobalt-100)] p-2">
                  <Calendar className="h-4 w-4 text-[var(--color-cobalt-600)]" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">Request Submitted</p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <div className="mt-1 rounded-full bg-[var(--color-cobalt-100)] p-2">
                  <Clock3 className="h-4 w-4 text-[var(--color-cobalt-600)]" />
                </div>

                <div className="flex-1">
                  <p className="font-medium">Last Updated</p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDate(request.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exchange Notice */}

          <div className="rounded-xl border bg-[var(--color-cobalt-50)] p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-[var(--color-cobalt-600)]" />

              <div>
                <h4 className="font-medium">Exchange Status</h4>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This procurement request has been securely received by the Exchange. Once
                  reviewed, it will automatically progress into the Inquiry Management workflow
                  where suitable suppliers will be invited to participate.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t pt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
