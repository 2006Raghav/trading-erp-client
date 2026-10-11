// src/modules/commodity-requests/CommodityRequestSheet.tsx

import { useEffect, useState } from 'react'
import { Package, Truck, FileText, ShieldCheck, Send, Loader2 } from 'lucide-react'
import { COMMODITY_UNITS, CURRENCIES, INCOTERMS } from '../../lib/constants'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '../../components/ui/sheet'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import { Separator } from '../../components/ui/separator'

import { useToast } from '../auth/ToastContext'

import { commodityRequestsApi, type CommodityRequestInput } from './commodityRequests.api'

import type { CommodityRequestPrefill, MarketplaceCategory } from '../marketplace/marketplace.api'

interface CommodityRequestSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: MarketplaceCategory[]

  product?: CommodityRequestPrefill

  onSuccess?: () => void
}
export function CommodityRequestSheet({
  open,
  onOpenChange,
  categories,
  product,
  onSuccess
}: CommodityRequestSheetProps) {
  const toast = useToast()

  const [saving, setSaving] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<CommodityRequestInput>({
    categoryId: product?.categoryId ?? '',

    quantity: 0,
    quantityUnit: product?.quantityUnit ?? 'MT',

    targetPriceMin: undefined,
    targetPriceMax: undefined,

    currency: product?.currency ?? 'USD',

    deliveryCountry: '',
    deliveryTerms: '',

    requiredByDate: '',

    purityRequired: product?.purity ?? '',
    gradeRequired: product?.grade ?? '',

    notes: ''
  })

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [types, setTypes] = useState<any[]>([])
  const [typesLoading, setTypesLoading] = useState(false)

  useEffect(() => {
    if (!selectedCategoryId) {
      setTypes([])
      return
    }
    
    setTypesLoading(true)
    // We need to fetch from marketplaceApi.getTypesByCategory
    import('../marketplace/marketplace.api').then(({ marketplaceApi }) => {
      marketplaceApi.getTypesByCategory(selectedCategoryId)
        .then(res => {
          if (res.success) setTypes(res.data)
        })
        .finally(() => setTypesLoading(false))
    })
  }, [selectedCategoryId])

  useEffect(() => {
    if (!product) return

    setForm((prev) => ({
      ...prev,
      categoryId: product.categoryId ?? '',
      quantityUnit: product.quantityUnit,
      purityRequired: product.purity,
      gradeRequired: product.grade,
      currency: product.currency ?? 'USD'
    }))
  }, [product])

  function setField<K extends keyof CommodityRequestInput>(
    key: K,
    value: CommodityRequestInput[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }))

    if (errors[key]) {
      setErrors((prev) => {
        const e = { ...prev }
        delete e[key]
        return e
      })
    }
  }

  function validate() {
    const e: Record<string, string> = {}

    if (!form.categoryId) {
      e.categoryId = 'Commodity is required'
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      e.quantity = 'Enter a valid quantity'
    }

    if (
      form.targetPriceMin !== undefined &&
      form.targetPriceMax !== undefined &&
      form.targetPriceMin > form.targetPriceMax
    ) {
      e.targetPriceMax = 'Maximum price must be greater than minimum price'
    }

    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validation = validate()

    if (Object.keys(validation).length) {
      setErrors(validation)
      return
    }

    setSaving(true)

    try {
      const res = await commodityRequestsApi.create(form)

      if (res.success) {
        toast.success('Commodity request submitted successfully.')

        onSuccess?.()

        onOpenChange(false)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to submit request.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setErrors({})
      setSaving(false)
      setSelectedCategoryId('')
      setTypes([])

      setForm({
        categoryId: product?.categoryId ?? '',
        quantity: 0,
        quantityUnit: product?.quantityUnit ?? 'MT',
        targetPriceMin: undefined,
        targetPriceMax: undefined,
        currency: product?.currency ?? 'USD',
        deliveryCountry: '',
        deliveryTerms: '',
        requiredByDate: '',
        purityRequired: product?.purity ?? '',
        gradeRequired: product?.grade ?? '',
        notes: ''
      })
    }
  }, [open, product])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader className="space-y-2 border-b pb-6">
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <Package className="h-6 w-6 text-[var(--color-cobalt-600)]" />
            Request Commodity
          </SheetTitle>

          <SheetDescription>
            Submit your procurement requirement to the Exchange. Your request will later be
            connected to the Inquiry module where suppliers can respond.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {product && (
            <Card className="border-[var(--color-cobalt-100)] bg-[var(--color-cobalt-50)]/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                  Selected Commodity
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>Commodity</Label>

                  <p className="mt-1 font-semibold">{product.productName}</p>
                </div>

                <div>
                  <Label>Category</Label>

                  <p className="mt-1 font-semibold">{product.categoryName}</p>
                </div>

                <div>
                  <Label>Purity</Label>

                  <p className="mt-1">{product.purity || '—'}</p>
                </div>

                <div>
                  <Label>Grade</Label>

                  <p className="mt-1">{product.grade || '—'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!product && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                  Commodity
                </CardTitle>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label>
                    Commodity Category <span className="text-destructive">*</span>
                  </Label>

                  <Select
                    value={selectedCategoryId}
                    onValueChange={(value) => {
                      setSelectedCategoryId(value)
                      setField('categoryId', '') // reset type
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select commodity category" />
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
                  <Label>
                    Commodity Type <span className="text-destructive">*</span>
                  </Label>

                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => setField('categoryId', value)}
                    disabled={!selectedCategoryId || typesLoading}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={typesLoading ? "Loading..." : "Select commodity type"} />
                    </SelectTrigger>

                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-destructive">{errors.categoryId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Procurement Requirements
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-5 md:grid-cols-2">
              <div>
                <Label>
                  Quantity <span className="text-destructive">*</span>
                </Label>

                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={form.quantity || ''}
                    onChange={(e) => setField('quantity', Number(e.target.value))}
                  />

                  <Select
                    value={form.quantityUnit}
                    onValueChange={(value) => setField('quantityUnit', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {COMMODITY_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {errors.quantity && (
                  <p className="mt-1 text-sm text-destructive">{errors.quantity}</p>
                )}
              </div>

              <div>
                <Label>Required Purity</Label>

                <Input
                  className="mt-2"
                  placeholder="99.99%"
                  value={form.purityRequired || ''}
                  onChange={(e) => setField('purityRequired', e.target.value)}
                />
              </div>
              <div>
                <Label>Required Grade</Label>

                <Input
                  className="mt-2"
                  placeholder="LME Grade A"
                  value={form.gradeRequired || ''}
                  onChange={(e) => setField('gradeRequired', e.target.value)}
                />
              </div>

              <div>
                <Label>Target Price Range</Label>

                <div className="mt-2 flex gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={0.0001}
                    placeholder="Min"
                    value={form.targetPriceMin ?? ''}
                    onChange={(e) =>
                      setField(
                        'targetPriceMin',
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                  />

                  <Input
                    type="number"
                    min={0}
                    step={0.0001}
                    placeholder="Max"
                    value={form.targetPriceMax ?? ''}
                    onChange={(e) =>
                      setField(
                        'targetPriceMax',
                        e.target.value === '' ? undefined : Number(e.target.value)
                      )
                    }
                  />

                  <Select
                    value={form.currency}
                    onValueChange={(value) => setField('currency', value)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {errors.targetPriceMax && (
                  <p className="mt-1 text-sm text-destructive">{errors.targetPriceMax}</p>
                )}
              </div>
            </CardContent>
          </Card>

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

                <Input
                  className="mt-2"
                  placeholder="United Arab Emirates"
                  value={form.deliveryCountry || ''}
                  onChange={(e) => setField('deliveryCountry', e.target.value)}
                />
              </div>

              <div>
                <Label>Delivery Terms</Label>

                <Select
                  value={form.deliveryTerms || ''}
                  onValueChange={(value) => setField('deliveryTerms', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Incoterm" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCOTERMS.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>{' '}
                </Select>
              </div>

              <div>
                <Label>Required By</Label>

                <Input
                  className="mt-2"
                  type="date"
                  value={form.requiredByDate || ''}
                  onChange={(e) => setField('requiredByDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                Additional Requirements
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Textarea
                rows={6}
                placeholder="Mention packaging requirements, certifications, inspection agency, preferred loading port, payment terms or any additional procurement instructions."
                value={form.notes || ''}
                onChange={(e) => setField('notes', e.target.value)}
              />
            </CardContent>
          </Card>

          <Separator />

          <div className="rounded-xl border bg-[var(--color-cobalt-50)] p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--color-cobalt-600)]" />

              <div className="space-y-1">
                <h4 className="font-medium">What happens next?</h4>

                <p className="text-sm text-muted-foreground leading-6">
                  Your request will be submitted to the Exchange team. After review, it will
                  automatically enter the Inquiry Management workflow where suitable suppliers can
                  be matched with your procurement requirement.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="min-w-44 bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
