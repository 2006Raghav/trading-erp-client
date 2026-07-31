import { useState } from 'react'
import { useToast } from '../auth/ToastContext'
import { kycApi, type KycEntity } from './kyc.api'

export function useKycActions(onSuccessRefresh: () => void) {
  const toast = useToast()
  const [isActionLoading, setIsActionLoading] = useState(false)

  const handleKycAction = async (
    entity: KycEntity,
    id: string,
    action: 'review' | 'approve' | 'reject',
    rejectionReason?: string // Make reason an optional parameter
  ) => {
    try {
      setIsActionLoading(true)
      let res

      if (action === 'review') {
        res = await kycApi.moveToReview(entity, id)
      } else if (action === 'approve') {
        res = await kycApi.approve(entity, id)
      } else if (action === 'reject' && rejectionReason) {
        res = await kycApi.reject(entity, id, rejectionReason)
      }

      if (res?.success) {
        toast.success(`Application successfully ${action}d`)
        onSuccessRefresh()
      }
      return true // Return true on success so the UI knows it can close the modal
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} application`)
      return false
    } finally {
      setIsActionLoading(false)
    }
  }

  return { handleKycAction, isActionLoading }
}
