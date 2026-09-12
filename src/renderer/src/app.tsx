// src/renderer/src/App.tsx
// Root component: wraps all providers and defines the route tree.

import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './modules/auth/AuthContext'
import { ToastProvider } from './modules/auth/ToastContext'
import { ProtectedRoute } from './modules/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './modules/auth/LoginPage'
import { DashboardPage } from './modules/dashboard/DashboardPage'
import { BuyersPage } from './modules/buyers/buyersPage'
import { SellersPage } from './modules/sellers/sellersPage'
import { ProductsPage } from './modules/products/productsPage'
import { UsersPage } from './modules/users/usersPage'
import { RegistrationPage } from './modules/registration/RegistrationPage'
import { KycQueuePage } from './modules/kyc/kycQueuePage'
import { MarketplacePage } from './modules/marketplace/MarketplacePage'
import KycReviewPage from './modules/kyc/KycReviewPage'
import { MyProducts } from './modules/exchange/seller-products/MyProductsPage'
import { CommodityRequestsPage } from './modules/commodity-requests/CommodityRequestsPage'
import { MandatesPage } from './modules/mandates/MandatesPage'
import { KycStatusPage } from './modules/registration/KycStatusPage'
import { CategoriesPage } from './modules/catalogue/CategoriesPage'
import { InquiriesPage } from './modules/inquiries/InquiriesPage'
import { MyDealsPage } from './modules/exchange/deals/MyDealsPage'
import { DealDetailPage } from './modules/exchange/deals/DealDetailPage'
import { ChangePasswordPage } from './modules/auth/ChangePasswordPage'
import { ProfilePage } from './modules/auth/ProfilePage'
import { NotFoundPage } from './components/errors/NotFoundPage'

export default function App() {
  return (
    // AuthProvider holds the current user, login/logout functions, and role checks.
    // ToastProvider holds the toast queue and renders the fixed toast container.
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public route — accessible without a token */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          {/* Protected shell — all routes inside require a valid session.
              AppShell renders the sidebar + header + <Outlet /> (child route content). */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            {/* Default: redirect root to dashboard per spec */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
            {/* Module routes: ProtectedRoute with `require` also checks role permission */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute require="dashboard">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />{' '}
            <Route
              path="/buyers/*"
              element={
                <ProtectedRoute require="buyers">
                  <BuyersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sellers/*"
              element={
                <ProtectedRoute require="sellers">
                  <SellersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mandates/*"
              element={
                <ProtectedRoute require="mandates">
                  <MandatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/*"
              element={
                <ProtectedRoute require="products">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc/*"
              element={
                <ProtectedRoute require="kyc">
                  <KycQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kyc/:entity/:id"
              element={
                <ProtectedRoute require="kyc">
                  <KycReviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketplace/*"
              element={
                <ProtectedRoute require="marketplace">
                  <MarketplacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commodity-requests/*"
              element={
                <ProtectedRoute require="commodityRequests">
                  <CommodityRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inquiries"
              element={
                <ProtectedRoute require="inquiries">
                  <InquiriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inquiries/:id"
              element={
                <ProtectedRoute require="inquiries">
                  <InquiriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inquiries/*"
              element={
                <ProtectedRoute require="inquiries">
                  <InquiriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-deals"
              element={
                <ProtectedRoute require="myDeals">
                  <MyDealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-deals/:id"
              element={
                <ProtectedRoute require="myDeals">
                  <DealDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/*"
              element={
                <ProtectedRoute require="users">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myproducts/*"
              element={
                <ProtectedRoute require="myProducts">
                  <MyProducts />
                </ProtectedRoute>
              }
            />
            {/* KYC status & resubmission — accessible to any authenticated exchange user */}
            <Route
              path="/kyc-status"
              element={
                <ProtectedRoute>
                  <KycStatusPage />
                </ProtectedRoute>
              }
            />
            {/* Admin Catalogue Routes */}
            <Route
              path="/catalogue/categories"
              element={
                <ProtectedRoute require="products">
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            {/* User Security & Profile */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Route>
            {/* Catch-all: unknown URL → marketplace */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
  )
}
