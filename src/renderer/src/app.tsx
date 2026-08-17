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
import KycDetail from './modules/kyc/KycDetail'
import { MyProducts } from './modules/exchange/seller-products/MyProductsPage'
import { CommodityRequestsPage } from './modules/commodity-requests/CommodityRequestsPage'
import { MandatesPage } from './modules/mandates/MandatesPage'
export default function App() {
  return (
    // AuthProvider holds the current user, login/logout functions, and role checks.
    // ToastProvider holds the toast queue and renders the fixed toast container.
    // Both wrap everything because any component might need them.
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
            {/* Default: redirect root to dashboard */}
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
            <Route path="/kyc/:entity/:id" element={<KycDetail />} />
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
          </Route>
          {/* Catch-all: unknown URL → dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
