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
// import { SellersPage } from './modules/sellers/SellersPage'
import { ProductsPage } from './modules/products/productsPage'
// import { UsersPage } from './modules/users/UsersPage'

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
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Module routes: ProtectedRoute with `require` also checks role permission */}
            <Route
              path="/buyers/*"
              element={
                <ProtectedRoute require="buyers">
                  {' '}
                  <BuyersPage />{' '}
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/sellers/*"
              element={
                <ProtectedRoute require="sellers">
                  {' '}
                  <SellersPage />{' '}
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/products/*"
              element={
                <ProtectedRoute require="products">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            {/* // <Route
            //   path="/users/*"
            //   element={
            //     // <ProtectedRoute require="users">
            //     //   {' '}
            //     //   <UsersPage />{' '}
            //     // </ProtectedRoute>
            //   }
            /> */}
          </Route>

          {/* Catch-all: unknown URL → dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}
