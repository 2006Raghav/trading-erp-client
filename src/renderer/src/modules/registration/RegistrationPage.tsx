import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  Building2,
  ShoppingBag,
  Handshake,
  ChevronRight,
  ShieldCheck,
  Globe2,
  FileCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2
} from 'lucide-react'

import { registrationApi } from './registration.api'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../auth/ToastContext'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../components/ui/select'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../../components/ui/form'

import { RegistrationDocuments, type RequiredDocument } from './RegistrationDocuments'

import type {
  RegistrationDocument,
  RegistrationDocumentType,
  RegistrationEntityType,
  PendingDocument
} from './registration.types'

type RegistrationType = RegistrationEntityType
type Step = 1 | 2 | 3

const DOCUMENTS: Record<RegistrationType, readonly RequiredDocument[]> = {
  buyer: [
    {
      type: 'passport_copy',
      label: 'Passport (Authorized Representative)'
    },
    {
      type: 'company_registration',
      label: 'Company Registration Certificate'
    },
    {
      type: 'incorporation_doc',
      label: 'Company Incorporation Document'
    },
    {
      type: 'export_license',
      label: 'Export License'
    },
    {
      type: 'trade_license',
      label: 'Trade License'
    },
    {
      type: 'bank_reference',
      label: 'Bank Reference Letter'
    }
  ],

  seller: [
    {
      type: 'passport_copy',
      label: 'Passport (Authorized Representative)'
    },
    {
      type: 'company_registration',
      label: 'Company Registration Certificate'
    },
    {
      type: 'incorporation_doc',
      label: 'Company Incorporation Document'
    },
    {
      type: 'export_license',
      label: 'Export License'
    },
    {
      type: 'trade_license',
      label: 'Trade License'
    },
    {
      type: 'bank_reference',
      label: 'Bank Reference Letter'
    },
    {
      type: 'analytical_reports',
      label: 'Analytical Report(s)'
    },
    {
      type: 'past_trade_records',
      label: 'Past Trade Records'
    },
    {
      type: 'availability_statement',
      label: 'Goods Availability Statement'
    }
  ],

  mandate: [
    {
      type: 'passport_copy',
      label: 'Passport (Authorized Representative)'
    },
    {
      type: 'company_registration',
      label: 'Company Registration Certificate'
    },
    {
      type: 'incorporation_doc',
      label: 'Company Incorporation Document'
    },
    {
      type: 'export_license',
      label: 'Export License'
    },
    {
      type: 'trade_license',
      label: 'Trade License'
    },
    {
      type: 'bank_reference',
      label: 'Bank Reference Letter'
    },
    {
      type: 'representation_agreement',
      label: 'Representation Agreement'
    }
  ]
} as const

const schema = z
  .object({
    registrationType: z.enum(['buyer', 'seller', 'mandate']),

    companyName: z.string().min(2, 'Company name is required'),

    country: z.string().min(2, 'Country is required'),

    companyRegistrationNo: z.string().min(2, 'Company registration number is required'),

    tradeLicenseNo: z.string().min(2, 'Trade license number is required'),

    exportLicenseNo: z.string().min(2, 'Export license number is required'),

    contactPerson: z.string().min(2, 'Contact person is required'),

    email: z.string().email('A valid business email is required'),

    phone: z.string().min(5, 'Phone number is required'),

    whatsapp: z.string().optional(),

    password: z.string().min(8, 'Password must be at least 8 characters'),

    confirmPassword: z.string().min(8, 'Please confirm your password'),

    businessType: z.string().optional(),

    annualPurchaseCapacity: z.coerce.number().optional(),

    factoryAddress: z.string().optional(),

    warehouseAddress: z.string().optional(),

    monthlyProductionCapacity: z.coerce.number().optional(),

    bankName: z.string().optional(),

    bankAccountNo: z.string().optional(),

    bankSwiftCode: z.string().optional(),

    bankIban: z.string().optional(),

    bankCountry: z.string().optional(),

    represents: z.enum(['buyer_side', 'seller_side']).optional(),

    description: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match'
      })
    }

    if (data.registrationType === 'buyer' && !data.businessType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessType'],
        message: 'Business type is required'
      })
    }

    if (data.registrationType === 'seller') {
      if (!data.factoryAddress?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['factoryAddress'],
          message: 'Factory address is required'
        })
      }

      if (
        data.monthlyProductionCapacity === undefined ||
        Number.isNaN(data.monthlyProductionCapacity) ||
        data.monthlyProductionCapacity <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['monthlyProductionCapacity'],
          message: 'Monthly production capacity is required'
        })
      }

      if (!data.bankName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankName'],
          message: 'Bank name is required'
        })
      }

      if (!data.bankAccountNo?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountNo'],
          message: 'Bank account number is required'
        })
      }

      if (!data.bankSwiftCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankSwiftCode'],
          message: 'SWIFT / BIC code is required'
        })
      }

      if (!data.bankCountry?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankCountry'],
          message: 'Bank country is required'
        })
      }
    }

    if (data.registrationType === 'mandate' && !data.represents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['represents'],
        message: 'Select which side you represent'
      })
    }
  })

