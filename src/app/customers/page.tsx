import { CustomersPage } from '@/features/customers'

// Customer data is per-tenant and auth-dependent; never statically prerender it.
export const dynamic = 'force-dynamic'

export default function Customers() {
  return <CustomersPage />
}
