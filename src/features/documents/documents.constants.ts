export const DOCUMENTS_TABLE = 'documents'

export const DOCUMENT_COLUMNS =
  'id, org_id, created_by, title, description, category, document_type, document_date, amount, expiry_date, visibility, is_approved, original_name, file_path, created_at, updated_at, deleted_at, uploader:users!created_by(name)'

export const DOCUMENTS_BUCKET = 'documents'
export const DOCUMENT_MAX_FILE_SIZE = 10 * 1024 * 1024
export const DOCUMENT_ACCEPTED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'] as const

export const DOCUMENTS_LOAD_ERROR = 'Unable to load documents. Please try again.'
export const DOCUMENT_SAVE_ERROR = 'Unable to save document. Please try again.'
export const DOCUMENT_DELETE_ERROR = 'Unable to delete document. Please try again.'
export const DOCUMENT_APPROVE_ERROR = 'Unable to update document approval. Please try again.'
export const DOCUMENT_OPEN_ERROR = 'Unable to open document. Please try again.'

export const documentCategoryValues = [
  'Business Permits',
  'Tax & BIR Documents',
  'Water Quality Tests',
  'Sanitary & Health',
  'Sales & Customer Receipts',
  'Expenses & Supplier',
  'Equipment & Maintenance',
  'Delivery & Vehicle',
  'Employee Documents',
  'Other',
] as const

export type DocumentCategory = (typeof documentCategoryValues)[number]

export const DOCUMENT_TYPES: Record<DocumentCategory, string[]> = {
  'Business Permits': [
    "Mayor's Permit",
    'Barangay Clearance',
    'DTI Certificate',
    'BIR COR',
    'Fire Safety Certificate',
    'Lease Contract',
    'Zoning Clearance',
    'Other',
  ],
  'Tax & BIR Documents': [
    'BIR Form 2307',
    'VAT Return',
    'Income Tax Return',
    'Authority to Print',
    'OR/Invoice Copy',
    'Other',
  ],
  'Water Quality Tests': [
    'Bacteriological Test Result',
    'Physical-Chemical Analysis',
    'Certificate of Potability',
    'Corrective Action Report',
    'Other',
  ],
  'Sanitary & Health': [
    'Sanitary Permit',
    'Employee Health Certificate',
    'Sanitation Inspection Report',
    'PPE Compliance Record',
    'Plant Operator Certificate',
    'Other',
  ],
  'Sales & Customer Receipts': [
    'Sales Invoice',
    'Customer Receipt',
    'Delivery Receipt',
    'Proof of Payment',
    'GCash Screenshot',
    'SOA',
    'Customer Contract',
    'Other',
  ],
  'Expenses & Supplier': [
    'Supplier Invoice',
    'Expense Receipt',
    'Utility Bill',
    'Rent Receipt',
    'Fuel Receipt',
    'Filter Replacement Receipt',
    'Equipment Repair Receipt',
    'Other',
  ],
  'Equipment & Maintenance': [
    'Equipment Purchase Invoice',
    'Warranty Document',
    'Service Report',
    'Preventive Maintenance Report',
    'Repair Quotation',
    'Calibration Record',
    'Other',
  ],
  'Delivery & Vehicle': [
    'Vehicle OR/CR',
    "Driver's License Copy",
    'Delivery Proof',
    'Accident Report',
    'Vehicle Repair Receipt',
    'Damaged Gallon Photo',
    'Other',
  ],
  'Employee Documents': [
    'Employee ID',
    'Employment Contract',
    'Attendance Sheet',
    'Payroll Document',
    'Training Certificate',
    'Incident Report',
    'Other',
  ],
  'Other': ['General Document', 'Other'],
}

/**
 * Blank upload form, with the document date pre-filled to today. A function,
 * not a const: a module-level value would freeze the date at import and go
 * stale for anyone who leaves the tab open past midnight.
 */
export function documentFormDefaults() {
  return {
    title: '',
    description: '',
    category: 'Business Permits' as DocumentCategory,
    documentType: '',
    documentDate: new Date().toLocaleDateString('en-CA'),
    amount: '',
    expiryDate: '',
    visibility: 'all' as 'all' | 'only_me',
  }
}