type RegistrationForm = z.infer<typeof schema>

const TYPE_META = {
  buyer: {
    label: 'Buyer',
    description: 'Purchase commodities for your organization.',
    icon: ShoppingBag
  },

  seller: {
    label: 'Seller',
    description: 'Supply commodities to verified buyers.',
    icon: Building2
  },

  mandate: {
    label: 'Mandate',
    description: 'Represent buyers or sellers in commodity transactions.',
    icon: Handshake
  }
} as const

export function RegistrationPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { login } = useAuth()

  const [step, setStep] = useState<Step>(1)

  const [registrationType, setRegistrationType] = useState<RegistrationType>('buyer')

  const [entityId, setEntityId] = useState<string | null>(null)

  const [documents, setDocuments] = useState<(RegistrationDocument | any)>([])

  const [uploading, setUploading] = useState<RegistrationDocumentType | null>(null)

  const [submitting, setSubmitting] = useState(false)

  const [registrationData, setRegistrationData] = useState<RegistrationForm | null>(null)

  const [showPassword, setShowPassword] = useState(false)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(schema) as any,

    defaultValues: {
      registrationType: 'buyer',

      companyName: '',
      country: '',
      companyRegistrationNo: '',
      tradeLicenseNo: '',
      exportLicenseNo: '',

      contactPerson: '',
      email: '',
      phone: '',
      whatsapp: '',

      password: '',
      confirmPassword: '',

      businessType: '',
      annualPurchaseCapacity: undefined,

      factoryAddress: '',
      warehouseAddress: '',
      monthlyProductionCapacity: undefined,

      bankName: '',
      bankAccountNo: '',
      bankSwiftCode: '',
      bankIban: '',
      bankCountry: '',

      represents: undefined,
      description: ''
    }
  })

  const businessOptions = useMemo(
    () => [
      'Importer',
      'Trading Company',
      'Industrial Consumer',
      'Manufacturer',
      'Distributor',
      'End User',
      'Other'
    ],
    []
  )

  const requiredDocuments = DOCUMENTS[registrationType]

  const uploadedTypes = new Set(documents.map((document) => document.documentType))

  const allRequiredUploaded = requiredDocuments.every((document) =>
    uploadedTypes.has(document.type)
  )

  function changeRegistrationType(type: RegistrationType) {
    setRegistrationType(type)

    form.setValue('registrationType', type)

    form.clearErrors()
  }

  async function continueToDocuments(values: RegistrationForm) {
    if (entityId) {
      setStep(2)
      return
    }
    
    // Save the registration data but defer the API call until submission
    setRegistrationData(values)
    setStep(2)
  }

  async function handleFileUpload(documentType: RegistrationDocumentType, file: File) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Use PDF, JPG, PNG, or DOCX files')
      return
    }

    if (!Number.isFinite(file.size) || file.size <= 0 || file.size > 20 * 1024 * 1024) {
      toast.error('File size must be greater than 0 and must not exceed 20MB')
      return
    }

    const newPendingDoc: PendingDocument = {
      id: crypto.randomUUID(),
      documentType,
      file
    }

    setDocuments((current) => {
      const isMultiFile =
        documentType === 'analytical_reports' || documentType === 'past_trade_records'

      if (isMultiFile) {
        return [...current, newPendingDoc]
      }

      return [
        ...current.filter((document) => document.documentType !== documentType),
        newPendingDoc
      ]
    })
  }

  async function handleRemoveDocument(document: RegistrationDocument | any) {
    if ('file' in document) {
      // Local pending document
      setDocuments((current) => current.filter((item) => item.id !== document.id))
      return
    }
    
    if (!entityId) return

    try {
      const response = await registrationApi.removeDocument(
        document.id,
        registrationType,
        entityId,
        document.documentType
      )

      if (!response.success) {
        throw new Error('Could not remove document')
      }

      setDocuments((current) => current.filter((item) => item.id !== document.id))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not remove document')
    }
  }

  async function handleSubmitApplication() {
    if (!registrationData && !entityId) {
      toast.error('Registration data is missing')
      return
    }

    if (!allRequiredUploaded) {
      toast.error('Upload all required documents before submitting')
      return
    }

    try {
      setSubmitting(true)

      let currentEntityId = entityId

      // 1. Create the entity if it hasn't been created yet
      if (!currentEntityId && registrationData) {
        let response
        
        const base = {
          companyName: registrationData.companyName,
          country: registrationData.country,
          companyRegistrationNo: registrationData.companyRegistrationNo,
          tradeLicenseNo: registrationData.tradeLicenseNo,
          exportLicenseNo: registrationData.exportLicenseNo,
          contactPerson: registrationData.contactPerson,
          email: registrationData.email,
          phone: registrationData.phone,
          whatsapp: registrationData.whatsapp,
          password: registrationData.password,
          confirmPassword: registrationData.confirmPassword
        }

        if (registrationType === 'buyer') {
          response = await registrationApi.registerBuyer({
            ...base,
            businessType: registrationData.businessType,
            annualPurchaseCapacity: registrationData.annualPurchaseCapacity
          })
        }

        if (registrationType === 'seller') {
          response = await registrationApi.registerSeller({
            ...base,
            factoryAddress: registrationData.factoryAddress!,
            warehouseAddress: registrationData.warehouseAddress,
            monthlyProductionCapacity: registrationData.monthlyProductionCapacity!,
            bankName: registrationData.bankName!,
            bankAccountNo: registrationData.bankAccountNo!,
            bankSwiftCode: registrationData.bankSwiftCode!,
            bankIban: registrationData.bankIban,
            bankCountry: registrationData.bankCountry!
          })
        }

        if (registrationType === 'mandate') {
          response = await registrationApi.registerMandate({
            ...base,
            represents: registrationData.represents!,
            description: registrationData.description
          })
        }

        if (!response?.success || !response.data?.id) {
          throw new Error('Registration could not be created')
        }
        
        currentEntityId = response.data.id
        setEntityId(currentEntityId)
      }

      if (!currentEntityId) {
        throw new Error('Entity ID missing after registration')
      }

      // 2. Upload all pending documents sequentially
      const pendingDocs = documents.filter((doc): doc is any => 'file' in doc)
      
      for (const pendingDoc of pendingDocs) {
        setUploading(pendingDoc.documentType)
        const response = await registrationApi.uploadDocument(
          currentEntityId,
          registrationType,
          pendingDoc.documentType,
          pendingDoc.file
        )
        
        if (!response.success) {
          throw new Error(`Failed to upload ${pendingDoc.file.name}: ${response.error || 'Unknown error'}`)
        }
      }
      setUploading(null)

      // 3. Submit application
      const submitResponse = await registrationApi.submitApplication({
        entityId: currentEntityId,
        entityType: registrationType
      })

      if (!submitResponse.success) {
        throw new Error('Application could not be submitted')
      }

      // Auto-login after successful registration
      if (registrationData?.email && registrationData?.password) {
        const loginRes = await login(registrationData.email, registrationData.password)
        if (loginRes.success) {
          navigate('/kyc-status')
          return
        }
      }

      // Fallback if login fails for some reason
      setStep(3)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Application could not be submitted')
    } finally {
      setSubmitting(false)
      setUploading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas-50)] text-[var(--color-ink-900)]">
      <div className="grid min-h-screen lg:grid-cols-[360px_1fr]">
        {/* LEFT BRAND PANEL */}

        <aside className="hidden bg-[var(--color-navy-950)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-cobalt-600)]">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <div className="text-[15px] font-semibold">Commodity ERP</div>

                <div className="text-xs text-[var(--color-slate-300)]">Global Trade Exchange</div>
              </div>
            </div>

            <div className="mt-16">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-cobalt-600)]">
                Secure onboarding
              </p>

              <h1 className="mt-3 text-3xl font-semibold leading-tight">
                Join the verified commodity exchange.
              </h1>

              <p className="mt-5 text-sm leading-6 text-[var(--color-slate-300)]">
                Register your organization, provide the required KYC documents, and submit your
                application for verification.
              </p>
            </div>

            <div className="mt-14 space-y-7">
              <TrustPoint
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Verified companies"
                text="Every external organization completes KYC before marketplace access."
              />

              <TrustPoint
                icon={<Globe2 className="h-5 w-5" />}
                title="Global trade"
                text="Connect through a controlled exchange network built for physical commodities."
              />

              <TrustPoint
                icon={<FileCheck className="h-5 w-5" />}
                title="Document-led approval"
                text="Required documents are reviewed by the exchange team before activation."
              />
            </div>
          </div>

          <p className="text-xs text-[var(--color-slate-500)]">
            © {new Date().getFullYear()} Commodity ERP
          </p>
        </aside>

        {/* MAIN */}

        <main className="overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
            {/* HEADER */}

            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-cobalt-600)]">
                  Company registration
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Create your company account
                </h2>

                <p className="mt-2 text-sm text-[var(--color-slate-500)]">
                  Already registered?
                  <Link
                    to="/login"
                    className="ml-1 font-semibold text-[var(--color-cobalt-600)] hover:text-[var(--color-cobalt-700)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cobalt-600)] focus:ring-offset-2"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* STEP INDICATOR */}

            <StepIndicator step={step} />

            {/* TYPE SELECTOR */}

            {step !== 3 && (
              <div className="mt-8">
                <Label className="text-[11px] uppercase tracking-[0.08em] text-[var(--color-slate-500)]">
                  Registration type
                </Label>

                <Tabs
                  value={registrationType}
                  onValueChange={(value) => changeRegistrationType(value as RegistrationType)}
                  className="mt-3"
                >
                  <TabsList className="grid h-auto grid-cols-3 rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] p-1">
                    {(Object.keys(TYPE_META) as RegistrationType[]).map((type) => {
                      const meta = TYPE_META[type]

                      const Icon = meta.icon

                      return (
                        <TabsTrigger
                          key={type}
                          value={type}
                          disabled={step !== 1}
                          className="min-h-[64px] gap-2 rounded-md text-sm text-[var(--text-secondary)] data-[state=active]:bg-[var(--action-tint)] data-[state=active]:text-[var(--action-hover)]"
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.7} />

                          <span className="hidden sm:inline">{meta.label}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </Tabs>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  {TYPE_META[registrationType].description}
                </p>
              </div>
            )}

            {/* CONTENT CARD */}

            <Card className="mt-6 border-[var(--border)] shadow-sm">
              <CardContent className="p-6 sm:p-8">
                {/* STEP 1 */}

                {step === 1 && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(continueToDocuments as any)} className="space-y-8">
                      {/* COMPANY */}

                      <FormSection
                        title="Company information"
                        description="Provide the legal identity of your organization."
                      >
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field
                            control={form.control as any}
                            name="companyName"
                            label="Company Name"
                            placeholder="Acme Trading Ltd"
                          />

                          <Field
                            control={form.control as any}
                            name="country"
                            label="Country"
                            placeholder="India"
                          />

                          <Field
                            control={form.control as any}
                            name="companyRegistrationNo"
                            label="Company Registration Number"
                            placeholder="REG-001234"
                          />

                          <Field
                            control={form.control as any}
                            name="tradeLicenseNo"
                            label="Trade License Number"
                            placeholder="TL-001234"
                          />

                          <Field
                            control={form.control as any}
                            name="exportLicenseNo"
                            label="Export License Number"
                            placeholder="EL-001234"
                          />
                        </div>
                      </FormSection>

                      {/* CONTACT */}

                      <FormSection
                        title="Contact information"
                        description="These details will be used for account communication."
                      >
                        <div className="grid gap-5 md:grid-cols-2">
                          <Field
                            control={form.control as any}
                            name="contactPerson"
                            label="Contact Person Full Name"
                            placeholder="John Anderson"
                          />

                          <Field
                            control={form.control as any}
                            name="email"
                            label="Business Email"
                            type="email"
                            placeholder="john@company.com"
                          />

                          <Field
                            control={form.control as any}
                            name="phone"
                            label="Phone Number"
                            placeholder="+91 9876543210"
                          />

                          <Field
                            control={form.control as any}
                            name="whatsapp"
                            label="WhatsApp Number"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </FormSection>

                      {/* BUYER */}

                      {registrationType === 'buyer' && (
                        <FormSection
                          title="Buyer details"
                          description="Tell us how your organization purchases commodities."
                        >
                          <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                              control={form.control as any}
                              name="businessType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-[var(--color-slate-500)]">
                                    Business Type
                                  </FormLabel>

                                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select business type" />
                                      </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                      {businessOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Field
                              control={form.control as any}
                              name="annualPurchaseCapacity"
                              label="Annual Purchase Capacity"
                              type="number"
                              placeholder="0"
                            />
                          </div>
                        </FormSection>
                      )}

                      {/* SELLER */}

                      {registrationType === 'seller' && (
                        <>
                          <FormSection
                            title="Operational details"
                            description="Provide your production and storage information."
                          >
                            <div className="grid gap-5 md:grid-cols-2">
                              <Field
                                control={form.control as any}
                                name="factoryAddress"
                                label="Factory Address"
                                placeholder="Factory address"
                              />

                              <Field
                                control={form.control as any}
                                name="warehouseAddress"
                                label="Warehouse Address"
                                placeholder="Warehouse address"
                              />

                              <Field
                                control={form.control as any}
                                name="monthlyProductionCapacity"
                                label="Monthly Production Capacity (MT)"
                                type="number"
                                placeholder="0"
                              />
                            </div>
                          </FormSection>

                          <FormSection
                            title="Banking details"
                            description="Banking information required for verification."
                          >
                            <div className="grid gap-5 md:grid-cols-2">
                              <Field
                                control={form.control as any}
                                name="bankName"
                                label="Bank Name"
                                placeholder="Bank name"
                              />

                              <Field
                                control={form.control as any}
                                name="bankAccountNo"
                                label="Bank Account Number"
                                placeholder="Account number"
                              />

                              <Field
                                control={form.control as any}
                                name="bankSwiftCode"
                                label="SWIFT / BIC Code"
                                placeholder="SWIFTBIC"
                              />

                              <Field
                                control={form.control as any}
                                name="bankIban"
                                label="IBAN"
                                placeholder="IBAN"
                              />

                              <Field
                                control={form.control as any}
                                name="bankCountry"
                                label="Bank Country"
                                placeholder="India"
                              />
                            </div>
                          </FormSection>
                        </>
                      )}

                      {/* MANDATE */}

                      {registrationType === 'mandate' && (
                        <FormSection
                          title="Mandate details"
                          description="Tell us which side of the transaction you represent."
                        >
                          <div className="space-y-5">
                            <FormField
                              control={form.control as any}
                              name="represents"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-[var(--color-slate-500)]">
                                    Represents
                                  </FormLabel>

                                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select representation side" />
                                      </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                      <SelectItem value="buyer_side">Buyer Side</SelectItem>

                                      <SelectItem value="seller_side">Seller Side</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control as any}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs text-[var(--color-slate-500)]">
                                    Brief Description of Mandate
                                  </FormLabel>

                                  <FormControl>
                                    <textarea
                                      {...field}
                                      rows={4}
                                      placeholder="Describe the parties, commodities, territories, or transaction scope you represent."
                                      className="flex w-full rounded-md border border-[var(--border)] bg-[var(--bg-canvas)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm transition-colors placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action-tint-strong)]"
                                    />
                                  </FormControl>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </FormSection>
                      )}

                      {/* ACCOUNT */}

                      <FormSection
                        title="Account security"
                        description="Your email address will be used to sign in after approval."
                      >
                        <div className="grid gap-5 md:grid-cols-2">
                          <PasswordField
                            control={form.control as any}
                            name="password"
                            label="Password"
                            show={showPassword}
                            onToggle={() => setShowPassword((current) => !current)}
                          />

                          <PasswordField
                            control={form.control as any}
                            name="confirmPassword"
                            label="Confirm Password"
                            show={showConfirmPassword}
                            onToggle={() => setShowConfirmPassword((current) => !current)}
                          />
                        </div>
                      </FormSection>

                      {/* ACTION */}

                      <div className="flex justify-end border-t border-[var(--border)] pt-6">
                        <Button
                          type="submit"
                          disabled={submitting}
                          className="h-11 rounded-md bg-[var(--action)] px-6 font-semibold text-white hover:bg-[var(--action-hover)] focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating profile
                            </>
                          ) : (
                            <>
                              Continue to Documents
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                )}

                {/* STEP 2 */}

                {step === 2 && (
                  <RegistrationDocuments
                    registrationType={registrationType}
                    documents={documents as any}
                    requiredDocuments={requiredDocuments}
                    uploading={uploading}
                    allRequiredUploaded={allRequiredUploaded}
                    onUpload={handleFileUpload}
                    onRemove={handleRemoveDocument}
                    onBack={() => setStep(1)}
                    onSubmit={handleSubmitApplication}
                    submitting={submitting}
                  />
                )}

                {/* STEP 3 */}

                {step === 3 && (
                  <ConfirmationStep
                    email={form.getValues('email')}
                    onStatus={() => navigate('/exchange/status')}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SUBCOMPONENTS                                                              */
/* -------------------------------------------------------------------------- */

function TrustPoint({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[var(--color-cobalt-600)]">{icon}</div>

      <div>
        <h3 className="text-sm font-semibold">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-[var(--color-slate-300)]">{text}</p>
      </div>
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    ['Profile', 'Company information'],
    ['Documents', 'KYC verification'],
    ['Confirmation', 'Application received']
  ]

  return (
    <div className="mt-8 grid grid-cols-3">
      {steps.map(([title, description], index) => {
        const number = index + 1

        const active = number === step

        const completed = number < step

        return (
          <div key={title} className="relative">
            {index !== 0 && (
              <div
                className={`absolute left-0 right-1/2 top-4 -translate-x-1/2 border-t ${
                  completed ? 'border-[var(--action)]' : 'border-[var(--border)]'
                }`}
              />
            )}

            <div className="relative flex flex-col items-center text-center">
              <div
                className={[
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',

                  completed
                    ? 'border-[var(--action)] bg-[var(--action)] text-white'
                    : active
                      ? 'border-[var(--action)] bg-[var(--action-tint)] text-[var(--action-hover)]'
                      : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]'
                ].join(' ')}
              >
                {completed ? <CheckCircle2 className="h-4 w-4" /> : number}
              </div>

              <span
                className={`mt-2 text-xs font-semibold ${
                  active || completed
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                {title}
              </span>

              <span className="mt-0.5 hidden text-[10px] text-[var(--text-secondary)] sm:block">
                {description}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FormSection({
  title,
  description,
  children
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>

      {children}
    </section>
  )
}

function Field({
  control,
  name,
  label,
  placeholder,
  type = 'text'
}: {
  control: any
  name: string
  label: string
  placeholder?: string
  type?: string
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel className="text-xs text-[var(--text-secondary)]">{label}</FormLabel>

          <FormControl>
            <Input
              {...field}
              type={type}
              value={field.value ?? ''}
              placeholder={placeholder}
              className="border-[var(--border)] focus-visible:border-[var(--action)] focus-visible:ring-[var(--action-tint)]"
            />
          </FormControl>

          <FormMessage className="text-xs text-[var(--danger-text)]" />
        </FormItem>
      )}
    />
  )
}

function PasswordField({
  control,
  name,
  label,
  show,
  onToggle
}: {
  control: any
  name: string
  label: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }: any) => (
        <FormItem>
          <FormLabel className="text-xs text-[var(--text-secondary)]">{label}</FormLabel>

          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={show ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                className="border-[var(--border)] pr-10 focus-visible:border-[var(--action)] focus-visible:ring-[var(--action-tint)]"
              />

              <button
                type="button"
                onClick={onToggle}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--action)]"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FormControl>

          <FormMessage className="text-xs text-[var(--danger-text)]" />
        </FormItem>
      )}
    />
  )
}

function ConfirmationStep({ email, onStatus }: { email: string; onStatus: () => void }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success-text)]">
        <CheckCircle2 className="h-7 w-7" />
      </div>

      <h3 className="mt-6 text-2xl font-semibold text-[var(--text-primary)]">Application Received</h3>

      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--text-secondary)]">
        Your registration is under review. We typically respond within 1–2 business days.
      </p>

      {email && (
        <p className="mt-3 text-sm text-[var(--text-primary)]">
          You will be contacted at <span className="font-semibold">{email}</span>.
        </p>
      )}

      <div className="mt-8">
        <Button
          type="button"
          onClick={onStatus}
          className="bg-[var(--action)] text-white hover:bg-[var(--action-hover)]"
        >
          Check Application Status
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <p className="mt-6 text-xs text-[var(--text-secondary)]">
        Your account remains inactive until KYC approval.
      </p>
    </div>
  )
}
