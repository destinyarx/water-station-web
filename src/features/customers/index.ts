export { CustomersPage } from './components/customers-page'
export { CustomersTable } from './components/customers-table'
export { useCustomers } from './hooks/use-customers'
export { useCreateCustomer } from './hooks/use-create-customer'
export { useUpdateCustomer } from './hooks/use-update-customer'
export { useArchiveCustomer } from './hooks/use-archive-customer'
export {
  getActiveCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  archiveCustomer,
} from './services/customers.service'
export { canEditCustomer } from './customers.guards'
export { customerKeys } from './customers.keys'
export { customerRowSchema, customerFormSchema } from './customers.schema'
export { toCustomer, toInsertRow, toUpdateRow, toFormValues } from './customers.mapper'
export type {
  Customer,
  CustomerRow,
  CustomerFormValues,
  CustomerOwner,
} from './customers.types'
