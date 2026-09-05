// src/renderer/src/modules/inquiries/AssignSellerModal.tsx

import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/dialog'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Badge } from '../../components/ui/badge'
import { Skeleton } from '../../components/ui/skeleton'
import {
  Building2,
  Search,
  CheckCircle2,
  Globe2,
  User,
  PackageCheck,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { adminInquiriesApi, type SellerLookupItem } from './adminInquiries.api'

interface AssignSellerModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  requestTitle: string
  buyerName: string
  quantityStr: string
  currentSellerId?: string | null
  currentSellerName?: string | null
  onSuccess: () => void
}

export function AssignSellerModal({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  buyerName,
  quantityStr,
  currentSellerId,
  onSuccess
}: AssignSellerModalProps) {
  const [search, setSearch] = useState('')
  const [sellers, setSellers] = useState<SellerLookupItem[]>([])
  const [selectedSellerId, setSelectedSellerId] = useState<string>(currentSellerId || '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSellers = useCallback(async (query = '') => {
    try {
      setLoading(true)
      const res = await adminInquiriesApi.getSellersLookup(query)
      if (res.success) {
        setSellers(res.data)
      }
    } catch (err: any) {
      console.error('Failed to load sellers', err)
      setError('Could not load sellers list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedSellerId(currentSellerId || '')
      setNotes('')
      setError(null)
      loadSellers(search)
    }
  }, [isOpen, currentSellerId, loadSellers, search])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearch(q)
    loadSellers(q)
  }

  const handleAssign = async () => {
    if (!selectedSellerId) {
      setError('Please select a seller to assign')
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const res = await adminInquiriesApi.assignSeller(requestId, {
        sellerId: selectedSellerId,
        notes: notes.trim() || undefined
      })

      if (res.success) {
        onSuccess()
        onClose()
      } else {
        setError('Failed to assign seller')
      }
    } catch (err: any) {
      setError(err?.message || 'Error assigning seller')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden border-[var(--color-slate-200)] shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[var(--color-slate-100)] bg-[var(--color-canvas-50)]">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-cobalt-50)] text-[var(--color-cobalt-600)]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-[var(--color-ink-900)]">
                Assign Seller to Enquiry
              </DialogTitle>
              <DialogDescription className="text-xs text-[var(--color-slate-500)]">
                Pair verified suppliers with <span className="font-semibold text-[var(--color-ink-900)]">{requestTitle}</span> for {buyerName} ({quantityStr})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-slate-400)]" />
            <Input
              value={search}
              onChange={handleSearchChange}
              placeholder="Search verified sellers by company name, country, or code..."
              className="pl-9 text-sm"
            />
          </div>

          {/* Seller List */}
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : sellers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--color-slate-500)]">
                No verified active sellers found matching your search.
              </div>
            ) : (
              sellers.map((seller) => {
                const isSelected = selectedSellerId === seller.id
                return (
                  <div
                    key={seller.id}
                    onClick={() => setSelectedSellerId(seller.id)}
                    className={[
                      'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                      isSelected
                        ? 'border-[var(--color-cobalt-600)] bg-[var(--color-cobalt-50)]/40 ring-1 ring-[var(--color-cobalt-600)]'
                        : 'border-[var(--color-slate-200)] bg-white hover:border-[var(--color-slate-300)] hover:bg-[var(--color-canvas-50)]'
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-xs',
                          isSelected
                            ? 'bg-[var(--color-cobalt-600)] text-white'
                            : 'bg-[var(--color-canvas-100)] text-[var(--color-slate-700)]'
                        ].join(' ')}
                      >
                        {seller.companyName.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[var(--color-ink-900)] truncate">
                            {seller.companyName}
                          </p>
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5 font-mono">
                            {seller.sellerCode || 'SELLER'}
                          </Badge>
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] py-0 px-1.5 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            KYC Verified
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--color-slate-500)]">
                          <span className="flex items-center gap-1">
                            <Globe2 className="h-3 w-3" />
                            {seller.country}
                          </span>
                          {seller.contactPerson && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {seller.contactPerson}
                            </span>
                          )}
                          {seller.monthlyCapacity ? (
                            <span className="flex items-center gap-1 font-medium text-[var(--color-ink-900)]">
                              <PackageCheck className="h-3 w-3 text-amber-600" />
                              {seller.monthlyCapacity.toLocaleString()} {seller.capacityUnit || 'MT'}/mo
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-3">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-cobalt-600)]" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-[var(--color-slate-300)]" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Handover / Sourcing Notes */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--color-slate-100)]">
            <label className="text-xs font-semibold text-[var(--color-ink-900)]">
              Assignment & Sourcing Notes (Optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide internal guidance for fulfilling this request with this supplier..."
              className="h-20 text-xs resize-none"
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-3.5 border-t border-[var(--color-slate-100)] bg-[var(--color-canvas-50)] flex items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedSellerId || submitting}
            className="bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              'Confirm Assignment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
