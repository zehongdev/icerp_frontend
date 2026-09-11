import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supplierApi, type Supplier, type SupplierListParams, type SupplierPayload } from './api'

export const supplierQueryKeys = {
  all: ['suppliers'],
  list: (params: SupplierListParams = {}) => [...supplierQueryKeys.all, 'list', params],
}

export function useSuppliersQuery(params: SupplierListParams = {}) {
  return useQuery({
    queryKey: supplierQueryKeys.list(params),
    queryFn: () => supplierApi.list(params),
    staleTime: 1000 * 60,
  })
}

// 供应商增删改的 mutation hooks
export function useCreateSupplierMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (supplier: SupplierPayload) => supplierApi.create(supplier),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: supplierQueryKeys.all })
    },
  })
}

export function useUpdateSupplierMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, supplier }: { id: string; supplier: SupplierPayload }) => supplierApi.update(id, supplier),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: supplierQueryKeys.all })
    },
  })
}

export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => supplierApi.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: supplierQueryKeys.all })
    },
  })
}

export function useFindSupplierByNameQuery(name: string) {
  return useQuery({
    queryKey: ['supplier', 'findByName', name],
    queryFn: () => supplierApi.findByName(name),
    staleTime: 1000 * 60,
  })
}

export type { Supplier, SupplierListParams, SupplierPayload }
