import { useQuery, useQueryClient, useMutation, useQueries } from '@tanstack/react-query'
import { RfqMainApi } from './api'
import type { RfqMainListParams, RfqMainPayload, RfqUpdateDetailPayload, RfqCreateDetailPayload } from './type'


export const rfqMainQueryKeys = {
    all: ['rfqMainList'],
    list: (params: RfqMainListParams = {}) => [...rfqMainQueryKeys.all, 'list', params],
}

export function useRfqMainByIdQuery(id: number) {
    return useQuery({
        queryKey: ['rfqMain', 'byId', id],
        queryFn: () => RfqMainApi.getByMainId(id),
        enabled: !!id,
        staleTime: 1000 * 60,
    })
}
export function useRfqMainListQuery(params: RfqMainListParams = {}) {
    return useQuery({
        queryKey: rfqMainQueryKeys.list(params),
        queryFn: () => RfqMainApi.list(params),
        staleTime: 1000 * 60,
    })
}
export function useUpdateRfqMainMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, rfqMain }: { id: number; rfqMain: RfqMainPayload }) => RfqMainApi.update(id, rfqMain),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: rfqMainQueryKeys.all })
        },
    })
}
export function useDeleteRfqMainMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => RfqMainApi.delete(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: rfqMainQueryKeys.all })
        },
    })
}
export function useCreateRfqMainMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (rfqMain: RfqMainPayload) => RfqMainApi.create(rfqMain),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: rfqMainQueryKeys.all })
        },
    })
}


// 询价详情 相关query hooks
export const rfqDetailQueryKeys = {
    all: ['rfqDetail'],
    detail: (id: number) => [...rfqDetailQueryKeys.all, 'detail', id],
}
// 获取询价详情列表
export function useRfqDetailsBatchQuery(ids: number[]) {
    return useQueries({
        queries: ids.map(id => ({
            queryKey: rfqDetailQueryKeys.detail(id),
            queryFn: () => RfqMainApi.getDetailByRfqMainId(id),
            enabled: !!id,

            staleTime: 1000 * 60 * 5,
        }))
    })
}
// 更新询价详情
export function useUpdateRfqDetailMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: RfqUpdateDetailPayload }) => RfqMainApi.updateDetail(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: rfqDetailQueryKeys.all })
        },
    })
}
export function useDeleteRfqDetailMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => RfqMainApi.deleteDetail(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: rfqDetailQueryKeys.all })
        },
    })
}
export function useCreateRfqDetailMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: RfqCreateDetailPayload }) => RfqMainApi.createDetail(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: rfqDetailQueryKeys.all })
        },
    })
}
