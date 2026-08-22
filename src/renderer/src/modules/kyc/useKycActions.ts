// src/renderer/src/modules/kyc/kycAction.ts

import { useState } from 'react'
import { useToast } from '../auth/ToastContext'
import { executeKycAction } from './kyc.api'
import type { KycAction, KycEntity } from './kyc.types'

export function useKycActions(onSuccess?: () => void) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const execute = async (
    entity: KycEntity,
    id: string,
    action: KycAction,
    reason?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await executeKycAction(action, entity, id, reason)

      if (!response?.success) {
        throw new Error('KYC action failed.')
      }

      toast.success(
        action === 'review'
          ? 'Application moved to review.'
          : action === 'approve'
            ? 'Application approved.'
            : 'Application rejected.'
      )

      onSuccess?.()

      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update KYC application.')

      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    execute,
    isLoading,
    handleKycAction: execute,
    isActionLoading: isLoading
  }
}

export const useKycAction = useKycActions
