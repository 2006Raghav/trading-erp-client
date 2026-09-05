import { api } from '../../lib/api'

import type {
  BuyerRegistrationRequest,
  SellerRegistrationRequest,
  MandateRegistrationRequest,
  RegistrationResponse,
  RegistrationDocumentsResponse,
  RegistrationSubmitResponse,
  RegistrationStatusResponse,
  RegistrationDocumentType,
  RegistrationEntityType,
  RegistrationDocument
} from './registration.types'

const BASE_URL = import.meta.env.VITE_API_URL

interface UploadDocumentResponse {
  success: boolean
  data: RegistrationDocument
  error?: string
}

export const registrationApi = {
  // ─────────────────────────────────────────────────────────────
  // Registration
  // ─────────────────────────────────────────────────────────────

  registerBuyer(data: BuyerRegistrationRequest) {
    return api.request<RegistrationResponse>('POST', '/api/auth/register/buyer', data)
  },

  registerSeller(data: SellerRegistrationRequest) {
    return api.request<RegistrationResponse>('POST', '/api/auth/register/seller', data)
  },

  registerMandate(data: MandateRegistrationRequest) {
    return api.request<RegistrationResponse>('POST', '/api/auth/register/mandate', data)
  },

  // ─────────────────────────────────────────────────────────────
  // Registration Status (authenticated — post-login)
  // ─────────────────────────────────────────────────────────────

  getRegistrationStatus(
    entityType: RegistrationEntityType,
    entityId: string
  ): Promise<RegistrationStatusResponse> {
    return api.request<RegistrationStatusResponse>(
      'GET',
      `/api/auth/register/status?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`
    )
  },

  // ─────────────────────────────────────────────────────────────
  // Documents
  // ─────────────────────────────────────────────────────────────

  async uploadDocument(
    entityId: string,
    entityType: RegistrationEntityType,
    documentType: RegistrationDocumentType,
    file: File
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData()

    formData.append('entityId', entityId)
    formData.append('entityType', entityType)
    formData.append('documentType', documentType)
    formData.append('file', file)

    const response = await fetch(`${BASE_URL}/api/auth/register/documents`, {
      method: 'POST',
      body: formData
    })

    let payload: UploadDocumentResponse | null = null

    try {
      payload = (await response.json()) as UploadDocumentResponse
    } catch {
      throw new Error(`Document upload failed with HTTP ${response.status}`)
    }

    if (!response.ok || !payload.success) {
      throw new Error(payload.error || `Document upload failed with HTTP ${response.status}`)
    }

    return payload
  },

  getDocuments(
    entityType: RegistrationEntityType,
    entityId: string
  ): Promise<RegistrationDocumentsResponse> {
    return api.request<RegistrationDocumentsResponse>(
      'GET',
      `/api/auth/register/documents?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`
    )
  },

  // Fixed: passes entityType, entityId, and documentType as required by the backend route
  removeDocument(
    documentId: string,
    entityType: RegistrationEntityType,
    entityId: string,
    documentType: RegistrationDocumentType
  ): Promise<{ success: boolean }> {
    return api.request<{ success: boolean }>(
      'DELETE',
      `/api/auth/register/documents/${encodeURIComponent(documentId)}?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}&documentType=${encodeURIComponent(documentType)}`
    )
  },

  // ─────────────────────────────────────────────────────────────
  // Final Submission (works for first submit + resubmission)
  // ─────────────────────────────────────────────────────────────

  submitApplication(data: {
    entityId: string
    entityType: RegistrationEntityType
  }): Promise<RegistrationSubmitResponse> {
    return api.request<RegistrationSubmitResponse>('POST', '/api/auth/register/submit', data)
  }
}
