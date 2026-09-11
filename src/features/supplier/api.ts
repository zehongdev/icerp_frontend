import apiClient from '../../lib/api/client'
import type {
  Supplier,
  SupplierDeleteResponse,
  SupplierInputOption,
  SupplierInputSearchResponse,
  SupplierListParams,
  SupplierPageResponse,
  SupplierPageResult,
  SupplierPayload,
  SupplierSingleResponse,
} from './types'

export type {
  Supplier,
  SupplierInputOption,
  SupplierListParams,
  SupplierPageResult,
  SupplierPayload,
  SupplierStatus,
} from './types'

const shouldUseMockFallback = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

export const defaultSuppliers: Supplier[] = [
  { id: 'sup-001', name: 'Alpha Components', contact: 'Mia Chen', phone: '+86 138 0000 1000', email: 'mia@alphacomponents.com', address: 'Shenzhen, Guangdong', remark: 'Preferred electronics partner', status: 'Preferred' },
  { id: 'sup-002', name: 'BluePeak Labs', contact: 'Lucas Wang', phone: '+86 136 0000 2000', email: 'lucas@bluepeaklabs.cn', address: 'Shanghai, China', remark: 'R&D sample supplier', status: 'Active' },
  { id: 'sup-003', name: 'Northwind Industrial', contact: 'Emma Liu', phone: '+86 139 0000 3000', email: 'emma@northwind-ind.com', address: 'Dongguan, Guangdong', remark: 'OEM manufacturing support', status: 'Preferred' },
  { id: 'sup-004', name: 'Silver Crest Tech', contact: 'Olivia Wu', phone: '+86 137 0000 4000', email: 'olivia@silvercresttech.com', address: 'Hangzhou, Zhejiang', remark: 'Packaging solution provider', status: 'Active' },
  { id: 'sup-005', name: 'Greenfield Parts', contact: 'Noah Sun', phone: '+86 138 0000 5000', email: 'noah@greenfieldparts.com', address: 'Ningbo, Zhejiang', remark: 'Metal and tooling procurement', status: 'Preferred' },
  { id: 'sup-006', name: 'Harbor Supply Co.', contact: 'Sophia Li', phone: '+86 135 0000 6000', email: 'sophia@harborsupply.cn', address: 'Guangzhou, Guangdong', remark: 'Logistics and transport', status: 'Active' },
  { id: 'sup-007', name: 'Crown Circuit', contact: 'Daniel Zhang', phone: '+86 136 0000 7000', email: 'daniel@crowncircuit.com', address: 'Foshan, Guangdong', remark: 'PCB module distribution', status: 'Preferred' },
  { id: 'sup-008', name: 'Nova Materials', contact: 'Ava Zhou', phone: '+86 139 0000 8000', email: 'ava@novamaterials.cn', address: 'Suzhou, Jiangsu', remark: 'Material testing support', status: 'Preferred' },
  { id: 'sup-009', name: 'Smart Axis Automation', contact: 'James Liu', phone: '+86 137 0000 9000', email: 'james@smartaxis.com', address: 'Shenzhen, Guangdong', remark: 'Automation equipment vendor', status: 'Active' },
  { id: 'sup-010', name: 'EcoLink Components', contact: 'Grace Han', phone: '+86 138 0000 1100', email: 'grace@ecolinkcomponents.com', address: 'Xiamen, Fujian', remark: 'Energy-saving components', status: 'Preferred' },
]

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const createId = () => {
  const id = globalThis.crypto?.randomUUID?.()
  return id ?? `sup-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

let supplierStore: Supplier[] = [...defaultSuppliers]

const normalizeSupplierPageResult = (items: Supplier[], page = 1, pageSize = items.length || 1): SupplierPageResult => {
  const total = items.length
  const safePageSize = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * safePageSize

  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  }
}

const applyLocalFilters = (items: Supplier[], params: SupplierListParams = {}): SupplierPageResult => {
  const keyword = params.keyword?.trim().toLowerCase()
  const status = params.status

  let data = [...items]

  if (keyword) {
    data = data.filter((supplier) => [
      supplier.name,
      supplier.contact,
      supplier.phone,
      supplier.email,
      supplier.address,
      supplier.remark,
    ].some((value) => value.toLowerCase().includes(keyword)))
  }

  if (status && status !== 'all') {
    data = data.filter((supplier) => supplier.status === status)
  }

  if (params.sortBy) {
    const direction = params.sortOrder === 'desc' ? -1 : 1

    data.sort((left, right) => {
      const leftValue = left[params.sortBy ?? 'name']
      const rightValue = right[params.sortBy ?? 'name']

      return String(leftValue).localeCompare(String(rightValue)) * direction
    })
  }

  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.max(1, params.pageSize ?? data.length ?? 1)

  return normalizeSupplierPageResult(data, page, pageSize)
}

const findSupplierByIdOrName = (idOrName: string) => {
  const supplier = supplierStore.find((item) => item.id === idOrName || item.name === idOrName)

  if (!supplier) {
    throw new Error('Supplier not found')
  }

  return supplier
}

const parseSupplierListResponse = (data: unknown): SupplierPageResult | null => {
  if (!data || typeof data !== 'object') {
    return null
  }

  if ('success' in data && data.success && 'data' in data && data.data && typeof data.data === 'object') {
    const payload = data.data as SupplierPageResponse['data']
    if (Array.isArray(payload.items)) {
      return {
        items: payload.items,
        page: Number(payload.page ?? 1),
        pageSize: Number(payload.pageSize ?? payload.items.length ?? 1),
        total: Number(payload.total ?? payload.items.length ?? 0),
        totalPages: Number(payload.totalPages ?? Math.max(1, Math.ceil((payload.total ?? payload.items.length ?? 0) / Math.max(1, Number(payload.pageSize ?? payload.items.length ?? 1))))),
      }
    }
  }

  if (Array.isArray(data)) {
    return normalizeSupplierPageResult(data, 1, data.length || 1)
  }

  return null
}

const parseSupplierInputSearchResponse = (data: unknown): SupplierInputOption[] | null => {
  if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items)) {
    return null
  }

  if (!data.items.every((item) => (
    item
    && typeof item === 'object'
    && 'id' in item
    && (typeof item.id === 'string' || typeof item.id === 'number')
    && 'name' in item
    && typeof item.name === 'string'
  ))) {
    return null
  }

  return data.items.map((item) => ({
    id: String(item.id),
    name: item.name,
  }))
}

export const supplierApi = {
  async list(params: SupplierListParams = {}): Promise<SupplierPageResult> {
    try {
      const { data } = await apiClient.get<SupplierPageResponse>('/supplierv2/list', { params })
      const pageResult = parseSupplierListResponse(data)
      if (pageResult) {
        return pageResult
      }
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }
    }

    if (!shouldUseMockFallback) {
      throw new Error('Supplier list response was not in the expected paginated format.')
    }

    await sleep(150)
    return applyLocalFilters(supplierStore, params)
  },
  async searchForInput(keyword = '', signal?: AbortSignal): Promise<SupplierInputOption[]> {
    const normalizedKeyword = keyword.trim()

    try {
      const { data } = await apiClient.get<SupplierInputSearchResponse>('/supplierv2/search', {
        params: { keyword: normalizedKeyword },
        signal,
      })
      const options = parseSupplierInputSearchResponse(data)
      if (options) {
        return options
      }
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }
    }

    if (!shouldUseMockFallback) {
      throw new Error('Supplier input search response was not in the expected format.')
    }

    await sleep(150)
    const lowercaseKeyword = normalizedKeyword.toLowerCase()
    return supplierStore
      .filter((supplier) => (
        !lowercaseKeyword
        || supplier.id.toLowerCase().includes(lowercaseKeyword)
        || supplier.name.toLowerCase().includes(lowercaseKeyword)
      ))
      .slice(0, 20)
      .map(({ id, name }) => ({ id, name }))
  },


  // Todo
  async getById(id: string): Promise<Supplier | undefined> {
    try {
      const { data } = await apiClient.get<SupplierSingleResponse>(`/suppliers/${id}`)
      return data?.success ? data.data : undefined
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }

      await sleep(80)
      return supplierStore.find((supplier) => supplier.id === id)
    }
  },

  async create(payload: SupplierPayload): Promise<Supplier> {
    try {
      const { data } = await apiClient.post<SupplierSingleResponse>('/supplierv2/create', payload)
      return data?.success ? data.data : data.data
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }

      await sleep(200)

      const supplier: Supplier = {
        ...payload,
        id: createId(),
      }

      supplierStore = [supplier, ...supplierStore]
      return supplier
    }
  },

  async update(idOrName: string, payload: SupplierPayload): Promise<Supplier> {
    try {
      const { data } = await apiClient.put<SupplierSingleResponse>(`/supplierv2/update/${idOrName}`, payload)
      return data?.success ? data.data : data.data
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }

      await sleep(200)

      const supplier = findSupplierByIdOrName(idOrName)
      const nextSupplier: Supplier = { ...supplier, ...payload }

      supplierStore = supplierStore.map((item) => item.id === supplier.id ? nextSupplier : item)

      return nextSupplier
    }
  },

  async remove(idOrName: string): Promise<void> {
    try {
      const { data } = await apiClient.delete<SupplierDeleteResponse>(`/supplierv2/delete/${idOrName}`)
      if (data?.success) {
        return
      }
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }

      await sleep(150)

      const supplier = findSupplierByIdOrName(idOrName)
      supplierStore = supplierStore.filter((item) => item.id !== supplier.id)
    }
  },
  async findByName(name: string): Promise<Supplier | undefined> {
    try {
      const { data } = await apiClient.get<SupplierSingleResponse>(`/supplierv2/searchByName?name=${name}`)
      if (data?.success && data.data !== null) {
        return data.data
      }
      return undefined
    } catch (error) {
      if (!shouldUseMockFallback) {
        throw error
      }

      await sleep(80)
      return supplierStore.find((supplier) => supplier.name === name)
    }
  }
} as const

export async function fetchSuppliers(params: SupplierListParams = {}): Promise<SupplierPageResult> {
  return supplierApi.list(params)
}

export async function createSupplier(payload: SupplierPayload): Promise<Supplier> {
  return supplierApi.create(payload)
}

export async function updateSupplier(idOrName: string, payload: SupplierPayload): Promise<Supplier> {
  return supplierApi.update(idOrName, payload)
}

export async function deleteSupplier(idOrName: string): Promise<void> {
  return supplierApi.remove(idOrName)
}
