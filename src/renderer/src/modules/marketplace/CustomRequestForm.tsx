import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, Truck, FileText, Send, Loader2, ArrowLeft } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
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

import { commodityRequestsApi, type CommodityRequestInput } from '../commodity-requests/commodityRequests.api'
import { COMMODITY_UNITS, INCOTERMS } from '../../lib/constants'

export function CustomRequestForm() {
  const navigate = useNavigate()
  const toast = useToast()

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<CommodityRequestInput>({
    isCustomCategory: true,
    customFamilyName: '',
    customTypeName: '',
    
    quantity: 0,
    quantityUnit: 'MT',

    targetPriceMin: undefined,
    targetPriceMax: undefined,

    currency: 'USD', // Always USD

    deliveryCountry: '',
    deliveryTerms: '',
    requiredByDate: '',

    purityRequired: '',
    gradeRequired: '',
    notes: ''
  })

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

    if (!form.customFamilyName?.trim()) {
      e.customFamilyName = 'Family name is required'
    }

    if (!form.customTypeName?.trim()) {
      e.customTypeName = 'Type name is required'
    }

    if (!form.purityRequired?.trim()) {
      e.purityRequired = 'Purity is required'
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      e.quantity = 'Enter a valid quantity'
    }

    if (!form.targetPriceMax || Number(form.targetPriceMax) <= 0) {
      e.targetPriceMax = 'Target maximum price is required'
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
        toast.success('Custom commodity request submitted successfully.')
        navigate('/commodity-requests')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to submit request.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="-ml-3 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Custom Commodity</h1>
        <p className="mt-1 text-muted-foreground">
          Can't find what you need in the catalogue? Define your own commodity requirement.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-[var(--color-cobalt-200)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-[var(--color-cobalt-600)]" />
              Define Commodity
            </CardTitle>
            <CardDescription>
              Specify the family and type of the uncatalogued commodity you are looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <Label>
                Requested Family Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g. Precious Metals"
                value={form.customFamilyName || ''}
                onChange={(e) => setField('customFamilyName', e.target.value)}
              />
              {errors.customFamilyName && (
                <p className="mt-1 text-sm text-destructive">{errors.customFamilyName}</p>
              )}
            </div>
            <div>
              <Label>
                Requested Type Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g. Platinum Ingots"
                value={form.customTypeName || ''}
                onChange={(e) => setField('customTypeName', e.target.value)}
              />
              {errors.customTypeName && (
                <p className="mt-1 text-sm text-destructive">{errors.customTypeName}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procurement Requirements</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <Label>
                Required Purity <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g. min 99.9%"
                value={form.purityRequired || ''}
                onChange={(e) => setField('purityRequired', e.target.value)}
              />
              {errors.purityRequired && (
                <p className="mt-1 text-sm text-destructive">{errors.purityRequired}</p>
              )}
            </div>

            <div>
              <Label>Required Grade</Label>
              <Input
                className="mt-2"
                placeholder="e.g. Grade A"
                value={form.gradeRequired || ''}
                onChange={(e) => setField('gradeRequired', e.target.value)}
              />
            </div>

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
                  <SelectTrigger className="w-32 bg-muted/50">
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
              <Label>
                Target Price Range <span className="text-destructive">*</span>
              </Label>
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
                  placeholder="Max *"
                  value={form.targetPriceMax ?? ''}
                  onChange={(e) =>
                    setField(
                      'targetPriceMax',
                      e.target.value === '' ? undefined : Number(e.target.value)
                    )
                  }
                />
                <div className="flex w-24 items-center justify-center rounded-md border border-input bg-muted text-sm font-medium">
                  USD
                </div>
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
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <Label>Delivery Country</Label>
              <Input
                className="mt-2"
                placeholder="e.g. United Arab Emirates"
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
                </SelectContent>
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
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              rows={5}
              placeholder="Describe what you're looking for in detail..."
              value={form.notes || ''}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-32">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="w-48 bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)]"
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
    </div>
  )
}
