import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import {
  Building2,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Globe2,
  FileCheck,
  Eye,
  EyeOff
} from 'lucide-react'

import { registrationApi } from './registration.api'
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

type RegistrationType = 'buyer' | 'seller'

// FIXED: Added clear error messages and conditional superRefine to prevent silent failures
const schema = z
  .object({
    registrationType: z.enum(['buyer', 'seller']),
    companyName: z.string().min(2, 'Company name is required'),
    companyRegistrationNumber: z.string().min(2, 'Registration number is required'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    email: z.string().email('A valid business email is required'),
    phone: z.string().min(5, 'Phone number is required'),
    country: z.string().min(2, 'Country is required'),
    businessType: z.string().optional(),
    productionFocus: z.array(z.string()).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  })
  .superRefine((data, ctx) => {
    // Force validation on conditional fields so the form doesn't fail silently
    if (data.registrationType === 'buyer' && !data.businessType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Business type is required for buyers',
        path: ['businessType']
      })
    }
    if (
      data.registrationType === 'seller' &&
      (!data.productionFocus || data.productionFocus.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Production focus is required for sellers',
        path: ['productionFocus']
      })
    }
  })

type RegistrationForm = z.infer<typeof schema>

export function RegistrationPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      registrationType: 'buyer',
      companyName: '',
      companyRegistrationNumber: '',
      contactPerson: '',
      email: '',
      phone: '',
      country: '',
      businessType: '',
      productionFocus: [],
      password: '',
      confirmPassword: ''
    }
  })

  const registrationType = form.watch('registrationType')

  const businessOptions = useMemo(() => {
    if (registrationType === 'buyer') {
      return [
        'Importer',
        'Trading Company',
        'Manufacturer',
        'Industrial Consumer',
        'Investment Company',
        'Government',
        'Other'
      ]
    }
    return [
      'Mining Company',
      'Refinery',
      'Manufacturer',
      'Exporter',
      'Trading Company',
      'Broker',
      'Other'
    ]
  }, [registrationType])

  async function onSubmit(values: RegistrationForm) {
    try {
      setLoading(true)

      if (values.registrationType === 'buyer') {
        await registrationApi.registerBuyer({
          companyName: values.companyName,
          companyRegistrationNumber: values.companyRegistrationNumber,
          businessType: values.businessType ?? '',
          contactPerson: values.contactPerson,
          email: values.email,
          phone: values.phone,
          country: values.country,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
      } else {
        await registrationApi.registerSeller({
          companyName: values.companyName,
          companyRegistrationNumber: values.companyRegistrationNumber,
          productionFocus: values.productionFocus ?? [],
          contactPerson: values.contactPerson,
          email: values.email,
          phone: values.phone,
          country: values.country,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
      }

      toast.success(
        'Registration submitted successfully. Your company is now pending KYC verification.'
      )
      navigate('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-canvas-50)] text-[var(--color-ink-900)]">
      {/* LEFT PANEL */}
      <aside className="hidden lg:flex w-[430px] bg-[var(--color-navy-950)] text-[var(--color-white)] flex-col justify-between px-10 py-12">
        <div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-cobalt-600)] flex items-center justify-center">
              <Building2 className="h-6 w-6 text-[var(--color-white)]" />
            </div>
            <div>
              <h2 className="font-semibold text-heading-m">Commodity Exchange</h2>
              <p className="text-[var(--color-slate-500)] text-body-s mt-1">
                Enterprise Trading Platform
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h1 className="text-4xl font-bold leading-tight">
              Join the global commodity marketplace.
            </h1>
            <p className="mt-5 text-[var(--color-slate-300)] text-body-m leading-7">
              Register your company to buy or sell commodities through a secure and verified
              exchange network.
            </p>
          </div>

          <div className="mt-16 space-y-8">
            <div className="flex gap-4">
              <div className="mt-1">
                <ShieldCheck className="h-6 w-6 text-[var(--color-cobalt-600)]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-heading-s">Verified Companies</h3>
                <p className="text-[var(--color-slate-300)] text-body-s mt-1 leading-6">
                  Every organization completes a KYC verification before gaining marketplace access.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <Globe2 className="h-6 w-6 text-[var(--color-cobalt-600)]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-heading-s">Global Trading</h3>
                <p className="text-[var(--color-slate-300)] text-body-s mt-1 leading-6">
                  Connect with verified buyers and sellers across multiple countries.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1">
                <FileCheck className="h-6 w-6 text-[var(--color-cobalt-600)]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-heading-s">Secure Approval</h3>
                <p className="text-[var(--color-slate-300)] text-body-s mt-1 leading-6">
                  Your registration enters the KYC review queue immediately after submission.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-caption text-[var(--color-slate-500)]">
          © {new Date().getFullYear()} Commodity ERP
        </p>
      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-14 px-8">
          <div>
            <h1 className="text-heading-m font-bold text-[var(--color-ink-900)]">
              Create your company account
            </h1>
            <p className="mt-2 text-body-m text-[var(--color-slate-500)]">
              Already registered?
              <Link
                to="/login"
                className="ml-1 text-[var(--color-cobalt-600)] hover:text-[var(--color-cobalt-700)] font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          <Card className="mt-10 shadow-card border border-[var(--color-slate-200)] bg-[var(--color-white)] rounded-card">
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div>
                    <Label className="uppercase tracking-wider text-caption text-[var(--color-slate-500)]">
                      Register As
                    </Label>

                    <Tabs
                      value={registrationType}
                      onValueChange={(value) =>
                        form.setValue('registrationType', value as RegistrationType)
                      }
                      className="mt-3"
                    >
                      <TabsList className="grid grid-cols-2 h-16 bg-[var(--color-canvas-50)] border border-[var(--color-slate-200)]">
                        <TabsTrigger
                          value="buyer"
                          className="flex gap-3 text-body-m text-[var(--color-slate-500)] data-[state=active]:text-[var(--color-cobalt-600)] data-[state=active]:bg-[var(--color-white)]"
                        >
                          <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                          Buyer
                        </TabsTrigger>

                        <TabsTrigger
                          value="seller"
                          className="flex gap-3 text-body-m text-[var(--color-slate-500)] data-[state=active]:text-[var(--color-cobalt-600)] data-[state=active]:bg-[var(--color-white)]"
                        >
                          <Building2 className="h-5 w-5" strokeWidth={1.5} />
                          Seller
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* ===== YOUR DETAILS SECTION STARTS HERE ===== */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-heading-s text-[var(--color-ink-900)]">Your Details</h3>
                      <p className="text-body-s text-[var(--color-slate-500)] mt-1">
                        Enter your primary contact information.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="contactPerson"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Contact Person
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Anderson"
                                className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Business Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john@company.com"
                                className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+91 9876543210"
                                className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Country
                            </FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger className="border-[var(--color-slate-200)] focus:border-[var(--color-cobalt-600)] focus:ring-[var(--color-cobalt-100)]">
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[var(--color-white)] border-[var(--color-slate-200)]">
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                <SelectItem value="Germany">Germany</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                                <SelectItem value="Singapore">Singapore</SelectItem>
                                <SelectItem value="UAE">United Arab Emirates</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ====================================================== */}
                  <div className="border-t border-[var(--color-slate-200)] pt-8 space-y-6">
                    <div>
                      <h3 className="text-heading-s text-[var(--color-ink-900)]">
                        Company Information
                      </h3>
                      <p className="text-body-s text-[var(--color-slate-500)] mt-1">
                        Tell us about your organization.
                      </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Company Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Acme Trading Ltd"
                                className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyRegistrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Registration Number
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="REG-001234"
                                className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      {registrationType === 'buyer' ? (
                        <FormField
                          control={form.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-caption text-[var(--color-slate-500)]">
                                Business Type
                              </FormLabel>
                              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger className="border-[var(--color-slate-200)] focus:border-[var(--color-cobalt-600)] focus:ring-[var(--color-cobalt-100)]">
                                    <SelectValue placeholder="Select business type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[var(--color-white)] border-[var(--color-slate-200)]">
                                  {businessOptions.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-[var(--color-danger)] text-body-s" />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="productionFocus"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-caption text-[var(--color-slate-500)]">
                                Production Focus
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Mining, Refining"
                                  className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                                  onChange={(event) =>
                                    field.onChange(
                                      event.target.value
                                        .split(',')
                                        .map((item) => item.trim())
                                        .filter(Boolean)
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage className="text-[var(--color-danger)] text-body-s" />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Create a password"
                                  className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)] hover:text-[var(--color-ink-900)]"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                  ) : (
                                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-caption text-[var(--color-slate-500)]">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  {...field}
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Re-enter password"
                                  className="border-[var(--color-slate-200)] focus-visible:border-[var(--color-cobalt-600)] focus-visible:ring-[var(--color-cobalt-100)]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)] hover:text-[var(--color-ink-900)]"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                                  ) : (
                                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-[var(--color-danger)] text-body-s" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* ====================================================== */}
                  <div className="border-t border-[var(--color-slate-200)] pt-8 space-y-6">
                    <div className="rounded-card border border-[var(--color-slate-200)] bg-[var(--color-canvas-50)] p-5">
                      <h4 className="font-semibold text-heading-s text-[var(--color-ink-900)]">
                        Before you continue
                      </h4>
                      <ul className="mt-3 space-y-2 text-body-m text-[var(--color-slate-500)]">
                        <li>
                          • Your company account will be created with
                          <strong className="text-[var(--color-ink-900)] font-semibold">
                            {' '}
                            Pending KYC{' '}
                          </strong>
                          status.
                        </li>
                        <li>
                          • An Exchange administrator will verify your submitted company
                          information.
                        </li>
                        <li>
                          • Marketplace access will be enabled only after successful approval.
                        </li>
                        <li>
                          • You can sign in after approval using the email address and password
                          created here.
                        </li>
                      </ul>
                    </div>

                    <p className="text-caption leading-6 text-[var(--color-slate-500)]">
                      By clicking
                      <strong className="text-[var(--color-ink-900)] font-semibold">
                        {' '}
                        Register Company
                      </strong>
                      , you certify that the information supplied is accurate and belongs to your
                      organization. You also agree to the Exchange Terms of Service and Privacy
                      Policy.
                    </p>
                  </div>

                  {/* ====================================================== */}
                  <div className="flex flex-col gap-4 pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={loading}
                      className="w-full h-12 bg-[var(--color-cobalt-600)] hover:bg-[var(--color-cobalt-700)] text-white rounded-btn border-none font-semibold"
                    >
                      {loading ? (
                        'Submitting Registration...'
                      ) : (
                        <>
                          Register Company
                          <ChevronRight className="ml-2 h-4 w-4" strokeWidth={1.5} />
                        </>
                      )}
                    </Button>

                    <div className="text-center text-body-m text-[var(--color-slate-500)]">
                      Already have an account?
                      <Link
                        to="/login"
                        className="ml-1 font-semibold text-[var(--color-cobalt-600)] hover:text-[var(--color-cobalt-700)]"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
