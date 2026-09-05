// src/renderer/src/modules/marketplace/MarketplacePage.tsx

import { Routes, Route } from 'react-router-dom'
import { MarketplaceHomePage } from './MarketplaceHomePage'
import { CategoryDetailPage } from './CategoryDetailPage'
import { RequestForm } from './RequestForm'
import { CustomRequestForm } from './CustomRequestForm'

export function MarketplacePage() {
  return (
    <Routes>
      <Route path="/" element={<MarketplaceHomePage />} />
      <Route path="/request/new" element={<RequestForm />} />
      <Route path="/request/custom" element={<CustomRequestForm />} />
      <Route path="/:categoryId" element={<CategoryDetailPage />} />
    </Routes>
  )
}
