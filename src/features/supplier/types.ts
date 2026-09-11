export type SupplierStatus = 'Preferred' | 'Active' | 'Pending' | 'Blocked'

export type Supplier = {
  id: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  remark: string
  status: SupplierStatus
}

export type SupplierPayload = Omit<Supplier, 'id'>

export type SupplierInputOption = Pick<Supplier, 'id' | 'name'>

export type SupplierInputSearchResponse = {
  items: SupplierInputOption[]
}

export type SupplierListParams = {
  keyword?: string
  status?: SupplierStatus | 'all'
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'contact' | 'status'
  sortOrder?: 'asc' | 'desc'
}

export type SupplierPageResult = {
  items: Supplier[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type SupplierPageResponse = {
  success: boolean
  data: SupplierPageResult
  message?: string
}

export type SupplierSingleResponse = {
  success: boolean
  data: Supplier
  message?: string
}

export type SupplierDeleteResponse = {
  success: boolean
  message?: string
}